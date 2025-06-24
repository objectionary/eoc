#! /usr/bin/env node
/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const tinted = require('./tinted-console');
const {program} = require('commander'),

  /**
 * Target language option.
 */
  language = {
    java: 'Java',
    js: 'JavaScript',
  },

  /**
 * Platform dependent commands.
 */
  common = {
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
    inspect: require('./commands/inspect'),
    jeo_disassemble: require('./commands/jeo/disassemble'),
    jeo_assemble: require('./commands/jeo/assemble'),
    latex: require('./commands/latex')
  },
  commands = {
    [language.java]: {
      ...common,
      ...{
        resolve: require('./commands/java/resolve'),
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
        resolve: require('./commands/js/resolve'),
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
const path = require('path'),
  tag = fs.readFileSync(path.join(__dirname, '../home-tag.txt'), 'utf8').trim();
let parser = fs.readFileSync(path.join(__dirname, '../eo-version.txt'), 'utf8').trim();
if (process.argv.includes('--latest')) {
  parser = require('./parser-version').get();
  // Maybe here we should also go to GITHUB, find out what is the
  // latest hash of the objectionary/home repository, and then
  // set it to the "hash" variable?
} else {
  console.debug(`EO parser ${parser}; use the --latest flag if you need a fresher one`);
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
  .option('--easy', 'Ignore "warnings" and only fail if there are "errors" or "criticals"')
  .option('--home-tag <version>', 'Git tag in objectionary/home to compile against', tag)
  .option('--parser <version>', 'Set the version of EO parser to use', parser)
  .option('--latest', 'Use the latest parser version from Maven Central')
  .option('--alone', 'Just run a single command without dependencies')
  .option('-l, --language <name>', 'Language of target execution platform', language.java)
  .option('-b, --batch', 'Run in batch mode, suppress interactive messages')
  .option('--no-color', 'Disable colorization of console messages')
  .option('--track-transformation-steps', 'Save intermediate XMIR files')
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
    if (program.opts().alone === undefined) {
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
    if (program.opts().alone === undefined) {
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
    if (program.opts().alone === undefined) {
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
    if (program.opts().alone === undefined) {
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
    if (program.opts().alone === undefined) {
      coms().register(program.opts())
        .then((r) => coms().assemble(program.opts()))
        .then((r) => coms().lint(program.opts()));
    } else {
      coms().lint(program.opts());
    }
  });

program.command('resolve')
  .description('Resolve all the dependencies required for compilation')
  .action((str, opts) => {
    clear(str);
    if (program.opts().alone === undefined) {
      coms().register(program.opts())
        .then((r) => coms().assemble(program.opts()))
        .then((r) => coms().lint(program.opts()))
        .then((r) => coms().resolve(program.opts()));
    } else {
      coms().resolve(program.opts());
    }
  });

program.command('transpile')
  .description('Convert EO files into target language')
  .action((str, opts) => {
    clear(str);
    if (program.opts().alone === undefined) {
      coms().register(program.opts())
        .then((r) => coms().assemble(program.opts()))
        .then((r) => coms().lint(program.opts()))
        .then((r) => coms().resolve(program.opts()))
        .then((r) => coms().transpile(program.opts()));
    } else {
      coms().transpile(program.opts());
    }
  });

program.command('compile')
  .description('Compile target language sources into binaries')
  .action((str, opts) => {
    clear(str);
    if (program.opts().alone === undefined) {
      coms().register(program.opts())
        .then((r) => coms().assemble(program.opts()))
        .then((r) => coms().lint(program.opts()))
        .then((r) => coms().resolve(program.opts()))
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
    if (program.opts().alone === undefined) {
      coms().register(program.opts())
        .then((r) => coms().assemble(program.opts()))
        .then((r) => coms().lint(program.opts()))
        .then((r) => coms().resolve(program.opts()))
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
    if (program.opts().alone === undefined) {
      coms().register(program.opts())
        .then((r) => coms().assemble(program.opts()))
        .then((r) => coms().lint(program.opts()))
        .then((r) => coms().resolve(program.opts()))
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
    if (program.opts().alone === undefined) {
      coms().register(program.opts())
        .then((r) => coms().assemble(program.opts()))
        .then((r) => coms().lint(program.opts()))
        .then((r) => coms().resolve(program.opts()))
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
  .description('Generate documentation with LLM')
  .requiredOption('--provider <provider>',
    'Which LLM provider to use. Currently supported providers are: `openai`, `placeholder`.')
  .option('--openai_model <model>',
    '(only usable with `openai` provider) name of model to use')
  .option('--openai_token <token>',
    '(only usable with `openai` provider) openai api token')
  .option('--openai_url <url>',
    '(only usable with `openai` provider) url to openai-like api',
    'https://api.openai.com/')
  .requiredOption('--source <path>', 'File to process')
  .option('--comment_placeholder <placeholder>',
    'A string placeholder, each instance of which will be replaced with a generated comment',
    '<COMMENT-TO-BE-ADDED>')
  .option('--output <path>',
    'Output file path - the file will contain the replacement mapping',
    'out.json')
  .requiredOption('--prompt_template <path>',
    'Path to prompt template file, ' +
    'where `{code}` placeholder will be replaced with the code given by the user')
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

program.command('latex')
  .description('Generate LaTeX files from EO sources')
  .action((str, opts) => {
    clear(str);
    coms().register(program.opts())
      .then((r) => coms().parse(program.opts()))
      .then((r) => coms().latex(program.opts()));
  });

program.command('fmt')
  .description('Format EO files in the source directory')
  .action((str, opts) => {
    clear(str);
    coms().register(program.opts())
      .then((r) => coms().parse(program.opts()))
      .then((r) => coms()
        .print({
          printInput: '1-parse',
          printOutput: program.opts().sources,
          ...program.opts()
        }));
  });

program.command('inspect')
  .description('Start EO inspect server and send input')
  .action((str, opts) => {
    coms().inspect(program.opts());
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
 * @return {Object} - commands
 */
function coms() {
  const lang = program.opts().language,
    hash = commands[lang];
  if (hash === undefined) {
    throw new Error(`Unknown platform ${lang}`);
  }
  return hash;
}
