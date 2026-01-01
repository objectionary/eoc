/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {runSync, parserVersion, homeTag, weAreOnline} = require('../helpers'),

  options = [
    {lang: 'Java', version: parserVersion, tag: homeTag},
    {lang: 'Java', version: '0.58.1', tag: '0.58.1'},
  // {lang: 'JavaScript', version: parserVersion, tag: homeTag},
  // {lang: 'JavaScript', version: '0.41.3', tag: '0.41.3'}
  ];

describe('dataize', () => {
  before(weAreOnline);
  options.forEach(({lang, version, tag}) => {
    it(`dataizes: lang ${lang}, version ${version}, tag ${tag}`, function(done) {
      this.timeout(0);
      const home = path.resolve(`temp/test-dataize/${version}/${lang}`);
      fs.rmSync(home, {recursive: true, force: true});
      fs.mkdirSync(path.resolve(home, 'src/foo/bar'), {recursive: true});
      fs.writeFileSync(
        path.resolve(home, 'src/foo/bar/simple.eo'),
        [
          '+package foo.bar',
          '+alias org.eolang.io.stdout',
          '',
          '# sample',
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
    this.timeout(0);
    const home = path.resolve('temp/test-dataize-with-arg');
    fs.rmSync(home, {recursive: true, force: true});
    fs.mkdirSync(home, {recursive: true});
    fs.writeFileSync(
      path.resolve(home, 'simple.eo'),
      [
        '# sample',
        '[args] > simple',
        '  QQ.io.stdout (args.at 0) > @',
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
