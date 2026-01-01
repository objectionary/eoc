/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const semver = require('semver');

/**
 * Only if provided version is the required one or younger.
 *
 * @param {String} subject - What is being checked
 * @param {String} current - Current version
 * @param {String} min - Minimal expected version
 */
module.exports.gte = function(subject, current, min) {
  if (current.endsWith('-SNAPSHOT')) {
    return;
  }
  if (semver.lt(current, min)) {
    console.error(
      '%s is required to have version %s or higher, while you use %s',
      subject, min, current
    );
    process.exit(1);
  }
};
