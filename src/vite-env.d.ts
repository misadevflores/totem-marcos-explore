/// <reference types="vite/client" />

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.pdf' {
  const content: string;
  export default content;
}

interface ImportMetaEnv {
  readonly VITE_API_BASE?: string;
  readonly VITE_ADMIN_PASSWORD?: string;
  readonly VITE_BUILD_TARGET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
