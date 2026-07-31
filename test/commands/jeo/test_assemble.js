/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const fs = require('fs');
const path = require('path'),
  {execSync} = require('child_process');
const {runSync, assertFilesExist, jeoVersion, weAreOnline} = require('../../helpers');

describe('jeo:assemble', () => {
  before(weAreOnline);
  it('converts XMIR files to CLASS files', (done) => {
    const home = path.resolve('temp/test-jeo-assemble/simple');
    fs.rmSync(home, {recursive: true, force: true});
    fs.mkdirSync(home, {recursive: true});
    fs.writeFileSync(path.resolve(home, 'Foo.java'), 'package bar; class Foo {}');
    execSync(`javac -d ${home} ${path.resolve(home, 'Foo.java')}`);
    runSync([
      'jeo:disassemble',
      '--verbose',
      `--jeo-version=${jeoVersion}`,
      '--classes', home,
      '--xmirs', home,
    ]);
    fs.rmSync(path.resolve(home, 'bar/Foo.class'), {recursive: true, force: true});
    fs.rmSync(path.resolve(home, 'Foo.java'), {recursive: true, force: true});
    const stdout = runSync([
      'jeo:assemble',
      '--verbose',
      `--jeo-version=${jeoVersion}`,
      '--xmirs', home,
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
