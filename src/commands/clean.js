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

const rel = require('relative');
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Deletes all temporary files.
 * @param {Hash} opts - All options
 */
module.exports = function(opts) {
  const home = path.resolve(opts.target);
  if (fs.existsSync(home)) {
    fs.rmSync(home, {recursive: true, force: true});
    console.info('The directory %s deleted', rel(home));
  } else {
    console.info('The directory %s doesn\'t exist, no need to delete', rel(home));
  }
  if (opts.global) {
    const eo = path.join(os.homedir(), '.eo');
    if (fs.existsSync(eo)) {
      fs.rmSync(eo, {recursive: true});
      console.info('The directory %s deleted', eo);
    } else {
      console.info('The directory %s doesn\'t exist, no need to delete', eo);
    }
  }
};
