// Copyright (c) 2022-2025 Objectionary.com
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const fs = require('fs');
const path = require('path');
const {runSync, assertFilesExist, parserVersion, homeTag, weAreOnline} = require('../helpers');

describe('resolve', function() {
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
    const home = path.resolve(`temp/test-resolve`);
    const stdout = resolve(home);
    assertFilesExist(
      stdout, home,
      [
        'target/6-resolve/org.eolang/eo-runtime',
        'target/6-resolve/net.java.dev.jna/jna',
        'target/classes/org/eolang/Phi.class',
        'target/classes/EOorg/EOeolang/EOerror.class',
        'target/classes/com/sun/jna',
      ]
    );
    done();
  });
});
