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

const assemble = require('./commands/assemble');
const audit = require('./commands/audit');
const clean = require('./commands/clean');
const foreign = require('./commands/foreign');
const parse = require('./commands/parse');
const phi = require('./commands/phi');
const print = require('./commands/print');
const register = require('./commands/register');
const sodg = require('./commands/sodg');
const tinted = require('./tinted-console');
const unphi = require('./commands/unphi');
const verify = require('./commands/verify');
const {program} = require('commander');

/**
 * Target language option.
 */
const language = {
  java: 'Java',
  js: 'JavaScript',
};

/**
 * Platform dependent commands.
 */
const commands = {
  [language.java]: {
    transpile: require('./commands/java/transpile'),
    link: require('./commands/java/link'),
    compile: require('./commands/java/compile'),
    dataize: require('./commands/java/dataize'),
    test: require('./commands/java/test')
  },
  [language.js]: {
    transpile: require('./commands/js/transpile'),
    link: require('./commands/js/link'),
    compile: require('./commands/js/compile'),
    dataize: require('./commands/js/dataize'),
    test: require('./commands/js/test')
  }
};

if (process.argv.includes('--verbose')) {
  tinted.enable('debug');
  console.debug('Debug output is turned ON');
}

const fs = require('fs');
const path = require('path');
const tag = fs.readFileSync(path.join(__dirname, '../home-tag.txt'), 'utf8').trim();
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
  .description(
    'EO command-line toolkit (' +
    version.what + ' built on ' + version.when +
    '): https://github.com/objectionary/eoc'
  )
  .version(version.what, '-v, --version', 'Output the version number')
  .helpOption('-?, --help', 'Print this help information')
  .configureHelp({sortOptions: true, sortSubcommands: true});

program
  .option('-s, --sources <path>', 'Directory with .EO sources', '.')
  .option('-t, --target <path>', 'Directory with all generated files', '.eoc')
  .option('--home-tag <version>', 'Git tag in objectionary/home to compile against', tag)
  .option('--parser <version>', 'Set the version of EO parser to use', parser)
  .option('--latest', 'Use the latest parser version from Maven Central')
  .option('--alone', 'Just run a single command without dependencies')
  .option('-l, --language <name>', 'Language of target execution platform', language.java)
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

program.command('phi')
  .description('Generate PHI files from XMIR')
  .option(
    '--phi-input <dir>',
    'Directory where XMIR files for translation to PHI are taken (relative to --target)',
    '2-optimize'
  )
  .option(
    '--phi-output <dir>',
    'Directory where translated PHI files are stored (relative to --target)',
    'phi'
  )
  .action((str, opts) => {
    clear(str);
    if (program.opts().alone == undefined) {
      register(program.opts())
        .then((r) => assemble(program.opts()))
        .then((r) => phi({...program.opts(), ...str}));
    } else {
      phi(program.opts());
    }
  });

program.command('unphi')
  .option('--tests', 'Add "+tests" meta to result XMIR files')
  .option(
    '--unphi-input <dir>',
    'Directory where PHI files for translation to XMIR are taken (relative to --target)',
    'phi'
  )
  .option(
    '--unphi-output <dir>',
    'Directory where translated XMIR files are stored (relative to --target)',
    'unphi'
  )
  .description('Generate XMIR files from PHI files')
  .action((str, opts) => {
    clear(str);
    unphi({...program.opts(), ...str});
  });

program.command('print')
  .description('Generate EO files from XMIR files')
  .option(
    '--print-input <dir>',
    'Directory where XMIR files for translation to EO are taken (relative to --target)',
    '2-optimize'
  )
  .option(
    '--print-output <dir>',
    'Directory where translated EO files are stored (relative to --target)',
    'print'
  )
  .action((str, opts) => {
    clear(str);
    print({...program.opts(), ...str});
  });

program.command('verify')
  .description('Verify XMIR files and fail if any issues inside')
  .action((str, opts) => {
    clear(str);
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
    const lang = program.opts().language;
    if (program.opts().alone == undefined) {
      register(program.opts())
        .then((r) => assemble(program.opts()))
        .then((r) => verify(program.opts()))
        .then((r) => commands[lang].transpile(program.opts()));
    } else {
      commands[lang].transpile(program.opts());
    }
  });

program.command('compile')
  .description('Compile target language sources into binaries')
  .action((str, opts) => {
    const lang = program.opts().language;
    clear(str);
    if (program.opts().alone == undefined) {
      register(program.opts())
        .then((r) => assemble(program.opts()))
        .then((r) => verify(program.opts()))
        .then((r) => commands[lang].transpile(program.opts()))
        .then((r) => commands[lang].compile(program.opts()));
    } else {
      commands[lang].compile(program.opts());
    }
  });

program.command('link')
  .description('Link together all binaries into a single executable binary')
  .action((str, opts) => {
    clear(str);
    const lang = program.opts().language;
    if (program.opts().alone == undefined) {
      register(program.opts())
        .then((r) => assemble(program.opts()))
        .then((r) => verify(program.opts()))
        .then((r) => commands[lang].transpile(program.opts()))
        .then((r) => commands[lang].compile(program.opts()))
        .then((r) => commands[lang].link(program.opts()));
    } else {
      commands[lang].link(program.opts());
    }
  });

program.command('dataize')
  .description('Run the single executable binary and dataize an object')
  .option('--stack <size>', 'Set stack size for the virtual machine', '1M')
  .option('--heap <size>', 'Set the heap size for the VM', '256M')
  .action((str, opts) => {
    clear(str);
    const lang = program.opts().language;
    if (program.opts().alone == undefined) {
      register(program.opts())
        .then((r) => assemble(program.opts()))
        .then((r) => verify(program.opts()))
        .then((r) => commands[lang].transpile(program.opts()))
        .then((r) => commands[lang].compile(program.opts()))
        .then((r) => commands[lang].link(program.opts()))
        .then((r) => commands[lang].dataize(
          program.args[1], program.args.slice(2), {...program.opts(), ...str}
        ));
    } else {
      commands[lang].dataize(
        program.args[1], program.args.slice(2), {...program.opts(), ...str}
      );
    }
  });

program.command('test')
  .description('Run all visible unit tests')
  .action((str, opts) => {
    clear(str);
    const lang = program.opts().language;
    if (program.opts().alone == undefined) {
      register(program.opts())
        .then((r) => assemble(program.opts()))
        .then((r) => verify(program.opts()))
        .then((r) => commands[lang].transpile(program.opts()))
        .then((r) => commands[lang].compile(program.opts()))
        .then((r) => commands[lang].link(program.opts()))
        .then((r) => commands[lang].test(program.opts()));
    } else {
      commands[lang].test(program.opts());
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
