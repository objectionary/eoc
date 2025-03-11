/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const safe = require('colors/safe');
const util = require('node:util');

const levels = {
  'trace': false,
  'debug': false,
  'info': true,
  'warn': true,
  'error': true,
};

const colors = {
  'trace': 'gray',
  'debug': 'gray',
  'info': 'white',
  'warn': 'orange',
  'error': 'red',
};

for (const level in levels) {
  if (levels.hasOwnProperty(level)) {
    const lvl = level;
    const before = console[lvl];
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
 * Enable this particular logging level.
 * @param {String} level - The level to enable
 */
module.exports.enable = function enable(level) {
  for (const key in levels) {
    if (levels.hasOwnProperty(level)) {
      levels[key] = true;
      if (key === level) {
        break;
      }
    }
  }
};
