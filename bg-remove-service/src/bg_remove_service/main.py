# Use a pipeline as a high-level helper
import torch
from transformers import pipeline

# Use GPU if available, otherwise CPU
device = 0 if torch.cuda.is_available() else -1

pipe = pipeline("image-segmentation", model="briaai/RMBG-1.4", trust_remote_code=True, device=device, use_fast=True)

image_path = "https://farm5.staticflickr.com/4007/4322154488_997e69e4cf_z.jpg"
pillow_mask = pipe(image_path, return_mask = True) # outputs a pillow mask
pillow_image = pipe(image_path) # applies mask on input and returns a pillow image

pillow_image.save("output.png")