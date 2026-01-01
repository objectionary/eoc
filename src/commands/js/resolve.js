/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

/**
 * Command to resolve all the dependencies required for compilation.
 * @param {Object} opts - All options
 * @return {Promise} of resolve task
 */
module.exports = function(opts) {
  return new Promise((resolve, reject) => {
    console.info('Resolve step is skipped for JavaScript');
    resolve(opts);
  });
};
