/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {runSync} = require('./helpers');

describe('README.md', () => {
  it('mentions every command exposed by eoc --help', (done) => {
    const help = runSync(['--help']);
    const tail = help.split('\nCommands:\n')[1];
    assert(tail, `eoc --help output has no "Commands:" section:\n${help}`);
    const names = [];
    for (const line of tail.split('\n')) {
      const match = line.match(/^ {2}(?<name>[a-z][a-z_:]*)\b/);
      if (match && match.groups.name !== 'help') {
        names.push(match.groups.name);
      }
    }
    assert(names.length > 0, `no commands extracted from --help:\n${help}`);
    const readme = fs.readFileSync(
      path.resolve(__dirname, '../README.md'), 'utf8'
    );
    const missing = names.filter((name) => !readme.includes(`\`${name}\``));
    assert.deepStrictEqual(
      missing, [],
      `These commands are exposed by 'eoc --help' but are not mentioned in ` +
      `README.md: ${missing.join(', ')}. Please document them in the ` +
      `Commands section so the README stays in sync with the CLI.`
    );
    done();
  });
});
