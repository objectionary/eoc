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

const path = require('path');
const fs = require('fs');
const rel = require('relative');
const readline = require('readline');
const {spawn} = require('child_process');
const colors = require('colors');

/**
 * The shell to use (depending on operating system).
 * @return {String} Path to shell or "undefined" if default one should be used
 */
function shell() {
  if (process.platform == 'win32') {
    return 'C:\\Windows\\SysWOW64\\WindowsPowerShell\\v1.0\\powershell.exe';
  }
}

let phase = 'unknown';
let target;
let running = false;
let beginning;

/**
 * Prepare options for Maven.
 * @param {Object} opts - Opts provided to the "eoc"
 * @return {Array} of Maven options
 */
module.exports.flags = function(opts) {
  const sources = path.resolve(opts.sources);
  console.debug('Sources in %s', rel(sources));
  const target = path.resolve(opts.target);
  console.debug('Target in %s', rel(target));
  return [
    `-Deo.version=${opts.parser}`,
    `-Deo.tag=${opts.homeTag ? opts.homeTag : opts.parser}`,
    opts.verbose ? '--errors' : '',
    opts.verbose ? '' : '--quiet',
    opts.debug ? '--debug' : '',
    `-Deo.sourcesDir=${sources}`,
    `-Deo.targetDir=${target}`,
    `-Deo.outputDir=${path.resolve(opts.target, 'classes')}`,
    `-Deo.generatedDir=${path.resolve(opts.target, 'generated-sources')}`,
    `-Deo.placed=${path.resolve(opts.target, 'eo-placed.csv')}`,
    `-Deo.placedFormat=csv`,
    opts.trackOptimizationSteps ? '-Deo.trackOptimizationSteps' : '',
  ];
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
    target = tgt;
    phase = args[0];
    const home = path.resolve(__dirname, '../mvnw');
    const bin = path.resolve(home, 'mvnw') + (process.platform == 'win32' ? '.cmd' : '');
    const params = args.filter(function(t) {
      return t != '';
    }).concat([
      '--batch-mode',
      '--color=never',
      '--update-snapshots',
      '--fail-fast',
      '--strict-checksums',
    ]);
    const cmd = bin + ' ' + params.join(' ');
    console.debug('+ %s', cmd);
    const result = spawn(
      bin,
      process.platform == 'win32' ? params.map((p) => `"${p}"`) : params,
      {
        cwd: home,
        stdio: 'inherit',
        shell: shell(),
      }
    );
    if (tgt != undefined && args.includes('--quiet')) {
      if (!batch) {
        start();
      }
      result.on('close', (code) => {
        if (code !== 0) {
          console.error(`The command "${cmd}" exited with #${code} code`);
          process.exit(1);
        }
        if (!batch) {
          stop();
        }
        resolve(args);
      });
    } else {
      result.on('close', (code) => {
        if (code !== 0) {
          console.error(`The command "${cmd}" exited with #${code} code`);
          process.exit(1);
        }
        resolve(args);
      });
    }
  });
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
    if (fs.existsSync(dir)) {
      for (const f of fs.readdirSync(dir)) {
        const next = path.join(dir, f);
        if (fs.statSync(next).isDirectory()) {
          curr = count(next, curr);
        } else {
          curr++;
        }
      }
    }
    return curr;
  }
  let elapsed;
  if (duration < 1000) {
    elapsed = `${duration}ms`;
  } else if (duration < 60 * 1000) {
    elapsed = `${Math.ceil(duration / 1000)}s`;
  } else {
    elapsed = `${Math.ceil(duration / 3600000)}min`;
  }
  process.stdout.write(
    colors.yellow(`[${phase}] ${elapsed}; ${count(target, 0)} files generated so far...`)
  );
  readline.clearLine(process.stdout, 1);
  readline.cursorTo(process.stdout, 0);
}
