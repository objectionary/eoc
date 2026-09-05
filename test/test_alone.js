/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const path = require('path');
const {execFileSync} = require('child_process');

/**
 * Run eoc with Maven replaced by a stub that prints the goals.
 * @param {Array.<String>} args - Command line arguments
 * @return {String} Stdout
 */
const runStubbed = function(args) {
  try {
    return execFileSync(
      'node',
      [
        '-r', path.resolve(__dirname, 'stubs/mvnw.js'),
        path.resolve(__dirname, '../src/eoc.js'), '--batch'
      ].concat(args),
      {timeout: 1200000, windowsHide: true}
    ).toString();
  } catch (ex) {
    return (ex.stdout || '').toString();
  }
};

describe('--alone', () => {
  ['latex', 'normalize'].forEach((command) => {
    it(`runs ${command} without the pipeline`, () => {
      const stdout = runStubbed(['--alone', command]);
      assert.ok(!stdout.includes('eo:register'), stdout);
      assert.ok(!stdout.includes('eo:parse'), stdout);
    });
    it(`runs the pipeline for ${command} without the option`, () => {
      assert.ok(runStubbed([command]).includes('eo:register'));
    });
  });
});
