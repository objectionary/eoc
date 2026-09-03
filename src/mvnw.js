/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const path = require('path');
const fs = require('fs');
const rel = require('relative');
const readline = require('readline');
const {spawn} = require('child_process');
const colors = require('colors');
const parserVersion = require('./parser-version');

/**
 * Short label for the Maven goals being executed, collapsing a list
 * into a count and leaving a lone goal under its own name.
 * @param {Array} args The arguments passed to Maven
 * @return {String} Either the single goal or a count like "5 steps"
 */
module.exports.summary = function(args) {
  const steps = args.filter((a) => !a.startsWith('-'));
  return steps.length > 1 ? `${steps.length} steps` : steps.join('');
};

/**
 * The shell to use (depending on operating system).
 * @return {String} Path to shell or "undefined" if default one should be used
 */
function shell() {
  if (process.platform === 'win32') {
    return 'C:\\Windows\\SysWOW64\\WindowsPowerShell\\v1.0\\powershell.exe';
  }
}

let beginning,
  phase = 'unknown',
  running = false,
  target;

/**
 * Prepare options for Maven.
 * @param {Object} opts - Opts provided to the "eoc"
 * @return {Array} of Maven options
 */
module.exports.flags = function(opts) {
  if (opts.sources === undefined) {
    throw new Error('Sources directory is not specified. Please provide it with --sources option.');
  }
  if (opts.target === undefined) {
    throw new Error('Target directory is not specified. Please provide it with --target option.');
  }
  const sources = path.resolve(opts.sources);
  console.debug('Sources in %s', rel(sources));
  const target = path.resolve(opts.target);
  console.debug('Target in %s', rel(target));
  if (opts.parser && !opts.parser.endsWith('-SNAPSHOT') && !parserVersion.exists(opts.parser)) {
    console.error(colors.red(
      `Parser version ${opts.parser} is not available in Maven Central.\n` +
      `Please check available versions at: https://repo.maven.apache.org/maven2/org/eolang/eo-maven-plugin/\n` +
      `Or use --latest flag to get the most recent version.`
    ));
    process.exit(1);
  }
  return [
    `-Deo.version=${opts.parser}`,
    `-Deo.tag=${opts.homeTag ? opts.homeTag : opts.parser}`,
    opts.lints ? `-Deo.lintsVersion=${opts.lints}` : '',
    opts.verbose ? '--errors' : '',
    opts.verbose ? '' : '--quiet',
    opts.debug ? '--debug' : '',
    opts.updateSnapshots ? '--update-snapshots' : '',
    `-Deo.sourcesDir=${sources}`,
    `-Deo.targetDir=${target}`,
    `-Deo.outputDir=${path.resolve(opts.target, 'classes')}`,
    `-Deo.generatedDir=${path.resolve(opts.target, 'generated-sources')}`,
    `-Deo.placed=${path.resolve(opts.target, 'eo-placed.csv')}`,
    `-Deo.placedFormat=csv`,
    `-Deo.skipLinting=${opts.blind ? 'true' : 'false'}`,
    opts.trackTransformationSteps ? '-Deo.trackTransformationSteps' : '',
    '-Dorg.slf4j.simpleLogger.showDateTime=true',
    '-Dorg.slf4j.simpleLogger.dateTimeFormat=yyyy-MM-dd HH:mm:ss',
  ].filter(flag => flag !== '');
};

/**
 * Run mvnw with provided commands.
 * @param {Array.<String>} args - All arguments to pass to it
 * @param {String} [tgt] - Path to the target directory
 * @param {Boolean} [batch] - Is it batch mode (TRUE) or interactive (FALSE)?
 * @return {Promise} of maven execution task
 */
