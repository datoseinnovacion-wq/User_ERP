/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SEA_SSO_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
