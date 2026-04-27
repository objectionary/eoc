/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */
const assert = require('assert');
const test = require('../../../src/commands/java/test');

describe('java/test', () => {
  it('builds -Dtest filter from --object with package', async () => {
    let captured;
    await test(
      {stack: '64M', heap: '256M', sources: 'src', target: 'target', object: 'foo.app.works-fine'},
      (args) => { captured = args; }
    );
    assert.ok(
      captured.includes('-Dtest=org.eolang.EOfoo.EOappTestTest#works_fine'),
      `expected -Dtest=org.eolang.EOfoo.EOappTestTest#works_fine, got: ${captured}`
    );
  });
  it('builds -Dtest filter from --object without package', async () => {
    let captured;
    await test(
      {stack: '64M', heap: '256M', sources: 'src', target: 'target', object: 'app.works-fine'},
      (args) => { captured = args; }
    );
    assert.ok(
      captured.includes('-Dtest=org.eolang.EOappTestTest#works_fine'),
      `expected -Dtest=org.eolang.EOappTestTest#works_fine, got: ${captured}`
    );
  });
  it('omits -Dtest when --object is not provided', async () => {
    let captured;
    await test(
      {stack: '64M', heap: '256M', sources: 'src', target: 'target'},
      (args) => { captured = args; }
    );
    assert.ok(
      !captured.some((a) => a.startsWith('-Dtest=')),
      `expected no -Dtest arg, got: ${captured}`
    );
  });
});
