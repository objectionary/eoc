#! /usr/bin/env node
/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const tinted = require('./tinted-console');
const {program, InvalidArgumentError} = require('commander');
const demand = require('./demand');
const {engines} = require('../package.json');

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
  print: require('./commands/print'),
  register: require('./commands/register'),
  lint: require('./commands/lint'),
  docs: require('./commands/docs'),
  generate_comments: require('./commands/generate_comments'),
  jeo_disassemble: require('./commands/jeo/disassemble'),
  jeo_assemble: require('./commands/jeo/assemble'),
  normalize: require('./commands/normalize'),
  format: require('./commands/format'),
};

const commands = {
  [language.java]: {
    ...common,
    ...{
      resolve: require('./commands/java/resolve'),
      transpile: require('./commands/java/transpile'),
      link: require('./commands/java/link'),
      compile: require('./commands/java/compile'),
      dataize: require('./commands/java/dataize'),
      test: require('./commands/java/test'),
      inspect: require('./commands/java/inspect'),
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
      test: require('./commands/js/test'),
    }
  }
};

const pipelines = {
  [language.java]: require('./commands/java/pipeline'),
  [language.js]: require('./commands/js/pipeline'),
};

/**
 * Every language name a user may type, mapped (in lower case) to its
 * canonical platform key. Derived from `language` so the accepted names
 * and the platforms can never drift apart. For each `[alias, canonical]`
 * pair we accept the short alias (e.g. `js`) and the canonical name
 * lower-cased (e.g. `javascript`); `canonicalLanguage()` lower-cases the
 * input, so mixed-case spellings such as `JavaScript` are matched too.
 */
const platforms = {};
for (const [alias, canonical] of Object.entries(language)) {
  platforms[alias] = canonical;
  platforms[canonical.toLowerCase()] = canonical;
}

/**
 * Validate and canonicalize the value of the --language option, so an
 * unknown platform is rejected right away with a clean commander error
 * instead of surfacing later as an unhandled exception.
 * @param {String} value - Raw value from the command line
 * @return {String} The canonical platform name
 * @throws {InvalidArgumentError} If the language does not resolve to a known platform
 */
function canonicalLanguage(value) {
  const canonical = platforms[String(value).toLowerCase()];
  if (canonical === undefined) {
    throw new InvalidArgumentError(`Unknown platform ${value}`);
  }
  return canonical;
}

if (
  process.argv.includes('--verbose') ||
  process.argv.includes('--debug')
) {
  tinted.enable('debug');
  console.debug('Debug output is turned ON');
}

const fs = require('fs');
const path = require('path'),
  tag = fs.readFileSync(path.join(__dirname, '../home-tag.txt'), 'utf8').trim(),
  jeo = fs.readFileSync(path.join(__dirname, '../jeo-version.txt'), 'utf8').trim();
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
  .option('-C, --dir <path>', 'Directory where the work should be done', '.')
  .option('-s, --sources <path>', 'Directory with .EO sources', '.')
  .option('-t, --target <path>', 'Directory with all generated files', '.eoc')
  .option('--easy', 'Ignore "warnings" and only fail if there are "errors" or "critical" errors')
  .option('--blind', 'Disable linting')
  .option('--home-tag <version>', 'Git tag in objectionary/home to compile against', tag)
  .option('--parser <version>', 'Set the version of EO parser to use', parser)
  .option('--lints <version>', 'Set the version of EO lints to use')
  .option('--latest', 'Use the latest parser version from Maven Central')
  .option('--alone', 'Just run a single command without dependencies')
  .option('-l, --language <name>', 'Language of target execution platform (Java or JavaScript, case-insensitive)', canonicalLanguage, language.java)
  .option('-b, --batch', 'Run in batch mode, suppress interactive messages')
  .option('--no-color', 'Disable colorization of console messages')
  .option('--track-transformation-steps', 'Save intermediate XMIR files')
  .option('-c, --clean', 'Delete .eoc directory before running a command')
  .option('--debug', 'Print ALL debug messages, heavily overloading the log')
  .option('--verbose', 'Print debug messages and full output of child processes')
  .option('--pin <version>', 'Fail if eoc version doesn\'t match exactly', version.what)
  .option('--update-snapshots', 'Update snapshots in the local repository if they are outdated');

program.hook('preAction', (command) => {
  const dir = command.opts().dir;
  if (path.resolve(dir) !== process.cwd()) {
    try {
      process.chdir(dir);
    } catch (err) {
      console.error('Cannot switch to the working directory %s: %s', dir, err.message);
      process.exit(1);
    }
    console.debug(`Working directory changed to ${process.cwd()}`);
  }
});

