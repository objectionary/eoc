/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');

describe('parser version existence cache', () => {
  let parser;
  beforeEach(() => {
    delete require.cache[require.resolve('../src/parser-version')];
    parser = require('../src/parser-version');
  });
  [200, 404, 503].forEach((status) => {
    it(`checks a version only once after HTTP ${status}`, () => {
      let calls = 0;
      const fetch = () => {
        calls += 1;
        return {statusCode: status};
      };
      for (let step = 0; step < 8; step += 1) {
        assert.strictEqual(parser.exists('0.60.0', fetch), status !== 404);
      }
      assert.strictEqual(calls, 1, 'each pipeline step repeated the same version lookup');
    });
  });
  it('checks different versions independently', () => {
    const urls = [];
    const fetch = (method, url) => {
      urls.push(url);
      return {statusCode: url.includes('/0.60.0/') ? 200 : 404};
    };
    assert.strictEqual(parser.exists('0.60.0', fetch), true);
    assert.strictEqual(parser.exists('999.0.0', fetch), false);
    assert.strictEqual(parser.exists('0.60.0', fetch), true);
    assert.strictEqual(parser.exists('999.0.0', fetch), false);
    assert.deepStrictEqual(urls, [parser.url('0.60.0'), parser.url('999.0.0')]);
  });
  it('warns once and includes the error code when the request has no message', () => {
    let calls = 0;
    const messages = [];
    const original = console.warn;
    console.warn = (message) => messages.push(message);
    try {
      const fetch = () => {
        calls += 1;
        const error = new Error('');
        error.code = 'ETIMEDOUT';
        throw error;
      };
      assert.strictEqual(parser.exists('0.60.0', fetch), true);
      assert.strictEqual(parser.exists('0.60.0', fetch), true);
      assert.strictEqual(calls, 1, 'a failed lookup must not repeat at each pipeline step');
      assert.strictEqual(messages.length, 1, 'the same failed lookup produced repeated warnings');
      assert(messages[0].includes('ETIMEDOUT'), 'the warning omitted the available error code');
    } finally {
      console.warn = original;
    }
  });
});
