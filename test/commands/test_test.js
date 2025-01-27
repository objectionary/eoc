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

describe('test', function() {
  before(weAreOnline);

  /**
   * Run test command.
   * @param {String} home - Home directory
   * @param {String} lang - Target language
   * @param {String} parser - Version of EO parser
   * @param {String} hash - Git SHA in objectionary/home
   * @return {String} - Stdout
   */
  const test = function(home, lang = 'Java', parser, hash) {
    fs.rmSync(home, {recursive: true, force: true});
    fs.mkdirSync(path.resolve(home, 'src'), {recursive: true});
    fs.writeFileSync(
      path.resolve(home, 'src/simple-test.eo'),
      [
        '+tests',
        '+any',
        '',
        '# sample',
        '[] > simple-comparison-works',
        '  gt. > @',
        '    10',
        '    5',
      ].join('\n')
    );
    return runSync([
      'test',
      '--verbose',
      '--easy',
      `--parser=${parser}`,
      `--home-tag=${hash}`,
      '--stack=16M',
      '--heap=128M',
      '-s', path.resolve(home, 'src'),
      '-t', path.resolve(home, 'target'),
      `--language=${lang}`
    ]);
  };

  it('executes a single Java unit test', function(done) {
    const home = path.resolve('temp/test-test/java');
    const stdout = test(home, 'Java', parserVersion, homeTag);
    assertFilesExist(
      stdout, home,
      [
        'target/generated-sources/EOsimple_comparison_worksTest.java',
        'target/classes/EOsimple_comparison_worksTest.class',
      ]
    );
    done();
  });

  it('executes a single JavaScript unit test', function(done) {
    this.skip(); // it doesn't work with 0.42.0
    const home = path.resolve('temp/test-test/javascript');
    const stdout = test(home, 'JavaScript', '0.42.0', '0.42.0');
    assert.ok(stdout.includes('1 passing'));
    assertFilesExist(
      stdout, home, ['target/project/simple-test.test.js',]
    );
    done();
  });
});
