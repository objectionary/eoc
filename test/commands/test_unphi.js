/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2022-2025 Objectionary.com
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const fs = require('fs');
const path = require('path');
const {runSync, assertFilesExist, parserVersion, homeTag, weAreOnline} = require('../helpers');
const assert = require('assert');

describe('unphi', function() {
  before(weAreOnline);

  it('converts PHI files to XMIR files', function(done) {
    const home = path.resolve('temp/test-unphi/simple');
    fs.rmSync(home, {recursive: true, force: true});
    fs.mkdirSync(path.resolve(home, 'target/input'), {recursive: true});
    fs.writeFileSync(path.resolve(home, 'target/input/app.phi'), '{ ⟦ app ↦ ⟦ ⟧ ⟧ }');
    const stdout = runSync([
      'unphi',
      '--verbose',
      '--track-optimization-steps',
      '--tests',
      `--parser=${parserVersion}`,
      `--home-tag=${homeTag}`,
      '--unphi-input=input',
      '--unphi-output=output',
      '-t', path.resolve(home, 'target'),
    ]);
    const unphied = 'target/output/app.xmir';
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
