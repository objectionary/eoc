/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const {runSync} = require('../helpers');
const audit = require('../../src/commands/audit');

describe('audit', () => {
  it('prints the version of every package', (done) => {
    const stdout = runSync(['audit']);
    ['eoc:', 'eo-maven-plugin:', 'objectionary/home:', 'jeo-maven-plugin:'].forEach((name) => {
      assert(stdout.includes(name), stdout);
    });
    assert(stdout.includes('Apache Maven'), stdout);
    done();
  });
  it('resolves the version of every package', (done) => {
    audit.packages({parser: '0.62.1', homeTag: '0.62.1'}).forEach(([name, ver]) => {
      assert(ver !== undefined && ver !== '', `${name} is not resolved`);
    });
    done();
  });
});
