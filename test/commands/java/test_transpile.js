/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */
const assert = require('assert');
const transpile = require('../../../src/commands/java/transpile');

describe('java/transpile', () => {
  it('merges package members before transpiling', () => {
    assert.deepStrictEqual(transpile.goals(), ['eo:merge', 'eo:transpile']);
  });
});
