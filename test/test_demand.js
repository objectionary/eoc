/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const {gte, node} = require('../src/demand');

describe('demand', () => {
  let originalExit;
  let originalError;
  let exitCode;
  beforeEach(() => {
    originalExit = process.exit;
    originalError = console.error;
    exitCode = undefined;
    process.exit = (code) => {
      exitCode = code;
    };
    console.error = (message) => message;
  });
  afterEach(() => {
    process.exit = originalExit;
    console.error = originalError;
  });
  it('exits with code 1 when the current version is below the minimum', () => {
    gte('Node.js', '16.0.0', '18.0.0');
    assert.strictEqual(exitCode, 1);
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
  it('exits when Node.js is older than the engines range demands', () => {
    node({node: '>=18'}, '17.9.1');
    assert.strictEqual(exitCode, 1);
  });
  it('accepts Node.js that satisfies the engines range', () => {
    node({node: '>=18'}, '22.3.0');
    assert.strictEqual(exitCode, undefined);
  });
  it('demands nothing when engines has no node field, as in the nix build', () => {
    node({npm: '>8.0'}, '14.0.0');
    assert.strictEqual(exitCode, undefined);
  });
  it('demands nothing when package.json declares no engines at all', () => {
    node(undefined, '14.0.0');
    assert.strictEqual(exitCode, undefined);
  });
});
