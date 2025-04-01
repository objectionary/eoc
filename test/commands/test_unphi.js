/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const fs = require('fs');
const path = require('path');
const {runSync, assertFilesExist, parserVersion, homeTag, weAreOnline} = require('../helpers');
const assert = require('assert');

describe('unphi', () => {
  before(weAreOnline);

  it('converts PHI files to XMIR files', (done) => {
    const home = path.resolve('temp/test-unphi/simple');
    fs.rmSync(home, {recursive: true, force: true});
    fs.mkdirSync(path.resolve(home, 'target/input'), {recursive: true});
    fs.writeFileSync(path.resolve(home, 'target/input/app.phi'), '{ ⟦ app ↦ ⟦ ⟧ ⟧ }');
    const stdout = runSync([
        'unphi',
        '--verbose',
        '--track-transformation-steps',
        '--tests',
        `--parser=${parserVersion}`,
        `--home-tag=${homeTag}`,
        '--unphi-input=input',
        '--unphi-output=output',
        '-t', path.resolve(home, 'target'),
      ]),
      unphied = 'target/output/app.xmir';
    assertFilesExist(
      stdout, home,
      [unphied]
    );
    assert.ok(
      fs.readFileSync(path.resolve(home, unphied)).toString().includes(
        '<head>tests</head>'
      )
    );
    done();
  });
});
