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
      {
        stack: '64M',
        heap: '256M',
        sources: 'src',
        target: 'target',
        object: 'foo.app.works-fine',
      },
      (args) => {
        captured = args;
      }
    );
    assert.ok(
      captured.includes('-Dtest=org.eolang.EOfoo.EOapp*Test#works_fine'),
      `expected -Dtest=org.eolang.EOfoo.EOapp*Test#works_fine, got: ${captured}`
    );
  });
  it('builds -Dtest filter from --object without package', async () => {
    let captured;
    await test(
      {
        stack: '64M',
        heap: '256M',
        sources: 'src',
        target: 'target',
        object: 'app.works-fine',
      },
      (args) => {
        captured = args;
      }
    );
    assert.ok(
      captured.includes('-Dtest=org.eolang.EOapp*Test#works_fine'),
      `expected -Dtest=org.eolang.EOapp*Test#works_fine, got: ${captured}`
    );
  });
  it('cannot accept an object with a single segment', () => {
    assert.throws(
      () => test(
        {stack: '64M', heap: '256M', sources: 'src', target: 'target', object: 'app'},
        (args) => args
      ),
      /Invalid --object format/,
      'single-segment object should be rejected but was not'
    );
  });
  it('cannot accept an object with a trailing empty segment', () => {
    assert.throws(
      () => test(
        {stack: '64M', heap: '256M', sources: 'src', target: 'target', object: 'app.'},
        (args) => args
      ),
      /Invalid --object format/,
      'trailing empty segment should be rejected but was not'
    );
  });
  it('cannot accept an object with a leading empty segment', () => {
    assert.throws(
      () => test(
        {stack: '64M', heap: '256M', sources: 'src', target: 'target', object: '.works-fine'},
        (args) => args
      ),
      /Invalid --object format/,
      'leading empty segment should be rejected but was not'
    );
  });
  it('cannot accept an object made only of dots', () => {
    assert.throws(
      () => test(
        {stack: '64M', heap: '256M', sources: 'src', target: 'target', object: '..'},
        (args) => args
      ),
      /Invalid --object format/,
      'dots-only object should be rejected but was not'
    );
  });
  it('builds -Dtest filter from --object with a deep package', async () => {
    let captured;
    await test(
      {stack: '64M', heap: '256M', sources: 'src', target: 'target', object: 'foo.bar.app.works-fine'},
      (args) => { captured = args; }
    );
    assert.ok(
      captured.includes('-Dtest=org.eolang.EOfoo.EObar.EOapp*Test#works_fine'),
      `expected -Dtest=org.eolang.EOfoo.EObar.EOapp*Test#works_fine, got: ${captured}`
    );
  });
  it('omits -Dtest when --object is not provided', async () => {
    let captured;
    await test(
      {
        stack: '64M',
        heap: '256M',
        sources: 'src',
        target: 'target',
      },
      (args) => {
        captured = args;
      }
    );
    assert.ok(
      !captured.some((a) => a.startsWith('-Dtest=')),
      `expected no -Dtest arg, got: ${captured}`
    );
  });
  it('passes execution options to Maven', async () => {
    let captured;
    await test(
      {
        stack: '64M',
        heap: '256M',
        sources: 'src',
        target: 'target',
        batch: true,
      },
      (args, target, batch) => {
        captured = {args, target, batch};
      }
    );
    assert.strictEqual(captured.target, 'target');
    assert.strictEqual(captured.batch, true);
  });
  it('throws on single-segment object', () => {
    assert.throws(
      () =>
        test({
          stack: '64M',
          heap: '256M',
          sources: 'src',
          target: 'target',
          object: 'app',
        }),
      /Invalid --object format/
    );
  });
  it('throws on trailing dot', () => {
    assert.throws(
      () =>
        test({
          stack: '64M',
          heap: '256M',
          sources: 'src',
          target: 'target',
          object: 'app.',
        }),
      /Invalid --object format/
    );
  });
  it('throws on leading dot', () => {
    assert.throws(
      () =>
        test({
          stack: '64M',
          heap: '256M',
          sources: 'src',
          target: 'target',
          object: '.works-fine',
        }),
      /Invalid --object format/
    );
  });
});
