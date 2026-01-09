/**
 * Zustand Stores
 *
 * This folder contains Zustand stores for client-side state management.
 *
 * When to use Zustand vs React Query:
 * - Zustand: Client-only state (auth tokens, UI preferences, form drafts)
 * - React Query: Server state (API data, caching, background refetching)
 *
 * Store Guidelines:
 * - One store per domain (auth, ui, etc.)
 * - Export selector hooks for optimized re-renders
 * - Use persist middleware for state that should survive page refresh
 */

export * from "./auth.store";
