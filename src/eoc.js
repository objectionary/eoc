#! /usr/bin/env node
/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2022-2025 Objectionary.com
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

const tinted = require('./tinted-console');
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
const common = {
  assemble: require('./commands/assemble'),
  audit: require('./commands/audit'),
  clean: require('./commands/clean'),
  foreign: require('./commands/foreign'),
  parse: require('./commands/parse'),
  phi: require('./commands/phi'),
  print: require('./commands/print'),
  register: require('./commands/register'),
  sodg: require('./commands/sodg'),
  unphi: require('./commands/unphi'),
  lint: require('./commands/lint'),
  docs: require('./commands/docs'),
  generate_comments: require('./commands/generate_comments'),
  jeo_disassemble: require('./commands/jeo/disassemble'),
  jeo_assemble: require('./commands/jeo/assemble')
};
const commands = {
  [language.java]: {
    ...common,
    ...{
      transpile: require('./commands/java/transpile'),
      link: require('./commands/java/link'),
      compile: require('./commands/java/compile'),
      dataize: require('./commands/java/dataize'),
      test: require('./commands/java/test')
    }
  },
  [language.js]: {
    ...common,
    ...{
      transpile: require('./commands/js/transpile'),
      link: require('./commands/js/link'),
      compile: require('./commands/js/compile'),
      dataize: require('./commands/js/dataize'),
      test: require('./commands/js/test')
    }
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
  console.debug(`EO parser ${parser}; use the --latest flag if you need a freshier one`);
}

const version = require('./version');
program
  .name('eoc')
  .usage('[options] command')
  .summary('EO command line toolkit')
  .description(
    `EO command-line toolkit (${version.what}) ` +
    `built on ${version.when}): https://github.com/objectionary/eoc`
  )
  .version(version.what, '-v, --version', `Just print the number of the version (${version.what})`)
  .helpOption('-?, --help', 'Print this help information')
  .configureHelp({sortOptions: true, sortSubcommands: true});

program
  .option('-s, --sources <path>', 'Directory with .EO sources', '.')
  .option('-t, --target <path>', 'Directory with all generated files', '.eoc')
  .option('--easy', 'Ignore "warnings" and only fail if there are "errorst" or "criticals"')
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
    coms().audit(program.opts());
  });

program.command('foreign')
  .description('Inspect and print the list of foreign objects')
  .action((str, opts) => {
    coms().foreign(program.opts());
  });

program
  .command('clean')
  .option('--global', 'delete ~/.eo directory')
  .description('Delete all temporary files')
  .action((str, opts) => {
    coms().clean({...program.opts(), ...str});
  });

program.command('register')
  .description('Register all visible EO source files')
  .action((str, opts) => {
    coms().register(program.opts());
  });

program.command('parse')
  .description('Parse EO files into XMIR')
  .action((str, opts) => {
    clear(str);
    if (program.opts().alone == undefined) {
      coms().register(program.opts())
        .then((r) => coms().parse(program.opts()));
    } else {
      coms().parse(program.opts());
    }
  });

