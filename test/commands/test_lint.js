/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const lint = require('../../src/commands/lint');
const {runSync, assertFilesExist, parserVersion, homeTag, weAreOnline} = require('../helpers');

describe('lint', () => {
  it('picks a goal for a version semver cannot parse', () => {
    for (const parser of ['0.57', '1.0-rc1', '0.57.3.1', 'latest', '']) {
      assert.deepEqual(
        lint.goals({parser}),
        ['eo:verify'],
        `Expected a goal rather than a TypeError for --parser ${parser}`
      );
    }
  });
  it('picks the linting goal for a modern parser', () => {
    assert.deepEqual(lint.goals({parser: '0.57.3'}), ['eo:lint']);
    assert.deepEqual(lint.goals({parser: '0.45.0'}), ['eo:lint']);
    assert.deepEqual(lint.goals({parser: '0.57-SNAPSHOT'}), ['eo:lint']);
  });
  it('picks the verifying goal for an older parser', () => {
    assert.deepEqual(lint.goals({parser: '0.44.0'}), ['eo:verify']);
  });
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
    fs.writeFileSync(path.resolve(home, 'src/simple.eo'), '[] > simple\n');
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
    fs.writeFileSync(path.resolve(home, 'src/simple.eo'), '[] > simple\n');
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
});
