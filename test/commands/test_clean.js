/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { runSync } = require('../helpers');

describe('clean', function () {
  const testDir = 'temp/test-clean';
  const eoDir = path.join(os.homedir(), '.eo');

  function setupTestEnvironment(home, eo) {
    fs.rmSync(home, { recursive: true, force: true });
    fs.rmSync(eo, { recursive: true, force: true });
    fs.mkdirSync(path.resolve(home, 'src'), { recursive: true });
    fs.mkdirSync(eo, { recursive: true });
    fs.writeFileSync(path.resolve(home, 'src/clean.eo'), '# sample\n[] > clean\n');
  }

  function runCleanCommand(home, global = false) {
    const args = ['clean', '-s', path.resolve(home, 'src'), '-t', path.resolve(home, 'target')];
    if (global) args.push('--global');
    return runSync(args);
  }

  it('deletes all temporary files with --global', function (done) {
    const home = path.resolve(testDir, 'simple');
    setupTestEnvironment(home, eoDir);
    const stdout = runCleanCommand(home, true);
    assert(!fs.existsSync(path.resolve(home, 'target')), stdout);
    assert(!fs.existsSync(eoDir), stdout);
    done();
  });

  it('deletes target directory without affecting global eo', function (done) {
    const home = path.resolve(testDir, 'without-global');
    setupTestEnvironment(home, eoDir);
    const stdout = runCleanCommand(home);
    assert(!fs.existsSync(path.resolve(home, 'target')), stdout);
    assert(fs.existsSync(eoDir), stdout);
    done();
  });
});
