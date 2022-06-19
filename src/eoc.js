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

const audit = require('./commands/audit');
const clean = require('./commands/clean');
const assemble = require('./commands/assemble');
const register = require('./commands/register');
const transpile = require('./commands/transpile');
const compile = require('./commands/compile');
const link = require('./commands/link');
const dataize = require('./commands/dataize');

program
  .name('eoc')
  .description('EO command-line toolkit')
  .version(require('./version'));

program
  .option('-s, --sources <path>', 'directory with .EO sources', '.')
  .option('-t, --target <path>', 'directory with all generated files', '.eoc')
  .option('--alone', 'just run a single command without dependencies');

program.command('audit')
  .description('inspects all packages and reports their status')
  .action((str, opts) => {
    audit(program.opts());
  });

program.command('clean')
  .description('delete all temporary files')
  .action((str, opts) => {
    clean(program.opts());
  });

program.command('register')
  .description('register all visible EO source files')
  .action((str, opts) => {
    register(program.opts());
  });

program.command('assemble')
  .description('parse EO files into XMIR and join them with required dependencies')
  .action((str, opts) => {
    if (program.opts().alone == undefined) {
      register(program.opts());
    }
    assemble(program.opts());
  });

program.command('transpile')
  .description('converts EO files into target language')
  .action((str, opts) => {
    if (program.opts().alone == undefined) {
      register(program.opts());
      assemble(program.opts());
    }
    transpile(program.opts());
  });

program.command('compile')
  .description('compiles target language sources into binaries')
  .action((str, opts) => {
    if (program.opts().alone == undefined) {
      register(program.opts());
      assemble(program.opts());
      transpile(program.opts());
    }
    compile(program.opts());
  });

program.command('link')
  .description('link together all binaries into a single executable binary')
  .action((str, opts) => {
    if (program.opts().alone == undefined) {
      register(program.opts());
      assemble(program.opts());
      transpile(program.opts());
      compile(program.opts());
    }
    link(program.opts());
  });

program.command('dataize')
  .description('run the single executable binary and dataize an object')
  .action((str, opts) => {
    if (program.opts().alone == undefined) {
      register(program.opts());
      assemble(program.opts());
      transpile(program.opts());
      compile(program.opts());
      link(program.opts());
    }
    dataize(program.args[1], program.opts());
  });

try {
  program.parse(process.argv);
} catch (e) {
  console.log('eoc failed: "' + e.message + '"');
  process.exit(1);
}
