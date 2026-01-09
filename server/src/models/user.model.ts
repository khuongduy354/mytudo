import type { ISupabaseClient } from "../di/supabase.js";
import type { UserProfile, UpdateProfileRequest } from "@mytudo/shared";

interface DbUser {
  id: string;
  email: string | null;
  phone: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export class UserModel {
  constructor(private supabase: ISupabaseClient) {}

  private mapToUserProfile(dbUser: DbUser): UserProfile {
    return {
      id: dbUser.id,
      email: dbUser.email ?? undefined,
      phone: dbUser.phone ?? undefined,
      fullName: dbUser.full_name,
      avatarUrl: dbUser.avatar_url,
      createdAt: dbUser.created_at,
      updatedAt: dbUser.updated_at,
    };
  }

  async findById(id: string): Promise<UserProfile | null> {
    const { data, error } = await this.supabase
      .getClient()
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return this.mapToUserProfile(data);
  }

  async findByPhone(phone: string): Promise<UserProfile | null> {
    const { data, error } = await this.supabase
      .getClient()
      .from("users")
      .select("*")
      .eq("phone", phone)
      .single();

    if (error || !data) return null;
    return this.mapToUserProfile(data);
  }

  async findByEmail(email: string): Promise<UserProfile | null> {
    const { data, error } = await this.supabase
      .getClient()
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !data) return null;
    return this.mapToUserProfile(data);
  }

  async create(
    id: string,
    identifier: { email?: string; phone?: string },
    fullName?: string
  ): Promise<UserProfile> {
    const { data, error } = await this.supabase
      .getClient()
      .from("users")
      .insert({
        id,
        email: identifier.email || null,
        phone: identifier.phone || null,
        full_name: fullName || null,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create user: ${error.message}`);
    return this.mapToUserProfile(data);
  }

  async update(
    id: string,
    updates: UpdateProfileRequest
  ): Promise<UserProfile> {
    const dbUpdates: Partial<DbUser> = {};
    if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
    if (updates.avatarUrl !== undefined)
      dbUpdates.avatar_url = updates.avatarUrl;

    const { data, error } = await this.supabase
      .getClient()
      .from("users")
      .update(dbUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update user: ${error.message}`);
    return this.mapToUserProfile(data);
  }

  async upsert(id: string, phone: string): Promise<UserProfile> {
    const { data, error } = await this.supabase
      .getClient()
      .from("users")
      .upsert({ id, phone }, { onConflict: "id" })
      .select()
      .single();

    if (error) throw new Error(`Failed to upsert user: ${error.message}`);
    return this.mapToUserProfile(data);
  }
}
