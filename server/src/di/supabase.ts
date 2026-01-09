import {
  createClient,
  SupabaseClient as SupabaseClientType,
} from "@supabase/supabase-js";

export interface ISupabaseClient {
  getClient(): SupabaseClientType;
}

export class DevSupabaseClient implements ISupabaseClient {
  private client: SupabaseClientType;

  constructor() {
    const supabaseUrl = process.env.DEV_SUPABASE_URL;
    const supabaseKey = process.env.DEV_SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing DEV Supabase environment variables");
    }

    this.client = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    console.log("[DEV] Supabase client initialized with service role");
  }

  getClient(): SupabaseClientType {
    return this.client;
  }
}

export class ProdSupabaseClient implements ISupabaseClient {
  private client: SupabaseClientType;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing PROD Supabase environment variables");
    }

    this.client = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    console.log("[PROD] Supabase client initialized with service role");
  }

  getClient(): SupabaseClientType {
    return this.client;
  }
}
