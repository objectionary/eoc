/*
 * The MIT License (MIT)
 *
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

/**
 * Command to compile target language into binaries.
 * @param {Object} opts - All options
 * @return {Promise} of compile task
 */
module.exports = function(opts) {
  return new Promise((resolve, reject) => {
    console.info('Compile step is skipped for JavaScript');
    resolve(opts);
  });
};
