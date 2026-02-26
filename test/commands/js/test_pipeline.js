/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const pipeline = require('../../../src/commands/js/pipeline');

describe('js/pipeline', () => {
  it('stops on first failing command', async () => {
    const order = [];
    const coms = {
      step1: async () => order.push('step1'),
      step2: async () => { throw new Error('step2 failed'); },
      step3: async () => order.push('step3'),
    };
    await assert.rejects(
      pipeline(coms, ['step1', 'step2', 'step3'], {}),
      /step2 failed/
    );
    assert.deepStrictEqual(order, ['step1']);
  });
});