module.exports.mvnw = function(args, tgt, batch) {
  return new Promise((resolve, reject) => {
    console.debug(`Running mvnw with arguments: ${args.join(' ')}`);
    target = tgt;
    phase = module.exports.summary(args);
    const home = path.resolve(__dirname, '../mvnw');
    let bin = path.resolve(home, 'mvnw') + (process.platform === 'win32' ? '.cmd' : '');
    if (!fs.existsSync(bin)) {
      console.warn(colors.yellow(`Warning: mvnw not found at ${bin}, falling back to system "mvn"`));
      bin = 'mvn';
    }
    const params = args.filter((t) => t !== '').concat([
      '--batch-mode',
      '--color=never',
      '--fail-fast',
      '--strict-checksums',
      '-Dorg.slf4j.simpleLogger.showDateTime=true',
      '-Dorg.slf4j.simpleLogger.dateTimeFormat=yyyy-MM-dd HH:mm:ss',
    ]);
    const cmd = `${bin} ${params.join(' ')}`;
    console.debug('+ %s', cmd);
    const result = spawn(
      bin,
      process.platform === 'win32' ? params.map((p) => `"${p}"`) : params,
      {
        cwd: home,
        stdio: 'inherit',
        shell: shell(),
      }
    );
    const ticking = tgt !== undefined && args.includes('--quiet') && !batch;
    if (ticking) {
      start();
    }
    result.on('error', (error) => {
      if (ticking) {
        stop();
      }
      reject(new Error(module.exports.missing(bin, error), {cause: error}));
    });
    result.on('close', (code) => {
      if (ticking) {
        stop();
      }
      if (code !== 0) {
        reject(new Error(`The command "${cmd}" exited with #${code} code`));
        return;
      }
      resolve(args);
    });
  });
};

/**
 * The diagnostic for a Maven binary that could not be started at all,
 * which usually means Maven is not installed or the package is broken.
 * @param {String} bin - The binary that could not be started
 * @param {Error} cause - The error the spawn reported
 * @return {String} The user-facing diagnostic
 */
module.exports.missing = function(bin, cause) {
  const lines = [
    `The Maven binary "${bin}" could not be started.`,
    'EO needs Maven 3.9 or newer to build EO programs.',
    'Either install it and make sure "mvn" is on your PATH,',
    'or reinstall "eolang" so that its bundled wrapper is restored.',
    '  Debian/Ubuntu: sudo apt-get install maven',
    '  macOS:         brew install maven',
    '  Windows:       https://maven.apache.org/download.cgi'
  ];
  if (cause && cause.message) {
    lines.push(`Underlying error: ${cause.message.toString().trim()}`);
  }
  return lines.join('\n');
};

/**
 * Starts mvnw execution status detection.
 */
function start() {
  running = true;
  beginning = Date.now();
  const check = function() {
    if (running) {
      print();
      setTimeout(check, 1000);
    }
  };
  check();
}

/**
 * Stops mvnw execution status detection.
 */
function stop() {
  running = false;
  readline.clearLine(process.stdout);
}

/**
 * Prints mvnw execution status.
 */
function print() {
  const duration = Date.now() - beginning;
  /**
   * Recursively calculates number of files under a directory.
   * @param {String} dir - Directory where to count.
   * @param {Integer} curr - Current counter.
   * @return {Integer} Total number files.
   */
  function count(dir, curr) {
    if (!fs.existsSync(dir)) {
      return curr;
    }
    try {
      const files = fs.readdirSync(dir);
      for (const f of files) {
        curr = processFile(path.join(dir, f), curr);
      }
    } catch (error) {
      if (error.code === 'ENOENT') {
        return curr;
      }
      throw error;
    }
    return curr;
  }
  function processFile(filePath, curr) {
    try {
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        return count(filePath, curr);
      }
      return curr + 1;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return curr;
      }
      throw error;
    }
  }
  let elapsed;
  if (duration < 1000) {
    elapsed = `${duration}ms`;
  } else if (duration < 60 * 1000) {
    elapsed = `${Math.ceil(duration / 1000)}s`;
  } else {
    elapsed = `${Math.ceil(duration / (60 * 1000))}min`;
  }
  process.stdout.write(
    colors.yellow(`[${phase}] ${elapsed}; ${count(target, 0)} files generated so far...`)
  );
  readline.clearLine(process.stdout, 1);
  readline.cursorTo(process.stdout, 0);
}
