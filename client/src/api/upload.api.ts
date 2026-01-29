import { apiClient } from "./client";

// AI_SERVICE_URL handled by backend proxy

// Types for AI extraction
export interface ExtractedItem {
  category: string;
  color: string;
  name: string;
  brand?: string | null;
  material?: string | null;
  size?: string | null;
  estimated_price?: number | null;
}

export interface ExtractionResponse {
  items: ExtractedItem[];
  image_index: number;
}

export interface BatchExtractionResponse {
  results: ExtractionResponse[];
  total_items: number;
}

export interface BatchBgRemovalResult {
  index: number;
  filename: string;
  success: boolean;
  data?: string; // base64 encoded image
  error?: string;
}

export interface BatchBgRemovalResponse {
  results: BatchBgRemovalResult[];
  total: number;
}

export const uploadApi = {
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post("/upload/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.data.imageUrl;
  },

  removeBackground: async (file: File): Promise<File> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post("/ai/remove-bg", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      responseType: "arraybuffer", // Important for receiving binary data
    });

    const blob = new Blob([response.data], { type: "image/png" });
    return new File([blob], file.name.replace(/\.[^/.]+$/, ".png"), {
      type: "image/png",
    });
  },

  /**
   * Extract clothing attributes from a single image using AI
   * Can detect multiple items in one image
   */
  extractAttributes: async (file: File): Promise<ExtractionResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post("/ai/extract-attributes", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  /**
   * Batch extract clothing attributes from multiple images
   * Each image can contain multiple items
   */
  extractAttributesBatch: async (
    files: File[]
  ): Promise<BatchExtractionResponse> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await apiClient.post(
      "/ai/batch/extract-attributes",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  },

  /**
   * Batch remove background from multiple images
   * NOT IMPLEMENTED IN BACKEND PROXY YET, keeping for consistency types
   * but should probably be removed or implemented. 
   * Since the backend doesn't implement batch remove-bg, we will comment this out or throw not implemented
   * validation error.
   */
  removeBackgroundBatch: async (
    _files: File[]
  ): Promise<BatchBgRemovalResponse> => {
      // The user didn't ask for batch background removal proxy specifically, 
      // but if needed we can add it. For now, we'll throw to indicate migration needs.
      throw new Error("Batch background removal not yet migrated to v2 proxy");
  },

  /**
   * Generate embedding for a single image
   */
  generateEmbedding: async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post("/ai/generate-embedding", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  /**
   * Convert base64 background removal result to File
   */
  base64ToFile: (base64: string, filename: string): File => {
    const byteString = atob(base64);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new File([ab], filename.replace(/\.[^/.]+$/, ".png"), {
      type: "image/png",
    });
  },
};
