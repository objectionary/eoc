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

const {program} = require('commander');
const tinted = require('./tinted-console');
const audit = require('./commands/audit');
const clean = require('./commands/clean');
const assemble = require('./commands/assemble');
const gmi = require('./commands/gmi');
const register = require('./commands/register');
const transpile = require('./commands/transpile');
const compile = require('./commands/compile');
const link = require('./commands/link');
const dataize = require('./commands/dataize');
const foreign = require('./commands/foreign');
const test = require('./commands/test');

if (process.argv.includes('--verbose')) {
  tinted.enable('debug');
  console.debug('Debug output is turned ON');
  console.info('INFO');
}

program
  .name('eoc')
  .description('EO command-line toolkit (' + require('./version') + ')')
  .version(require('./version'));

program
  .option('-s, --sources <path>', 'directory with .EO sources', '.')
  .option('-t, --target <path>', 'directory with all generated files', '.eoc')
  .option('--hash <hex>', 'hash in objectionary/home to compile against')
  .option('--parser <version>', 'set the version of parser to use')
  .option('--alone', 'just run a single command without dependencies')
  .option('--no-color', 'disable colorization of console messages')
  .option('--track-optimization-steps', 'save intermediate XMIR files')
  .option('--verbose', 'print debug messages and full output of child processes');

program.command('audit')
  .description('inspect all packages and report their status')
  .action((str, opts) => {
    audit(program.opts());
  });

program.command('foreign')
  .description('inspect and print the list of foreign objects')
  .action((str, opts) => {
    foreign(program.opts());
  });

program
  .command('clean')
  .option('--cached', 'delete ~/.eo directory')
  .description('delete all temporary files')
  .action((str, opts) => {
    clean({...program.opts(), ...str});
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

program.command('gmi')
  .description('generate GMI files from XMIR')
  .option('--gmi-xml', 'generate .gmi.xml files')
  .option('--gmi-xembly', 'generate .gmi.xe files')
  .option('--gmi-graph', 'generate .gmi.graph files')
  .option('--gmi-dot', 'generate .gmi.dot files')
  .action((str, opts) => {
    if (program.opts().alone == undefined) {
      register(program.opts());
      assemble(program.opts());
    }
    gmi({...program.opts(), ...str});
  });

program.command('transpile')
  .description('convert EO files into target language')
  .action((str, opts) => {
    if (program.opts().alone == undefined) {
      register(program.opts());
      assemble(program.opts());
    }
    transpile(program.opts());
  });

program.command('compile')
  .description('compile target language sources into binaries')
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
    dataize(program.args[1], program.args.slice(2), program.opts());
  });

program.command('test')
  .description('run all visible unit tests')
  .action((str, opts) => {
    if (program.opts().alone == undefined) {
      register(program.opts());
      assemble(program.opts());
      transpile(program.opts());
      compile(program.opts());
      link(program.opts());
    }
    test(program.opts());
  });

try {
  program.parse(process.argv);
} catch (e) {
  console.error(e.message);
  console.debug(e.stack);
  process.exit(1);
}
