/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const {runSync, runOutput} = require('../helpers');

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
    const home = path.resolve(testDir, 'refuses-cwd');
    fs.rmSync(home, {recursive: true, force: true});
    fs.mkdirSync(home, {recursive: true});
    const outcome = runOutput(['--target', '.', 'clean'], {cwd: home});
    assert(outcome.status !== 0, outcome.stderr);
    assert(outcome.stderr.includes('Refusing to delete'), outcome.stderr);
    assert(fs.existsSync(home), 'the current directory must not be deleted');
    done();
  });
  it('refuses to delete the current directory through a symbolic link', (done) => {
    const home = path.resolve(testDir, 'refuses-symlink-cwd'),
      real = path.resolve(home, 'real'),
      link = path.resolve(home, 'link'),
      type = process.platform === 'win32' ? 'junction' : 'dir';
    fs.rmSync(home, {recursive: true, force: true});
    fs.mkdirSync(real, {recursive: true});
    fs.symlinkSync(home, link, type);
    const outcome = runOutput(
      ['--target', path.resolve(link, 'real'), 'clean'],
      {cwd: real}
    );
    assert(outcome.status !== 0, `${outcome.stdout}\n${outcome.stderr}`);
    assert(
      outcome.stderr.includes('Refusing to delete'),
      outcome.stderr
    );
    assert(
      fs.existsSync(real),
      'the current directory must not be deleted through a symbolic link'
    );
    done();
  });
  it('refuses to delete an ancestor of the current working directory', (done) => {
    const home = path.resolve(testDir, 'refuses-ancestor'),
      nested = path.resolve(home, 'nested');
    fs.rmSync(home, {recursive: true, force: true});
    fs.mkdirSync(nested, {recursive: true});
    const outcome = runOutput(['--target', '..', 'clean'], {cwd: nested});
    assert(outcome.status !== 0, outcome.stderr);
    assert(fs.existsSync(home), 'the ancestor directory must not be deleted');
    done();
  });
  it('refuses to delete the home directory', (done) => {
    const fakeHome = path.resolve(testDir, 'fake-home');
    fs.rmSync(fakeHome, {recursive: true, force: true});
    fs.mkdirSync(fakeHome, {recursive: true});
    const outcome = runOutput(
      ['--target', fakeHome, 'clean'],
      {env: {...process.env, HOME: fakeHome, USERPROFILE: fakeHome}}
    );
    assert(outcome.status !== 0, outcome.stderr);
    assert(fs.existsSync(fakeHome), 'the home directory must not be deleted');
    done();
  });
});
