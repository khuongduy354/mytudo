import axios from "axios";
import FormData from "form-data";

export class AiService {
  private readonly aiServiceUrl: string;

  constructor() {
    this.aiServiceUrl =
      process.env.AI_SERVICE_URL || "http://localhost:8001";
  }

  /**
   * Extract attributes from an image using the AI service
   */
  async extractAttributes(
    fileBuffer: Buffer,
    filename: string,
    mimetype: string
  ): Promise<any> {
    try {
      const formData = new FormData();
      formData.append("file", fileBuffer, {
        filename,
        contentType: mimetype,
      });

      const response = await axios.post(
        `${this.aiServiceUrl}/extract-attributes`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error(
        "AI Service Error (extractAttributes):",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.detail || "Failed to extract attributes"
      );
    }
  }

  /**
   * Extract attributes from multiple images using the AI service
   */
  async extractAttributesBatch(files: Express.Multer.File[]): Promise<any> {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file.buffer, {
          filename: file.originalname,
          contentType: file.mimetype,
        });
      });

      const response = await axios.post(
        `${this.aiServiceUrl}/batch/extract-attributes`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error(
        "AI Service Error (extractAttributesBatch):",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.detail || "Failed to batch extract attributes"
      );
    }
  }

  /**
   * Generate embedding for an image
   */
  async generateEmbedding(
    fileBuffer: Buffer,
    filename: string,
    mimetype: string
  ): Promise<any> {
    try {
      const formData = new FormData();
      formData.append("file", fileBuffer, {
        filename,
        contentType: mimetype,
      });

      const response = await axios.post(
        `${this.aiServiceUrl}/generate-embedding`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error(
        "AI Service Error (generateEmbedding):",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.detail || "Failed to generate embedding"
      );
    }
  }

  /**
   * Remove background from an image
   */
  async removeBackground(
    fileBuffer: Buffer,
    filename: string,
    mimetype: string
  ): Promise<Buffer> {
    try {
      const formData = new FormData();
      formData.append("file", fileBuffer, {
        filename,
        contentType: mimetype,
      });

      const response = await axios.post(
        `${this.aiServiceUrl}/remove-bg`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },
          responseType: "arraybuffer",
        }
      );

      return Buffer.from(response.data);
    } catch (error: any) {
      console.error(
        "AI Service Error (removeBackground):",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.detail || "Failed to remove background"
      );
    }
  }
}
