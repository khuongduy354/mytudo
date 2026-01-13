import type { ISupabaseClient } from "../di/supabase.js";
import type { UserModel } from "../models/user.model.js";
import type {
  UserProfile,
  AuthResponse,
  UpdateProfileRequest,
  LoginWithEmailRequest,
  RegisterWithEmailRequest,
  SendMagicLinkRequest,
  SendMagicLinkResponse,
} from "@mytudo/shared";
import { createClient } from "@supabase/supabase-js";

export class AuthService {
  constructor(
    private userModel: UserModel,
    private supabase: ISupabaseClient
  ) {}

  // Create a temporary client for auth operations to avoid polluting the singleton
  private createAuthClient() {
    const supabaseUrl =
      process.env.DEV_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey =
      process.env.DEV_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables for auth");
    }

    return createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  // Email/password authentication
  async loginWithEmail(data: LoginWithEmailRequest): Promise<AuthResponse> {
    // Use a separate client instance to avoid polluting the shared service role client
    const authClient = this.createAuthClient();

    const { data: authData, error } = await authClient.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error || !authData.user) {
      throw new Error(`Login failed: ${error?.message || "Unknown error"}`);
    }

    // Get or create user profile using the service role client
    let user = await this.userModel.findById(authData.user.id);
    if (!user) {
      user = await this.userModel.create(
        authData.user.id,
        { email: data.email },
        authData.user.user_metadata?.full_name
      );
    }

    return {
      user,
      accessToken: authData.session?.access_token || "",
      refreshToken: authData.session?.refresh_token || "",
    };
  }

  async registerWithEmail(
    data: RegisterWithEmailRequest
  ): Promise<AuthResponse> {
    // Use a separate client instance
    const authClient = this.createAuthClient();

    const { data: authData, error } = await authClient.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName || null,
        },
      },
    });

    if (error || !authData.user) {
      throw new Error(
        `Registration failed: ${error?.message || "Unknown error"}`
      );
    }

    // Create user profile using service role client
    const user = await this.userModel.create(
      authData.user.id,
      { email: data.email },
      data.fullName
    );

    return {
      user,
      accessToken: authData.session?.access_token || "",
      refreshToken: authData.session?.refresh_token || "",
    };
  }

  // Magic link authentication (passwordless email login)
  async sendMagicLink(
    data: SendMagicLinkRequest
  ): Promise<SendMagicLinkResponse> {
    const authClient = this.createAuthClient();

    const { error } = await authClient.auth.signInWithOtp({
      email: data.email,
      options: {
        emailRedirectTo: process.env.SITE_URL || "http://127.0.0.1:3000",
      },
    });

    if (error) {
      throw new Error(`Failed to send magic link: ${error.message}`);
    }

    return { message: "Magic link sent successfully" };
  }

  async getMe(userId: string): Promise<UserProfile | null> {
    return this.userModel.findById(userId);
  }

  async updateProfile(
    userId: string,
    data: UpdateProfileRequest
  ): Promise<UserProfile> {
    return this.userModel.update(userId, data);
  }

  async refreshToken(
    refreshToken: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // Use a separate client instance for refresh
    const authClient = this.createAuthClient();

    const { data, error } = await authClient.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session) {
      throw new Error(
        `Failed to refresh token: ${error?.message || "Unknown error"}`
      );
    }

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    };
  }

  async logout(accessToken: string): Promise<void> {
    // Use admin API to invalidate the token
    await this.supabase.getClient().auth.admin.signOut(accessToken);
  }
}
