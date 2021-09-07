import * as monaco from 'monaco-editor';
import getIndentRanges from '../ranges/indent';
import getRegexRanges from '../ranges/regex';

const registerArcLanguage = (): void => {
  const id = 'arc';
  const conf: monaco.languages.LanguageConfiguration = {
    autoClosingPairs: [{ open: '"', close: '"' }],
    surroundingPairs: [{ open: '"', close: '"' }],
  };
  const def: monaco.languages.IMonarchLanguage = {
    tokenPostfix: '.arc',
    keywords: ['true', 'false'],

    numberInteger: /(?:0|[+-]?[0-9]+)/,
    numberFloat: /(?:0|[+-]?[0-9]+)(?:\.[0-9]+)?(?:[eE][-+]?(?:0|[1-9][0-9]*))?/,
    numberOctal: /0[oO][0-7]+/,
    numberBinary: /0[bB][01]+/,
    numberHex: /0[xX][0-9a-fA-F]+/,

    tokenizer: {
      root: [
        // whitespace
        { include: '@comment' },
        { include: '@whitespace' },

        // numbers
        [/@numberHex/, 'number.hex'],
        [/@numberOctal/, 'number.octal'],
        [/@numberBinary/, 'number.binary'],
        [/@numberFloat/, 'number.float'],

        [/@numberInteger/, 'number'],

        // @...
        [/@[\w-]+/, { token: 'annotation' }],

        // strings
        [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],

        // bare string
        { include: '@identifier' },
      ],

      string: [
        [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }],
        [/./, 'string'],
      ],

      comment: [
        //
        [/#.*$/, 'comment'],
      ],

      whitespace: [
        //
        [/[ \t\r\n]+/, 'white'],
      ],

      identifier: [
        //
        [/\S+/, { cases: { '@keywords': 'keyword', '@default': 'identifier' } }],
      ],
    },
  };

  monaco.languages.register({ id });
  monaco.languages.setMonarchTokensProvider(id, def);
  monaco.languages.setLanguageConfiguration(id, conf);
  monaco.languages.registerFoldingRangeProvider(id, {
    provideFoldingRanges: async (model) => [
      ...(await getIndentRanges(model)),
      ...(await getRegexRanges(model, /^\s*@/)),
    ],
  });
};

export default registerArcLanguage;
