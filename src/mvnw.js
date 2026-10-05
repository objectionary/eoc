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
    return process.env.ComSpec || 'powershell.exe';
  }
}

/**
 * Whether the given shell is cmd.exe.
 * @param {String} sh - Shell path, as returned by shell()
 * @return {Boolean} TRUE if it is cmd.exe
 */
function cmd(sh) {
  return /^(?:.*\\)?cmd(?:\.exe)?$/i.test(sh);
}

/**
 * Quote a single argument for the Windows shell that will run it.
 *
 * cmd.exe does not understand single quotes; they are passed through
 * literally instead of being stripped, which corrupts the argument.
 * PowerShell, on the other hand, expands "$" and backtick inside double
 * quotes. Each shell needs its own literal quoting style.
 * @param {String} value - Argument to quote
 * @param {String} sh - Shell chosen by shell()
 * @return {String} Quoted argument
 */
module.exports.quote = function(value, sh) {
  return cmd(sh) ?
    `"${value.replace(/"/g, '""')}"` :
    `'${value.replace(/'/g, "''")}'`;
};

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
  if (!fs.existsSync(sources)) {
    throw new Error(`Sources directory ${rel(sources)} does not exist.`);
  }
  console.debug('Sources in %s', rel(sources));
  const target = path.resolve(opts.target);
  console.debug('Target in %s', rel(target));
  if (opts.parser && !opts.parser.endsWith('-SNAPSHOT') && !parserVersion.exists(opts.parser)) {
    throw new Error(
      `Parser version ${opts.parser} is not available in Maven Central.\n` +
      `Please check available versions at: https://repo.maven.apache.org/maven2/org/eolang/eo-maven-plugin/\n` +
      `Or use --latest flag to get the most recent version.`
    );
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
    const cmdline = `${bin} ${params.join(' ')}`;
    console.debug('+ %s', cmdline);
    const sh = shell();
    const result = spawn(
      bin,
      process.platform === 'win32' ? params.map((p) => module.exports.quote(p, sh)) : params,
      {
        cwd: home,
        stdio: 'inherit',
        shell: sh,
        detached: process.platform !== 'win32',
      }
    );
    const progress = tgt !== undefined && args.includes('--quiet') && !batch;
    const handlers = new Map();
    let interrupted;
    let escalation;
    const cleanup = () => {
      for (const [signal, handler] of handlers) {
        process.off(signal, handler);
      }
      clearTimeout(escalation);
      if (progress) {
        stop();
      }
    };
    const handleSignal = (signal) => {
      const handler = () => {
        interrupted ||= signal;
        clearTimeout(escalation);
        try {
          module.exports.killTree(result.pid, signal, result);
        } catch {
          result.kill(signal);
        }
        escalation = setTimeout(
          () => module.exports.killTree(result.pid, 'SIGKILL', result),
          5000
        );
        escalation.unref();
      };
      handlers.set(signal, handler);
      process.on(signal, handler);
    };
    for (const signal of ['SIGINT', 'SIGTERM']) {
      handleSignal(signal);
    }
    result.on('error', (error) => {
      cleanup();
      reject(error);
    });
    if (progress) {
      start();
    }
    result.on('close', (code) => {
      cleanup();
      if (interrupted) {
        process.exitCode = interrupted === 'SIGINT' ? 130 : 143;
        reject(new Error(`The command "${cmdline}" was interrupted by ${interrupted}`));
      } else if (code === 0) {
        resolve(args);
      } else {
        reject(new Error(`The command "${cmdline}" exited with #${code} code`));
      }
    });
  });
};

/**
 * Send a signal to the complete Maven process tree.
 * @param {Number} pid - The process ID returned by spawn
 * @param {String} signal - The signal to send
 * @param {Object} child - The spawned Maven process
 */
module.exports.killTree = function killTree(pid, signal, child) {
  if (!pid) {
    return;
  }
  if (process.platform === 'win32') {
    const killer = spawn(
      'taskkill', ['/PID', String(pid), '/T', '/F'],
      {stdio: 'ignore', windowsHide: true}
    );
    killer.on('error', () => child.kill(signal));
    killer.on('close', (code) => {
      if (code !== 0) {
        child.kill(signal);
      }
    });
    return;
  }
  try {
    process.kill(-pid, signal);
  } catch (error) {
    if (error.code !== 'ESRCH') {
      throw error;
    }
    child.kill(signal);
  }
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
