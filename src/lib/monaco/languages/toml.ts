import * as monaco from 'monaco-editor';
import getIndentRanges from '../ranges/indent';
import getRegexRanges from '../ranges/regex';

const registerTOMLLanguage = (): void => {
  const id = 'toml';
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
      { open: '"""', close: '"""' },
      { open: "'''", close: "'''" },
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
    tokenPostfix: '.toml',
    brackets: [
      { token: 'delimiter.bracket', open: '{', close: '}' },
      { token: 'delimiter.square', open: '[', close: ']' },
      { token: 'delimiter.square.double', open: '[[', close: ']]' },
    ],
    keywords: ['true', 'false', 'nan', 'inf'],

    identifier: /[A-Za-z_-][A-Za-z0-9_-]*/,

    numberInteger: /(?:0|[+-]?[0-9_]+)/,
    numberFloat: /(?:0|[+-]?[0-9_]+)(?:\.[0-9_]+)?(?:[eE][-+]?(?:0|[1-9][0-9_])*)?/,
    numberOctal: /0[oO][0-7_]+/,
    numberBinary: /0[bB][01_]+/,
    numberHex: /0[xX][0-9a-fA-F_]+/,
    numberDate: /\d{4}-\d\d-\d\d([Tt ]\d\d:\d\d:\d\d(\.\d+)?(( ?[+-]\d\d?(:\d\d)?)|Z)?)?/,
    numberTime: /\d\d:\d\d:\d\d(\.\d+)?(( ?[+-]\d\d?(:\d\d)?)|Z)?/,

    escapes: /\\(?:[btnfr"\\\n/ ]|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

    tokenizer: {
      root: [
        { include: '@whitespace' },
        { include: '@comment' },

        { include: '@value' },

        [/\[\[/, { token: 'delimiter.bracket', bracket: '@open', next: '@arrayKey' }],
        [/\[/, { token: 'bracket.square.double', bracket: '@open', next: '@tableKey' }],

        // [/[{}()[\]]/, '@brackets'],
        // [/[\w$\-.]+/, 'identifier'],
        // [/[;,.]/, 'delimiter'],
        // { include: '@table' },
        // { include: '@key_value' },
      ],

      comment: [[/#.*$/, 'comment']],
      whitespace: [[/[ \t\r\n]+/, 'white']],

      valueNumber: [
        [/@numberDate/, 'number.date'],
        [/@numberTime/, 'number.date.time'],

        [/@numberHex/, 'number.hex'],
        [/@numberOctal/, 'number.octal'],
        [/@numberBinary/, 'number.binary'],
        [/@numberFloat/, 'number.float'],

        [/@numberInteger/, 'number'],
        [/(-)(nan)/, ['operator', 'keyword']],
        [/(-)(inf)/, ['operator', 'keyword']],
      ],

      valueString: [
        { include: '@stringBasicTriple' },
        { include: '@stringLiteralTriple' },
        { include: '@stringBasic' },
        { include: '@stringLiteral' },
      ],

      valueArray: [
        {
          regex: /(=)(\s*)(\[)/,
          action: [
            'delimiter',
            'white',
            {
              // bracket: '@open',
              token: 'bracket.square',
              log: 'here1',
              next: '@valueArrayBody',
            },
          ],
        },
      ],
      valueArrayBody: [
        //
        [/\[/, 'bracket.square', '@push'],
        { include: '@value' },
        [/\]/, 'bracket.square', '@pop'],
      ],

      valueTable: [
        //
        [/\{/, { token: 'bracket.square', bracket: '@open', next: '@valueTableBody' }],
      ],
      valueTableBody: [
        //
        { include: '@value' },
        [/\}/, { token: 'bracket.square', bracket: '@close', next: '@pop' }],
      ],

      value: [
        //
        { include: '@valueString' },
        { include: '@valueNumber' },
        { include: '@valueArray' },
        { include: '@valueTable' },

        // Should be after number (ex: -1)
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

      arrayKey: [
        //
        { include: '@stringBasic' },
        { include: '@stringLiteral' },
        [/@identifier/, 'type.keyword'],
        [/\]\]/, { token: 'bracket.square.double', bracket: '@close', next: '@pop' }],
      ],

      tableKey: [
        //
        { include: '@stringBasic' },
        { include: '@stringLiteral' },
        [/@identifier/, 'type.keyword'],
        [/\]/, { token: 'bracket.square', bracket: '@close', next: '@pop' }],
      ],

      stringLiteral: [
        //
        [/'(?:[^'])*$/, 'string.invalid'], // non-teminated string
        [/'/, { token: 'string.quote.literal', bracket: '@open', next: '@stringLiteralBody' }],
      ],
      stringLiteralBody: [
        //
        [/'/, { token: 'string.quote.literal', bracket: '@close', next: '@pop' }],
        [/./, 'string'],
      ],

      stringBasic: [
        //
        [/"(?:[^"\\]|\\.)*$/, 'string.invalid'], // non-teminated string
        [/"/, { token: 'string.quote.basic', bracket: '@open', next: '@stringBasicBody' }],
      ],
      stringBasicBody: [
        //
        [/@escapes/, 'string.escape'],
        [/"/, { token: 'string.quote.basic', bracket: '@close', next: '@pop' }],
        [/./, 'string'],
      ],

      stringLiteralTriple: [
        //
        [/'''/, { token: 'string.quote.literal.triple', bracket: '@open', next: '@stringLiteralTripleBody' }],
      ],
      stringLiteralTripleBody: [
        //
        [/'''/, { token: 'string.quote.literal.triple', bracket: '@close', next: '@pop' }],
        [/./, 'string'],
      ],

      stringBasicTriple: [
        //
        [/"""/, { token: 'string.quote.basic.triple', bracket: '@open', next: '@stringBasicTripleBody' }],
      ],
      stringBasicTripleBody: [
        //
        [/@escapes/, 'string.escape'],
        [/"""/, { token: 'string.quote.basic.triple', bracket: '@close', next: '@pop' }],
        [/./, 'string'],
      ],
    },
  };

  monaco.languages.register({ id });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  monaco.languages.setMonarchTokensProvider(id, def as any);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  monaco.languages.setLanguageConfiguration(id, conf as any);
  monaco.languages.registerFoldingRangeProvider(id, {
    provideFoldingRanges: async model => {
      return [
        ...(await getIndentRanges(model)),
        ...(await getRegexRanges(model, /^\s*\[\[/)),
        ...(await getRegexRanges(model, /^\s*\[\s*[^[]/)),
      ];
    },
  });
};

export default registerTOMLLanguage;
