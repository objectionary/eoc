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

// When you upgrade them, don't forget to place old values to the
// "test_dataize.js" table of versions, in order to make sure we
// do test dataization with all possible old versions.
module.exports.parserVersion = '0.35.2';
module.exports.homeHash = '130afdd1456a0cbafd52aee8d7bc612e1faac547';

/**
 * Helper to run EOC command line tool.
 *
 * @param {Array} args - Array of args
 * @return {String} Stdout
 */
module.exports.runSync = function runSync(args) {
  const path = require('path');
  const execSync = require('child_process').execSync;
  try {
    return execSync(
      `node ${path.resolve('./src/eoc.js')} --batch ${args.join(' ')}`,
      {
        'timeout': 1200000,
        'windowsHide': true,
      }
    ).toString();
  } catch (ex) {
    console.log(ex.stdout.toString());
    throw ex;
  }
};

/**
 * Assert that all files exist.
 *
 * @param {String} stdout - The stdout printed
 * @param {String} home - The location of files to match
 * @param {Array} paths - Array of file paths
 */
module.exports.assertFilesExist = function assertFilesExist(stdout, home, paths) {
  const path = require('path');
  const assert = require('assert');
  const fs = require('fs');
  paths.forEach((p) => {
    const abs = path.resolve(home, p);
    assert(
      fs.existsSync(abs),
      stdout + '\nFile ' + abs + ' is absent'
    );
  });
};
