/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const {collect} = require('../../../src/commands/java/pipeline');

describe('java/pipeline collect', () => {
  it('collects static goals from commands', () => {
    const coms = {
      register: {goals: ['eo:register']},
      assemble: {goals: ['eo:assemble']},
    };
    const {goalList, flagList} = collect(coms, ['register', 'assemble'], {});
    assert.deepStrictEqual(goalList, ['eo:register', 'eo:assemble']);
    assert.deepStrictEqual(flagList, []);
  });
  it('resolves dynamic goals from function', () => {
    const coms = {
      lint: {
        goals: (opts) => opts.newParser ? ['eo:lint'] : ['eo:verify'],
        extraFlags: (opts) => [`-Deo.failOnWarning=${opts.easy ? 'false' : 'true'}`],
      },
    };
    const {goalList, flagList} = collect(coms, ['lint'], {newParser: true, easy: false});
    assert.deepStrictEqual(goalList, ['eo:lint']);
    assert.deepStrictEqual(flagList, ['-Deo.failOnWarning=true']);
  });
  it('collects multiple goals from single command', () => {
    const coms = {
      resolve: {goals: ['eo:resolve', 'eo:place']},
    };
    const {goalList} = collect(coms, ['resolve'], {});
    assert.deepStrictEqual(goalList, ['eo:resolve', 'eo:place']);
  });
});
