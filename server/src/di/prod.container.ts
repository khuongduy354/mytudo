import { container, DI_KEYS, DIContainer } from "./container.js";
import { ProdSupabaseClient, ISupabaseClient } from "./supabase.js";

// Models
import { UserModel } from "../models/user.model.js";
import { WardrobeModel } from "../models/wardrobe.model.js";
import { ListingModel } from "../models/listing.model.js";
import { WishlistModel } from "../models/wishlist.model.js";
import { OrderModel } from "../models/order.model.js";

// Services
import { AuthService } from "../services/auth.service.js";
import { WardrobeService } from "../services/wardrobe.service.js";
import { ListingService } from "../services/listing.service.js";
import { WishlistService } from "../services/wishlist.service.js";
import { UploadService } from "../services/upload.service.js";
import { OrderService } from "../services/order.service.js";

// Controllers
import { AuthController } from "../controllers/auth.controller.js";
import { WardrobeController } from "../controllers/wardrobe.controller.js";
import { ListingController } from "../controllers/listing.controller.js";
import { WishlistController } from "../controllers/wishlist.controller.js";
import { UploadController } from "../controllers/upload.controller.js";
import { OrderController } from "../controllers/order.controller.js";

export function createProdContainer(): DIContainer {
  console.log("[Container] Initializing PROD container...");

  // Infrastructure - PROD Supabase
  container.registerFactory(
    DI_KEYS.SUPABASE_CLIENT,
    () => new ProdSupabaseClient(),
  );

  // Models
  container.registerFactory(DI_KEYS.USER_MODEL, () => {
    const supabase = container.resolve<ISupabaseClient>(
      DI_KEYS.SUPABASE_CLIENT,
    );
    return new UserModel(supabase);
  });

  container.registerFactory(DI_KEYS.WARDROBE_MODEL, () => {
    const supabase = container.resolve<ISupabaseClient>(
      DI_KEYS.SUPABASE_CLIENT,
    );
    return new WardrobeModel(supabase);
  });

  container.registerFactory(DI_KEYS.LISTING_MODEL, () => {
    const supabase = container.resolve<ISupabaseClient>(
      DI_KEYS.SUPABASE_CLIENT,
    );
    return new ListingModel(supabase);
  });

  container.registerFactory(DI_KEYS.WISHLIST_MODEL, () => {
    const supabase = container.resolve<ISupabaseClient>(
      DI_KEYS.SUPABASE_CLIENT,
    );
    return new WishlistModel(supabase);
  });

  container.registerFactory(DI_KEYS.ORDER_MODEL, () => {
    const supabase = container.resolve<ISupabaseClient>(
      DI_KEYS.SUPABASE_CLIENT,
    );
    return new OrderModel(supabase);
  });

  // Services
  container.registerFactory(DI_KEYS.AUTH_SERVICE, () => {
    const userModel = container.resolve<UserModel>(DI_KEYS.USER_MODEL);
    const supabase = container.resolve<ISupabaseClient>(
      DI_KEYS.SUPABASE_CLIENT,
    );
    return new AuthService(userModel, supabase);
  });

  container.registerFactory(DI_KEYS.WARDROBE_SERVICE, () => {
    const wardrobeModel = container.resolve<WardrobeModel>(
      DI_KEYS.WARDROBE_MODEL,
    );
    const listingModel = container.resolve<ListingModel>(DI_KEYS.LISTING_MODEL);
    return new WardrobeService(wardrobeModel, listingModel);
  });

  container.registerFactory(DI_KEYS.LISTING_SERVICE, () => {
    const listingModel = container.resolve<ListingModel>(DI_KEYS.LISTING_MODEL);
    const wardrobeModel = container.resolve<WardrobeModel>(
      DI_KEYS.WARDROBE_MODEL,
    );
    return new ListingService(listingModel, wardrobeModel);
  });

  container.registerFactory(DI_KEYS.WISHLIST_SERVICE, () => {
    const wishlistModel = container.resolve<WishlistModel>(
      DI_KEYS.WISHLIST_MODEL,
    );
    const listingModel = container.resolve<ListingModel>(DI_KEYS.LISTING_MODEL);
    return new WishlistService(wishlistModel, listingModel);
  });

  container.registerFactory(DI_KEYS.UPLOAD_SERVICE, () => {
    const supabase = container.resolve<ISupabaseClient>(
      DI_KEYS.SUPABASE_CLIENT,
    );
    return new UploadService(supabase);
  });

  container.registerFactory(DI_KEYS.ORDER_SERVICE, () => {
    const orderModel = container.resolve<OrderModel>(DI_KEYS.ORDER_MODEL);
    const listingModel = container.resolve<ListingModel>(DI_KEYS.LISTING_MODEL);
    const wardrobeModel = container.resolve<WardrobeModel>(
      DI_KEYS.WARDROBE_MODEL,
    );
    return new OrderService(orderModel, listingModel, wardrobeModel);
  });

  // Controllers
  container.registerFactory(DI_KEYS.AUTH_CONTROLLER, () => {
    const authService = container.resolve<AuthService>(DI_KEYS.AUTH_SERVICE);
    return new AuthController(authService);
  });

  container.registerFactory(DI_KEYS.WARDROBE_CONTROLLER, () => {
    const wardrobeService = container.resolve<WardrobeService>(
      DI_KEYS.WARDROBE_SERVICE,
    );
    return new WardrobeController(wardrobeService);
  });

  container.registerFactory(DI_KEYS.LISTING_CONTROLLER, () => {
    const listingService = container.resolve<ListingService>(
      DI_KEYS.LISTING_SERVICE,
    );
    return new ListingController(listingService);
  });

  container.registerFactory(DI_KEYS.WISHLIST_CONTROLLER, () => {
    const wishlistService = container.resolve<WishlistService>(
      DI_KEYS.WISHLIST_SERVICE,
    );
    return new WishlistController(wishlistService);
  });

  container.registerFactory(DI_KEYS.UPLOAD_CONTROLLER, () => {
    const uploadService = container.resolve<UploadService>(
      DI_KEYS.UPLOAD_SERVICE,
    );
    return new UploadController(uploadService);
  });

  container.registerFactory(DI_KEYS.ORDER_CONTROLLER, () => {
    const orderService = container.resolve<OrderService>(DI_KEYS.ORDER_SERVICE);
    return new OrderController(orderService);
  });

  console.log("[Container] PROD container initialized");
  return container;
}
