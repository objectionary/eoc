/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const {elapsed} = require('../src/elapsed');
const assert = require('assert');

describe('elapsed', () => {
  const snooze = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  /**
   * Stub Date.now so the first invocation returns 0 and the next returns
   * the given duration in milliseconds. This lets us simulate long
   * elapsed times without actually waiting.
   * @param {Number} duration - Pretended elapsed time in ms.
   * @return {Function} Restore function that puts back the original Date.now.
   */
  const stubNow = (duration) => {
    const original = Date.now;
    let calls = 0;
    Date.now = () => {
      const value = calls === 0 ? 0 : duration;
      calls += 1;
      return value;
    };
    return () => {
      Date.now = original;
    };
  };
  it('measures time correctly', async () => {
    const actual = await elapsed(async (tracked) => {
      await snooze(333);
      return tracked.print('task');
    });
    assert(
      /task in 3\d+ms/.test(actual),
      `Expected "${actual}" to match /task in 3\\d+ms/`
    );
  });
  it('measures short time correctly', async () => {
    const actual = await elapsed(async (tracked) => {
      await snooze(10);
      return tracked.print('short task');
    });
    assert(
      /short task in \d+ms/.test(actual),
      `Expected "${actual}" to match /short task in \\d+ms/`
    );
  });
  it('measures long time correctly', async () => {
    const actual = await elapsed(async (tracked) => {
      await snooze(1200);
      return tracked.print('long task');
    });
    assert(
      /long task in 2s/.test(actual),
      `Expected "${actual}" to match /long task in 2s/`
    );
  });
  it('reports a 5-minute task in minutes, not in fractional hours', () => {
    const restore = stubNow(5 * 60 * 1000);
    try {
      const actual = elapsed((tracked) => tracked.print('long task'));
      assert.strictEqual(actual, 'long task in 5min');
    } finally {
      restore();
    }
  });
  it('rounds a sub-minute-multiple duration up to the next minute', () => {
    const restore = stubNow(3 * 60 * 1000 + 12 * 1000);
    try {
      const actual = elapsed((tracked) => tracked.print('odd task'));
      assert.strictEqual(actual, 'odd task in 4min');
    } finally {
      restore();
    }
  });
  it('reports exactly 1 minute when the duration is 60s', () => {
    const restore = stubNow(60 * 1000);
    try {
      const actual = elapsed((tracked) => tracked.print('boundary task'));
      assert.strictEqual(actual, 'boundary task in 1min');
    } finally {
      restore();
    }
  });
  it('handles errors in task correctly', async () => {
    await assert.rejects(
      elapsed(async () => {
        throw new Error('task error');
      }),
      (error) => {
        assert.throws(() => {
          throw error;
        }, /task error/);
        return true;
      }
    );
  });
});
