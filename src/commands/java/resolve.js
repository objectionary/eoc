// Copyright (c) 2022-2025 Objectionary.com
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const rel = require('relative');
const {mvnw, flags} = require('../../mvnw');
const path = require('path');

/**
 * Command to resolve all the dependencies for compilation.
 * @param {Object} opts - All options
 * @return {Promise} of resolve task
 */
module.exports = function(opts) {
  return mvnw(['eo:resolve'].concat(flags(opts)), opts.target, opts.batch)
    .then((r) => {
      const sources = path.resolve(opts.target, 'eo/6-resolve');
      console.info('Dependencies resolved in %s', rel(sources));
      return mvnw(['eo:place'].concat(flags(opts)), opts.target, opts.batch);
    }).then((r) => {
      const classes = path.resolve(opts.target, 'classes');
      console.info('Dependencies placed in %s', rel(classes));
      return r;
    });
};
