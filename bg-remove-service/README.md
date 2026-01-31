# Background Removal & Fashion Embedding Service

FastAPI service that provides:
- Background removal from images using RMBG-1.4 model
- Fashion item embedding generation using Type-Specific Network
- AI-powered attribute extraction using OpenRouter/Qwen

## Features

### Background Removal
- Remove background from images using RMBG-1.4 model
- Returns transparent PNG images
- Batch processing support

### Embedding Generation
- Generate 64-dimensional embeddings for fashion items
- Uses ResNet-18 backbone trained on fashion compatibility
- Model: `model_best.pth.tar` (Type-Specific Network from ECCV 2018 paper)
- Compatibility scoring between items
- Find most compatible items from a collection

### Attribute Extraction
- AI-powered extraction of clothing attributes
- Detects category, color, brand, material, size
- Batch processing support

## Setup

```bash
poetry install
```

## Configuration

Create a `.env` file (see `.env.example`):

```bash
# Required for attribute extraction
OPENROUTER_API_KEY=your-api-key

# Optional
PORT=8001
CLIENT_URL=http://localhost:5173

# Model path (relative to bg-remove-service directory)
EMBEDDING_MODEL_PATH=../model_best.pth.tar
```

## Run

```bash
poetry run uvicorn bg_remove_service.main:app --host 0.0.0.0 --port 8001
```

Or run in background:

```bash
nohup poetry run uvicorn bg_remove_service.main:app --host 0.0.0.0 --port 8001 > bg-service.log 2>&1 &
```

## API Endpoints

### Health Check
- `GET /` - Health check endpoint

### Background Removal
- `POST /remove-bg` - Remove background from single image
- `POST /batch/remove-bg` - Batch background removal

### Attribute Extraction
- `POST /extract-attributes` - Extract attributes from single image
- `POST /batch/extract-attributes` - Batch attribute extraction

### Embedding Generation
- `POST /generate-embedding` - Generate 64-dim embedding for single image
- `POST /batch/generate-embedding` - Batch embedding generation
- `POST /compute-compatibility` - Compute compatibility between two embeddings
- `POST /find-compatible` - Find most compatible items from candidates

## Testing

### Test Embedding Service
```bash
poetry run python test_embedding.py
```

### End-to-End Test
```bash
bash test_e2e.sh
```

## Model Information

The service uses `model_best.pth.tar`, which is a pre-trained Type-Specific Network for fashion compatibility. The model:
- Based on "Learning Type-Aware Embeddings for Fashion Compatibility" (ECCV 2018)
- Trained on Polyvore dataset
- Generates 64-dimensional embeddings
- Epoch 4, Best precision: 1.47

## Integration

The client calls this service from [upload.api.ts](../client/src/api/upload.api.ts):

```typescript
await uploadApi.removeBackground(imageFile);
```

Used in [AddItemPage.tsx](../client/src/features/wardrobe/pages/AddItemPage.tsx) to let users choose between original and background-removed versions before uploading.
