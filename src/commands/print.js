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
const path = require('path');
const {mvnw, flags} = require('../mvnw');

/**
 * Command to convert .XMIR files into .EO files.
 * @param {Object} opts - All options
 * @return {Promise} of assemble task
 */
module.exports = function(opts) {
  const input = path.resolve(opts.target, opts.printInput);
  console.debug('Reading from %s', rel(input));
  const output = path.resolve(opts.target, opts.printOutput);
  console.debug('Writing into %s', rel(output));
  return mvnw(
    ['eo:print']
      .concat(flags(opts))
      .concat(
        [
          `-Deo.printSourcesDir=${input}`,
          `-Deo.printOutputDir=${output}`,
        ]
      ),
    opts.target, opts.batch
  ).then((r) => {
    console.info('XMIR files converted into EO files at %s', rel(output));
    return r;
  });
};
