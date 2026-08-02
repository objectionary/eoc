/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const fs = require('fs');
const http = require('http');
const path = require('path');
const inspect = require('../../src/commands/java/inspect');
const {runSync, parserVersion, homeTag, weAreOnline} = require('../helpers');

describe('inspect', () => {
  before(weAreOnline);
  it('prints the object the session starts at', function(done) {
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
      '--port=18081',
      '--easy',
      '--blind',
      `--parser=${parserVersion}`,
      `--home-tag=${homeTag}`,
      '-s', home,
      '-t', path.resolve(home, 'target'),
    ]);
    assert(stdout.includes('@ Φ'), stdout);
    done();
  });
});

describe('inspect/java', () => {
  it('asks the server and prints the object it answers with', async () => {
    const home = path.resolve('temp/test-inspect-unit');
    fs.rmSync(home, {recursive: true, force: true});
    fs.mkdirSync(path.resolve(home, 'inspect'), {recursive: true});
    fs.writeFileSync(path.resolve(home, 'inspect', 'inspect.jar'), '');
    const server = http.createServer((req, res) => {
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end('{"forma":"Φ"}');
    });
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const printed = [];
    const info = console.info;
    console.info = (line) => printed.push(line);
    let params;
    let killed = false;
    try {
      await inspect(
        {target: home, port: server.address().port},
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
    assert(
      params.includes('org.eolang.eoc.Inspect'),
      `inspect does not run the server class: ${params}`
    );
    assert(
      params[1].split(path.delimiter).includes(path.resolve(home, 'eoc.jar')),
      `inspect does not put the program on the classpath: ${params}`
    );
    assert(
      params[1].split(path.delimiter).includes(path.resolve(home, 'inspect', 'inspect.jar')),
      `inspect does not put the server on the classpath: ${params}`
    );
    assert(
      printed.includes('@ Φ'),
      `inspect does not print the object the session starts at: ${printed}`
    );
    assert(killed, 'inspect leaves the server running');
  });
  it('fails fast with a clear message when javac is not on the PATH', async () => {
    const missing = () => {
      const cause = new Error('spawnSync javac ENOENT');
      cause.code = 'ENOENT';
      throw cause;
    };
    await assert.rejects(
      () => inspect({target: '.', port: 8080}, missing),
      /javac/,
      'inspect does not fail fast with a clear javac message when the JDK is missing'
    );
  });
});
