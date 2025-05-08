/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const { configs } = require('@eslint/js');

module.exports = [
  {
    ignores: ['node_modules/'],
  },
  {
    ...configs.all,
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2019,
      sourceType: 'module'
    },
    rules: {
      ...configs.all.rules,
      'camelcase': 'off',
      'capitalized-comments': 'off',
      'consistent-return': 'off',
      'default-param-last': 'off',
      'eqeqeq': 'off',
      'func-names': 'off',
      'func-style': 'off',
      'id-length': 'off',
      'indent': ['error', 2, { "SwitchCase": 1 }],
      'init-declarations': 'off',
      'max-len': ['error', { code: 200 }],
      'max-lines': 'off',
      'max-lines-per-function': 'off',
      'max-params': 'off',
      'max-statements': 'off',
      'no-alert': 'off',
      'no-console': 'off',
      'no-dupe-keys': 'off',
      'no-inline-comments': 'off',
      'no-invalid-this': 'off',
      'no-magic-numbers': 'off',
      'no-multi-assign': 'off',
      'no-param-reassign': 'off',
      'no-plusplus': 'off',
      'no-promise-executor-return': 'off',
      'no-prototype-builtins': 'off',
      'no-shadow': 'off',
      'no-ternary': 'off',
      'no-undef': 'off',
      'no-undefined': 'off',
      'no-unused-vars': 'off',
      'no-use-before-define': 'off',
      'one-var': 'off',
      'prefer-destructuring': 'off',
      'require-await': 'off',
      'require-unicode-regexp': 'off',
      'sort-keys': 'off',
      'sort-vars': 'off'
    }
  }
];