program.command('assemble')
  .description('Parse EO files into XMIR and join them with required dependencies')
  .action((str, opts) => {
    clear(str);
    if (program.opts().alone == undefined) {
      coms().register(program.opts())
        .then((r) => coms().assemble(program.opts()));
    } else {
      coms().assemble(program.opts());
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
      coms().register(program.opts())
        .then((r) => coms().assemble(program.opts()))
        .then((r) => coms().sodg({...program.opts(), ...str}));
    } else {
      coms().sodg({...program.opts(), ...str});
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
      coms().register(program.opts())
        .then((r) => coms().assemble(program.opts()))
        .then((r) => coms().phi({...program.opts(), ...str}));
    } else {
      coms().phi({...program.opts(), ...str});
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
    coms().unphi({...program.opts(), ...str});
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
    coms().print({...program.opts(), ...str});
  });

program.command('lint')
  .description('Lint XMIR files and fail if any issues inside')
  .action((str, opts) => {
    clear(str);
    if (program.opts().alone == undefined) {
      coms().register(program.opts())
        .then((r) => coms().assemble(program.opts()))
        .then((r) => coms().lint(program.opts()));
    } else {
      coms().lint(program.opts());
    }
  });

program.command('transpile')
  .description('Convert EO files into target language')
  .action((str, opts) => {
    clear(str);
    if (program.opts().alone == undefined) {
      coms().register(program.opts())
        .then((r) => coms().assemble(program.opts()))
        .then((r) => coms().lint(program.opts()))
        .then((r) => coms().transpile(program.opts()));
    } else {
      coms().transpile(program.opts());
    }
  });

program.command('compile')
  .description('Compile target language sources into binaries')
  .action((str, opts) => {
    clear(str);
    if (program.opts().alone == undefined) {
      coms().register(program.opts())
        .then((r) => coms().assemble(program.opts()))
        .then((r) => coms().lint(program.opts()))
        .then((r) => coms().transpile(program.opts()))
        .then((r) => coms().compile(program.opts()));
    } else {
      coms().compile(program.opts());
    }
  });

program.command('link')
  .description('Link together all binaries into a single executable binary')
  .action((str, opts) => {
    clear(str);
    if (program.opts().alone == undefined) {
      coms().register(program.opts())
        .then((r) => coms().assemble(program.opts()))
        .then((r) => coms().lint(program.opts()))
        .then((r) => coms().transpile(program.opts()))
        .then((r) => coms().compile(program.opts()))
        .then((r) => coms().link(program.opts()));
    } else {
      coms().link(program.opts());
    }
  });

program.command('dataize')
  .description('Run the single executable binary and dataize an object')
  .option('--stack <size>', 'Set stack size for the virtual machine', '64M')
  .option('--heap <size>', 'Set the heap size for the VM', '256M')
  .action((str, opts) => {
    clear(str);
    if (program.opts().alone == undefined) {
      coms().register(program.opts())
        .then((r) => coms().assemble(program.opts()))
        .then((r) => coms().lint(program.opts()))
        .then((r) => coms().transpile(program.opts()))
        .then((r) => coms().compile(program.opts()))
        .then((r) => coms().link(program.opts()))
        .then((r) => coms().dataize(
          program.args[1], program.args.slice(2), {...program.opts(), ...str}
        ));
    } else {
      coms().dataize(
        program.args[1], program.args.slice(2), {...program.opts(), ...str}
      );
    }
  });

program.command('test')
  .description('Run all visible unit tests')
  .option('--stack <size>', 'Set stack size for the virtual machine', '64M')
  .option('--heap <size>', 'Set the heap size for the VM', '256M')
  .action((str, opts) => {
    clear(str);
    if (program.opts().alone == undefined) {
      coms().register(program.opts())
        .then((r) => coms().assemble(program.opts()))
        .then((r) => coms().lint(program.opts()))
        .then((r) => coms().transpile(program.opts()))
        .then((r) => coms().compile(program.opts()))
        .then((r) => coms().link(program.opts()))
        .then((r) => coms().test({...program.opts(), ...str}));
    } else {
      coms().test({...program.opts(), ...str});
    }
  });

program.command('docs')
  .description('Generate documentation from XMIR files')
  .action((str, opts) => {
    coms().docs(program.opts());
  });

program.command('generate_comments')
  .description('Complete comments with LLM')
  .requiredOption('--provider <provider>', 'Which LLM provider to use. Currently supported providers are: \`placeholder\`.')
  .requiredOption('--source <path>', 'File to process')
  .option('--comment_placeholder <placholder>', 'A string placeholder, each instance of which will be replaced with a generated comment', '<COMMENT-TO-BE-ADDED>')
  .option('--output <path>', 'Output file path - the file will contain the replacment mapping', 'out.json')
  .requiredOption('--prompt_template <path>', 'Path to prompt template file, where `{code}` placholder will be replaced with the code given by the user')
  .action((str, opts) => {
    coms().generate_comments({...program.opts(), ...str});
  });

program.command('jeo:disassemble')
  .description('Disassemble .class files to .xmir files')
  .option('--jeo-version <version>', 'Version of JEO to use', '0.6.11')
  .option(
    '--classes <dir>',
    'Directory with .class files (relative to --target)',
    'classes'
  )
  .option(
    '--xmirs <dir>',
    'Directory with .xmir files (relative to --target)',
    'xmir'
  )
  .action((str, opts) => {
    coms().jeo_disassemble({...program.opts(), ...str});
  });

program.command('jeo:assemble')
  .description('Assemble .xmir files to .class files')
  .option('--jeo-version <version>', 'Version of JEO to use', '0.6.11')
  .option(
    '--xmirs <dir>',
    'Directory with .xmir files (relative to --target)',
    'xmir'
  )
  .option(
    '--unrolled <dir>',
    'Directory with unrolled .xmir files (relative to --target)',
    'unrolled'
  )
  .option(
    '--classes <dir>',
    'Directory with .class files (relative to --target)',
    'classes'
  )
  .action((str, opts) => {
    coms().jeo_assemble({...program.opts(), ...str});
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
    coms().clean({...program.opts(), ...str});
  }
}

/**
 * Get commands for the target language.
 * @return {Hash} Commands for the specified language
 */
function coms() {
  const lang = program.opts().language;
  const hash = commands[lang];
  if (hash == undefined) {
    throw new Error(`Unknown platform ${lang}`);
  }
  return hash;
}
