import type { ISupabaseClient } from "../di/supabase.js";

export class UploadService {
  constructor(private supabase: ISupabaseClient) {}

  async uploadImage(
    userId: string,
    file: Buffer,
    filename: string,
    mimeType: string
  ): Promise<string> {
    const path = `${userId}/${Date.now()}_${filename}`;

    const { data, error } = await this.supabase
      .getClient()
      .storage.from("wardrobe-images")
      .upload(path, file, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) throw new Error(`Upload failed: ${error.message}`);

    // Get public URL
    const { data: urlData } = this.supabase
      .getClient()
      .storage.from("wardrobe-images")
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  }

  async deleteImage(imageUrl: string): Promise<void> {
    // Extract path from URL
    const urlParts = imageUrl.split("/wardrobe-images/");
    if (urlParts.length !== 2) return;

    const path = urlParts[1];

    const { error } = await this.supabase
      .getClient()
      .storage.from("wardrobe-images")
      .remove([path]);

    if (error) {
      console.error(`Failed to delete image: ${error.message}`);
    }
  }
}
