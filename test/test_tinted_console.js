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
  it('refuses a level it does not know', () => {
    const {enable} = require('../src/tinted-console');
    assert.throws(
      () => enable('nope'),
      /Unknown logging level: nope/,
      'an unknown level must be reported, not quietly ignored'
    );
  });
  it('enables the level it is given', () => {
    const {enable} = require('../src/tinted-console');
    assert.doesNotThrow(() => enable('debug'));
    const written = [];
    const original = process.stdout.write;
    process.stdout.write = (chunk) => {
      written.push(String(chunk));
      return true;
    };
    try {
      console.debug('hello from the test');
    } finally {
      process.stdout.write = original;
    }
    assert.ok(
      written.join('').includes('hello from the test'),
      'an enabled level must print'
    );
  });
});
