/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const fs = require('fs');
const path = require('path');
const {spawn} = require('node:child_process');
const {mvnw, flags} = require('../../mvnw');
const {verifyJavac} = require('../../jdk');

/**
 * The jar with the inspection server, built on demand.
 * @param {Object} opts - All options
 * @return {Promise<String>} Path to the jar
 */
async function jar(opts) {
  const built = path.resolve(opts.target, 'inspect', 'inspect.jar');
  if (!fs.existsSync(built)) {
    await mvnw(
      ['package', '-f', path.resolve(__dirname, '../../../inspect/pom.xml')].concat(flags(opts)),
      opts.target,
      opts.batch
    );
  }
  return built;
}

/**
 * Ask the server where the session currently is, waiting for it to open the port.
 * The address is IPv4 on purpose, since the server listens on IPv4 while
 * "localhost" resolves to ::1 first on some machines and is refused there.
 * @param {Number} port - TCP port the server listens on
 * @param {Number} deadline - Moment in time after which we give up, in millis
 * @return {Promise<Object>} The answer, parsed from JSON
 */
async function ask(port, deadline) {
  let answer;
  try {
    answer = await (await fetch(`http://127.0.0.1:${port}/`)).json();
  } catch (error) {
    if (Date.now() > deadline) {
      throw new Error(
        `The inspection server has not opened port ${port} in a minute`,
        {cause: error}
      );
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
    answer = await ask(port, deadline);
  }
  return answer;
}

/**
 * Traverse the tree of objects of a compiled program.
 *
 * The server runs in a separate JVM, with the linked program on its
 * classpath, and every question about the tree is an HTTP request to it.
 *
 * @todo #500:60min Turn this single question into an interactive session.
 *  The issue asks for a prompt that stays open, reads a verb from the
 *  terminal, sends it to the server and prints the answer, until the user
 *  leaves. Right now we ask one question and shut the server down. Add
 *  the loop, and keep the printing here, since the server is the only one
 *  that knows the objects and this side is the only one that knows the
 *  terminal.
 * @todo #500:30min Do not leave the JVM behind when this process dies.
 *  The server is killed in the "finally" below, which covers a failure of
 *  our own code, but not a user pressing Ctrl-C and not a crash of the
 *  Node process itself. In both cases the JVM keeps the port open and the
 *  next run of the command fails to bind it. Kill the child on the
 *  signals too, and report a port that is already taken by naming it.
 * @param {Object} opts - All options
 * @param {Function} [exec] - Optional command runner for the JDK check
 * @param {Function} [runner] - Optional Java process runner
 * @return {Promise} of the inspection session
 */
module.exports = async function(opts, exec, runner = spawn) {
  verifyJavac(exec);
  const port = Number(opts.port);
  const params = [
    '-cp',
    [path.resolve(opts.target, 'eoc.jar'), await jar(opts)].join(path.delimiter),
    'org.eolang.eoc.Inspect',
    '--port',
    String(port),
  ];
  console.debug(`+ java ${params.join(' ')}`);
  const server = runner('java', params, {stdio: 'inherit'});
  try {
    const answer = await ask(port, Date.now() + 60000);
    console.info(`Loaded ${answer.loaded} objects`);
    console.info('Ready to traverse the Universe');
    console.info(`@ ${answer.forma}`);
  } finally {
    server.kill();
  }
};
