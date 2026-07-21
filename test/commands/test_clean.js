/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const {runSync} = require('../helpers');

describe('clean', () => {
  const testDir = 'temp/test-clean',
    eoDir = path.join(os.homedir(), '.eo');
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
    if (global) {args.push('--global');}
    return runSync(args);
  }
  it('deletes all temporary files with --global', (done) => {
    const home = path.resolve(testDir, 'simple');
    setupTestEnvironment(home, eoDir);
    const stdout = runCleanCommand(home, true);
    assert(!fs.existsSync(path.resolve(home, 'target')), stdout);
    assert(!fs.existsSync(eoDir), stdout);
    done();
  });
  it('deletes target directory without affecting global eo', (done) => {
    const home = path.resolve(testDir, 'without-global');
    setupTestEnvironment(home, eoDir);
    const stdout = runCleanCommand(home);
    assert(!fs.existsSync(path.resolve(home, 'target')), stdout);
    assert(fs.existsSync(eoDir), stdout);
    done();
  });
  it('refuses to delete the current working directory', (done) => {
    const {spawnSync} = require('child_process');
    const home = path.resolve(testDir, 'refuses-cwd');
    fs.rmSync(home, {recursive: true, force: true});
    fs.mkdirSync(home, {recursive: true});
    const s = spawnSync(
      'node', [path.resolve('./src/eoc.js'), '--target', '.', 'clean'],
      {cwd: home}
    );
    assert(s.status !== 0, s.stderr.toString());
    assert(s.stderr.toString().includes('Refusing to delete'), s.stderr.toString());
    assert(fs.existsSync(home), 'the current directory must not be deleted');
    done();
  });
  it('refuses to delete an ancestor of the current working directory', (done) => {
    const {spawnSync} = require('child_process');
    const home = path.resolve(testDir, 'refuses-ancestor'),
      nested = path.resolve(home, 'nested');
    fs.rmSync(home, {recursive: true, force: true});
    fs.mkdirSync(nested, {recursive: true});
    const s = spawnSync(
      'node', [path.resolve('./src/eoc.js'), '--target', '..', 'clean'],
      {cwd: nested}
    );
    assert(s.status !== 0, s.stderr.toString());
    assert(fs.existsSync(home), 'the ancestor directory must not be deleted');
    done();
  });
  it('refuses to delete the home directory', (done) => {
    const {spawnSync} = require('child_process');
    const fakeHome = path.resolve(testDir, 'fake-home');
    fs.rmSync(fakeHome, {recursive: true, force: true});
    fs.mkdirSync(fakeHome, {recursive: true});
    const s = spawnSync(
      'node', [path.resolve('./src/eoc.js'), '--target', fakeHome, 'clean'],
      {env: {...process.env, HOME: fakeHome, USERPROFILE: fakeHome}}
    );
    assert(s.status !== 0, s.stderr.toString());
    assert(fs.existsSync(fakeHome), 'the home directory must not be deleted');
    done();
  });
});
