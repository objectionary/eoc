/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {execFileSync} = require('child_process');

describe('--clean', () => {
  ['docs', 'register'].forEach((command) => {
    it(`deletes the target directory before ${command}`, () => {
      const home = path.resolve(`temp/test-clean-option/${command}`);
      fs.rmSync(home, {recursive: true, force: true});
      fs.mkdirSync(path.resolve(home, '.eoc'), {recursive: true});
      fs.writeFileSync(path.resolve(home, '.eoc/leftover.txt'), 'junk');
      try {
        execFileSync(
          'node',
          [path.resolve('./src/eoc.js'), '--batch', '--dir', home, '--clean', command],
          {timeout: 1200000, windowsHide: true}
        );
      } catch (ex) {
        assert.ok(ex.status !== null, ex.message);
      }
      assert.ok(
        !fs.existsSync(path.resolve(home, '.eoc/leftover.txt')),
        `the leftover file survived "${command}"`
      );
    });
  });
});
