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

const {spawn} = require('node:child_process');
const path = require('path');

/**
 * Runs the single executable binary.
 * @param {String} obj - Name of object to dataize
 * @param {Array} args - Arguments
 * @param {Hash} opts - All options
 */
module.exports = function(obj, args, opts) {
  const params = [
    '-Dfile.encoding=UTF-8',
    `-Xss${opts.stack}`,
    '-jar', path.resolve(opts.target, 'eoc.jar'),
    obj,
    ...args,
  ];
  console.debug('+ java ' + params.join(' '));
  spawn('java', params, {stdio: 'inherit'}).on('close', (code) => {
    if (code !== 0) {
      console.error(`Java exited with #${code} code`);
      process.exit(1);
    }
  });
};
