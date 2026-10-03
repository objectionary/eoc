/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const {EventEmitter} = require('node:events');
const fs = require('fs');
const http = require('http');
const net = require('net');
const path = require('path');
const inspect = require('../../src/commands/java/inspect');
const {flags} = require('../../src/mvnw');
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
    const sources = path.resolve(home, 'sources');
    fs.mkdirSync(sources, {recursive: true});
    const opts = {target: home, sources, port: 0, batch: true};
    const project = path.resolve(__dirname, '../../inspect');
    const args = ['package', '-f', path.join(project, 'pom.xml')].concat(flags(opts));
    fs.writeFileSync(
      path.resolve(home, 'inspect', '.inspect-source.sha256'),
      inspect.fingerprint(project, args)
    );
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
        {...opts, port: server.address().port},
        () => true,
        (command, args) => {
          params = args;
          return {kill: () => {
            killed = true;
          }};
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
  it('rebuilds the server jar when its sources or Maven arguments change', async () => {
    const project = path.resolve('temp/test-inspect-fingerprint');
    fs.rmSync(project, {recursive: true, force: true});
    const source = path.join(project, 'src/main/java/Inspect.java');
    fs.mkdirSync(path.dirname(source), {recursive: true});
    fs.writeFileSync(path.join(project, 'pom.xml'), '<project/>');
    fs.writeFileSync(source, 'class Inspect {}');
    const original = inspect.fingerprint(project, ['package']);
    fs.writeFileSync(source, 'class Inspect { void changed() {} }');
    assert.notStrictEqual(
      inspect.fingerprint(project, ['package']),
      original,
      'a source change must invalidate the build fingerprint'
    );

    const target = path.resolve('temp/test-inspect-cache');
    fs.rmSync(target, {recursive: true, force: true});
    const sources = path.join(target, 'sources');
    fs.mkdirSync(sources, {recursive: true});
    const opts = {target, sources, homeTag: 'first', batch: true};
    let builds = 0;
    const build = async () => {
      builds += 1;
      const output = path.join(target, 'inspect');
      fs.mkdirSync(output, {recursive: true});
      fs.writeFileSync(path.join(output, 'inspect.jar'), 'jar');
    };
    try {
      await inspect.jar(opts, build);
      await inspect.jar(opts, build);
      assert.strictEqual(builds, 1, 'an unchanged server jar should be reused');
      await inspect.jar({...opts, homeTag: 'second'}, build);
      assert.strictEqual(builds, 2, 'changed Maven arguments must rebuild the server jar');
    } finally {
      fs.rmSync(project, {recursive: true, force: true});
      fs.rmSync(target, {recursive: true, force: true});
    }
  });
  it('fails immediately when the inspection server exits early', async () => {
    const port = await free();
    await assert.rejects(
      () => inspect(
        {target: home, sources: path.resolve(home, 'sources'), port},
        () => true,
        () => {
          const server = new EventEmitter();
          server.kill = () => undefined;
          process.nextTick(() => server.emit('close', 7));
          return server;
        }
      ),
      /Inspection server exited before opening port .* exit code 7/
    );
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
});
