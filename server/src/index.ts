import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables
const isDevEnv = process.env.NODE_ENV === "development";
console.log("[DEBUG] Is dev env", isDevEnv);
dotenv.config({
  path: isDevEnv ? ".env.dev" : ".env",
});

// Import DI setup
import { initializeContainer, type Environment } from "./di/index.js";

// Import route factories
import { createAuthRouter } from "./routes/auth.routes.js";
import { createWardrobeRouter } from "./routes/wardrobe.routes.js";
import {
  createListingRouter,
  createMarketplaceRouter,
} from "./routes/listing.routes.js";
import { createWishlistRouter } from "./routes/wishlist.routes.js";
import { createUploadRouter } from "./routes/upload.routes.js";
import { createOrderRouter } from "./routes/order.routes.js";

// Error handler
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize DI container based on environment
const env = (process.env.NODE_ENV || "development") as Environment;
const container = initializeContainer(env);

console.log(`Initializing ${env} container...`);

// Middleware
app.use(cors());
app.use(express.json());

// Disable caching for API routes
app.use("/api", (req, res, next) => {
  res.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  next();
});

// Routes
app.use("/api/auth", createAuthRouter(container));
app.use("/api/wardrobe", createWardrobeRouter(container));
app.use("/api/listings", createListingRouter(container));
app.use("/api/marketplace", createMarketplaceRouter(container));
app.use("/api/wishlist", createWishlistRouter(container));
app.use("/api/upload", createUploadRouter(container));
app.use("/api/orders", createOrderRouter(container));

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    environment: env,
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} in ${env} mode`);
});

export default app;
