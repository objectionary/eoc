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
const {gte} = require('../demand');
const {mvnw, flags} = require('../mvnw');

/**
 * Command to convert .XMIR files into .PHI files.
 * @param {Object} opts - All options
 * @return {Promise} of assemble task
 */
module.exports = function(opts) {
  gte('EO parser', opts.parser, '0.35.2');
  const target = path.resolve(opts.target);
  const input = path.resolve(opts.target, opts.phiInput);
  console.debug('Reading .XMIR files from %s', rel(input));
  const output = path.resolve(opts.target, opts.phiOutput);
  console.debug('Writing .PHI files to %s', rel(output));
  return mvnw(
    ['eo:xmir-to-phi']
      .concat(flags(opts))
      .concat(
        [
          `-Deo.phiInputDir=${input}`,
          `-Deo.phiOutputDir=${output}`,
        ]
      ),
    opts.target, opts.batch
  ).then((r) => {
    console.info('XMIR files converted into PHI files at %s', rel(target));
    return r;
  });
};
