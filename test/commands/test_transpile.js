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

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {runSync, assertFilesExist, parserVersion, homeTag, weAreOnline} = require('../helpers');

describe('transpile', function() {
  before(weAreOnline);

  const transpile = function(home, lang) {
    fs.rmSync(home, {recursive: true, force: true});
    fs.mkdirSync(path.resolve(home, 'src'), {recursive: true});
    fs.writeFileSync(
      path.resolve(home, 'src/transpile.eo'),
      [
        '# Sample.',
        '[] > transpile'
      ].join('\n')
    );
    const transpiled = path.resolve(home, 'target/8-transpile');
    if (fs.existsSync(transpiled)) {
      fs.rmSync(transpiled, {recursive: true, force: true});
    }
    return runSync([
      'transpile',
      '--verbose',
      '--easy',
      `--parser=${parserVersion}`,
      `--home-tag=${homeTag}`,
      '-s', path.resolve(home, 'src'),
      '-t', path.resolve(home, 'target'),
      `--language=${lang}`,
    ]);
  };

  it('transpiles a simple .EO program to Java', function(done) {
    this.timeout(0);
    const home = path.resolve(`temp/test-transpile/java`);
    const stdout = transpile(home, 'Java');
    assertFilesExist(
      stdout, home,
      ['target/generated-sources/EOtranspile.java']
    );
    done();
  });

  it('transpiles a simple .EO program to JavaScript', function(done) {
    this.skip();
    this.timeout(0);
    const home = path.resolve(`temp/test-transpile/js`);
    const stdout = transpile(home, 'JavaScript');
    assertFilesExist(
      stdout, home,
      ['target/project/transpile.js']
    );
    done();
  });

  it('attempts to transpile a simple .EO program to wrong platform', function(done) {
    const spawnSync = require('child_process').spawnSync;
    const s = spawnSync(
      'node', [path.resolve('./src/eoc.js'), 'transpile', '--language=Eiffel']
    );
    assert(s.status != 0);
    assert(s.stderr.includes('Unknown platform Eiffel'), s.stderr);
    done();
  });
});
