/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const fs = require('fs');
const path = require('path');
const {runSync, assertFilesExist, parserVersion, homeTag, weAreOnline} = require('../helpers');

describe('print', () => {
  before(weAreOnline);
  it('converts XMIR files to EO files', (done) => {
    const home = path.resolve('temp/test-print/simple');
    fs.rmSync(home, {recursive: true, force: true});
    fs.mkdirSync(path.resolve(home, 'target/input'), {recursive: true});
    fs.writeFileSync(
      path.resolve(home, 'target/input/foo.xmir'),
      [
        '<object ms="0" time="2024-01-01T01:01:01"',
        'version="0.0.0" dob="2024-01-01T01:01:01" revision="0">',
        '<listing/><errors/><sheets/><license/><metas/>',
        '<o name="foo"/></object>'
      ].join(' ')
    );
    const stdout = runSync([
      'print',
      '--verbose',
      '--track-transformation-steps',
      `--parser=${parserVersion}`,
      `--home-tag=${homeTag}`,
      '--print-input=input',
      '--print-output=output',
      '-t', path.resolve(home, 'target'),
    ]);
    assertFilesExist(
      stdout, home,
      [
        'target/output/foo.eo',
      ]
    );
    done();
  });
});
