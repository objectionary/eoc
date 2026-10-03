/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const normalize = require('../../src/commands/normalize');

describe('normalize phino version check', () => {
  it('uses a deadline and reports a stalled phino process', () => {
    let call;
    const timeout = Object.assign(new Error('process timed out'), {code: 'ETIMEDOUT'});
    assert.throws(
      () => normalize.verifyPhino((...args) => {
        call = args;
        throw timeout;
      }),
      /phino --version check timed out after 3 seconds/
    );
    assert.strictEqual(call[0], 'phino');
    assert.deepStrictEqual(call[1], ['--version']);
    assert.strictEqual(call[2].timeout, 3000);
    assert.strictEqual(call[2].killSignal, 'SIGKILL');
  });
});
