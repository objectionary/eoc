/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2022-2024 Objectionary.com
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

const readline = require('readline');

/**
 * Command to open inspect mode.
 * @param {Hash} opts - All options
 */
module.exports = function(opts) {
  console.info('open inspect mode');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'inspect> '
  });

  const exitInspectMode = () => {
    rl.close();
    process.exit(0);
  };

  const handleInput = (input) => {
    if (input.trim().toLowerCase() === 'exit') {
      console.info('\nExiting inspect mode...');
      exitInspectMode();
    } else {
      console.info('Sorry, this command is under development 🚧');
      rl.prompt();
    }
  };

  const handleSigint = () => {
    exitInspectMode();
  };

  process.on('SIGINT', handleSigint);

  rl.prompt();
  rl.on('line', handleInput);

  rl.on('close', () => {
    process.off('SIGINT', handleSigint);
  });
};
