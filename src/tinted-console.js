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

const safe = require('colors/safe');
const util = require('node:util');

const levels = {
  'trace': false,
  'debug': false,
  'info': true,
  'warn': true,
  'error': true,
};

const colors = {
  'trace': 'gray',
  'debug': 'gray',
  'info': 'white',
  'warn': 'orange',
  'error': 'red',
};

for (const level in levels) {
  if (levels.hasOwnProperty(level)) {
    const lvl = level;
    const before = console[lvl];
    console[level] = function(...args) {
      if (!levels[lvl]) {
        return;
      }
      before.call(
        before,
        safe[colors[lvl]](util.format(...args))
      );
    };
  }
}

/**
 * Enable this particular logging level.
 * @param {String} level - The level to enable
 */
module.exports.enable = function enable(level) {
  for (const key in levels) {
    if (levels.hasOwnProperty(level)) {
      levels[key] = true;
      if (key === level) {
        break;
      }
    }
  }
};
