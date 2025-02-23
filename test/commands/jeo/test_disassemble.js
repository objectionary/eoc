/*
 * The MIT License (MIT)
 *
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;
const {runSync, assertFilesExist, weAreOnline} = require('../../helpers');
const version = '0.6.11';

describe('jeo:disassemble', function() {
  before(weAreOnline);

  it('converts CLASS files to XMIR files', function(done) {
    const home = path.resolve('temp/test-jeo-disassemble/simple');
    fs.rmSync(home, {recursive: true, force: true});
    fs.mkdirSync(home, {recursive: true});
    fs.writeFileSync(path.resolve(home, 'Foo.java'), 'class Foo {}');
    execSync(`javac ${path.resolve(home, 'Foo.java')}`);
    const stdout = runSync([
      'jeo:disassemble',
      '--verbose',
      `--jeo-version=${version}`,
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
