import * as monaco from 'monaco-editor';

const registerTOMLLanguage = (): void => {
  const id = 'toml';
  monaco.languages.register({ id });
  const def = {
    tokenizer: {
      root: [
        { include: '@whitespace' },
        [/[{}()[\]]/, '@brackets'],
        [/[\w$\-.]+/, 'identifier'],
        [/[;,.]/, 'delimiter'],
        { include: '@table' },
        { include: '@key_value' },
      ],

      comment: [[/^[ \t\r\n]*#.*$/, 'comment']],

      whitespace: [[/[ \t\r\n]+/, 'white']],

      table: [
        // [key]
        [
          /^[ \t\r\n]*(\[)([^[\]]*)(\])/,
          [{ token: '@brackets', bracket: '@open' }, '@table_key', { token: '@brackets', bracket: '@close' }],
        ],
        // [[key]]
        [
          /^[ \t\r\n]*(\[\[)([^[\]]*)(\]\])/,
          [{ token: '@brackets', bracket: '@open' }, '@table_key', { token: '@brackets', bracket: '@close' }],
        ],
        // { ... }
        { include: '@braket_table' },
      ],
      table_key: [[/[\w$-]+/, 'type.identifier'], { include: '@basic_string' }, [/[;,.]/, 'delimiter']],
      braket_table: [['(?<!\\w)(\\{)\\s*', { token: '@brackets', bracket: '@close', next: '@braket_table_body' }]],
      braket_table_body: [
        { include: '@whitespace' },
        { include: '@comment' },
        { include: '@key_value' },
        { include: '@data' },
        ['\\s*(\\})(?!\\w)', { token: '@brackets', bracket: '@close', next: '@pop' }],
      ],
      key_value: [
        ['^(\\s*=.*)$', 'invalid.illegal.noKey.toml'],
        ['^(\\s*[A-Za-z_\\-][A-Za-z0-9_\\-]*\\s*=)(?=\\s*$)', 'invalid.deprecated.noValue.toml'],
        // key = ...
        [
          '\\s*([A-Za-z_-][A-Za-z0-9_-]*|".+"|\'.+\'|[0-9]+)\\s*(=)\\s*',
          ['entity.name.tag.toml', 'delimiter.definition'],
          '@value',
        ],
      ],
      value: [
        { include: '@comment' },
        { include: '@data' },
        { include: '@illegal' },
        ['($|(?==)|\\,|\\s*(?=\\}))', { token: '@brackets', bracket: '@close', next: '@pop' }],
      ],
      data: [
        // { ... }
        { include: '@braket_table' },
        // [ ... ]
        { include: '@data_array' },
        // """ ... """
        { include: '@triple_basic_string' },
        // " ... "
        { include: '@basic_string' },
        // ''' ... '''
        ["'''", { token: '@brackets', bracket: '@open', next: '@triple_literal_string' }],
        ["'.*?'", 'string.quoted.single.literal.line.toml'],
        [
          '(?<!\\w)(\\d{4}\\-\\d{2}\\-\\d{2}[T| ]\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?(?:Z|[\\+\\-]\\d{2}:\\d{2}))(?!\\w)',
          ['constant.other.datetime.offset.toml'],
        ],
        ['(\\d{4}\\-\\d{2}\\-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?)', 'constant.other.datetime.local.toml'],
        ['\\d{4}\\-\\d{2}\\-\\d{2}', 'constant.other.date.toml'],
        ['\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?', 'constant.other.time.toml'],
        ['(?<!\\w)(true|false)(?!\\w)', ['constant.other.boolean.toml']],
        [
          '(?<!\\w)([\\+\\-]?(0|([1-9](([0-9]|_[0-9])+)?))(?:(?:\\.(0|([1-9](([0-9]|_[0-9])+)?)))?[eE][\\+\\-]?[1-9]_?[0-9]*|(?:\\.[0-9_]*)))(?!\\w)',
          ['constant.numeric.float.toml'],
        ],
        ['(?<!\\w)((?:[\\+\\-]?(0|([1-9](([0-9]|_[0-9])+)?))))(?!\\w)', ['constant.numeric.integer.toml']],
        ['(?<!\\w)([\\+\\-]?inf)(?!\\w)', ['constant.numeric.inf.toml']],
        ['(?<!\\w)([\\+\\-]?nan)(?!\\w)', ['constant.numeric.nan.toml']],
        ['(?<!\\w)((?:0x(([0-9a-fA-F](([0-9a-fA-F]|_[0-9a-fA-F])+)?))))(?!\\w)', ['constant.numeric.hex.toml']],
        ['(?<!\\w)(0o[0-7](_?[0-7])*)(?!\\w)', ['constant.numeric.oct.toml']],
        ['(?<!\\w)(0b[01](_?[01])*)(?!\\w)', ['constant.numeric.bin.toml']],
      ],
      basic_string: [
        [
          '(")[^"\\\\]*(?:\\\\.[^"\\\\]*)*(")',
          [
            { token: '@brackets', bracket: '@open' },
            [
              ['\\\\([btnfr"\\\\\\n/ ]|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})', ['constant.character.escape.toml']],
              ['\\\\[^btnfr/"\\\\\\n]', 'invalid.illegal.escape.toml'],
            ],
            { token: '@brackets', bracket: '@close' },
          ],
        ],
      ],
      triple_basic_string: [['"""', { token: '@brackets', bracket: '@close', next: '@triple_basic_string_body' }]],
      triple_basic_string_body: [
        ['\\\\([btnfr"\\\\\\n/ ]|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})', 'constant.character.escape.toml'],
        ['\\\\[^btnfr/"\\\\\\n]', 'invalid.illegal.escape.toml'],
        ['"""', { token: '@brackets', bracket: '@close', next: '@pop' }],
      ],
      triple_literal_string: [
        [/[^']+|'(?!'')/, 'string.quoted.triple.literal.block.toml'],
        ["'''", { token: '@brackets', bracket: '@close', next: '@pop' }],
      ],
      data_array: [['(?<!\\w)(\\[)\\s*', { token: '@brackets', bracket: '@close', next: '@data_array_body' }]],
      data_array_body: [
        ['\\s*(\\])(?!\\w)', { token: '@brackets', bracket: '@close', next: '@pop' }],
        { include: '@comment' },
        { include: '@data' },
      ],
      illegal: [['.*', 'invalid.illegal.toml']],
    },
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  monaco.languages.setMonarchTokensProvider(id, def as any);
};

export default registerTOMLLanguage;
