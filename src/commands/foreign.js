/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const rel = require('relative');
const path = require('path');
const fs = require('fs');

/**
 * Extract the first balanced JSON array from a string, ignoring any trailing
 * bytes that may have been left over by a non-atomic writer (observed on
 * Windows CI, see issue #782).
 * @param {String} text - Raw file contents
 * @return {String} Substring spanning the first complete `[...]` array
 */
function firstJsonArray(text) {
  const body = text.charCodeAt(0) === 0xFEFF ? text.slice(1) : text;
  let depth = 0;
  let start = -1;
  let inString = false;
  let escape = false;
  for (let i = 0; i < body.length; i += 1) {
    const ch = body[i];
    if (inString) {
      if (escape) {
        escape = false;
      } else if (ch === '\\') {
        escape = true;
      } else if (ch === '"') {
        inString = false;
      }
    } else if (ch === '"') {
      inString = true;
    } else if (ch === '[') {
      if (depth === 0) {
        start = i;
      }
      depth += 1;
    } else if (ch === ']') {
      depth -= 1;
      if (depth === 0 && start >= 0) {
        return body.slice(start, i + 1);
      }
    }
  }
  throw new SyntaxError('No complete JSON array found in foreign catalog');
}

/**
 * Inspects and prints the list of foreign objects.
 * @param {Hash} opts - All options
 */
module.exports = function(opts) {
  const file = path.resolve(opts.target, 'eo-foreign.json');
  const all = JSON.parse(firstJsonArray(fs.readFileSync(file, 'utf8')));
  console.info('There are %d objects in %s:', all.length, rel(file));
  all.forEach((obj) => {
    console.info('  %s', obj.id);
  });
};

module.exports.firstJsonArray = firstJsonArray;
