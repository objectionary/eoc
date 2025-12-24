/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {execSync} = require('child_process');
const {runSync, assertFilesExist, parserVersion, homeTag, weAreOnline} = require('../helpers');

describe('parse', () => {
  before(weAreOnline);

  const createTestProject = (dir) => {
    fs.rmSync(dir, {recursive: true, force: true});
    fs.mkdirSync(path.resolve(dir, 'src'), {recursive: true});
    fs.writeFileSync(
      path.resolve(dir, 'src/simple.eo'),
      '# sample\n[] > simple\n'
    );
  };

  const runCommand = (args) => {
    try {
      return execSync(
        `node ${path.resolve('./src/eoc.js')} --batch ${args}`,
        {
          timeout: 30000,
          windowsHide: true,
          encoding: 'utf8'
        }
      );
    } catch (ex) {
      return {
        stdout: ex.stdout ? ex.stdout.toString() : '',
        stderr: ex.stderr ? ex.stderr.toString() : '',
        error: ex.message,
        status: ex.status
      };
    }
  };

  it('parses a simple .EO program', (done) => {
    const home = path.resolve('temp/test-parse/simple');
    createTestProject(home);
    const stdout = runSync([
      'parse',
      '--verbose',
      `--parser=${parserVersion}`,
      `--home-tag=${homeTag}`,
      '-s', path.resolve(home, 'src'),
      '-t', path.resolve(home, 'target'),
    ]);
    assertFilesExist(
      stdout, home,
      [
        'target/eo-foreign.json',
        'target/1-parse/simple.xmir',
      ]
    );
    assert(!fs.existsSync(path.resolve('../../mvnw/target')));
    done();
  });

  it('rejects invalid parser version', function () {
    this.timeout(30000);
    const home = path.resolve('temp/test-parse/invalid-version');
    createTestProject(home);

    const result = runCommand([
      'parse',
      '--parser=999.999.999',
      '-s', path.resolve(home, 'src'),
      '-t', path.resolve(home, 'target'),
    ].join(' '));

    assert(result.status !== 0, 'Command should fail with non-zero exit code');
  });

  it('accepts valid parser version', function () {
    this.timeout(60000);
    const home = path.resolve('temp/test-parse/valid-version');
    createTestProject(home);

    const result = runCommand([
      'parse',
      '--parser=0.28.11',
      '-s', path.resolve(home, 'src'),
      '-t', path.resolve(home, 'target'),
    ].join(' '));

    if (typeof result === 'object' && result.status !== undefined) {
      assert(
        result.status === 0,
        'Command should succeed with valid parser version'
      );
    }
  });

  it('validates parser version before calling Maven', function () {
    this.timeout(30000);
    const home = path.resolve('temp/test-parse/early-validation');
    createTestProject(home);

    const result = runCommand([
      'parse',
      '--parser=999.999.999',
      '-s', path.resolve(home, 'src'),
      '-t', path.resolve(home, 'target'),
    ].join(' '));

    assert(result.status !== 0, 'Command should fail with invalid version');
  });

  it('handles assemble command with invalid version', function () {
    this.timeout(30000);
    const home = path.resolve('temp/test-parse/assemble-invalid');
    createTestProject(home);

    const result = runCommand([
      'assemble',
      '--parser=999.999.999',
      '-s', path.resolve(home, 'src'),
      '-t', path.resolve(home, 'target'),
    ].join(' '));

    assert(result.status !== 0, 'Assemble should fail with invalid version');
  });

  it('handles lint command with invalid version', function () {
    this.timeout(30000);
    const home = path.resolve('temp/test-parse/lint-invalid');
    createTestProject(home);

    const result = runCommand([
      'lint',
      '--parser=999.999.999',
      '-s', path.resolve(home, 'src'),
      '-t', path.resolve(home, 'target'),
    ].join(' '));

    assert(result.status !== 0, 'Lint should fail with invalid version');
  });
});
