/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const lint = require('../../src/commands/lint');
const {runSync, runOutput, assertFilesExist, parserVersion, homeTag, weAreOnline} = require('../helpers');

const simple = ['+architect yegor256@gmail.com', '', '[] > simple', ''].join('\n');

describe('lint', () => {
  it('extras returns failOnWarning flag', (done) => {
    assert.deepEqual(lint.extras({easy: false}), ['-Deo.failOnWarning=true']);
    assert.deepEqual(lint.extras({easy: true}), ['-Deo.failOnWarning=false']);
    done();
  });
  before(weAreOnline);
  it('lints a simple .EO program', (done) => {
    const home = path.resolve('temp/test-lint/simple');
    fs.rmSync(home, {recursive: true, force: true});
    fs.mkdirSync(path.resolve(home, 'src'), {recursive: true});
    fs.writeFileSync(path.resolve(home, 'src/simple.eo'), simple);
    const stdout = runSync([
      'lint',
      '--verbose',
      '--easy',
      '--track-transformation-steps',
      `--parser=${parserVersion}`,
      `--home-tag=${homeTag}`,
      '-s', path.resolve(home, 'src'),
      '-t', path.resolve(home, 'target'),
    ]);
    assertFilesExist(
      stdout, home,
      [
        'target/1-parse/simple.xmir',
        'target/3-lint/simple.xmir',
      ]
    );
    assert(!fs.existsSync(path.resolve('../../mvnw/target')));
    done();
  });
  it('avoid linting if --blind option is provided', (done) => {
    const home = path.resolve('temp/test-lint/simple');
    fs.rmSync(home, {recursive: true, force: true});
    fs.mkdirSync(path.resolve(home, 'src'), {recursive: true});
    fs.writeFileSync(path.resolve(home, 'src/simple.eo'), simple);
    runSync([
      'lint',
      '--verbose',
      '--blind',
      '--track-transformation-steps',
      `--parser=${parserVersion}`,
      `--home-tag=${homeTag}`,
      '-s', path.resolve(home, 'src'),
      '-t', path.resolve(home, 'target'),
    ]);
    assert(
      !fs.existsSync(path.resolve(home, 'target/3-lint/simple.xmir')),
      'Linting should be skipped with --blind option');
    done();
  });
  it('fails when --lints asks for a version of lints that does not exist', (done) => {
    const home = path.resolve('temp/test-lint/lints');
    fs.rmSync(home, {recursive: true, force: true});
    fs.mkdirSync(path.resolve(home, 'src'), {recursive: true});
    fs.writeFileSync(path.resolve(home, 'src/simple.eo'), simple);
    const result = runOutput([
      'lint',
      '--verbose',
      '--easy',
      '--lints=99.99.99',
      `--parser=${parserVersion}`,
      `--home-tag=${homeTag}`,
      '-s', path.resolve(home, 'src'),
      '-t', path.resolve(home, 'target'),
    ]);
    assert.notEqual(result.status, 0, 'a missing lints version must not pass');
    assert(
      result.stdout.includes('lints:jar:99.99.99'),
      'Maven must try to resolve the lints version given with --lints'
    );
    done();
  });
});
