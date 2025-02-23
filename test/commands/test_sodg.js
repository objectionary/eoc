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

describe('sodg', function() {
  before(weAreOnline);

  it('generates SODG files for a simple .EO program', function(done) {
    const home = path.resolve('temp/test-sodg/simple');
    fs.rmSync(home, {recursive: true, force: true});
    fs.mkdirSync(path.resolve(home, 'src'), {recursive: true});
    fs.writeFileSync(path.resolve(home, 'src/simple.eo'), '# sample\n[] > simple\n');
    const stdout = runSync([
      'sodg',
      `--parser=${parserVersion}`,
      `--home-tag=${homeTag}`,
      '--easy',
      '--verbose',
      '--dot',
      '--include=simple',
      '-s', path.resolve(home, 'src'),
      '-t', path.resolve(home, 'target'),
    ]);
    assertFilesExist(
      stdout, home,
      [
        'target/sodg/simple.sodg',
        'target/sodg/simple.sodg.xml',
        'target/sodg/simple.sodg.xe',
        'target/sodg/simple.sodg.graph.xml',
        'target/sodg/simple.sodg.dot',
      ]
    );
    assert(!fs.existsSync(path.resolve('../../mvnw/target')));
    done();
  });
});