program.command('audit')
  .description('Inspect all packages and report their status')
  .action(async (str, opts) => {
    pin(program.opts());
    await coms().audit(program.opts());
  });

program.command('foreign')
  .description('Inspect and print the list of foreign objects')
  .action((str, opts) => {
    pin(program.opts());
    coms().foreign(program.opts());
  });

program
  .command('clean')
  .option('--global', 'delete ~/.eo directory')
  .description('Delete all temporary files')
  .action((str, opts) => {
    pin(program.opts());
    coms().clean({...program.opts(), ...str});
  });

program.command('register')
  .description('Register all visible EO source files')
  .action(async (str, opts) => {
    pin(program.opts());
    await coms().register(program.opts());
  });

program.command('parse')
  .description('Parse EO files into XMIR')
  .action(async (str, opts) => {
    pin(program.opts());
    clear(str);
    if (program.opts().alone === undefined) {
      await pipe()(coms(), ['register', 'parse'], program.opts());
    } else {
      await coms().parse(program.opts());
    }
  });

program.command('assemble')
  .description('Parse EO files into XMIR and join them with required dependencies')
  .action(async (str, opts) => {
    pin(program.opts());
    clear(str);
    if (program.opts().alone === undefined) {
      await pipe()(coms(), ['register', 'assemble'], program.opts());
    } else {
      await coms().assemble(program.opts());
    }
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
  .action(async (str, opts) => {
    pin(program.opts());
    clear(str);
    await coms().print({...program.opts(), ...str});
  });

program.command('lint')
  .description('Lint XMIR files and fail if any issues inside')
  .action(async (str, opts) => {
    pin(program.opts());
    clear(str);
    if (program.opts().alone === undefined) {
      await pipe()(coms(), ['register', 'assemble', 'lint'], program.opts());
    } else {
      await coms().lint(program.opts());
    }
  });

program.command('resolve')
  .description('Resolve all the dependencies required for compilation')
  .action(async (str, opts) => {
    pin(program.opts());
    clear(str);
    if (program.opts().alone === undefined) {
      await pipe()(coms(), ['register', 'assemble', 'lint', 'resolve'], program.opts());
    } else {
      await coms().resolve(program.opts());
    }
  });

program.command('transpile')
  .description('Convert EO files into target language')
  .action(async (str, opts) => {
    pin(program.opts());
    clear(str);
    if (program.opts().alone === undefined) {
      await pipe()(coms(), ['register', 'assemble', 'lint', 'resolve', 'transpile'], program.opts());
    } else {
      await coms().transpile(program.opts());
    }
  });

program.command('compile')
  .description('Compile target language sources into binaries')
  .action(async (str, opts) => {
    pin(program.opts());
    clear(str);
    if (program.opts().alone === undefined) {
      await pipe()(coms(), ['register', 'assemble', 'lint', 'resolve', 'transpile', 'compile'], program.opts());
    } else {
      await coms().compile(program.opts());
    }
  });

program.command('link')
  .description('Link together all binaries into a single executable binary')
  .action(async (str, opts) => {
    pin(program.opts());
    clear(str);
    if (program.opts().alone === undefined) {
      await pipe()(coms(), ['register', 'assemble', 'lint', 'resolve', 'transpile', 'compile', 'link'], program.opts());
    } else {
      await coms().link(program.opts());
    }
  });

program.command('dataize')
  .description('Run the single executable binary and dataize an object')
  .option('--stack <size>', 'Set stack size for the virtual machine', '64M')
  .option('--heap <size>', 'Set the heap size for the VM', '256M')
  .action(async (str, opts) => {
    pin(program.opts());
    clear(str);
    if (program.opts().alone === undefined) {
      await pipe()(coms(), ['register', 'assemble', 'lint', 'resolve', 'transpile', 'compile', 'link'], program.opts());
      await coms().dataize(
        program.args[1], program.args.slice(2), {...program.opts(), ...str}
      );
    } else {
      await coms().dataize(
        program.args[1], program.args.slice(2), {...program.opts(), ...str}
      );
    }
  });

program.command('inspect')
  .description('Traverse the tree of objects of a compiled program')
  .option('--port <number>', 'TCP port for the inspection server', '8080')
  .action(async (str, opts) => {
    pin(program.opts());
    clear(str);
    const inspect = coms().inspect;
    if (inspect === undefined) {
      throw new Error(`The "inspect" command only works for ${language.java}`);
    }
    if (program.opts().alone === undefined) {
      await pipe()(coms(), ['register', 'assemble', 'lint', 'resolve', 'transpile', 'compile', 'link'], program.opts());
    }
    await inspect({...program.opts(), ...str});
  });

program.command('test')
  .description('Run all visible unit tests')
  .option('--stack <size>', 'Set stack size for the virtual machine', '64M')
  .option('--heap <size>', 'Set the heap size for the VM', '256M')
  .option('--object <name>', 'Run a single test object by its full EO name, e.g. foo.app.works-fine')
  .action(async (str, opts) => {
    pin(program.opts());
    clear(str);
    if (program.opts().alone === undefined) {
      await pipe()(coms(), ['register', 'assemble', 'lint', 'resolve', 'transpile', 'compile', 'link'], program.opts());
      await coms().test({...program.opts(), ...str});
    } else {
      await coms().test({...program.opts(), ...str});
    }
  });

program.command('docs')
  .description('Generate documentation from XMIR files')
  .action(async (str, opts) => {
    pin(program.opts());
    await coms().docs(program.opts());
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
  .action(async (str, opts) => {
    pin(program.opts());
    await coms().generate_comments({...program.opts(), ...str});
  });

program.command('jeo:disassemble')
  .description('Disassemble .class files to .xmir files')
  .option('--jeo-version <version>', 'Version of JEO to use', jeo)
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
  .action(async (str, opts) => {
    pin(program.opts());
    await coms().jeo_disassemble({...program.opts(), ...str});
  });

program.command('jeo:assemble')
  .description('Assemble .xmir files to .class files')
  .option('--jeo-version <version>', 'Version of JEO to use', jeo)
  .option(
    '--xmirs <dir>',
    'Directory with .xmir files (relative to --target)',
    'xmir'
  )
  .option(
    '--classes <dir>',
    'Directory with .class files (relative to --target)',
    'classes'
  )
  .action(async (str, opts) => {
    pin(program.opts());
    await coms().jeo_assemble({...program.opts(), ...str});
  });

program.command('normalize')
  .description('Normalize EO files using phi-calculus normalization via phino')
  .action(async (str, opts) => {
    pin(program.opts());
    clear(str);
    await pipe()(coms(), ['register', 'parse'], program.opts());
    await coms().normalize(program.opts());
  });

program.command('format')
  .description('Fail if EO files in the source directory are not formatted')
  .option('--fix', 'Overwrite EO files with their formatted versions')
  .action(async (str, opts) => {
    pin(program.opts());
    clear(str);
    if (program.opts().alone === undefined) {
      await pipe()(coms(), ['register', 'format'], {...program.opts(), ...str});
    } else {
      await coms().format({...program.opts(), ...str});
    }
  });

if (require.main === module) {
  demand.node(engines, process.versions.node);
  (async () => {
    try {
      await program.parseAsync(process.argv);
    } catch (err) {
      console.error(err && err.message ? err.message : err);
      process.exit(1);
    }
  })();
}

module.exports.commandsDescription = function commandsDescription() {
  return program.commands
    .map(c => [c.name(),c.description()]);
}

module.exports.canonicalLanguage = canonicalLanguage;

module.exports.select = select;

/**
 * Checks --clean option and clears the .eoc directory if true.
 * @param {*} str Str
 */
function clear(str) {
  if (program.opts().clean) {
    coms().clean({...program.opts(), ...str});
  }
}

/** Checks --pin option and fails if version mismatch.
 * @param {*} opts Options
 * @throws {Error} If version mismatch
 */
function pin(opts) {
  if (opts.pin && opts.pin !== version.what) {
    console.error(`Version mismatch: you are running eoc ${version.what}, but --pin option requires ${opts.pin}`);
    process.exit(1);
  }
}

/**
 * Get commands for the target language.
 * @return {Object} - commands
 */
function coms() {
  return select(commands, program.opts().language);
}

/**
 * Get pipeline for the target language.
 * @return {Function} - pipeline function
 */
function pipe() {
  return select(pipelines, program.opts().language);
}

/**
 * Resolve the entry registered for the requested language, matching the
 * name case-insensitively and accepting aliases (e.g. `js`, `java`).
 * Validation is delegated to canonicalLanguage(), so the "unknown
 * platform" check is never duplicated.
 * @param {Object} registry - Map keyed by canonical platform name
 * @param {String} lang - Language name as provided on the command line
 * @return {*} The entry registered for the resolved platform
 * @throws {InvalidArgumentError} If the language does not resolve to a known platform
 */
function select(registry, lang) {
  return registry[canonicalLanguage(lang)];
}
