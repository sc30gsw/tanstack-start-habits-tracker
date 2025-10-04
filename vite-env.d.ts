/// <reference types="vite/client" />

interface ViteTypeOptions {
  // By adding this line, you can make the type of ImportMetaEnv strict
  // to disallow unknown keys.
  strictImportMetaEnv: unknown
}

interface ImportMetaEnv {
  readonly VITE_TURSO_CONNECTION_URL: string
  readonly VITE_TURSO_AUTH_TOKEN: string
  readonly VITE_BETTER_AUTH_URL: string
  readonly VITE_BETTER_AUTH_SECRET: string
  readonly VITE_GITHUB_CLIENT_ID: string
  readonly VITE_GITHUB_CLIENT_SECRET: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}