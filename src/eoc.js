#! /usr/bin/env node
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

const {program} = require('commander');
const tinted = require('./tinted-console');
const audit = require('./commands/audit');
const clean = require('./commands/clean');
const parse = require('./commands/parse');
const preflight = require('./commands/preflight');
const assemble = require('./commands/assemble');
const sodg = require('./commands/sodg');
const phi = require('./commands/phi');
const unphi = require('./commands/unphi');
const print = require('./commands/print');
const register = require('./commands/register');
const verify = require('./commands/verify');
const transpile = require('./commands/transpile');
const compile = require('./commands/compile');
const link = require('./commands/link');
const dataize = require('./commands/dataize');
const foreign = require('./commands/foreign');
const test = require('./commands/test');

if (process.argv.includes('--verbose')) {
  tinted.enable('debug');
  console.debug('Debug output is turned ON');
}

const fs = require('fs');
const path = require('path');
const hash = fs.readFileSync(path.join(__dirname, '../home-hash.txt'), 'utf8').trim();
let parser = fs.readFileSync(path.join(__dirname, '../eo-version.txt'), 'utf8').trim();
if (process.argv.includes('--latest')) {
  parser = require('./parser-version').get();
  // Maybe here we should also go to GITHUB, find out what is the
  // latest hash of the objectionary/home repository, and then
  // set it to the "hash" variable?
} else {
  console.debug('EO parser ' + parser + '; use the --latest flag if you need a freshier one');
}

const version = require('./version');
program
  .name('eoc')
  .usage('[options] command')
  .summary('EO command line toolkit')
  .description('EO command-line toolkit (' + version.what + ' built on ' + version.when + ')')
  .version(version.what, '-v, --version', 'Output the version number')
  .helpOption('-?, --help', 'Print this help information')
  .configureHelp({sortOptions: true, sortSubcommands: true});

program
  .option('-s, --sources <path>', 'Directory with .EO sources', '.')
  .option('-t, --target <path>', 'Directory with all generated files', '.eoc')
  .option('--home-tag <version>', 'Git tag in objectionary/home to compile against', hash)
  .option('--parser <version>', 'Set the version of EO parser to use', parser)
  .option('--latest', 'Use the latest parser version from Maven Central')
  .option('--alone', 'Just run a single command without dependencies')
  .option('-b, --batch', 'Run in batch mode, suppress interactive messages')
  .option('--no-color', 'Disable colorization of console messages')
  .option('--track-optimization-steps', 'Save intermediate XMIR files')
  .option('-c, --clean', 'Delete .eoc directory before running a command')
  .option('--debug', 'Print ALL debug messages, heavily overloading the log')
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
  .option('--global', 'delete ~/.eo directory')
  .description('Delete all temporary files')
  .action((str, opts) => {
    clean({...program.opts(), ...str});
  });

program.command('register')
  .description('Register all visible EO source files')
  .action((str, opts) => {
    preflight(program.opts());
    register(program.opts());
  });

program.command('parse')
  .description('Parse EO files into XMIR')
  .action((str, opts) => {
    clear(str);
    preflight(program.opts());
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
    preflight(program.opts());
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
    preflight(program.opts());
    if (program.opts().alone == undefined) {
      register(program.opts())
        .then((r) => assemble(program.opts()))
        .then((r) => sodg({...program.opts(), ...str}));
    } else {
      sodg({...program.opts(), ...str});
    }
  });

program.command('phi')
  .description('Generate PHI files from XMIR')
  .action((str, opts) => {
    clear(str);
    preflight(program.opts());
    if (program.opts().alone == undefined) {
      register(program.opts())
        .then((r) => assemble(program.opts()))
        .then((r) => phi(program.opts()));
    } else {
      phi(program.opts());
    }
  });

program.command('unphi')
  .option('--tests', 'Add "+tests" meta to result XMIR files')
  .description('Generate XMIR files from PHI files')
  .action((str, opts) => {
    clear(str);
    preflight(program.opts());
    unphi({...program.opts(), ...str});
  });

program.command('print')
  .description('Generate EO files from XMIR files')
  .action((str, opts) => {
    clear(str);
    print(program.opts());
  });

program.command('verify')
  .description('Verify XMIR files and fail if any issues inside')
  .action((str, opts) => {
    clear(str);
    preflight(program.opts());
    if (program.opts().alone == undefined) {
      register(program.opts())
        .then((r) => assemble(program.opts()))
        .then((r) => verify(program.opts()));
    } else {
      verify(program.opts());
    }
  });

program.command('transpile')
  .description('Convert EO files into target language')
  .action((str, opts) => {
    clear(str);
    preflight(program.opts());
    if (program.opts().alone == undefined) {
      register(program.opts())
        .then((r) => assemble(program.opts()))
        .then((r) => verify(program.opts()))
        .then((r) => transpile(program.opts()));
    } else {
      transpile(program.opts());
    }
  });

program.command('compile')
  .description('Compile target language sources into binaries')
  .action((str, opts) => {
    clear(str);
    preflight(program.opts());
    if (program.opts().alone == undefined) {
      register(program.opts())
        .then((r) => assemble(program.opts()))
        .then((r) => verify(program.opts()))
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
    preflight(program.opts());
    if (program.opts().alone == undefined) {
      register(program.opts())
        .then((r) => assemble(program.opts()))
        .then((r) => verify(program.opts()))
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
    preflight(program.opts());
    if (program.opts().alone == undefined) {
      register(program.opts())
        .then((r) => assemble(program.opts()))
        .then((r) => verify(program.opts()))
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
    preflight(program.opts());
    if (program.opts().alone == undefined) {
      register(program.opts())
        .then((r) => assemble(program.opts()))
        .then((r) => verify(program.opts()))
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
