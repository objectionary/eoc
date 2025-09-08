/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const {mvnw, flags} = require('../src/mvnw');
const assert = require('assert');

describe('mvnw', () => {
  it('prints Maven own version', (done) => {
    const opts = {batch: true};
    mvnw(['--version', '--quiet'], null, opts.batch);
    done();
  });
  it('sets right flags from options', async () => {
    const opts = {
      sources: 'sources',
      target: 'target',
      parser: 'parser',
      homeTag: 'homeTag'
    };
    const args = await mvnw(['--version', '--quiet', ...flags(opts)]);
    assert.ok(args.includes('-Deo.tag=homeTag'));
    assert.ok(args.includes('-Deo.version=parser'));
  });
});
