/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {runSync, assertFilesExist, parserVersion, homeTag, weAreOnline} = require('../helpers');

describe('resolve', () => {
  before(weAreOnline);
  const resolve = function(home) {
    fs.rmSync(home, {recursive: true, force: true});
    fs.mkdirSync(path.resolve(home, 'src'), {recursive: true});
    fs.writeFileSync(
      path.resolve(home, 'src/resolve.eo'),
      [
        '[] > resolve',
        '  "Hello, world" > @'
      ].join('\n')
    );
    const resolved = path.resolve(home, 'target/6-resolve');
    if (fs.existsSync(resolved)) {
      fs.rmSync(resolved, {recursive: true, force: true});
    }
    return runSync([
      'resolve',
      '--verbose',
      '--easy',
      '--blind',
      `--parser=${parserVersion}`,
      `--home-tag=${homeTag}`,
      '-s', path.resolve(home, 'src'),
      '-t', path.resolve(home, 'target'),
    ]);
  };
  it('resolves eo-runtime', function(done) {
    this.timeout(0);
    const home = path.resolve(`temp/test-resolve`),
      stdout = resolve(home);
    const stage = fs.readdirSync(path.resolve(home, 'target')).find(
      (dir) => /^\d+-resolve$/.test(dir)
    );
    assert.ok(stage, 'the numbered -resolve directory must exist in the target');
    assertFilesExist(
      stdout, home,
      [
        `target/${stage}/org.eolang/eo-runtime`,
        `target/${stage}/net.java.dev.jna/jna`,
        'target/classes/org/eolang/Phi.class',
        'target/classes/org/eolang/EOdataized.class',
        'target/classes/com/sun/jna',
      ]
    );
    done();
  });
});
