/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */
const assert = require('assert');
const path = require('path');
const pipeline = require('../../../src/commands/java/pipeline');

describe('java/pipeline', () => {
  it('builds correct command for eo:register and eo:assemble', async () => {
    const coms = {
      register: {goals: () => ['eo:register']},
      assemble: {goals: () => ['eo:assemble']},
    };
    calls = [];
    const maven = function maven(command) {
      calls.push(command);
    }
    opts = {sources: 'sources-dir', target: 'target-dir'};
    await pipeline(coms, ['register', 'assemble'], opts, maven)
    assert.deepStrictEqual(
      calls[0],
      [
        'eo:register',
        'eo:assemble',
        '-Deo.version=undefined',
        '-Deo.tag=undefined',
        '--quiet',
        `-Deo.sourcesDir=${path.resolve(opts.sources)}`,
        `-Deo.targetDir=${path.resolve(opts.target)}`,
        `-Deo.outputDir=${path.resolve(opts.target, 'classes')}`,
        `-Deo.generatedDir=${path.resolve(opts.target, 'generated-sources')}`,
        `-Deo.placed=${path.resolve(opts.target, 'eo-placed.csv')}`,
        '-Deo.placedFormat=csv',
        '-Deo.skipLinting=false',
      ]
    );
  });
  it('resolves dynamic goals for lint', async () => {
    const coms = {
      lint: {
        goals: (opts) => opts.newParser ? ['eo:lint'] : ['eo:verify'],
        extras: (opts) => [`-Deo.failOnWarning=${opts.easy ? 'false' : 'true'}`],
      },
    };
    calls = [];
    const maven = function maven(command) {
      calls.push(command);
    }
    opts = {
      sources: 'lint-sources-dir',
      target: 'lint-target-dir',
      newParser: true,
      easy: true,
    };
    await pipeline(coms, ['lint'], opts, maven)
    assert(calls[0].includes('eo:lint'));
    assert(calls[0].includes('-Deo.failOnWarning=false'));
  });
  it('uses multiple goals from single command', async () => {
    const coms = {
      resolve: {goals: () => ['eo:resolve', 'eo:place']},
    };
    calls = [];
    const maven = function maven(command) {
      calls.push(command);
    }
    await pipeline(coms, ['resolve'], {sources: 'srs', target: 'tgt'}, maven)
    assert(calls[0].includes('eo:resolve'));
    assert(calls[0].includes('eo:place'));
  });
});
