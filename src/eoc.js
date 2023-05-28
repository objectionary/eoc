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
const parse = require('./commands/parse');
const assemble = require('./commands/assemble');
const sodg = require('./commands/sodg');
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

if (process.argv.includes('--latest')) {
  const ver = require('./parser-version').get();
  process.argv.push('--parser');
  process.argv.push(ver);
  process.argv.push('--hash');
  process.argv.push(ver);
}

const version = require('./version');
program
  .name('eoc')
  .description('EO command-line toolkit (' + version.what + ' ' + version.when + ')')
  .version(version.what);

const parser = '0.29.4';
program
  .option('-s, --sources <path>', 'Directory with .EO sources', '.')
  .option('-t, --target <path>', 'Directory with all generated files', '.eoc')
  .option('--hash <hex>', 'Hash in objectionary/home to compile against', parser)
  .option('--parser <version>', 'Set the version of EO parser to use', parser)
  .option('--latest', 'Use latest parser and latest objectionary/home objects')
  .option('--alone', 'Just run a single command without dependencies')
  .option('-b, --batch', 'Run in batch mode, suppress interactive messages')
  .option('--no-color', 'Disable colorization of console messages')
  .option('--track-optimization-steps', 'Save intermediate XMIR files')
  .option('-c, --clean', 'Delete ./.eoc directory')
  .option('--verbose', 'Print debug messages and full output of child processes');

program.command('audit')
  .description('Inspect all packages and report their status')
  .action((str, opts) => {
    audit(program.opts());
  });

program.command('foreign')
  .description('Inspect and print the list of foreign objects')
  .action((str, opts) => {
    foreign(program.opts());
  });

program
  .command('clean')
  .option('--cached', 'delete ~/.eo directory')
  .description('Delete all temporary files')
  .action((str, opts) => {
    clean({...program.opts(), ...str});
  });

program.command('register')
  .description('Register all visible EO source files')
  .action((str, opts) => {
    register(program.opts());
  });

program.command('parse')
  .description('Parse EO files into XMIR')
  .action((str, opts) => {
    clear(str);
    if (program.opts().alone == undefined) {
      register(program.opts())
        .then((r) => parse(program.opts()));
    } else {
      parse(program.opts());
    }
  });

program.command('assemble')
  .description('Parse EO files into XMIR and join them with required dependencies')
  .action((str, opts) => {
    clear(str);
    if (program.opts().alone == undefined) {
      register(program.opts())
        .then((r) => assemble(program.opts()));
    } else {
      assemble(program.opts());
    }
  });

program.command('sodg')
  .description('Generate SODG files from XMIR')
  .option('--xml', 'Generate .sodg.xml files')
  .option('--xembly', 'Generate .sodg.xe files')
  .option('--graph', 'Generate .sodg.graph files')
  .option('--dot', 'Generate .sodg.dot files')
  .option('--include <names>', 'Generate SODG for these object names (using mask)', '**')
  .option('--exclude <names>', 'Don\'t generate SODG for these objects')
  .action((str, opts) => {
    clear(str);
    if (program.opts().alone == undefined) {
      register(program.opts())
        .then((r) => assemble(program.opts()))
        .then((r) => sodg({...program.opts(), ...str}));
    } else {
      sodg({...program.opts(), ...str});
    }
  });

program.command('transpile')
  .description('Convert EO files into target language')
  .action((str, opts) => {
    clear(str);
    if (program.opts().alone == undefined) {
      register(program.opts())
        .then((r) => assemble(program.opts()))
        .then((r) => transpile(program.opts()));
    } else {
      transpile(program.opts());
    }
  });

program.command('compile')
  .description('Compile target language sources into binaries')
  .action((str, opts) => {
    clear(str);
    if (program.opts().alone == undefined) {
      register(program.opts())
        .then((r) => assemble(program.opts()))
        .then((r) => transpile(program.opts()))
        .then((r) => compile(program.opts()));
    } else {
      compile(program.opts());
    }
  });

program.command('link')
  .description('Link together all binaries into a single executable binary')
  .action((str, opts) => {
    clear(str);
    if (program.opts().alone == undefined) {
      register(program.opts())
        .then((r) => assemble(program.opts()))
        .then((r) => transpile(program.opts()))
        .then((r) => compile(program.opts()))
        .then((r) => link(program.opts()));
    } else {
      link(program.opts());
    }
  });

program.command('dataize')
  .description('Run the single executable binary and dataize an object')
  .option('--stack <size>', 'Change stack size', '1M')
  .action((str, opts) => {
    clear(str);
    if (program.opts().alone == undefined) {
      register(program.opts())
        .then((r) => assemble(program.opts()))
        .then((r) => transpile(program.opts()))
        .then((r) => compile(program.opts()))
        .then((r) => link(program.opts()))
        .then((r) => dataize(program.args[1], program.args.slice(2), {...program.opts(), ...str}));
    } else {
      dataize(program.args[1], program.args.slice(2), {...program.opts(), ...str});
    }
  });

program.command('test')
  .description('Run all visible unit tests')
  .action((str, opts) => {
    clear(str);
    if (program.opts().alone == undefined) {
      register(program.opts())
        .then((r) => assemble(program.opts()))
        .then((r) => transpile(program.opts()))
        .then((r) => compile(program.opts()))
        .then((r) => link(program.opts()))
        .then((r) => test(program.opts()));
    } else {
      test(program.opts());
    }
  });

try {
  program.parse(process.argv);
} catch (e) {
  console.error(e.message);
  console.debug(e.stack);
  process.exit(1);
}

/**
 * Checks --clean option and clears the .eoc directory if true.
 * @param {*} str Str
 */
function clear(str) {
  if (program.opts().clean) {
    clean({...program.opts(), ...str});
  }
}
