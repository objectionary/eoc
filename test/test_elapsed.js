/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const {elapsed} = require('../src/elapsed');
const assert = require('assert');

describe('elapsed', function() {
  const snooze = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  it('measures time correctly', async () => {
    return elapsed(async (tracked) => {
      await snooze(300);
      return tracked.print('task');
    }).then(
      (actual) => assert(
        /task in 3\d+ms/.test(actual),
        `Expected "${actual}" to match /task in 3\\d+ms/`
      )
    );
  });
  it('measures short time correctly', async () => {
    return elapsed(async (tracked) => {
      await snooze(10);
      return tracked.print('short task');
    }).then(
      (actual) => assert(
        /short task in \d+ms/.test(actual),
        `Expected "${actual}" to match /short task in \\d+ms/`
      )
    );
  });
  it('measures long time correctly', async () => {
    return elapsed(async (tracked) => {
      await snooze(1200);
      return tracked.print('long task');
    }).then(
      (actual) => assert(
        /long task in 2s/.test(actual),
        `Expected "${actual}" to match /long task in 2s/`
      )
    );
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
