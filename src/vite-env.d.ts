/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PLANLLAMA_API_TOKEN: string;
  readonly VITE_OPENAI_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.css" {
  const content: Record<string, string>;
  export default content;
}
