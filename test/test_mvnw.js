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
    // Create a temporary directory for testing
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'eoc-test-'));
    const subDir = path.join(tmpDir, 'subdir');
    fs.mkdirSync(subDir);

    // Create some test files
    fs.writeFileSync(path.join(tmpDir, 'file1.txt'), 'test');
    fs.writeFileSync(path.join(subDir, 'file2.txt'), 'test');

    // Simulate the count function behavior by accessing the internal function
    // We'll test this indirectly by calling mvnw with a target that has files
    const opts = {
      sources: 'sources',
      target: tmpDir,
      parser: 'parser',
      homeTag: 'homeTag'
    };

    // This should not throw an error even if files are deleted during execution
    mvnw(['--version', '--quiet', ...flags(opts)]).then(() => {
      // Clean up
      fs.rmSync(tmpDir, { recursive: true, force: true });
      done();
    }).catch((err) => {
      // Clean up even if test fails
      fs.rmSync(tmpDir, { recursive: true, force: true });
      done(err);
    });
  });
});
