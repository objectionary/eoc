/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const fs = require('fs');
const http = require('http');
const net = require('net');
const {Readable} = require('stream');
const path = require('path');
const inspect = require('../../src/commands/java/inspect');
const {runSync, parserVersion, homeTag, weAreOnline} = require('../helpers');

/**
 * Take a port the operating system is willing to give us right now, so that
 * two suites on the same machine, or a JVM an earlier run left behind, do not
 * collide on a number written into the test.
 * @return {Promise<Number>} A port nobody listens on
 */
async function free() {
  const socket = net.createServer();
  await new Promise((resolve) => socket.listen(0, '127.0.0.1', resolve));
  const port = socket.address().port;
  await new Promise((resolve) => socket.close(resolve));
  return port;
}

describe('inspect', () => {
  before(weAreOnline);
  it('prints the object the session starts at', async function() {
    this.timeout(0);
    const home = path.resolve('temp/test-inspect');
    fs.rmSync(home, {recursive: true, force: true});
    fs.mkdirSync(home, {recursive: true});
    fs.writeFileSync(
      path.resolve(home, 'simple.eo'),
      ['[] > simple', '  42 > @'].join('\n')
    );
    const stdout = runSync([
      'inspect',
      `--port=${await free()}`,
      '--easy',
      '--blind',
      `--parser=${parserVersion}`,
      `--home-tag=${homeTag}`,
      '-s', home,
      '-t', path.resolve(home, 'target'),
    ]);
    assert(
      stdout.includes('@ Φ'),
      `inspect does not print the object the session starts at: ${stdout}`
    );
  });
});

describe('inspect/java', () => {
  const home = path.resolve('temp/test-inspect-unit');
  let params;
  let printed;
  let killed;
  before(async () => {
    fs.rmSync(home, {recursive: true, force: true});
    fs.mkdirSync(path.resolve(home, 'inspect'), {recursive: true});
    fs.writeFileSync(path.resolve(home, 'inspect', 'inspect.jar'), '');
    const server = http.createServer((req, res) => {
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end('{"forma":"Φ"}');
    });
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    printed = [];
    killed = false;
    const info = console.info;
    console.info = (line) => printed.push(line);
    try {
      await inspect(
        {target: home, port: server.address().port},
        () => true,
        (command, args) => {
          params = args;
          return {
            kill: () => {
              killed = true;
            },
            on: () => undefined,
          };
        }
      );
    } finally {
      console.info = info;
      server.close();
    }
  });
  it('runs the server class', () => {
    assert(
      params.includes('org.eolang.eoc.Inspect'),
      `inspect does not run the server class: ${params}`
    );
  });
  it('puts the program on the classpath', () => {
    assert(
      params[1].split(path.delimiter).includes(path.resolve(home, 'eoc.jar')),
      `inspect does not put the program on the classpath: ${params}`
    );
  });
  it('puts the server on the classpath', () => {
    assert(
      params[1].split(path.delimiter).includes(path.resolve(home, 'inspect', 'inspect.jar')),
      `inspect does not put the server on the classpath: ${params}`
    );
  });
  it('prints the object the server answers with', () => {
    assert(
      printed.includes('@ Φ'),
      `inspect does not print the object the session starts at: ${printed}`
    );
  });
  it('kills the server when the session ends', () => {
    assert(killed, 'inspect leaves the server running');
  });
  it('fails fast when javac is not on the PATH', async () => {
    const missing = () => {
      const cause = new Error('spawnSync javac ENOENT');
      cause.code = 'ENOENT';
      throw cause;
    };
    await assert.rejects(
      () => inspect({target: '.', port: 8080}, missing),
      (error) => error.cause.code === 'ENOENT',
      'inspect does not refuse to start when the JDK is missing'
    );
  });
  it('reads verbs from the terminal until the user leaves', async () => {
    const talker = http.createServer((req, res) => {
      res.writeHead(200, {'Content-Type': 'application/json'});
      if (req.url.startsWith('/do')) {
        res.end('{"out":"nothing yet"}');
      } else {
        res.end('{"forma":"Φ"}');
      }
    });
    await new Promise((resolve) => talker.listen(0, '127.0.0.1', resolve));
    const said = [];
    const info = console.info;
    console.info = (line) => said.push(line);
    const lines = Readable.from(['ls\n', 'quit\n']);
    lines.isTTY = true;
    try {
      await inspect(
        {target: home, port: talker.address().port},
        () => true,
        () => ({kill: () => undefined, on: () => undefined}),
        lines
      );
    } finally {
      console.info = info;
      talker.close();
    }
    assert(
      said.includes('nothing yet'),
      `inspect does not print what the server answers to a verb: ${said}`
    );
  });
  it('names the port when the server exits without opening it', async () => {
    await assert.rejects(
      () => inspect(
        {target: home, port: 1},
        () => true,
        () => ({
          kill: () => undefined,
          on: (event, todo) => {
            if (event === 'exit') {
              todo();
            }
          },
        })
      ),
      (error) => error.message.includes('port 1'),
      'inspect does not name the port that could not be opened'
    );
  });
});
