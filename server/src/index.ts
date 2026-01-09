import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({
  path: process.env.NODE_ENV === "development" ? ".env.local" : ".env",
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

// Routes
app.use("/api/auth", createAuthRouter(container));
app.use("/api/wardrobe", createWardrobeRouter(container));
app.use("/api/listings", createListingRouter(container));
app.use("/api/marketplace", createMarketplaceRouter(container));
app.use("/api/wishlist", createWishlistRouter(container));
app.use("/api/upload", createUploadRouter(container));

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
