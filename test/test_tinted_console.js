/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');

describe('tinted-console', () => {
  it('allows console.warn without errors', () => {
    require('../src/tinted-console');
    assert.doesNotThrow(() => console.warn('ok'));
  });
  it('leaves console.trace printing its stack', () => {
    require('../src/tinted-console');
    const written = [];
    const original = process.stderr.write;
    process.stderr.write = (chunk) => {
      written.push(String(chunk));
      return true;
    };
    try {
      console.trace('looking for the caller');
    } finally {
      process.stderr.write = original;
    }
    const out = written.join('');
    assert.ok(
      out.includes('looking for the caller'),
      `console.trace printed nothing: ${out}`
    );
    assert.ok(
      out.includes('    at '),
      `console.trace printed no stack: ${out}`
    );
  });
});
