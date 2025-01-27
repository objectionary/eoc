/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2022-2025 Objectionary.com
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
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
        /short task in 1\d+ms/.test(actual),
        `Expected "${actual}" to match /short task in 1\\d+ms/`
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
