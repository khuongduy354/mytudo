import { apiClient } from "./client";
import { uploadApi } from "./upload.api";

const AI_SERVICE_URL =
  import.meta.env.VITE_AI_SERVICE_URL || "http://localhost:8002";


// Types
export interface EmbeddingResponse {
  embedding: number[];
  dimensions: number;
}

export interface CompatibilityResponse {
  similarity: number;
  compatibility_score: number;
}

export interface FindCompatibleResponse {
  results: {
    id: string;
    similarity: number;
    compatibility_score: number;
    image_url: string;
    category?: string;
  }[];
}

export const debugApi = {
  /**
   * Generate embedding for a single image
   */
  generateEmbedding: async (file: File): Promise<EmbeddingResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${AI_SERVICE_URL}/generate-embedding`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || "Failed to generate embedding");
    }

    return response.json();
  },

  /**
   * Compute compatibility between two embeddings
   */
  computeCompatibility: async (
    embedding1: number[],
    embedding2: number[]
  ): Promise<CompatibilityResponse> => {
    const response = await fetch(`${AI_SERVICE_URL}/compute-compatibility`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        embedding1,
        embedding2,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || "Failed to compute compatibility");
    }

    return response.json();
  },

  /**
   * Remove background from an image
   */
  removeBackground: async (file: File): Promise<Blob> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${AI_SERVICE_URL}/remove-bg`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || "Failed to remove background");
    }

    return response.blob();
  },

  /**
   * Extract clothing attributes using Gemini
   */
  extractAttributes: async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${AI_SERVICE_URL}/extract-attributes`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || "Failed to extract attributes");
    }

    return response.json();
  },

  /**
   * Save debug embedding to database
   * (This acts as a bridge to saving embeddings for testing)
   */
  saveDebugEmbedding: async (file: File, embedding: number[]): Promise<any> => {
    // First upload image to get a URL
    const imageUrl = await uploadApi.uploadImage(file);
    
    // Save to debug table
    const response = await apiClient.post("/debug/embedding", {
        imageUrl,
        embedding,
        filename: file.name
    });
    
    return response.data;
  }
};
