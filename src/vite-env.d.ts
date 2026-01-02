/// <reference types="vite/client" />

declare const __APP_VERSION__: string;

interface ImportMetaEnv {
  /** Backend tunnel URL for remote access (e.g., https://your-tunnel.ngrok-free.app) */
  readonly VITE_BACKEND_TUNNEL_URL?: string;
  /** Allowed hosts for Vite dev server, comma-separated (e.g., your-tunnel.pinggy.link) */
  readonly VITE_ALLOWED_HOSTS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
