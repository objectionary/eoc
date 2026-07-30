/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const dataize = require('../../src/commands/java/dataize');
const {runSync, parserVersion, homeTag, weAreOnline} = require('../helpers'),

  options = [
    {lang: 'Java', version: parserVersion, tag: homeTag},
    // {lang: 'Java', version: '0.59.5', tag: '0.59.5'},
    // {lang: 'JavaScript', version: parserVersion, tag: homeTag},
    // {lang: 'JavaScript', version: '0.41.3', tag: '0.41.3'}
  ];

describe('dataize', () => {
  before(weAreOnline);
  options.forEach(({lang, version, tag}) => {
    it(`dataizes: lang ${lang}, version ${version}, tag ${tag}`, function(done) {
      this.skip(); // stdout is dead in 0.62.0, see objectionary/eo#6169
      this.timeout(0);
      const home = path.resolve(`temp/test-dataize/${version}/${lang}`);
      fs.rmSync(home, {recursive: true, force: true});
      fs.mkdirSync(path.resolve(home, 'src/foo/bar'), {recursive: true});
      fs.writeFileSync(
        path.resolve(home, 'src/foo/bar/simple.eo'),
        [
          '+package foo.bar',
          '',
          '[args] > simple',
          '  stdout "Hello, world!\\n" > @',
        ].join('\n')
      );
      const stdout = runSync([
        'dataize', 'foo.bar.simple',
        '--stack=64M',
        '--heap=1G',
        '--clean',
        '--easy',
        '--blind',
        `--parser=${version}`,
        `--home-tag=${tag}`,
        '-s', path.resolve(home, 'src'),
        '-t', path.resolve(home, 'target'),
        `--language=${lang}`
      ]);
      assert(stdout.includes('Hello, world!'), stdout);
      if (lang === 'Java') {
        assert(!fs.existsSync(path.resolve('../../mvnw/target')));
      }
      done();
    });
  });
  it(`dataizes with command-line argument`, function(done) {
    this.skip(); // stdout is dead in 0.62.0, see objectionary/eo#6169
    this.timeout(0);
    const home = path.resolve('temp/test-dataize-with-arg');
    fs.rmSync(home, {recursive: true, force: true});
    fs.mkdirSync(home, {recursive: true});
    fs.writeFileSync(
      path.resolve(home, 'simple.eo'),
      [
        '[args] > simple',
        '  stdout (args.at 0) > @',
      ].join('\n')
    );
    const stdout = runSync([
      'dataize',
      'simple',
      '--clean',
      '--easy',
      '--blind',
      `--parser=${parserVersion}`,
      `--home-tag=${homeTag}`,
      '-s', home,
      '-t', path.resolve(home, 'target'),
      'Hooray'
    ]);
    assert(stdout.includes('Hooray'), stdout);
    done();
  });
});

describe('dataize/java', () => {
  it('sets the maximum Java heap size', () => {
    let params;
    dataize(
      'main.foo',
      [],
      {target: '.', stack: '64M', heap: '256M'},
      () => true,
      (command, args) => {
        params = args;
        return {on: () => true};
      }
    );
    assert(
      params.includes('-Xmx256M'),
      'dataize does not set the maximum Java heap size'
    );
    assert(
      !params.some((param) => param.startsWith('-Xms')),
      'dataize still sets the initial Java heap size'
    );
  });
  it('fails fast with a clear message when javac is not on the PATH', () => {
    const missing = () => {
      const cause = new Error('spawnSync javac ENOENT');
      cause.code = 'ENOENT';
      throw cause;
    };
    assert.throws(
      () => dataize('main.foo', [], {target: '.', stack: '64M', heap: '256M'}, missing),
      /javac/,
      'dataize does not fail fast with a clear javac message when the JDK is missing'
    );
  });
  it('fails fast and mentions the JDK when javac exits non-zero', () => {
    const broken = () => {
      const cause = new Error('Command failed: javac -version');
      cause.status = 127;
      throw cause;
    };
    assert.throws(
      () => dataize('main.foo', [], {target: '.', stack: '64M', heap: '256M'}, broken),
      /JDK/,
      'dataize does not mention the JDK when javac exits non-zero'
    );
  });
  it('surfaces the underlying failure when javac cannot be executed', () => {
    const denied = () => {
      throw new Error('permission denied while probing javac');
    };
    assert.throws(
      () => dataize('main.foo', [], {target: '.', stack: '64M', heap: '256M'}, denied),
      /permission denied while probing javac/,
      'dataize hides the underlying reason why javac could not be executed'
    );
  });
});
