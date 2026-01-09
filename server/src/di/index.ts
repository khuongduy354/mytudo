import { container, DI_KEYS, type DIContainer } from "./container.js";
import { createDevContainer } from "./dev.container.js";
import { createProdContainer } from "./prod.container.js";

export type Environment = "development" | "production" | "test";

export function getEnvironment(): Environment {
  const env = process.env.NODE_ENV || "development";
  if (env === "production") return "production";
  if (env === "test") return "test";
  return "development";
}

export function initializeContainer(env?: Environment): DIContainer {
  const environment = env || getEnvironment();

  console.log(`[Container] Environment: ${environment}`);

  switch (environment) {
    case "production":
      return createProdContainer();
    case "development":
    case "test":
    default:
      return createDevContainer();
  }
}

export { container, DI_KEYS };
export type { DIContainer };
