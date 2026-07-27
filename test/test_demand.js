/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const {gte} = require('../src/demand');

describe('demand', () => {
  let originalExit;
  let originalError;
  let exitCode;
  let logged;
  beforeEach(() => {
    originalExit = process.exit;
    originalError = console.error;
    exitCode = undefined;
    logged = undefined;
    process.exit = (code) => {
      exitCode = code;
    };
    console.error = (...args) => {
      logged = args;
    };
  });
  afterEach(() => {
    process.exit = originalExit;
    console.error = originalError;
  });
  it('exits with code 1 when the current version is below the minimum', () => {
    gte('Node.js', '16.0.0', '18.0.0');
    assert.strictEqual(exitCode, 1);
  });
  it('reports the subject, minimum and current version in the message', () => {
    gte('Node.js', '16.0.0', '18.0.0');
    const message = logged.join(' ');
    assert.ok(message.includes('Node.js'), message);
    assert.ok(message.includes('18.0.0'), message);
    assert.ok(message.includes('16.0.0'), message);
  });
  it('passes silently when the current version equals the minimum', () => {
    gte('Node.js', '18.0.0', '18.0.0');
    assert.strictEqual(exitCode, undefined);
  });
  it('passes silently when the current version exceeds the minimum', () => {
    gte('Node.js', '20.1.0', '18.0.0');
    assert.strictEqual(exitCode, undefined);
  });
  it('skips the check for -SNAPSHOT versions below the minimum', () => {
    gte('Node.js', '0.0.1-SNAPSHOT', '18.0.0');
    assert.strictEqual(exitCode, undefined);
  });
});
