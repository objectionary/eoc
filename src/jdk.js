/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const {execSync} = require('child_process');

/**
 * Default executor used when no override is supplied. Runs the command
 * synchronously, captures its output, and returns it as a Buffer.
 * Stderr is captured (javac prints its version to stderr) so we can
 * surface it back if anything goes wrong.
 *
 * @param {String} cmd - The command to execute.
 * @return {Buffer} The combined stdout/stderr output.
 */
function defaultExec(cmd) {
  return execSync(cmd, {stdio: ['ignore', 'pipe', 'pipe']});
}

/**
 * Build the user-facing error message that we want to print when
 * `javac` cannot be located or executed. The message lists the
 * common ways to install a full JDK on each platform, since the
 * most common cause of this error is that the user has installed
 * a JRE (or none at all) instead of a JDK.
 *
 * @param {Error} cause - The underlying error from the exec attempt.
 * @return {String} The user-facing diagnostic.
 */
function missingJavacMessage(cause) {
  const lines = [
    '`javac` was not found on your PATH.',
    'EO needs a full JDK (not just a JRE) to compile Java sources.',
    'Please install OpenJDK 11 or newer and make sure `javac` is on your PATH.',
    '  Debian/Ubuntu: sudo apt-get install openjdk-21-jdk',
    '  macOS:         brew install --cask temurin',
    '  Windows:       https://adoptium.net/'
  ];
  if (cause && cause.message) {
    lines.push(`Underlying error: ${cause.message.toString().trim()}`);
  }
  return lines.join('\n');
}

/**
 * Verify that `javac` is available on the current PATH. Throws an
 * Error with a clear, actionable message when it is not, and is a
 * no-op otherwise. The actual command runner is injectable so that
 * tests can stub it out without spawning a real subprocess.
 *
 * @param {Function} [exec] - Optional command runner (mainly for tests).
 *                            Should accept a single string command and
 *                            either return the captured output or throw
 *                            on non-zero exit.
 * @return {void}
 */
module.exports.verifyJavac = function(exec) {
  const run = exec || defaultExec;
  try {
    run('javac -version');
  } catch (cause) {
    throw new Error(missingJavacMessage(cause), {cause});
  }
};
