/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {filled} = require('../src/stages');

describe('stages', () => {
  it('accepts a stage directory with files of the expected type', () => {
    const home = path.resolve('temp/test-stages/filled');
    fs.rmSync(home, {recursive: true, force: true});
    fs.mkdirSync(path.resolve(home, 'foo'), {recursive: true});
    fs.writeFileSync(path.resolve(home, 'foo/app.xmir'), '<object/>');
    assert.doesNotThrow(
      () => filled(home, '.xmir', 'parse'),
      'a stage with an XMIR file inside must be accepted'
    );
  });
  it('rejects a stage directory that does not exist', () => {
    assert.throws(
      () => filled(path.resolve('temp/test-stages/absent'), '.xmir', 'parse'),
      /run "eoc parse" first/,
      'a missing stage must be reported with the command that fills it'
    );
  });
  it('rejects a stage directory without files of the expected type', () => {
    const home = path.resolve('temp/test-stages/other');
    fs.rmSync(home, {recursive: true, force: true});
    fs.mkdirSync(home, {recursive: true});
    fs.writeFileSync(path.resolve(home, 'notes.txt'), 'nothing');
    assert.throws(
      () => filled(home, '.java', 'transpile'),
      /no \.java files/,
      'a stage with only foreign files must be reported as empty'
    );
  });
});
