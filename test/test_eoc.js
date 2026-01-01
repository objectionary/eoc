/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const version = require('../src/version');
const {runSync, weAreOnline} = require('./helpers');

describe('eoc', () => {
  it('prints its own version', (done) => {
    const stdout = runSync(['--version']);
    assert.equal(`${version.what  }\n`, stdout);
    done();
  });
  it('prints help screen', (done) => {
    const stdout = runSync(['--help']);
    assert(stdout.includes('Usage: eoc'));
    assert(stdout.includes(version.what));
    assert(stdout.includes(version.when));
    done();
  });
});

describe('eoc', () => {
  before(weAreOnline);
  it('loads latest version', (done) => {
    const stdout = runSync(['--latest', '--version']);
    assert(!stdout.includes('29.0.4'));
    done();
  });
});
