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
 * Generate SODG files from XMIR.
 * @param {Hash} opts - All options
 * @return {Promise} of sodg task
 */
module.exports = function(opts) {
  const argv = ['eo:sodg'].concat(flags(opts));
  argv.push('-Deo.sodgIncludes=' + opts.include);
  if (opts.exclude) {
    argv.push('-Deo.sodgExcludes=' + opts.exclude);
  }
  if (opts.xml) {
    argv.push('-Deo.generateSodgXmlFiles');
  }
  if (opts.xembly) {
    argv.push('-Deo.generateSodgXmlFiles');
    argv.push('-Deo.generateXemblyFiles');
  }
  if (opts.graph) {
    argv.push('-Deo.generateSodgXmlFiles');
    argv.push('-Deo.generateXemblyFiles');
    argv.push('-Deo.generateGraphFiles');
  }
  if (opts.dot) {
    argv.push('-Deo.generateSodgXmlFiles');
    argv.push('-Deo.generateXemblyFiles');
    argv.push('-Deo.generateGraphFiles');
    argv.push('-Deo.generateDotFiles');
  }
  return mvnw(argv, opts.target, opts.batch).then((r) => {
    console.info('SODG files generated in %s', rel(path.resolve(opts.target)));
    return r;
  });
};
