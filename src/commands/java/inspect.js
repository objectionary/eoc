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
  let on_error;
  let on_close;
  let on_exit;
  const lifecycle = new Promise((resolve, reject) => {
    on_error = (error) => reject(new Error(
      `Inspection server could not be started: ${error.message}`,
      {cause: error}
    ));
    on_close = (code) => reject(new Error(
      `Inspection server exited before opening port ${port} with exit code ${code}`
    ));
    // "close" waits for stdio streams to end too, which "stdio: inherit"
    // below gives the child none of, so "exit" is the one that reliably
    // fires the moment the process itself is gone.
    on_exit = on_close;
    if (typeof server.on === 'function') {
      server.on('error', on_error);
      server.on('close', on_close);
      server.on('exit', on_exit);
    }
  });
  const halt = (code) => () => {
    server.kill();
    process.exit(code);
  };
  const onint = halt(130);
  const onterm = halt(143);
  const onexit = () => server.kill();
  process.on('SIGINT', onint);
  process.on('SIGTERM', onterm);
  process.on('exit', onexit);
  try {
    const answer = await Promise.race([ask(port, Date.now() + 60000), lifecycle]);
    console.info('Ready to traverse the Universe');
    console.info(`@ ${answer.forma}`);
  } finally {
    if (typeof server.removeListener === 'function') {
      server.removeListener('error', on_error);
      server.removeListener('close', on_close);
      server.removeListener('exit', on_exit);
    }
    process.off('SIGINT', onint);
    process.off('SIGTERM', onterm);
    process.off('exit', onexit);
    server.kill();
  }
};
