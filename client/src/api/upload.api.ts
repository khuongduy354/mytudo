import { apiClient } from "./client";

const BG_REMOVE_SERVICE_URL = "http://localhost:8001";

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

    const response = await fetch(`${BG_REMOVE_SERVICE_URL}/remove-bg`, {
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
};
