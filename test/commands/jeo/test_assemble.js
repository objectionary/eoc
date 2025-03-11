/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;
const {runSync, assertFilesExist, weAreOnline} = require('../../helpers');
const version = '0.6.11';

describe('jeo:assemble', function() {
  before(weAreOnline);

  it('converts XMIR files to CLASS files', function(done) {
    const home = path.resolve('temp/test-jeo-assemble/simple');
    fs.rmSync(home, {recursive: true, force: true});
    fs.mkdirSync(home, {recursive: true});
    fs.writeFileSync(path.resolve(home, 'Foo.java'), 'package bar; class Foo {}');
    execSync(`javac ${path.resolve(home, 'Foo.java')}`);
    runSync([
      'jeo:disassemble',
      '--verbose',
      `--jeo-version=${version}`,
      '--classes', home,
      '--xmirs', home,
    ]);
    fs.rmSync(path.resolve(home, 'Foo.class'), {recursive: true, force: true});
    fs.rmSync(path.resolve(home, 'Foo.java'), {recursive: true, force: true});
    const stdout = runSync([
      'jeo:assemble',
      '--verbose',
      `--jeo-version=${version}`,
      '--xmirs', home,
      '--unrolled', path.resolve(home, 'unrolled'),
      '--classes', home,
    ]);
    assertFilesExist(
      stdout, home,
      [
        'bar/Foo.class',
        'bar/Foo.xmir'
      ]
    );
    done();
  });
});
