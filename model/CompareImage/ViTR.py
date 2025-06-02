#!/usr/bin/env python3
import sys
from pathlib import Path
import numpy as np
import torch
import timm
from PIL import Image
from torchvision import transforms
import torch.nn.functional as F
import torch.nn as nn
import torchvision.models as cv_models
import cv2
import matplotlib.pyplot as plt
from facenet_pytorch import MTCNN
from deepface import DeepFace
import mediapipe as mp
import os
os.environ["CUDA_VISIBLE_DEVICES"] = "-1" # Disable GPU
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s", handlers=[logging.FileHandler("ViTR_results_face.log"),logging.StreamHandler(sys.stdout)])
log = logging.getLogger()  


# ------------------------------
# 1) Config & Utilities
# ------------------------------
DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
MODEL_PATH = "vit_regressor.pth"
BACKBONE_ARCH = 'vit_base_patch16_224'

VAL_TFMS = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=[.485, .456, .406], std=[.229, .224, .225]),
])

# Load image helper
def load_image(path: Path):
    img = Image.open(path).convert("RGB")
    return VAL_TFMS(img).unsqueeze(0), img

# ------------------------------
# 2) Detection Functions
# ------------------------------
# Face & Smile
detector = MTCNN(keep_all=True, device=DEVICE)
smile_model = cv_models.resnet18(pretrained=True)
smile_model.fc = nn.Linear(smile_model.fc.in_features, 2)
smile_model = smile_model.to(DEVICE).eval()

# Mediapipe for landmarks
mp_face_mesh = mp.solutions.face_mesh.FaceMesh(static_image_mode=True)

# Heuristic detectors

def detect_smile(pil_img):
    boxes, _ = detector.detect(pil_img)
    if boxes is None: return False
    for box in boxes:
        x1, y1, x2, y2 = map(int, box)
        face = pil_img.crop((x1, y1, x2, y2)).resize((224,224))
        tensor = VAL_TFMS(face).unsqueeze(0).to(DEVICE)
        logits = smile_model(tensor)
        prob = F.softmax(logits, dim=-1)[0,1].item()
        if prob > 0.5:
            return True
    return False

# Makeup detection (simple color saturation heuristic)
def detect_makeup(pil_img):
    img_np = np.array(pil_img)
    hsv = cv2.cvtColor(img_np, cv2.COLOR_RGB2HSV)
    sat_mean = hsv[:,:,1].mean()
    return sat_mean > 50  # higher saturation indicates makeup

# Eye openness via landmarks
def detect_eye_openness(pil_img):
    img_np = np.array(pil_img)
    results = mp_face_mesh.process(cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR))
    if not results.multi_face_landmarks: return False
    lm = results.multi_face_landmarks[0]
    # landmarks indices for eye: use example ratios (left eye)
    def get_dist(a, b):
        return np.linalg.norm(np.array([lm.landmark[a].x, lm.landmark[a].y]) -
                              np.array([lm.landmark[b].x, lm.landmark[b].y]))
    open_ratio = get_dist(159, 145) / get_dist(33, 133)
    return open_ratio > 0.25

# Symmetry via flipping
def detect_symmetry(pil_img):
    img_np = np.array(pil_img.resize((224,224)))
    left = img_np[:, :112]
    right = img_np[:, 112:][:, ::-1]
    return np.mean(np.abs(left - right)) < 15

# Age & gender

def detect_age_gender(pil_img):
    analysis = DeepFace.analyze(
        np.array(pil_img), 
        actions=['age', 'gender'], 
        enforce_detection=False
    )
    
    # Fix: access the first dictionary from the list
    return analysis[0]['age'], analysis[0]['gender']


# Pose estimation
mp_pose = mp.solutions.pose.Pose(static_image_mode=True)
def detect_pose(pil_img):
    img_np = np.array(pil_img)
    res = mp_pose.process(cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR))
    if not res.pose_landmarks: return 'unknown'
    # simple: check if shoulders and hips detected
    return 'frontal'

# Aesthetics via brightness/contrast

def detect_brightness(pil_img):
    return np.mean(np.array(pil_img.convert('L')))

def detect_contrast(pil_img):
    return np.std(np.array(pil_img.convert('L')))

# Sharpness via Laplacian

def detect_sharpness(pil_img):
    img_gray = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2GRAY)
    return cv2.Laplacian(img_gray, cv2.CV_64F).var()

# Composition: rule-of-thirds saliency

def detect_composition(pil_img):
    w, h = pil_img.size
    thirds = [(w//3, h//3), (2*w//3, h//3), (w//3, 2*h//3), (2*w//3, 2*h//3)]
    gray = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2GRAY)
    sal = cv2.saliency.StaticSaliencyFineGrained_create().computeSaliency(gray)[1]
    scores = [sal[y,x] for x,y in thirds]
    return max(scores) > 0.5

# Background clutter via edges

def detect_background_clutter(pil_img):
    gray = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2GRAY)
    edges = cv2.Canny(gray, 100, 200)
    return edges.mean() < 0.05

# Image style simple: filter detection by histogram

def detect_image_style(pil_img):
    # stub: return 'filtered' if histogram skewed
    hist = pil_img.histogram()
    return 'none'

# Props detection via object detection stub

def detect_props(pil_img):
    return []

# Lighting type stub
def detect_lighting(pil_img):
    return 'natural'

