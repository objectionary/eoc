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

describe('phi', function() {
  before(weAreOnline);

  it('converts XMIR files to PHI files', function(done) {
    this.skip();
    const home = path.resolve('temp/test-phi/simple');
    fs.rmSync(home, {recursive: true, force: true});
    fs.mkdirSync(path.resolve(home, 'src'), {recursive: true});
    fs.writeFileSync(path.resolve(home, 'src/phi.eo'), '# sample\n[] > phi\n');
    const stdout = runSync([
      'phi',
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
        'target/2-optimize/phi.xmir',
        'target/out/phi.phi',
      ]
    );
    done();
  });

  it('converts XMIR files to PHI files, in the ALONE mode', function(done) {
    const home = path.resolve('temp/test-phi-alone/simple');
    fs.rmSync(home, {recursive: true, force: true});
    fs.mkdirSync(path.resolve(home, 'base/xmir'), {recursive: true});
    fs.writeFileSync(
      path.resolve(home, 'base/xmir/foo.xmir'),
      '<program ms="1" name="foo" time="2024-01-01T01:01:01"' +
      ' version="1" revision="1" dob="2024-01-01T01:01:01">' +
      '<listing/>' +
      '<errors/>' +
      '<sheets/>' +
      '<license/>' +
      '<metas/>' +
      '<objects/>' +
      '</program>'
    );
    const stdout = runSync([
      'phi',
      '--verbose',
      '--track-optimization-steps',
      `--parser=${parserVersion}`,
      `--home-tag=${homeTag}`,
      '--phi-input=xmir',
      '--phi-output=phi',
      '--alone',
      '-t', path.resolve(home, 'base'),
    ]);
    assertFilesExist(
      stdout, home,
      [
        'base/phi/foo.phi'
      ]
    );
    done();
  });
});
