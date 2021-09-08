import * as monaco from "../../../_snowpack/pkg/monaco-editor.js";
import getIndentRanges from "../ranges/indent.js";
import getRegexRanges from "../ranges/regex.js";
const registerArcLanguage = () => {
  const id = "arc";
  const conf = {
    autoClosingPairs: [{open: '"', close: '"'}],
    surroundingPairs: [{open: '"', close: '"'}]
  };
  const def = {
    tokenPostfix: ".arc",
    keywords: ["true", "false"],
    numberInteger: /(?:0|[+-]?[0-9]+)/,
    numberFloat: /(?:0|[+-]?[0-9]+)(?:\.[0-9]+)?(?:[eE][-+]?(?:0|[1-9][0-9]*))?/,
    numberOctal: /0[oO][0-7]+/,
    numberBinary: /0[bB][01]+/,
    numberHex: /0[xX][0-9a-fA-F]+/,
    tokenizer: {
      root: [
        {include: "@comment"},
        {include: "@whitespace"},
        [/@numberHex/, "number.hex"],
        [/@numberOctal/, "number.octal"],
        [/@numberBinary/, "number.binary"],
        [/@numberFloat/, "number.float"],
        [/@numberInteger/, "number"],
        [/@[\w-]+/, {token: "annotation"}],
        [/"/, {token: "string.quote", bracket: "@open", next: "@string"}],
        {include: "@identifier"}
      ],
      string: [
        [/"/, {token: "string.quote", bracket: "@close", next: "@pop"}],
        [/./, "string"]
      ],
      comment: [
        [/#.*$/, "comment"]
      ],
      whitespace: [
        [/[ \t\r\n]+/, "white"]
      ],
      identifier: [
        [/\S+/, {cases: {"@keywords": "keyword", "@default": "identifier"}}]
      ]
    }
  };
  monaco.languages.register({id});
  monaco.languages.setMonarchTokensProvider(id, def);
  monaco.languages.setLanguageConfiguration(id, conf);
  monaco.languages.registerFoldingRangeProvider(id, {
    provideFoldingRanges: async (model) => [
      ...await getIndentRanges(model),
      ...await getRegexRanges(model, /^\s*@/)
    ]
  });
};
export default registerArcLanguage;