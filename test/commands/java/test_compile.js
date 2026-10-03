/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */
const assert = require('assert');
const compile = require('../../../src/commands/java/compile');

describe('java/compile', () => {
  it('compiles production sources without test sources', () => {
    assert.deepStrictEqual(compile.goals(), ['compile']);
  });
});
