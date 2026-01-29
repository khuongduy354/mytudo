import { apiClient } from "./client";

const AI_SERVICE_URL =
  import.meta.env.VITE_AI_SERVICE_URL || "http://localhost:8001";

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

    const response = await fetch(`${AI_SERVICE_URL}/remove-bg`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to remove background");
    }

    const blob = await response.blob();
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

    const response = await fetch(
      `${AI_SERVICE_URL}/batch/extract-attributes`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || "Failed to batch extract attributes");
    }

    return response.json();
  },

  /**
   * Batch remove background from multiple images
   * Returns base64-encoded processed images
   */
  removeBackgroundBatch: async (
    files: File[]
  ): Promise<BatchBgRemovalResponse> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await fetch(`${AI_SERVICE_URL}/batch/remove-bg`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || "Failed to batch remove background");
    }

    return response.json();
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
