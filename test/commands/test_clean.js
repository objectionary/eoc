/*
 * The MIT License (MIT)
 *
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const {runSync} = require('../helpers');

describe('clean', function() {
  it('deletes all temporary files', function(done) {
    const home = path.resolve('temp/test-clean/simple');
    const eo = path.join(os.homedir(), '.eo');
    fs.rmSync(home, {recursive: true, force: true});
    fs.rmSync(eo, {recursive: true, force: true});
    fs.mkdirSync(path.resolve(home, 'src'), {recursive: true});
    fs.mkdirSync(eo, {recursive: true});
    fs.writeFileSync(path.resolve(home, 'src/clean.eo'), '# sample\n[] > clean\n');
    const stdout = runSync([
      'clean', '-s', path.resolve(home, 'src'), '-t', path.resolve(home, 'target'), '--global',
    ]);
    assert(!fs.existsSync(path.resolve(home, 'target')), stdout);
    assert(!fs.existsSync(eo), stdout);
    done();
  });
});
