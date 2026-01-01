/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const {runSync} = require('../helpers');

describe('audit', () => {
  it('audits all packages', (done) => {
    const stdout = runSync(['audit']);
    assert(stdout.includes('Apache Maven'), stdout);
    done();
  });
});
