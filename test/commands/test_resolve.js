/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

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
        '# Sample.',
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
    assertFilesExist(
      stdout, home,
      [
        'target/4-resolve/org.eolang/eo-runtime',
        'target/4-resolve/net.java.dev.jna/jna',
        'target/classes/org/eolang/Phi.class',
        'target/classes/EOorg/EOeolang/EOerror.class',
        'target/classes/com/sun/jna',
      ]
    );
    done();
  });
});
