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

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {runSync} = require('../helpers');

describe('docs', function() {
  const testDir = path.resolve('temp/test-docs-command');
  const eocDir = path.join(testDir, '.eoc', '1-parse');
  const docsDir = path.join(testDir, 'docs');

  beforeEach(function() {
    fs.rmSync(testDir, { recursive: true, force: true });
    fs.mkdirSync(eocDir, { recursive: true });
  });

  /**
   * Tests that the 'docs' command generates empty HTML files in the docs directory.
   * @param {Mocha.Done} done - Mocha callback signaling asynchronous completion
   */
  it('generates empty HTML files for packages', function(done) {
    const samplePackageDir = path.join(eocDir, 'foo', 'bar');
    fs.mkdirSync(samplePackageDir, { recursive: true });
    const xmirFilePath = path.join(samplePackageDir, 'test.xmir');
    fs.writeFileSync(xmirFilePath, '<program name="test" />');

    runSync([
      'docs',
      '--verbose',
      '-s', path.resolve(testDir, 'src'),
      '-t', path.resolve(testDir, 'target'),
    ]);

    assert(fs.existsSync(docsDir), 'Expected the docs directory to be created but it is missing');

    const generatedFile = path.join(docsDir, 'package_foo.bar.html');
    assert(fs.existsSync(generatedFile), `Expected file ${generatedFile} but it was not created`);
    const content = fs.readFileSync(generatedFile, 'utf8');
    assert.strictEqual(content, '', 'Expected the generated file to be empty');

    const packagesFile = path.join(docsDir, 'packages.html');
    assert(fs.existsSync(packagesFile), `Expected file ${packagesFile} but it was not created`);
    assert.strictEqual(
      fs.readFileSync(packagesFile, 'utf8'), '', 'Expected packages.html to be empty'
    );

    const cssFile = path.join(docsDir, 'styles.css');
    assert(fs.existsSync(cssFile), `Expected file ${cssFile} but it was not created`);
    assert.strictEqual(fs.readFileSync(cssFile, 'utf8'), '', 'Expected styles.css to be empty');

    done();
  });
});
