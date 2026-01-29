from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import torch
from transformers import pipeline
from PIL import Image
import io
import os
import base64
from openai import OpenAI

from dotenv import load_dotenv
import json

# Embedding service import
from .embedding_service import get_embedding_service

# Load environment variables from .env file
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="AI Service - Background Removal, Attribute Extraction & Embeddings")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        os.getenv("CLIENT_URL", ""),
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Use GPU if available, otherwise CPU
device = 0 if torch.cuda.is_available() else -1

# Initialize the background removal pipeline
pipe = pipeline(
    "image-segmentation",
    model="briaai/RMBG-1.4",
    trust_remote_code=True,
    device=device,
    use_fast=True
)

# Initialize OpenRouter client
openai_client = None
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
if OPENROUTER_API_KEY:
    openai_client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=OPENROUTER_API_KEY
    )


# Pydantic models for responses
class ExtractedItem(BaseModel):
    category: str  # tops, bottoms, footwear, accessories
    color: str  # primary color
    name: str  # descriptive name
    brand: Optional[str] = None
    material: Optional[str] = None
    size: Optional[str] = None
    estimated_price: Optional[int] = None  # in VND


class ExtractionResponse(BaseModel):
    items: list[ExtractedItem]
    image_index: int  # which image this came from (for batch)


class BatchExtractionResponse(BaseModel):
    results: list[ExtractionResponse]
    total_items: int


EXTRACTION_PROMPT = """Analyze this clothing/fashion image and extract all visible clothing items.

For EACH distinct clothing item visible in the image, provide:
- category: One of "tops", "bottoms", "footwear", "accessories"
- color: The primary color (use common color names like black, white, gray, red, blue, green, yellow, pink, purple, orange, brown, beige, navy)
- name: A descriptive name for the item (e.g., "White Cotton T-Shirt", "Blue Denim Jeans")
- brand: The brand name if visible/identifiable, otherwise null
- material: The material if identifiable (e.g., cotton, linen, polyester, denim, leather), otherwise null
- size: The size if visible on tags/labels, otherwise null
- estimated_price: Estimated price in Vietnamese Dong (VND), otherwise null

Return ONLY a valid JSON array of items. Example:
[
  {
    "category": "tops",
    "color": "white",
    "name": "White Cotton T-Shirt",
    "brand": "Uniqlo",
    "material": "cotton",
    "size": "M",
    "estimated_price": 350000
  }
]

If no clothing items are visible, return an empty array: []
"""


def image_to_base64(image: Image.Image) -> str:
    """Convert PIL Image to base64 string."""
    buffered = io.BytesIO()
    image.save(buffered, format="PNG")
    return base64.b64encode(buffered.getvalue()).decode()


async def extract_attributes_from_image(image: Image.Image) -> list[ExtractedItem]:
    """Use OpenRouter (Qwen) to extract clothing attributes from an image."""
    if not openai_client:
        raise HTTPException(
            status_code=503,
            detail="OpenRouter API not configured. Set OPENROUTER_API_KEY environment variable."
        )

    try:
        # Convert image to bytes for OpenRouter
        img_bytes = io.BytesIO()
        image.save(img_bytes, format="PNG")
        img_bytes.seek(0)
        base64_image = base64.b64encode(img_bytes.getvalue()).decode()

        # Call OpenRouter with image
        response = openai_client.chat.completions.create(
            model="google/gemma-3-4b-it:free",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": EXTRACTION_PROMPT},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/png;base64,{base64_image}"
                            }
                        }
                    ]
                }
            ]
        )

        response_text = response.choices[0].message.content


        # Parse JSON response
        response_text = response_text.strip()
        # Handle markdown code blocks
        if response_text.startswith("```"):
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]
            response_text = response_text.strip()

        items_data = json.loads(response_text)
        return [ExtractedItem(**item) for item in items_data]

    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse Gemini response: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"OpenRouter/Qwen API error: {str(e)}"
        )


async def remove_background_from_image(image: Image.Image) -> bytes:
    """Remove background from image using the segmentation pipeline."""
    result_image = pipe(image)
    img_byte_arr = io.BytesIO()
    result_image.save(img_byte_arr, format="PNG")
    img_byte_arr.seek(0)
    return img_byte_arr.getvalue()


@app.get("/")
async def root():
    return {
        "message": "AI Service is running",
        "features": ["background-removal", "attribute-extraction", "fashion-embedding"],
        "ai_configured": openai_client is not None,
        "embedding_service": "active"
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy", 
        "ai_configured": openai_client is not None,
        "embedding_service": "active"
    }


@app.post("/remove-bg")
async def remove_background(file: UploadFile = File(...)):
    """
    Remove background from uploaded image.
    Returns the processed image as PNG with transparent background.
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        result_bytes = await remove_background_from_image(image)

        return Response(
            content=result_bytes,
            media_type="image/png",
            headers={
                "Content-Disposition": f"attachment; filename=nobg_{file.filename}"
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process image: {str(e)}"
        )


@app.post("/extract-attributes", response_model=ExtractionResponse)
async def extract_attributes(file: UploadFile = File(...)):
    """
    Extract clothing item attributes from an image using OpenRouter/Qwen AI.
    Can detect multiple items in a single image.
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        items = await extract_attributes_from_image(image)

        return ExtractionResponse(items=items, image_index=0)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to extract attributes: {str(e)}"
        )


