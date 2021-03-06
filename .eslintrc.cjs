const configureBase = require('@luma-dev/eslint-config-base/configure');

/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ['@luma-dev/base'],
  overrides: [...configureBase(__dirname)],
};
