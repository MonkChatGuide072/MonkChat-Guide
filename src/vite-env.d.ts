/// <reference types="vite/client" />

/**
 * TypeScript declarations for Vite environment variables used in this project.
 *
 * Only public/publishable variables are declared here.
 * Do NOT add VITE_SUPABASE_SERVICE_ROLE_KEY or any server-side secret.
 */
interface ImportMetaEnv {
  /** Supabase project URL — e.g. https://xxxxxxxxxxxx.supabase.co */
  readonly VITE_SUPABASE_URL: string
  /**
   * Supabase anon/publishable key.
   * Safe to include in browser bundles; enforced by Supabase Row Level Security.
   * Do NOT use the service-role key here.
   */
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