@app.post("/batch/remove-bg")
async def batch_remove_background(files: list[UploadFile] = File(...)):
    """
    Batch background removal for multiple images.
    Returns a list of processed images as base64-encoded PNGs.
    """
    results = []

    for idx, file in enumerate(files):
        if not file.content_type or not file.content_type.startswith("image/"):
            results.append({
                "index": idx,
                "filename": file.filename,
                "success": False,
                "error": "File must be an image"
            })
            continue

        try:
            contents = await file.read()
            image = Image.open(io.BytesIO(contents))
            result_bytes = await remove_background_from_image(image)

            results.append({
                "index": idx,
                "filename": file.filename,
                "success": True,
                "data": base64.b64encode(result_bytes).decode()
            })
        except Exception as e:
            results.append({
                "index": idx,
                "filename": file.filename,
                "success": False,
                "error": str(e)
            })

    return {"results": results, "total": len(files)}


@app.post("/batch/extract-attributes", response_model=BatchExtractionResponse)
async def batch_extract_attributes(files: list[UploadFile] = File(...)):
    """
    Batch attribute extraction for multiple images.
    Each image can contain multiple items.
    """
    results = []
    total_items = 0

    for idx, file in enumerate(files):
        if not file.content_type or not file.content_type.startswith("image/"):
            results.append(ExtractionResponse(items=[], image_index=idx))
            continue

        try:
            contents = await file.read()
            image = Image.open(io.BytesIO(contents))
            items = await extract_attributes_from_image(image)
            total_items += len(items)
            results.append(ExtractionResponse(items=items, image_index=idx))
        except Exception as e:
            # Log error but continue with other images
            print(f"Error processing image {idx}: {str(e)}")
            results.append(ExtractionResponse(items=[], image_index=idx))

    return BatchExtractionResponse(results=results, total_items=total_items)


# ===========================================
# EMBEDDING GENERATION ENDPOINTS
# ===========================================

class EmbeddingResponse(BaseModel):
    """Response for single embedding generation."""
    embedding: list[float]
    dimensions: int


class BatchEmbeddingItem(BaseModel):
    """Single item in batch embedding response."""
    index: int
    filename: Optional[str] = None
    success: bool
    embedding: Optional[list[float]] = None
    error: Optional[str] = None


class BatchEmbeddingResponse(BaseModel):
    """Response for batch embedding generation."""
    results: list[BatchEmbeddingItem]
    total: int
    successful: int


class CompatibilityRequest(BaseModel):
    """Request for compatibility scoring."""
    embedding1: list[float]
    embedding2: list[float]


class CompatibilityResponse(BaseModel):
    """Response for compatibility scoring."""
    similarity: float
    compatibility_score: float


class FindCompatibleRequest(BaseModel):
    """Request to find compatible items."""
    target_embedding: list[float]
    candidates: list[dict]
    top_k: int = 5


class FindCompatibleResponse(BaseModel):
    """Response with compatible items."""
    results: list[dict]


@app.post("/generate-embedding", response_model=EmbeddingResponse)
async def generate_embedding(file: UploadFile = File(...)):
    """
    Generate a 64-dimensional fashion embedding for an image.
    Uses ResNet-18 backbone trained on fashion compatibility.
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        embedding_service = get_embedding_service()
        embedding = embedding_service.generate_embedding(image)
        
        return EmbeddingResponse(
            embedding=embedding,
            dimensions=len(embedding)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate embedding: {str(e)}"
        )


@app.post("/batch/generate-embedding", response_model=BatchEmbeddingResponse)
async def batch_generate_embedding(files: list[UploadFile] = File(...)):
    """
    Generate embeddings for multiple images in batch.
    More efficient than calling single endpoint multiple times.
    """
    results = []
    successful = 0
    
    embedding_service = get_embedding_service()
    
    for idx, file in enumerate(files):
        if not file.content_type or not file.content_type.startswith("image/"):
            results.append(BatchEmbeddingItem(
                index=idx,
                filename=file.filename,
                success=False,
                error="File must be an image"
            ))
            continue
        
        try:
            contents = await file.read()
            image = Image.open(io.BytesIO(contents))
            embedding = embedding_service.generate_embedding(image)
            
            results.append(BatchEmbeddingItem(
                index=idx,
                filename=file.filename,
                success=True,
                embedding=embedding
            ))
            successful += 1
        except Exception as e:
            results.append(BatchEmbeddingItem(
                index=idx,
                filename=file.filename,
                success=False,
                error=str(e)
            ))
    
    return BatchEmbeddingResponse(
        results=results,
        total=len(files),
        successful=successful
    )


@app.post("/compute-compatibility", response_model=CompatibilityResponse)
async def compute_compatibility(request: CompatibilityRequest):
    """
    Compute compatibility score between two embeddings.
    Returns both raw cosine similarity and a 0-100 compatibility score.
    """
    try:
        embedding_service = get_embedding_service()
        
        similarity = embedding_service.compute_similarity(
            request.embedding1,
            request.embedding2
        )
        compatibility_score = embedding_service.compute_compatibility_score(
            request.embedding1,
            request.embedding2
        )
        
        return CompatibilityResponse(
            similarity=round(similarity, 4),
            compatibility_score=compatibility_score
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to compute compatibility: {str(e)}"
        )


@app.post("/find-compatible", response_model=FindCompatibleResponse)
async def find_compatible(request: FindCompatibleRequest):
    """
    Find the most compatible items from a list of candidates.
    Each candidate should have 'id' and 'embedding' fields.
    """
    try:
        embedding_service = get_embedding_service()
        
        results = embedding_service.find_most_compatible(
            target_embedding=request.target_embedding,
            candidate_embeddings=request.candidates,
            top_k=request.top_k
        )
        
        return FindCompatibleResponse(results=results)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to find compatible items: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)