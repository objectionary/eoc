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
const gte = function(subject, current, min) {
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

/**
 * Only if the running Node.js is as young as the "engines" section demands.
 *
 * @param {Object} engines - The "engines" section of package.json
 * @param {String} current - Current version of Node.js
 */
const node = function(engines, current) {
  if (engines && engines.node) {
    gte('Node.js', current, semver.minVersion(engines.node).version);
  }
};

module.exports = {gte, node};
