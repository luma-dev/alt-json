import * as monaco from 'monaco-editor';

const registerJSONCLanguage = (): void => {
  const id = 'jsonc';
  const conf = {
    brackets: [
      ['{', '}'],
      ['[', ']'],
      ['(', ')'],
    ],
    autoClosingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
    ],
    surroundingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
    ],
  };
  const def = {
    tokenPostfix: '.jsonc',
    brackets: [
      { token: 'delimiter.bracket', open: '{', close: '}' },
      { token: 'delimiter.square', open: '[', close: ']' },
    ],
    keywords: ['true', 'false', 'null'],

    identifier: /[a-zA-Z$][\w$]*/,

    numberInteger: /(?:0|[+-]?[0-9]+)/,
    numberFloat: /(?:0|[+-]?[0-9]+)(?:\.[0-9]+)?(?:[eE][-+]?(?:0|[1-9][0-9]*))?/,

    escapes: /\\(?:[btnfr'"\\\n/ ]|$|u[0-9A-Fa-f]{4}|x[0-9]{2})/,

    tokenizer: {
      root: [
        { include: '@whitespace' },
        { include: '@comment' },

        { include: '@number' },

        { include: '@stringDouble' },

        { include: '@identifier' },

        [/[{}()[\]]/, '@brackets'],
        [/[,.:]/, 'delimiter'],
        [/[-+]/, 'operator'],
      ],

      comment: [
        [/\/\/.*$/, 'comment'],
        [/\/\*/, 'comment', '@commentMultiline'],
      ],

      commentMultiline: [
        [/\*\//, 'comment', '@pop'],
        [/./, 'comment'],
      ],

      whitespace: [[/[ \t\r\n]+/, 'white']],

      number: [
        [/@numberFloat/, 'number.float'],

        [/@numberInteger/, 'number'],
      ],

      identifier: [
        //
        [
          /@identifier/,
          {
            cases: {
              '@keywords': 'keyword',
              '@default': '',
            },
          },
        ],
      ],

      stringSingle: [
        //
        [/'(?:[^'\\]|\\.)*(?<!\\)$/, 'string.invalid'], // non-teminated string
        [/'/, { token: 'string.quote.single', bracket: '@open', next: '@stringSingleBody' }],
      ],
      stringSingleBody: [
        //
        [/@escapes/, 'string.escape'],
        [/'/, { token: 'string.quote.single', bracket: '@close', next: '@pop' }],
        [/./, 'string'],
      ],

      stringDouble: [
        //
        [/"(?:[^"\\]|\\.)*(?<!\\)$/, 'string.invalid'], // non-teminated string
        [/"/, { token: 'string.quote.double', bracket: '@open', next: '@stringDoubleBody' }],
      ],
      stringDoubleBody: [
        //
        [/@escapes/, 'string.escape'],
        [/"/, { token: 'string.quote.double', bracket: '@close', next: '@pop' }],
        [/./, 'string'],
      ],
    },
  };

  monaco.languages.register({ id });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  monaco.languages.setMonarchTokensProvider(id, def as any);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  monaco.languages.setLanguageConfiguration(id, conf as any);
};

export default registerJSONCLanguage;