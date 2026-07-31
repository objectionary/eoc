/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const fs = require('fs');
const path = require('path'),
  {execSync} = require('child_process');
const {runSync, assertFilesExist, jeoVersion, weAreOnline} = require('../../helpers');

describe('jeo:disassemble', () => {
  before(weAreOnline);
  it('converts CLASS files to XMIR files', (done) => {
    const home = path.resolve('temp/test-jeo-disassemble/simple');
    fs.rmSync(home, {recursive: true, force: true});
    fs.mkdirSync(home, {recursive: true});
    fs.writeFileSync(path.resolve(home, 'Foo.java'), 'class Foo {}');
    execSync(`javac ${path.resolve(home, 'Foo.java')}`);
    const stdout = runSync([
      'jeo:disassemble',
      '--verbose',
      `--jeo-version=${jeoVersion}`,
      `--target=${home}`,
      '--classes', '.',
      '--xmirs', '.',
    ]);
    assertFilesExist(
      stdout, home,
      [
        'Foo.java',
        'Foo.class',
        'Foo.xmir'
      ]
    );
    done();
  });
});
