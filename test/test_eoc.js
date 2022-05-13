/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2022 Yegor Bugayenko
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

/**
 * Helper to run EOC command line tool.
 *
 * @param {Array} args - Array of args
 * @param {Function} fn - Callback
 * @return {Mixed} The result of exec()
 */
function eoc(args, fn) {
  return exec(
    `node ${path.resolve('./src/eoc.js')} ${args.join(' ')}`,
    (error, stdout, stderr) => {
      assert.equal(null, error);
      assert.equal('', stderr);
      return fn(stdout);
    }
  );
}

const assert = require('assert');
const path = require('path');
const exec = require('child_process').exec;

describe('eoc', function() {
  it('prints its own version', function(done) {
    eoc(['--version'], function(stdout) {
      assert.equal(require('../src/version.js') + '\n', stdout);
      done();
    });
  });
});
