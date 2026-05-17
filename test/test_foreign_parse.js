/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const {firstJsonArray} = require('../src/commands/foreign');

describe('foreign / firstJsonArray', () => {
  it('returns the array verbatim when the input is clean JSON', () => {
    const text = '[{"id":"a"},{"id":"b"}]';
    assert.strictEqual(firstJsonArray(text), text);
  });
  it('tolerates leading whitespace and a UTF-8 BOM', () => {
    const text = '﻿\n  [{"id":"a"}]\n';
    assert.deepStrictEqual(JSON.parse(firstJsonArray(text)), [{id: 'a'}]);
  });
  it('returns only the first array when extra content is appended (issue #782)', () => {
    const text = [
      '[',
      '    {"id": "app"}',
      ']',
      ' [',
      '   {"id": "stale"}',
      ' ]',
      '',
    ].join('\n');
    const parsed = JSON.parse(firstJsonArray(text));
    assert.deepStrictEqual(parsed, [{id: 'app'}]);
  });
  it('handles nested arrays inside object values', () => {
    const text = '[{"id":"a","probed":"[1,2]"},{"id":"b"}]trailing';
    const parsed = JSON.parse(firstJsonArray(text));
    assert.strictEqual(parsed.length, 2);
    assert.strictEqual(parsed[0].probed, '[1,2]');
  });
  it('throws when no array is present', () => {
    assert.throws(() => firstJsonArray('not json at all'), SyntaxError);
  });
});
