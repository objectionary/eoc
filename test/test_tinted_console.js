/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');

describe('tinted-console', () => {
  it('allows console.warn without errors', () => {
    require('../src/tinted-console');
    assert.doesNotThrow(() => console.warn('ok'));
  });
});
