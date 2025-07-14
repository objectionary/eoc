/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const { mvnw, flags } = require('../src/mvnw');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');

describe('mvnw', () => {
  it('prints Maven own version', (done) => {
    const opts = { batch: true };
    mvnw(['--version', '--quiet'], null, opts.batch);
    done();
  });
  it('sets right flags from options', (done) => {
    const opts = {
      sources: 'sources',
      target: 'target',
      parser: 'parser',
      homeTag: 'homeTag'
    };
    mvnw(['--version', '--quiet', ...flags(opts)]).then((args) => {
      assert.ok(args.includes('-Deo.tag=homeTag'));
      assert.ok(args.includes('-Deo.version=parser'));
      done();
    });
  });
  it('handles race condition when files are deleted during counting', (done) => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'eoc-test-'));
    const sub = path.join(dir, 'subdir');
    fs.mkdirSync(sub);
    fs.writeFileSync(path.join(dir, 'file1.txt'), 'test');
    fs.writeFileSync(path.join(sub, 'file2.txt'), 'test');
    const opt = {
      sources: 'sources',
      target: dir,
      parser: 'parser',
      homeTag: 'homeTag'
    };
    mvnw(['--version', '--quiet', ...flags(opt)]).then(() => {
      fs.rmSync(dir, { recursive: true, force: true });
      done();
    }).catch((err) => {
      fs.rmSync(dir, { recursive: true, force: true });
      done(err);
    });
  });
});
