/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const fs = require('fs');
const path = require('path');
const {runSync, assertFilesExist, parserVersion, homeTag, weAreOnline} = require('../helpers');

describe('print', function() {
  before(weAreOnline);

  it('converts XMIR files to EO files', function(done) {
    const home = path.resolve('temp/test-print/simple');
    fs.rmSync(home, {recursive: true, force: true});
    fs.mkdirSync(path.resolve(home, 'target/input'), {recursive: true});
    fs.writeFileSync(
      path.resolve(home, 'target/input/app.xmir'),
      [
        '<program ms="0" name="xx" time="2024-01-01T01:01:01"',
        'version="0.0.0" dob="2024-01-01T01:01:01" revision="0">',
        '<listing/><errors/><sheets/><license/><metas/>',
        '<objects><o abstract="" name="foo"/></objects>',
        '</program>'
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
        'target/output/app.eo',
      ]
    );
    done();
  });
});
