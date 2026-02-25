/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const jsPipeline = require('../../src/commands/js/pipeline');
const {collect} = require('../../src/commands/java/pipeline');

describe('js/pipeline', () => {
  it('stops on first failing command', async () => {
    const order = [];
    const coms = {
      step1: async () => order.push('step1'),
      step2: async () => { throw new Error('step2 failed'); },
      step3: async () => order.push('step3'),
    };
    await assert.rejects(
      jsPipeline(coms, ['step1', 'step2', 'step3'], {}),
      /step2 failed/
    );
    assert.deepStrictEqual(order, ['step1']);
  });
});

describe('java/pipeline collect', () => {
  it('collects static goals from commands', () => {
    const coms = {
      register: {goals: ['eo:register']},
      assemble: {goals: ['eo:assemble']},
    };
    const {goalList, extraFlags} = collect(coms, ['register', 'assemble'], {});
    assert.deepStrictEqual(goalList, ['eo:register', 'eo:assemble']);
    assert.deepStrictEqual(extraFlags, []);
  });
  it('resolves dynamic goals from function', () => {
    const coms = {
      lint: {
        goals: (opts) => opts.newParser ? ['eo:lint'] : ['eo:verify'],
        extraFlags: (opts) => [`-Deo.failOnWarning=${opts.easy ? 'false' : 'true'}`],
      },
    };
    const {goalList, extraFlags} = collect(coms, ['lint'], {newParser: true, easy: false});
    assert.deepStrictEqual(goalList, ['eo:lint']);
    assert.deepStrictEqual(extraFlags, ['-Deo.failOnWarning=true']);
  });
  it('collects multiple goals from single command', () => {
    const coms = {
      resolve: {goals: ['eo:resolve', 'eo:place']},
    };
    const {goalList} = collect(coms, ['resolve'], {});
    assert.deepStrictEqual(goalList, ['eo:resolve', 'eo:place']);
  });
});
