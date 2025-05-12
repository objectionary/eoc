/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {runSync, assertFilesExist, parserVersion, homeTag, weAreOnline} = require('../helpers');

describe('foreign', () => {
  before(weAreOnline);

  it('inspects foreign objects and prints a report', (done) => {
    const home = path.resolve('temp/test-foreign/simple');
    fs.rmSync(home, {recursive: true, force: true});
    fs.mkdirSync(path.resolve(home, 'src'), {recursive: true});
    fs.writeFileSync(
      path.resolve(home, 'src/app.eo'),
      [
        '# Simple app.',
        '[args] > app',
        '  QQ.io.stdout "Hello, world!" > @',
      ].join('\n')
    );
    runSync([
      'assemble',
      '--verbose',
      `--parser=${parserVersion}`,
      `--home-tag=${homeTag}`,
      '-s', path.resolve(home, 'src'),
      '-t', path.resolve(home, 'target'),
    ]);
    const stdout = runSync([
      'foreign',
      '--verbose',
      `--parser=${parserVersion}`,
      `--home-tag=${homeTag}`,
      '-t', path.resolve(home, 'target'),
    ]);
    assertFilesExist(
      stdout, home,
      [
        'target/eo-foreign.json',
      ]
    );
    assert(stdout.includes('objects in'), stdout);
    done();
  });
});
