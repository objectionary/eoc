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


const {spawnSync} = require('child_process');
const path = require('path');
const colors = require('colors');
const {flags, shell} = require('../mvnw');

module.exports = (opts) => {
  console.info('Starting preflight check ');

  const params = ['eo:help'].concat(flags(opts)).filter((t) => t !== '');

  const home = path.resolve(__dirname, '../../mvnw');
  const bin = path.resolve(home, 'mvnw') + (process.platform == 'win32' ? '.cmd' : '');

  const result = spawnSync(
    bin,
    process.platform == 'win32' ? params.map((p) => `"${p}"`) : params,
    {
      cwd: home,
      stdio: 'inherit',
      shell: shell(),
    }
  );

  if (result.status !== 0) {
    throw new Error(`Preflight check failed. Parser version could be the problem.` +
    ` Current version of parser is : ${opts.parser}`);
  }

  process.stdout.write(
    colors.green('Preflight check finished successfully\n')
  );
};
