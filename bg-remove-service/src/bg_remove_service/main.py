from fastapi import FastAPI, File, UploadFile, HTTPException
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
from google import genai
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="AI Service - Background Removal & Attribute Extraction")

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

# Initialize Gemini client
gemini_client = None
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    gemini_client = genai.Client(api_key=GEMINI_API_KEY)


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
    """Use Gemini to extract clothing attributes from an image."""
    if not gemini_client:
        raise HTTPException(
            status_code=503,
            detail="Gemini API not configured. Set GEMINI_API_KEY environment variable."
        )

    try:
        # Convert image to bytes for Gemini
        img_bytes = io.BytesIO()
        image.save(img_bytes, format="PNG")
        img_bytes.seek(0)

        # Call Gemini with image
        response = gemini_client.models.generate_content(
            model="gemini-2.0-flash",
            contents=[
                {
                    "parts": [
                        {"text": EXTRACTION_PROMPT},
                        {
                            "inline_data": {
                                "mime_type": "image/png",
                                "data": base64.b64encode(img_bytes.getvalue()).decode()
                            }
                        }
                    ]
                }
            ]
        )

        # Parse JSON response
        import json
        response_text = response.text.strip()
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
            detail=f"Gemini API error: {str(e)}"
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
        "features": ["background-removal", "attribute-extraction"],
        "gemini_configured": gemini_client is not None
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "gemini_configured": gemini_client is not None}


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
    Extract clothing item attributes from an image using Gemini AI.
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


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)