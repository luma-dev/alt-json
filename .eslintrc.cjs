const path = require('path');

/** @type import("eslint").parserOptions */
module.exports = {
  ignorePatterns: [],

  overrides: [
    {
      files: '*.html',
      plugins: ['html', 'prettier'],
      parserOptions: {
        sourceType: 'module',
      },
      settings: {
        'html/report-bad-indent': 'error',
      },
    },
    {
      files: '*.json',
      plugins: ['json-format'],

      settings: {
        'json/json-with-comments-files': [],
        'json/ignore-files': [],
      },
    },
    {
      files: ['*.js', '*.mjs', '*.cjs'],

      extends: [
        'airbnb-base',
      ],

      rules: {
        'import/no-extraneous-dependencies': 'off',
        'no-void': ['error', { allowAsStatement: true }],
      },
    },
    {
      files: ['*.cjs'],

      env: {
        commonjs: true,
      },
    },
    {
      files: '*.ts',

      parserOptions: { project: path.resolve(__dirname, 'tsconfig.json') },

      extends: [
        'airbnb-base-typescript-prettier',
        'plugin:eslint-comments/recommended',
        // 'plugin:jest/recommended',
      ],
      plugins: [
        'eslint-comments',
        // 'jest',
      ],

      rules: {
        'import/no-extraneous-dependencies': 'off',
        '@typescript-eslint/no-unused-vars': ['error', {
          argsIgnorePattern: '^_',
        }],
        'no-underscore-dangle': 'off',
        'no-console': 'error',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-floating-promises': 'error',
        'no-lone-blocks': 'off',
        'no-void': ['error', { allowAsStatement: true }],
        '@typescript-eslint/no-implicit-any-catch': 'error',
        'consistent-return': 'off',
        'global-require': 'off',
        'eslint-comments/no-unused-disable': 'error',
        'import/extensions': 'off',
        '@typescript-eslint/no-unnecessary-condition': ['error', {
          allowConstantLoopConditions: true,
        }],
        '@typescript-eslint/no-unsafe-return': 'error',
        'import/prefer-default-export': 'off',
        'import/no-unresolved': ['error', {
          ignore: [
            'monaco-editor',
          ],
        }],
      },
    },
    {
      // test files
      files: [
        'tests/**/*.ts',
        '*.test.ts',
        '*.spec.ts',
      ],
      plugins: ['jest'],
    },
    {
      // dev ts files
      files: [
        'tests/**/*.ts',
        'scripts/**/*.ts',
        '*.test.ts',
        '*.spec.ts',
      ],
      rules: {
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        'import/no-dynamic-require': 'off',
      },
    },
    {
      files: ['*.js'],
      rules: {
        'import/order': 'off',
      },
    },
  ],
};
