"""
Fashion Embedding Service
Generates 64-dimensional embeddings for clothing images using the Type-Specific Network
Based on: "Learning Type-Aware Embeddings for Fashion Compatibility" (ECCV 2018)
"""

import torch
import torch.nn as nn
from torchvision import transforms
from PIL import Image
import io
import os
from typing import Optional
import numpy as np

from .resnet18 import resnet18


class SimpleEmbeddingNet(nn.Module):
    """
    Simplified embedding network for inference only.
    Uses ResNet-18 backbone to generate 64-dim embeddings.
    """
    def __init__(self, embedding_size: int = 64, pretrained: bool = True):
        super(SimpleEmbeddingNet, self).__init__()
        self.embeddingnet = resnet18(pretrained=pretrained, embedding_size=embedding_size)
    
    def forward(self, x):
        """Generate embeddings for input images."""
        return self.embeddingnet(x)


class FashionEmbeddingService:
    """
    Service for generating fashion item embeddings.
    Loads a pre-trained model and provides inference methods.
    """
    
    def __init__(self, 
                 model_path: Optional[str] = None,
                 embedding_size: int = 64,
                 device: Optional[str] = None):
        """
        Initialize the embedding service.
        
        Args:
            model_path: Path to pre-trained model checkpoint (optional)
            embedding_size: Dimension of output embeddings (default: 64)
            device: Device to run on ('cuda', 'cpu', or None for auto-detect)
        """
        self.embedding_size = embedding_size
        
        # Auto-detect device
        if device is None:
            self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        else:
            self.device = torch.device(device)
        
        print(f"[EmbeddingService] Using device: {self.device}")
        
        # Initialize model
        self.model = SimpleEmbeddingNet(
            embedding_size=embedding_size,
            pretrained=True  # Use ImageNet pretrained weights
        )
        
        # Load checkpoint if provided
        if model_path and os.path.exists(model_path):
            self._load_checkpoint(model_path)
        else:
            print("[EmbeddingService] Using ImageNet pretrained ResNet-18 backbone")
        
        self.model.to(self.device)
        self.model.eval()
        
        # Image preprocessing (matching the fashion-compatibility paper)
        self.transform = transforms.Compose([
            transforms.Resize(112),
            transforms.CenterCrop(112),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])
    
    def _load_checkpoint(self, model_path: str):
        """Load model weights from checkpoint."""
        try:
            # Load with weights_only=False for compatibility with older PyTorch checkpoints
            checkpoint = torch.load(model_path, map_location=self.device, weights_only=False)
            
            # Handle different checkpoint formats
            if 'state_dict' in checkpoint:
                state_dict = checkpoint['state_dict']
            else:
                state_dict = checkpoint
            
            # Filter only the embedding network weights
            filtered_dict = {}
            for key, value in state_dict.items():
                # Handle nested keys from full model
                if key.startswith('embeddingnet.embeddingnet.'):
                    new_key = key.replace('embeddingnet.embeddingnet.', 'embeddingnet.')
                    filtered_dict[new_key] = value
                elif key.startswith('embeddingnet.'):
                    filtered_dict[key] = value
                elif not any(key.startswith(prefix) for prefix in ['masks', 'metric', 'text']):
                    # Direct backbone keys
                    filtered_dict[f'embeddingnet.{key}'] = value
            
            if filtered_dict:
                self.model.load_state_dict(filtered_dict, strict=False)
                print(f"[EmbeddingService] Loaded checkpoint from: {model_path}")
            else:
                print(f"[EmbeddingService] Warning: No compatible weights found in checkpoint")
                
        except Exception as e:
            print(f"[EmbeddingService] Failed to load checkpoint: {e}")
            print("[EmbeddingService] Using ImageNet pretrained weights instead")
    
    def preprocess_image(self, image: Image.Image) -> torch.Tensor:
        """
        Preprocess a PIL Image for embedding generation.
        
        Args:
            image: PIL Image
            
        Returns:
            Preprocessed tensor ready for the model
        """
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Apply transforms
        tensor = self.transform(image)
        return tensor
    
    def generate_embedding(self, image: Image.Image) -> list[float]:
        """
        Generate embedding for a single image.
        
        Args:
            image: PIL Image
            
        Returns:
            64-dimensional embedding as a list of floats
        """
        # Preprocess
        tensor = self.preprocess_image(image)
        tensor = tensor.unsqueeze(0).to(self.device)  # Add batch dimension
        
        # Generate embedding
        with torch.no_grad():
            embedding = self.model(tensor)
        
        # Convert to list
        return embedding.cpu().numpy().flatten().tolist()
    
    def generate_embeddings_batch(self, images: list[Image.Image]) -> list[list[float]]:
        """
        Generate embeddings for a batch of images.
        
        Args:
            images: List of PIL Images
            
        Returns:
            List of 64-dimensional embeddings
        """
        if not images:
            return []
        
        # Preprocess all images
        tensors = [self.preprocess_image(img) for img in images]
        batch = torch.stack(tensors).to(self.device)
        
        # Generate embeddings
        with torch.no_grad():
            embeddings = self.model(batch)
        
        # Convert to list of lists
        return embeddings.cpu().numpy().tolist()
    
    def compute_similarity(self, 
                          embedding1: list[float], 
                          embedding2: list[float]) -> float:
        """
        Compute cosine similarity between two embeddings.
        
        Args:
            embedding1: First embedding
            embedding2: Second embedding
            
        Returns:
            Cosine similarity score (-1 to 1)
        """
        e1 = np.array(embedding1)
        e2 = np.array(embedding2)
        
        # Cosine similarity
        dot_product = np.dot(e1, e2)
        norm1 = np.linalg.norm(e1)
        norm2 = np.linalg.norm(e2)
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        
        return float(dot_product / (norm1 * norm2))
    
    def compute_compatibility_score(self,
                                    embedding1: list[float],
                                    embedding2: list[float]) -> float:
        """
        Compute compatibility score between two items.
        Transforms cosine similarity to a 0-100 score.
        
        Args:
            embedding1: First item embedding
            embedding2: Second item embedding
            
        Returns:
            Compatibility score (0-100)
        """
        similarity = self.compute_similarity(embedding1, embedding2)
        # Transform from [-1, 1] to [0, 100]
        score = (similarity + 1) * 50
        return round(score, 2)
    
    def find_most_compatible(self,
                            target_embedding: list[float],
                            candidate_embeddings: list[dict],
                            top_k: int = 5) -> list[dict]:
        """
        Find the most compatible items from a list of candidates.
        
        Args:
            target_embedding: The embedding to match against
            candidate_embeddings: List of dicts with 'id' and 'embedding' keys
            top_k: Number of results to return
            
        Returns:
            List of dicts with 'id', 'similarity', and 'compatibility_score'
        """
        results = []
        
        for candidate in candidate_embeddings:
            similarity = self.compute_similarity(target_embedding, candidate['embedding'])
            score = self.compute_compatibility_score(target_embedding, candidate['embedding'])
            
            results.append({
                'id': candidate['id'],
                'similarity': round(similarity, 4),
                'compatibility_score': score,
                **{k: v for k, v in candidate.items() if k not in ['id', 'embedding']}
            })
        
        # Sort by similarity descending
        results.sort(key=lambda x: x['similarity'], reverse=True)
        
        return results[:top_k]


# Singleton instance for the service
_embedding_service: Optional[FashionEmbeddingService] = None


def get_embedding_service() -> FashionEmbeddingService:
    """Get or create the singleton embedding service instance."""
    global _embedding_service
    
    if _embedding_service is None:
        model_path = os.getenv('EMBEDDING_MODEL_PATH')
        _embedding_service = FashionEmbeddingService(model_path=model_path)
    
    return _embedding_service
