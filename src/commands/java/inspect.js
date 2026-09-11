/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const fs = require('fs');
const path = require('path');
const {spawn} = require('node:child_process');
const readline = require('node:readline/promises');
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
 * @param {Function} gone - Tells whether the server has already exited
 * @return {Promise<Object>} The answer, parsed from JSON
 */
async function ask(port, deadline, gone) {
  let answer;
  try {
    answer = await (await fetch(`http://127.0.0.1:${port}/`)).json();
  } catch (error) {
    if (gone()) {
      throw new Error(
        `The inspection server exited without opening port ${port}, which is most probably taken by something else`,
        {cause: error}
      );
    }
    if (Date.now() > deadline) {
      throw new Error(
        `The inspection server has not opened port ${port} in a minute`,
        {cause: error}
      );
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
    answer = await ask(port, deadline, gone);
  }
  return answer;
}

/**
 * Ask the terminal for one verb.
 * @param {Object} prompt - The terminal to read from
 * @param {String} at - The object the session is at
 * @return {Promise<String>} The verb, or nothing when the terminal is closed
 */
async function asked(prompt, at) {
  let verb;
  try {
    verb = (await prompt.question(`@ ${at}\n`)).trim();
  } catch (error) {
    if (error.code !== 'ERR_USE_AFTER_CLOSE') {
      throw error;
    }
  }
  return verb;
}

/**
 * Read one verb from the terminal, print what the server answers to it,
 * and go on to the next one, until the user leaves. Recursive rather than
 * a loop, the same way the waiting above is, since a session is a chain of
 * questions and each one has to be answered before the next is asked.
 * @param {Number} port - TCP port the server listens on
 * @param {String} at - The object the session is at
 * @param {Object} prompt - The terminal to read the verbs from
 * @return {Promise} of the session
 */
async function session(port, at, prompt) {
  const verb = await asked(prompt, at);
  if (verb !== undefined && verb !== 'quit' && verb !== 'exit') {
    if (verb !== '') {
      const answer = await (await fetch(
        `http://127.0.0.1:${port}/do?verb=${encodeURIComponent(verb)}`
      )).json();
      console.info(answer.out);
    }
    await session(port, at, prompt);
  }
}

/**
 * Traverse the tree of objects of a compiled program.
 *
 * The server runs in a separate JVM, with the linked program on its
 * classpath, and every question about the tree is an HTTP request to it.
 *
 * @param {Object} opts - All options
 * @param {Function} [exec] - Optional command runner for the JDK check
 * @param {Function} [runner] - Optional Java process runner
 * @param {Object} [input] - Optional stream to read the verbs from
 * @return {Promise} of the inspection session
 */
module.exports = async function(opts, exec, runner = spawn, input = process.stdin) {
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
  let gone = false;
  server.on('exit', () => {
    gone = true;
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
    const answer = await ask(port, Date.now() + 60000, () => gone);
    console.info('Ready to traverse the Universe');
    console.info(`@ ${answer.forma}`);
    if (input.isTTY) {
      const prompt = readline.createInterface({input, output: process.stdout});
      try {
        await session(port, answer.forma, prompt);
      } finally {
        prompt.close();
      }
    }
  } finally {
    process.off('SIGINT', onint);
    process.off('SIGTERM', onterm);
    process.off('exit', onexit);
    server.kill();
  }
};
