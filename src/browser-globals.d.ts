// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../node_modules/better-typescript-lib/lib.dom.generated.d.ts" />

// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../node_modules/better-typescript-lib/lib.es2019.d.ts" />

declare module 'monaco-editor/esm/vs/editor/contrib/folding/indentRangeProvider' {
  import type * as monaco from 'monaco-editor';

  class IndentRangeProvider {
    constructor(model: monaco.editor.ITextModel);

    compute(): monaco.Thenable<{
      _startIndexes: Uint32Array;
      _endIndexes: Uint32Array;
    }>;
  }
}

interface Window {
  MonacoEnvironment: typeof MonacoEnvironment;
}

interface ImportMeta {
  env: {
    MODE: 'development' | 'production';
  };
}
