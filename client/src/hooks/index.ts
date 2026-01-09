/**
 * Hooks Folder
 *
 * This folder contains reusable custom React hooks that provide:
 *
 * 1. Abstraction of common logic patterns across the application
 * 2. Encapsulation of browser APIs and side effects
 * 3. Composable building blocks for feature-specific hooks
 *
 * Guidelines:
 * - Hooks here should be generic and reusable across multiple features
 * - Feature-specific hooks should live in their respective feature folders
 * - Always prefix with "use" (e.g., useDebounce, useLocalStorage)
 * - Include TypeScript types for parameters and return values
 */

export * from "./useDebounce";
export * from "./useLocalStorage";
export * from "./useMediaQuery";
