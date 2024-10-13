/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2022-2024 Objectionary.com
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

const rel = require('relative');
const fs = require('fs');
const assert = require('assert');
const path = require('path');
const {runSync, parserVersion, homeTag, weAreOnline} = require('../helpers');

// They don't work, but they should:
// Let's continue after this bug is fixed: https://github.com/objectionary/eo/issues/3093
// ['Java', '0.35.2', '130afdd1456a0cbafd52aee8d7bc612e1faac547'],
// ['Java', '0.35.1', '130afdd1456a0cbafd52aee8d7bc612e1faac547'],
// ['Java', '0.34.1', '1d605bd872f27494551e9dd2341b9413d0d96d89'],
const options = [
  {
    lang: 'Java',
    version: parserVersion,
    tag: homeTag
  },
  {
    lang: 'Java',
    version: '0.38.0',
    tag: '0.38.0'
  },
  {
    lang: 'Java',
    version: '0.36.0',
    tag: '0.36.0'
  },
  {
    lang: 'JavaScript',
    version: parserVersion,
    tag: homeTag
  },
];

describe('dataize', function() {
  before(weAreOnline);

  options.forEach(({lang, version, tag}) => {
    it(`dataizes: lang ${lang}, version ${version}, tag ${tag}`, function(done) {
      this.timeout(0);
      const home = path.resolve(`temp/test-dataize/${version}/${lang}`);
      fs.rmSync(home, {recursive: true, force: true});
      fs.mkdirSync(path.resolve(home, 'src/foo/bar'), {recursive: true});
      fs.writeFileSync(
        path.resolve(home, 'src/foo/bar/simple.eo'),
        [
          '+package foo.bar',
          '+alias org.eolang.io.stdout',
          '',
          '# sample',
          '[args] > simple',
          '  stdout "Hello, world!\\n" > @',
        ].join('\n')
      );
      const stdout = runSync([
        'dataize', 'foo.bar.simple',
        '--verbose',
        '--stack=64M',
        '--clean',
        '--parser=' + version,
        '--home-tag=' + tag,
        '-s', path.resolve(home, 'src'),
        '-t', path.resolve(home, 'target'),
        '--language=' + lang
      ]);
      assert(stdout.includes('Hello, world!'), stdout);
      assert(stdout.includes(`The directory ${rel(path.resolve(home, 'target'))} deleted`), stdout);
      if (lang === 'Java') {
        assert(!fs.existsSync(path.resolve('../../mvnw/target')));
      }
      done();
    });
  });
});
