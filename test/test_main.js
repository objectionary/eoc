/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const path = require('path');

describe('package main', () => {
  it('loads the package root without running the command line', () => {
    const eoc = require(path.resolve(__dirname, '..'));
    assert.strictEqual(typeof eoc.commandsDescription, 'function', 'the root of the package exports nothing');
    assert.strictEqual(typeof eoc.select, 'function', 'the root of the package lost select');
  });
});
