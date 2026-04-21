/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  readonly VITE_SUPABASE_PRESENCE_DEVICE_ID?: string;
  readonly VITE_SUPABASE_PRESENCE_DEVICE_NAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
