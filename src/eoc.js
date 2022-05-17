#! /usr/bin/env node
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

const {Command} = require('commander');
const program = new Command();

program
  .name('eoc')
  .description('EO command-line toolkit')
  .version(require('./version'));

program
  .option('-s, --sources <path>', 'directory with .EO sources', 'src')
  .option('-t, --target <path>', 'directory with all generated files', 'target');

program.command('register')
  .description('register all visible EO source files')
  .action((str, options) => {
    const cmd = require('./commands/register');
    cmd(program.opts());
  });

program.command('assemble')
  .description('parse EO files into XMIR and join them with required dependencies')
  .action((str, options) => {
    const cmd = require('./commands/assemble');
    cmd(program.opts());
  });

program.command('transpile')
  .description('converts EO files into target language')
  .action((str, options) => {
    const cmd = require('./commands/transpile');
    cmd(program.opts());
  });

program.command('compile')
  .description('compiles target language sources into binaries')
  .action((str, options) => {
    const cmd = require('./commands/compile');
    cmd(program.opts());
  });

program.command('link')
  .description('link together all binaries into a single executable binary')
  .action((str, options) => {
    const cmd = require('./commands/link');
    cmd(program.opts());
  });

program.parse();
