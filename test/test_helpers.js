/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const {runOutput} = require('./helpers');

describe('helpers', () => {
  it('captures the stderr of a failing command', () => {
    const outcome = runOutput(['transpile', '--language=Eiffel']);
    assert(
      outcome.stderr.includes('Unknown platform Eiffel'),
      `stderr of a failing command is lost: ${outcome.stderr}`
    );
  });
  it('reports the exit code of a failing command', () => {
    const outcome = runOutput(['transpile', '--language=Cobol']);
    assert.notStrictEqual(
      outcome.status, 0,
      'a failing command pretends to be successful'
    );
  });
  it('captures the stdout of a successful command', () => {
    const outcome = runOutput(['--version']);
    assert(
      outcome.stdout.trim().length > 0,
      `stdout of a successful command is empty: ${outcome.stdout}`
    );
  });
  it('runs the command in the given directory', () => {
    const outcome = runOutput(['--target', '.', 'clean'], {cwd: require('os').tmpdir()});
    assert(
      outcome.stderr.includes('Refusing to delete'),
      `the working directory is ignored: ${outcome.stderr}`
    );
  });
});
