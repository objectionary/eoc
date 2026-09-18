/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const safe = require('colors/safe');
const util = require('node:util'),

  levels = {
    'trace': false,
    'debug': false,
    'info': true,
    'warn': true,
    'error': true,
  },

  colors = {
    'trace': 'gray',
    'debug': 'gray',
    'info': 'white',
    'warn': 'yellow',
    'error': 'red',
  };

for (const level in levels) {
  if (levels.hasOwnProperty(level)) {
    const lvl = level,
      before = console[lvl];
    console[level] = function(...args) {
      if (!levels[lvl]) {
        return;
      }
      before.call(
        before,
        safe[colors[lvl]](util.format(...args))
      );
    };
  }
}

/**
 * Enable this particular logging level, and every level above it.
 * @param {String} level - The level to enable
 * @throws {Error} If the level is not one of the known ones
 */
module.exports.enable = function enable(level) {
  if (!Object.hasOwn(levels, level)) {
    throw new Error(`Unknown logging level: ${level}`);
  }
  for (const key of Object.keys(levels)) {
    levels[key] = true;
    if (key === level) {
      break;
    }
  }
};
