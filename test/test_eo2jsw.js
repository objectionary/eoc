/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const {flags} = require('../src/eo2jsw');

describe('eo2jsw', () => {
  it('passes every flag as its own argv entry', () => {
    const args = flags({target: '.eoc', alone: true}, '/tmp/lib');
    args.forEach((arg) => assert.ok(!arg.includes(' '), `"${arg}" holds a space`));
    assert.ok(args.includes('--foreign'));
    assert.strictEqual(args[args.indexOf('--foreign') + 1], 'eo-foreign.json');
  });
});
