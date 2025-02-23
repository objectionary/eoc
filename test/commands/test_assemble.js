/*
 * The MIT License (MIT)
 *
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {runSync, assertFilesExist, parserVersion, homeTag, weAreOnline} = require('../helpers');

describe('assemble', function() {
  before(weAreOnline);

  it('assembles a simple .EO program', function(done) {
    const home = path.resolve('temp/test-assemble/simple');
    fs.rmSync(home, {recursive: true, force: true});
    fs.mkdirSync(path.resolve(home, 'src'), {recursive: true});
    fs.writeFileSync(path.resolve(home, 'src/assemble.eo'), '# sample\n[] > assemble\n');
    const stdout = runSync([
      'assemble',
      '--verbose',
      '--track-optimization-steps',
      `--parser=${parserVersion}`,
      `--home-tag=${homeTag}`,
      '-s', path.resolve(home, 'src'),
      '-t', path.resolve(home, 'target'),
    ]);
    assertFilesExist(
      stdout, home,
      [
        'target/eo-foreign.json',
        'target/1-parse/assemble.xmir',
        'target/2-optimization-steps/assemble',
        'target/2-optimize/assemble.xmir',
      ]
    );
    assert(!fs.existsSync(path.resolve('../../mvnw/target')));
    done();
  });
});
