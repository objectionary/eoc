/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const {verifyJavac} = require('../src/jdk');

describe('jdk', () => {
  it('throws a clear error when javac is not on the PATH', () => {
    const fakeExec = () => {
      const err = new Error('spawnSync javac ENOENT');
      err.code = 'ENOENT';
      throw err;
    };
    assert.throws(
      () => verifyJavac(fakeExec),
      (error) => {
        assert(error instanceof Error);
        assert(
          /javac/.test(error.message),
          `Expected error message to mention "javac": ${error.message}`
        );
        assert(
          /JDK/.test(error.message),
          `Expected error message to mention "JDK": ${error.message}`
        );
        assert(
          /PATH/.test(error.message),
          `Expected error message to mention "PATH": ${error.message}`
        );
        return true;
      }
    );
  });
  it('returns silently when javac is available', () => {
    const fakeExec = () => Buffer.from('javac 21.0.10\n');
    assert.doesNotThrow(() => verifyJavac(fakeExec));
  });
  it('surfaces the underlying failure message when javac exits non-zero', () => {
    const fakeExec = () => {
      const err = new Error('Command failed: javac -version\n/bin/sh: 1: javac: not found\n');
      err.status = 127;
      throw err;
    };
    assert.throws(
      () => verifyJavac(fakeExec),
      (error) => {
        assert(/javac/.test(error.message));
        return true;
      }
    );
  });
});
