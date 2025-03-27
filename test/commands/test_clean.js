// Copyright (c) 2022-2025 Objectionary.com
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const {runSync} = require('../helpers');

describe('clean', function() {
  const testDir = 'temp/test-clean';
  const eoDir = path.join(os.homedir(), '.eo');

  /**
   * Setup test environment.
   * @param {String} home - Home directory
   * @param {String} eo - EO directory
   */
  function setupTestEnvironment(home, eo) {
    fs.rmSync(home, {recursive: true, force: true});
    fs.rmSync(eo, {recursive: true, force: true});
    fs.mkdirSync(path.resolve(home, 'src'), {recursive: true});
    fs.mkdirSync(eo, {recursive: true});
    fs.writeFileSync(path.resolve(home, 'src/clean.eo'), '# sample\n[] > clean\n');
  }

  /**
   * Run clean command.
   * @param {String} home - Home directory
   * @param {Boolean} global - Clean globally or not
   * @return {String} - Stdout of clean command
   */
  function runCleanCommand(home, global = false) {
    const args = ['clean', '-s', path.resolve(home, 'src'), '-t', path.resolve(home, 'target')];
    if (global) args.push('--global');
    return runSync(args);
  }

  it('deletes all temporary files with --global', function(done) {
    const home = path.resolve(testDir, 'simple');
    setupTestEnvironment(home, eoDir);
    const stdout = runCleanCommand(home, true);
    assert(!fs.existsSync(path.resolve(home, 'target')), stdout);
    assert(!fs.existsSync(eoDir), stdout);
    done();
  });

  it('deletes target directory without affecting global eo', function(done) {
    const home = path.resolve(testDir, 'without-global');
    setupTestEnvironment(home, eoDir);
    const stdout = runCleanCommand(home);
    assert(!fs.existsSync(path.resolve(home, 'target')), stdout);
    assert(fs.existsSync(eoDir), stdout);
    done();
  });
});