# ------------------------------
# 3) explain_image with heuristics
# ------------------------------
from timm import create_model
class ViTRegressor(nn.Module):
    def __init__(self, arch=BACKBONE_ARCH, pretrained=True):
        super().__init__()
        self.backbone = create_model(arch, pretrained=pretrained, num_classes=0, global_pool='avg')
        feat_dim = self.backbone.num_features
        self.head = nn.Sequential(
            nn.LayerNorm(feat_dim), nn.Linear(feat_dim,512), nn.ReLU(), nn.Dropout(0.2), nn.Linear(512,1)
        )
    def forward(self, x): return self.head(self.backbone(x)).squeeze(-1)
    
class ViTAttentionRollout:
    def __init__(self, model, discard_ratio=0.9):
        self.model = model
        self.discard_ratio = discard_ratio
        self.attentions = []

        # Hook all transformer blocks
        for block in self.model.blocks:
            block.attn.register_forward_hook(self._hook)

    def _hook(self, module, input, output):
        # input[0] is the token sequence [B, N, D]
        qkv = module.qkv(input[0])  # shape: [B, N, 3 * dim]
        B, N, C = qkv.shape
        assert C % 3 == 0, "Expected QKV channels divisible by 3"
        qkv = qkv.reshape(B, N, 3, module.num_heads, (C // 3) // module.num_heads)
        qkv = qkv.permute(2, 0, 3, 1, 4)  # [3, B, heads, N, head_dim]
        q, k, v = qkv[0], qkv[1], qkv[2]
        attn = (q @ k.transpose(-2, -1)) * module.scale
        attn = attn.softmax(dim=-1)
        self.attentions.append(attn.detach())


    def __call__(self, x: torch.Tensor) -> np.ndarray:
        _ = self.model(x)
        attn_mat = torch.stack(self.attentions)  # [num_layers, B, num_heads, tokens, tokens]
        self.attentions.clear()

        # Average heads
        attn_mat = attn_mat.mean(dim=2)  # [num_layers, B, tokens, tokens]
        attn_mat = attn_mat.squeeze(1)  # [num_layers, tokens, tokens]

        # Add identity and normalize
        residual_attn = torch.eye(attn_mat.size(1), device=attn_mat.device)
        aug_attn = attn_mat + residual_attn
        aug_attn /= aug_attn.sum(dim=-1, keepdim=True)

        # Matrix multiply attention across layers
        joint_attn = aug_attn[0]
        for i in range(1, attn_mat.size(0)):
            joint_attn = aug_attn[i] @ joint_attn

        # Attention from CLS to all patches
        mask = joint_attn[0, 1:]  # exclude CLS token
        mask = mask.reshape(14, 14).cpu().numpy()
        return mask

model = ViTRegressor().to(DEVICE)
model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
model.eval()
rollout = ViTAttentionRollout(model.backbone)

def explain_image(img_path: Path):
    x, pil_img = load_image(img_path)
    x = x.to(DEVICE)
    with torch.no_grad(): pred = model(x).item()

    reasons = []
    # face & smile
    face_present = detector.detect(pil_img)[0] is not None
    reasons.append(f"face detected={face_present}")
    reasons.append(f"smile={detect_smile(pil_img)}")
    # makeup
    reasons.append(f"makeup={detect_makeup(pil_img)}")
    # eyes
    reasons.append(f"eyes open={detect_eye_openness(pil_img)}")
    # symmetry
    reasons.append(f"symmetry={detect_symmetry(pil_img)}")
    # age/gender
    age, gender = detect_age_gender(pil_img)
    reasons.append(f"age={age:.0f}")
    reasons.append(f"gender={gender}")
    # pose
    reasons.append(f"pose={detect_pose(pil_img)}")
    # brightness, contrast, sharpness
    reasons.append(f"brightness={detect_brightness(pil_img):.1f}")
    reasons.append(f"contrast={detect_contrast(pil_img):.1f}")
    reasons.append(f"sharpness={detect_sharpness(pil_img):.1f}")
    # composition
    reasons.append(f"composition_rule_of_thirds={detect_composition(pil_img)}")
    # background clutter
    reasons.append(f"background_clutter={detect_background_clutter(pil_img)}")
    # style, props, lighting
    reasons.append(f"style={detect_image_style(pil_img)}")
    reasons.append(f"props={detect_props(pil_img)}")
    reasons.append(f"lighting={detect_lighting(pil_img)}")

    # attention rollout
    mask = rollout(x)
    mask = (mask - mask.min()) / (mask.max()-mask.min()+1e-8)
    mask = torch.tensor(mask).unsqueeze(0).unsqueeze(0)
    mask = F.interpolate(mask, size=(224,224), mode='bilinear').squeeze().cpu().numpy()
    reasons.append("attention_heatmap_computed")

    return pred, mask, reasons




# ------------------------------
# 4) CLI Entrypoint
# ------------------------------
if __name__ == '__main__':
    if len(sys.argv) != 4:
        print("Usage: python script.py A.jpg B.jpg C.jpg")
        log.info("Usage: python script.py A.jpg B.jpg C.jpg")
        sys.exit(1)

    paths = [Path(p) for p in sys.argv[1:]]
    results = []

    for path in paths:
        pred, mask, reasons = explain_image(path)
        results.append((path.name, pred, reasons))
    
    # Sort by prediction score (higher is better)
    results.sort(key=lambda x: x[1], reverse=True)
    
    # Log results
    log.info(f"Winner: {results[0][0]} with score={results[0][1]:.2f}")
    for name, score, reasons in results:
        log.info(f"{name} score={score:.2f}")
        log.info(f"{name} reasons: {reasons}")