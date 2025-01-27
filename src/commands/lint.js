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
const semver = require('semver');

/**
 * Command to lint .XMIR files.
 * @param {Hash} opts - All options
 * @return {Promise} of assemble task
 */
module.exports = function(opts) {
  const extra = [
    `-Deo.failOnWarning=${opts.easy ? 'false' : 'true'}`,
  ];
  if (opts.parser.endsWith('-SNAPSHOT') || semver.gte(opts.parser, '0.45.0')) {
    return mvnw(
      ['eo:lint'].concat(flags(opts)).concat(extra),
      opts.target, opts.batch
    ).then((r) => {
      console.info('EO program linted in %s', rel(path.resolve(opts.target)));
      return r;
    }).catch((error) => {
      throw new Error(
        'There are error and/or warnings; you may disable warnings via the --easy option'
      );
    });
  } else {
    return mvnw(
      ['eo:verify'].concat(flags(opts)).concat(extra),
      opts.target, opts.batch
    ).then((r) => {
      console.info('EO program verified in %s', rel(path.resolve(opts.target)));
      return r;
    }).catch((error) => {
      throw new Error('You may disable warnings via the --easy option');
    });
  }
};
