/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2022-2023 Objectionary.com
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

const mvnw = require('../mvnw');
const path = require('path');

/**
 * Command to compile target language into binaries.
 * @param {Hash} opts - All options
 * @return {Promise} of compile task
 */
module.exports = function(opts) {
  const target = path.resolve(opts.target);
  return mvnw([
    'compiler:compile',
    opts.verbose ? '--errors' : '',
    opts.verbose ? '' : '--quiet',
    opts.debug ? '--debug' : '',
    `-Dmaven.compiler.source=1.8`,
    `-Dmaven.compiler.target=1.8`,
    `-Deo.targetDir=${target}`,
    `-Deo.generatedDir=${path.resolve(opts.target, 'generated-sources')}`,
    '-Deo.version=' + opts.parser,
    '-Deo.hash=' + (opts.hash ? opts.hash : opts.parser),
  ], opts.target, opts.batch).then((r) => {
    console.info('Java .class files compiled into %s', target);
    return r;
  });
};
