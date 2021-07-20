// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../node_modules/better-typescript-lib/lib.dom.generated.d.ts" />
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../node_modules/better-typescript-lib/lib.es2019.d.ts" />

declare module 'monaco-editor/esm/*';

interface Window {
  MonacoEnvironment: typeof MonacoEnvironment;
}

interface ImportMeta {
  env: {
    MODE: 'development' | 'production';
  };
}
