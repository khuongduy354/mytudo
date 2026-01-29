import { SupabaseClient } from "@supabase/supabase-js";

interface SaveEmbeddingParams {
  imageUrl: string;
  embedding: number[];
  filename: string;
}

export class DebugService {
  constructor(private supabase: SupabaseClient) {}

  async saveEmbedding(params: SaveEmbeddingParams): Promise<any> {
    const { imageUrl, embedding, filename } = params;

    const { data, error } = await this.supabase
      .from("debug_embeddings")
      .insert({
        image_url: imageUrl,
        embedding: embedding, // pgvector handles array -> vector conversion
        filename: filename,
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving debug embedding:", error);
      throw new Error(`Failed to save embedding: ${error.message}`);
    }

    return data;
  }

  async getAllWardrobeItems(): Promise<any[]> {
    const { data, error } = await this.supabase
      .from("wardrobe_items")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch wardrobe items: ${error.message}`);
    }

    return data || [];
  }
}
