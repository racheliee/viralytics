import json
import numpy as np
from pathlib import Path
from PIL import Image, UnidentifiedImageError
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms
import timm
import wandb


class Config:
    # Paths
    INPUT_JSON_PATH = "merged_dataset_post_with_images.json"
    IMG_ROOT = Path("static/images")
    OUTPUT_MODEL_PATH = "vit_regressor.pth"

    # Data split
    TRAIN_SPLIT = 0.8

    # Dataloader
    BATCH_SIZE = 16
    NUM_WORKERS = 2

    # Training
    DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    NUM_EPOCHS = 20
    LR_BACKBONE = 3e-5
    LR_HEAD = 1e-4
    WEIGHT_DECAY = 1e-2
    T_MAX = 10


def log_transform(likes):
    """Apply log1p safely to handle edge cases."""
    if likes < 0:
        print(f"[Warning] Negative likes encountered: {likes}")
        likes = 0
    return np.log1p(likes).astype(np.float32)


class InstaVisionDataset(Dataset):
    def __init__(self, records, img_root: Path, transform=None):
        self.records = records
        self.img_root = img_root
        self.transform = transform

    def __len__(self):
        return len(self.records)

    def __getitem__(self, idx):
        img_rel, likes = self.records[idx]
        img_path = self.img_root / img_rel

        try:
            img = Image.open(img_path).convert("RGB")
        except (UnidentifiedImageError, FileNotFoundError, OSError):
            img = Image.new("RGB", (224, 224), (0, 0, 0))  # fallback image

        if self.transform:
            img = self.transform(img)

        target = log_transform(likes)
        return img, target


class ViTRegressor(nn.Module):
    def __init__(self, arch='vit_base_patch16_224', pretrained=True):
        super().__init__()
        self.backbone = timm.create_model(
            arch,
            pretrained=pretrained,
            num_classes=0,
            global_pool='avg'
        )
        feat_dim = self.backbone.num_features
        self.head = nn.Sequential(
            nn.LayerNorm(feat_dim),
            nn.Linear(feat_dim, 512),
            nn.ReLU(inplace=True),
            nn.Dropout(0.2),
            nn.Linear(512, 1)
        )

    def forward(self, x):
        feats = self.backbone(x)
        out = self.head(feats)
        return out.squeeze(-1)


def main():

    cfg = Config()
    wandb.init(project="image-likes-regression", config=cfg)

    # Step 1: Load and clean JSON
    with open(cfg.INPUT_JSON_PATH, 'r', encoding='utf-8') as f:
        posts = json.load(f)

    records = []
    for post in posts:
        try:
            likes = int(post.get("likesCount", 0))
            likes = max(0, likes)
        except (ValueError, TypeError):
            likes = 0
        for img in post.get("images", []):
            records.append((img, likes))

    print(f"Total samples: {len(records)}")

    # Step 2: Train/val split
    split_idx = int(cfg.TRAIN_SPLIT * len(records))
    train_recs, val_recs = records[:split_idx], records[split_idx:]

    # Step 3: Image transforms
    train_tfms = transforms.Compose([
        transforms.Resize(256),
        transforms.RandomResizedCrop(224),
        transforms.RandomHorizontalFlip(),
        transforms.ToTensor(),
        transforms.Normalize(mean=[.485, .456, .406], std=[.229, .224, .225]),
    ])
    val_tfms = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize(mean=[.485, .456, .406], std=[.229, .224, .225]),
    ])

    # Step 4: Datasets and DataLoaders
    train_ds = InstaVisionDataset(train_recs, cfg.IMG_ROOT, transform=train_tfms)
    val_ds = InstaVisionDataset(val_recs, cfg.IMG_ROOT, transform=val_tfms)
    train_loader = DataLoader(train_ds, batch_size=cfg.BATCH_SIZE, shuffle=True, num_workers=cfg.NUM_WORKERS)
    val_loader = DataLoader(val_ds, batch_size=cfg.BATCH_SIZE*2, shuffle=False, num_workers=cfg.NUM_WORKERS)

    print(f"Train batches: {len(train_loader)} | Val batches: {len(val_loader)}")

    # Step 5: Model setup
    model = ViTRegressor().to(cfg.DEVICE)

    optimizer = optim.AdamW([
        {"params": model.backbone.parameters(), "lr": cfg.LR_BACKBONE},
        {"params": model.head.parameters(),     "lr": cfg.LR_HEAD},
    ], weight_decay=cfg.WEIGHT_DECAY)

    criterion = nn.MSELoss()
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=cfg.T_MAX)

        # Step 6: Training loop
    for epoch in range(1, cfg.NUM_EPOCHS + 1):
        model.train()
        running_loss = 0.0
        for imgs, targets in train_loader:
            imgs = imgs.to(cfg.DEVICE)
            targets = targets.to(cfg.DEVICE)
            preds = model(imgs)
            loss = criterion(preds, targets)
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
            running_loss += loss.item() * imgs.size(0)

        train_loss = running_loss / len(train_ds)

        # Validation
        model.eval()
        val_loss = 0.0
        with torch.no_grad():
            for imgs, targets in val_loader:
                imgs = imgs.to(cfg.DEVICE)
                targets = targets.to(cfg.DEVICE)
                preds = model(imgs)
                val_loss += criterion(preds, targets).item() * imgs.size(0)
        val_loss /= len(val_ds)

        scheduler.step()
        
        # Log the losses to WandB
        wandb.log({
            "train_loss": train_loss,
            "val_loss": val_loss,
            "epoch": epoch
        })
        
        print(f"Epoch {epoch:02d} | train_loss: {train_loss:.4f} | val_loss: {val_loss:.4f}")

    # Step 7: Save the model
    torch.save(model.state_dict(), cfg.OUTPUT_MODEL_PATH)
    print(f"Model saved to {cfg.OUTPUT_MODEL_PATH}")

    # Finalize WandB
    wandb.finish()

if __name__ == '__main__':
    main()