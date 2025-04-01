/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const fs = require('fs');
const path = require('path');

/**
 * Command to create docs from .EO sources.
 * @param {Hash} opts - All options
 */
module.exports = function(opts) {
  const filePath = path.resolve('eodocs.html');
  fs.writeFileSync(filePath, '');
};
