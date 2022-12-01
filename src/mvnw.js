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
const {spawn} = require('child_process');
const status = require('./status');

/**
 * The shell to use (depending on operating system).
 * @return {String} Path to shell or "undefined" if default one should be used
 */
function shell() {
  if (process.platform == 'win32') {
    return 'C:\\Windows\\SysWOW64\\WindowsPowerShell\\v1.0\\powershell.exe';
  }
}

/**
 * Run mvnw with provided commands.
 * @param {Hash} args - All arguments to pass to it
 * @return {Promise} of maven execution task
 */
module.exports = function(args, tgt) {
  return new Promise((resolve, reject) => {
    const home = path.resolve(__dirname, '../mvnw');
    const bin = path.resolve(home, 'mvnw') + (process.platform == 'win32' ? '.cmd' : '');
    const params = args.filter(function(t) {
      return t != '';
    }).concat([
      '--errors',
      '--batch-mode',
      '--update-snapshots',
      '--fail-fast',
    ]);
    const cmd = bin + ' ' + params.join(' ');
    console.debug('+ %s', cmd);
    const result = spawn(
      bin,
      process.platform == 'win32' ? params.map((p) => `"${p}"`) : params,
      {
        cwd: home,
        stdio: 'inherit',
        shell: shell(),
      }
    );
    if (tgt != undefined) {
      status.start(args[0], tgt);
      result.on('close', (code) => {
        if (code !== 0) {
          throw new Error('The command "' + cmd + '" exited with #' + code + ' code');
        }
        status.stop();
        resolve(args);
      });
    } else {
      result.on('close', (code) => {
        if (code !== 0) {
          throw new Error('The command "' + cmd + '" exited with #' + code + ' code');
        }
        resolve(args);
      });
    }
  });
};
