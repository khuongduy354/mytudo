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

export class AuthService {
  constructor(
    private userModel: UserModel,
    private supabase: ISupabaseClient
  ) {}

  // Email/password authentication
  async loginWithEmail(data: LoginWithEmailRequest): Promise<AuthResponse> {
    const { data: authData, error } = await this.supabase
      .getClient()
      .auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

    if (error || !authData.user) {
      throw new Error(`Login failed: ${error?.message || "Unknown error"}`);
    }

    // Get or create user profile
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
    const { data: authData, error } = await this.supabase
      .getClient()
      .auth.signUp({
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

    // Create user profile
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
    const { error } = await this.supabase.getClient().auth.signInWithOtp({
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
    const { data, error } = await this.supabase
      .getClient()
      .auth.refreshSession({ refresh_token: refreshToken });

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
    // Invalidate the session on Supabase
    await this.supabase.getClient().auth.admin.signOut(accessToken);
  }
}
