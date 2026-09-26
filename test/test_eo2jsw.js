/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const {flags} = require('../src/eo2jsw');

describe('eo2jsw', () => {
  it('puts the name of every flag in its own argv entry', () => {
    for (const entry of flags({target: 'target'}, 'lib')) {
      assert.ok(
        !entry.includes(' ') || !entry.startsWith('--'),
        `The entry "${entry}" holds a flag and its value together, which execFileSync does not split`
      );
    }
  });
  it('names the foreign catalog as a flag and a value', () => {
    const args = flags({target: 'target'}, 'lib');
    const at = args.indexOf('--foreign');
    assert.notStrictEqual(at, -1, 'the --foreign flag must be an entry of its own');
    assert.strictEqual(args[at + 1], 'eo-foreign.json');
  });
});
