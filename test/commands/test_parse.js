/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
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
      () => runSync([
        'parse',
        '--parser=999.999.999',
        '-s', path.resolve(home, 'src'),
        '-t', path.resolve(home, 'target'),
      ]),
      (error) => error.status === 1,
      'invalid parser version was not rejected with a non-zero exit'
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
  it('rejects a malformed parser version', function () {
    this.timeout(30000);
    const home = path.resolve('temp/test-parse/malformed-version');
    createTestProject(home);
    assert.throws(
      () => runSync([
        'parse',
        '--parser=not-a-version',
        '-s', path.resolve(home, 'src'),
        '-t', path.resolve(home, 'target'),
      ]),
      (error) => error.status === 1,
      'malformed parser version was not rejected with a non-zero exit'
    );
  });
  it('handles assemble command with invalid version', function () {
    this.timeout(30000);
    const home = path.resolve('temp/test-parse/assemble-invalid');
    createTestProject(home);
    assert.throws(
      () => runSync([
        'assemble',
        '--parser=999.999.999',
        '-s', path.resolve(home, 'src'),
        '-t', path.resolve(home, 'target'),
      ]),
      (error) => error.status === 1,
      'assemble with an invalid parser version was not rejected with a non-zero exit'
    );
  });
  it('handles lint command with invalid version', function () {
    this.timeout(30000);
    const home = path.resolve('temp/test-parse/lint-invalid');
    createTestProject(home);
    assert.throws(
      () => runSync([
        'lint',
        '--parser=999.999.999',
        '-s', path.resolve(home, 'src'),
        '-t', path.resolve(home, 'target'),
      ]),
      (error) => error.status === 1,
      'lint with an invalid parser version was not rejected with a non-zero exit'
    );
  });
});
