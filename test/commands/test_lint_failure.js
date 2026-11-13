/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {execFileSync} = require('child_process');

/**
 * Run eoc lint with Maven replaced by a stub that always fails.
 * @param {String} name - Name of the test, for its own target directory
 * @param {Array.<String>} args - Extra command line arguments
 * @return {String} Stderr of the run
 */
const runFailing = function(name, args) {
  const target = path.resolve('temp/test-lint-failure', name);
  fs.rmSync(target, {recursive: true, force: true});
  fs.mkdirSync(path.resolve(target, '1-parse'), {recursive: true});
  fs.writeFileSync(path.resolve(target, '1-parse/simple.xmir'), '<object/>');
  try {
    execFileSync(
      'node',
      [
        '-r', path.resolve(__dirname, '../stubs/failing-mvnw.cjs'),
        path.resolve(__dirname, '../../src/eoc.js'), '--batch', '--alone', '--target', target
      ].concat(args).concat(['lint']),
      {timeout: 1200000, windowsHide: true, stdio: 'pipe'}
    );
  } catch (ex) {
    return (ex.stderr || '').toString();
  }
  return '';
};

describe('lint', () => {
  it('keeps the Maven failure in the message', () => {
    const stderr = runFailing('plain', []);
    assert.ok(stderr.includes('exited with #1 code'), stderr);
    assert.ok(stderr.includes('--easy'), stderr);
  });
  it('does not recommend the option that is already on', () => {
    const stderr = runFailing('easy', ['--easy']);
    assert.ok(stderr.includes('exited with #1 code'), stderr);
    assert.ok(!stderr.includes('--easy'), stderr);
  });
});
