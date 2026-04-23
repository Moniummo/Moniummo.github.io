/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  readonly VITE_SUPABASE_PRESENCE_DEVICE_ID?: string;
  readonly VITE_SUPABASE_PRESENCE_DEVICE_NAME?: string;
  readonly VITE_EMERGENCY_POPUP_PASSWORD_HASH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
