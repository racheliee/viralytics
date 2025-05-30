# viralytics
[2025 Spring Semester] System Management Engineering Capstone Project

## Project Structure
- `api/`: Contains the backend API code
- `ui/`: Contains the UI web code
- `model/`: Contains the model code and training history
- `data/`: Contains the data preprocessing code
- `docs/`: Contains the documentation

## For more details
- [Backend Documentation](packages/api/README.md)
- [Frontend Documentation](packages/ui/README.md)

## Getting Started
```bash
# Install dependencies for all workspaces
rm -rf node_modules yarn.lock # if you have issues with dependencies
yarn install
```

## Running the Project
```bash
# running the backend (port 3001)
yarn dev:api

# running the frontend (port 3000)
yarn dev:ui
```

## Formatting
To format the code, run in the respective directories:
```bash
yarn prettier: fix

# for each workspace (replace /api with each workspace name)
yarn workspace @viralytics/api prettier:fix
```

## Misc
### Unnecessary Dependencies
Go to each workspace and run:
```bash
depcheck
yarn remove <unnecessary-package>

# if you want to know why a seemingly unnecessary package is there
yarn why <unnecessary-package> 
```

