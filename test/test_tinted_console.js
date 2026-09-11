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
