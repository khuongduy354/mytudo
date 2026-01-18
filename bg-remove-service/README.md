# Background Removal Service

FastAPI service that removes backgrounds from images using AI.

## Features

- Remove background from images using RMBG-1.4 model
- Returns transparent PNG images
- REST API endpoint
- CORS enabled for local development

## Setup

```bash
poetry install
```

## Run

```bash
poetry run uvicorn bg_remove_service.main:app --host 0.0.0.0 --port 8001
```

Or run in background:

```bash
nohup poetry run uvicorn bg_remove_service.main:app --host 0.0.0.0 --port 8001 > bg-service.log 2>&1 &
```

## API

### GET /
Health check endpoint

### POST /remove-bg
Remove background from image

- Request: multipart/form-data with file field
- Response: PNG image with transparent background

## Integration

The client calls this service from [upload.api.ts](../client/src/api/upload.api.ts):

```typescript
await uploadApi.removeBackground(imageFile);
```

Used in [AddItemPage.tsx](../client/src/features/wardrobe/pages/AddItemPage.tsx) to let users choose between original and background-removed versions before uploading.
