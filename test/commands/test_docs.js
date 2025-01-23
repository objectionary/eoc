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
const {runSync} = require('../helpers');

/**
 * It should create an empty 'eodocs.html' file in the current directory.
 * @param {Function} done - Mocha's callback to signal completion
 */
describe('docs', function() {
  it('creates an empty eodocs.html file', function(done) {
    const filePath = path.resolve('eodocs.html');
    fs.rmSync(filePath, {recursive: true, force: true});
    runSync(['docs']);
    assert(fs.existsSync(filePath), `Expected eodocs.html to be created, but it's missing`);
    const content = fs.readFileSync(filePath, 'utf8');
    assert.strictEqual(
      content,
      '',
      `Expected eodocs.html to be empty, but it has content: ${content}`
    );
    done();
  });
});
