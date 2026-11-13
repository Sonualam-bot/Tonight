/**
 * WebSocket address of the Tonight server.
 * Set `VITE_SERVER_URL` per environment; defaults to the local dev server.
 * Anything prefixed `VITE_` is visible to every browser, so never put secrets here.
 */
export const SERVER_URL: string = import.meta.env.VITE_SERVER_URL ?? "ws://localhost:3000";
