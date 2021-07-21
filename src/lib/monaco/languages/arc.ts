import * as monaco from 'monaco-editor';

const registerArcLanguage = (): void => {
  const id = 'arc';
  monaco.languages.register({ id });
  const def = {
    tokenizer: {
      root: [
        // identifier
        { include: '@identifier' },

        // whitespace
        { include: '@whitespace' },

        // @ annotations.
        [/@[\w$\-.]+/, { token: 'annotation' }],

        // numbers
        [/\d*\.\d+([eE][-+]?\d+)?/, 'number.float'],
        [/0[xX][0-9a-fA-F]+/, 'number.hex'],
        [/\d+/, 'number'],

        // delimiter: after number because of .\d floats
        [/[;,.]/, 'delimiter'],

        // strings
        [/"([^"\\]|\\.)*$/, 'string.invalid'], // non-teminated string
        [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],
      ],

      string: [
        [/[^\\"]+/, 'string'],
        [/\\./, 'string.escape.invalid'],
        [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }],
      ],

      whitespace: [
        [/[ \t\r\n]+/, 'white'],
        [/^#.*/, 'comment'],
      ],

      identifier: [[/[\w$\-.]+/, 'identifier']],
    },
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  monaco.languages.setMonarchTokensProvider(id, def as any);
};

export default registerArcLanguage;
