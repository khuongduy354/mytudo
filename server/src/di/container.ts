// Simple DI Container - No external libraries
// Stores singleton instances by key

type Factory<T = any> = () => T;

export class DIContainer {
  private instances: Map<string, any> = new Map();
  private factories: Map<string, Factory> = new Map();

  // Register a singleton instance directly
  registerInstance<T>(key: string, instance: T): void {
    this.instances.set(key, instance);
  }

  // Register a factory function (lazy instantiation)
  registerFactory<T>(key: string, factory: Factory<T>): void {
    this.factories.set(key, factory);
  }

  // Resolve a dependency
  resolve<T>(key: string): T {
    // Check if already instantiated
    if (this.instances.has(key)) {
      return this.instances.get(key) as T;
    }

    // Check if factory exists
    if (this.factories.has(key)) {
      const factory = this.factories.get(key)!;
      const instance = factory();
      this.instances.set(key, instance); // Cache as singleton
      return instance as T;
    }

    throw new Error(`Dependency not registered: ${key}`);
  }

  // Check if a dependency is registered
  has(key: string): boolean {
    return this.instances.has(key) || this.factories.has(key);
  }

  // Clear all registrations (useful for testing)
  clear(): void {
    this.instances.clear();
    this.factories.clear();
  }
}

// Export a singleton container instance
export const container = new DIContainer();

// Dependency keys - use constants to avoid typos
export const DI_KEYS = {
  // Infrastructure
  SUPABASE_CLIENT: "SupabaseClient",
  SUPABASE_AUTH_CLIENT: "SupabaseAuthClient",

  // Models
  USER_MODEL: "UserModel",
  WARDROBE_MODEL: "WardrobeModel",
  LISTING_MODEL: "ListingModel",
  WISHLIST_MODEL: "WishlistModel",
  ORDER_MODEL: "OrderModel",

  // Services
  AUTH_SERVICE: "AuthService",
  WARDROBE_SERVICE: "WardrobeService",
  LISTING_SERVICE: "ListingService",
  WISHLIST_SERVICE: "WishlistService",
  UPLOAD_SERVICE: "UploadService",
  ORDER_SERVICE: "OrderService",

  // Controllers
  AUTH_CONTROLLER: "AuthController",
  WARDROBE_CONTROLLER: "WardrobeController",
  LISTING_CONTROLLER: "ListingController",
  WISHLIST_CONTROLLER: "WishlistController",
  UPLOAD_CONTROLLER: "UploadController",
  ORDER_CONTROLLER: "OrderController",
  DEBUG_CONTROLLER: "DebugController",

  // Debug
  DEBUG_SERVICE: "DebugService",
  
  // AI
  AI_SERVICE: "AiService",
  AI_CONTROLLER: "AiController",
} as const;
