/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const path = require('path');
const {execFileSync} = require('child_process');

/**
 * Run eoc lint with Maven replaced by a stub that always fails.
 * @param {Array.<String>} args - Extra command line arguments
 * @return {String} Stderr of the run
 */
const runFailing = function(args) {
  try {
    execFileSync(
      'node',
      [
        '-r', path.resolve(__dirname, '../stubs/failing-mvnw.js'),
        path.resolve(__dirname, '../../src/eoc.js'), '--batch', '--alone'
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
    const stderr = runFailing([]);
    assert.ok(stderr.includes('exited with #1 code'), stderr);
    assert.ok(stderr.includes('--easy'), stderr);
  });
  it('does not recommend the option that is already on', () => {
    const stderr = runFailing(['--easy']);
    assert.ok(stderr.includes('exited with #1 code'), stderr);
    assert.ok(!stderr.includes('--easy'), stderr);
  });
});
