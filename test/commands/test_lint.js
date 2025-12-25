/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {runSync, assertFilesExist, parserVersion, homeTag, weAreOnline} = require('../helpers');

describe('lint', () => {
  before(weAreOnline);
  it('lints a simple .EO program', (done) => {
    const home = path.resolve('temp/test-lint/simple');
    fs.rmSync(home, {recursive: true, force: true});
    fs.mkdirSync(path.resolve(home, 'src'), {recursive: true});
    fs.writeFileSync(path.resolve(home, 'src/simple.eo'), '# sample\n[] > simple\n');
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
});
