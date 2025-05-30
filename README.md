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
```
# running the backend (port 3001)
yarn workspace @viralytics/api dev

# running the frontend (port 3000)
yarn workspace @viralytics/ui dev   
```

## Formatting
To format the code, run in the respective directories:
```
yarn workspace @viralytics/api prettier:fix
yarn workspace @viralytics/ui prettier:fix
```


