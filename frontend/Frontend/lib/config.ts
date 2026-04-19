// ─────────────────────────────────────────────
// Centralized backend configuration
// ─────────────────────────────────────────────
// Use NEXT_PUBLIC_BACKEND_URL env var in production, or fall back to Render URL.
export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001" // Local development
// process.env.NEXT_PUBLIC_BACKEND_URL || "https://codeplay-11ib.onrender.com" // Production
