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

const path = require('path');
const mvnwSync = require('../mvnw');
const parserVersion = require('../parser-version');

/**
 * Generate GMI files from XMIR.
 * @param {Hash} opts - All options
 */
module.exports = function(opts) {
  mvnwSync([
    'eo:gmi',
    '-Deo.version=' + (opts.parser ? opts.parser : parserVersion()),
    opts.verbose ? '' : '--quiet',
    opts.gmi_xml ? '-Deo.generateGmiXmlFiles' : '',
    opts.gmi_xembly ? '-Deo.generateXemblyFiles' : '',
    opts.gmi_graph ? '-Deo.generateGraphFiles' : '',
    opts.gmi_dot ? '-Deo.generateDotFiles' : '',
    `-Deo.targetDir=${path.resolve(opts.target)}`,
  ]);
  console.info('GMI files generated in %s', path.resolve(opts.target));
};
