/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
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
    assert.throws(
      () => {
        runSync([
          'parse',
          '--parser=999.999.999',
          '-s', path.resolve(home, 'src'),
          '-t', path.resolve(home, 'target'),
        ]);
      },
      'Command should fail with invalid parser version'
    );
  });
  it('accepts valid parser version', function () {
    this.timeout(60000);
    const home = path.resolve('temp/test-parse/valid-version');
    createTestProject(home);
    runSync([
      'parse',
      '--parser=0.28.11',
      '-s', path.resolve(home, 'src'),
      '-t', path.resolve(home, 'target'),
    ]);
  });
  it('validates parser version before calling Maven', function () {
    this.timeout(30000);
    const home = path.resolve('temp/test-parse/early-validation');
    createTestProject(home);
    assert.throws(
      () => {
        runSync([
          'parse',
          '--parser=999.999.999',
          '-s', path.resolve(home, 'src'),
          '-t', path.resolve(home, 'target'),
        ]);
      },
      'Command should fail with invalid version'
    );
  });
  it('handles assemble command with invalid version', function () {
    this.timeout(30000);
    const home = path.resolve('temp/test-parse/assemble-invalid');
    createTestProject(home);
    assert.throws(
      () => {
        runSync([
          'assemble',
          '--parser=999.999.999',
          '-s', path.resolve(home, 'src'),
          '-t', path.resolve(home, 'target'),
        ]);
      },
      'Assemble should fail with invalid version'
    );
  });
  it('handles lint command with invalid version', function () {
    this.timeout(30000);
    const home = path.resolve('temp/test-parse/lint-invalid');
    createTestProject(home);
    assert.throws(
      () => {
        runSync([
          'lint',
          '--parser=999.999.999',
          '-s', path.resolve(home, 'src'),
          '-t', path.resolve(home, 'target'),
        ]);
      },
      'Lint should fail with invalid version'
    );
  });
});
