import {
  createClient,
  SupabaseClient as SupabaseClientType,
} from "@supabase/supabase-js";

export interface ISupabaseClient {
  getClient(): SupabaseClientType;
}

// Client for auth operations (uses anon key, creates new instances)
export class DevSupabaseAuthClient implements ISupabaseClient {
  private client: SupabaseClientType;

  constructor() {
    const supabaseUrl = process.env.DEV_SUPABASE_URL;
    const supabaseKey = process.env.DEV_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing DEV Supabase auth environment variables");
    }

    this.client = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    console.log("[DEV] Supabase auth client initialized with anon key");
  }

  getClient(): SupabaseClientType {
    return this.client;
  }
}

// Client for data operations (uses service role key, singleton)
export class DevSupabaseClient implements ISupabaseClient {
  private client: SupabaseClientType;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

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

export class ProdSupabaseAuthClient implements ISupabaseClient {
  private client: SupabaseClientType;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing PROD Supabase auth environment variables");
    }

    this.client = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    console.log("[PROD] Supabase auth client initialized with anon key");
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
