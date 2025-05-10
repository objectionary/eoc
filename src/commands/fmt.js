/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const fs = require('fs')
const path = require('path')
const { mvnw, flags } = require('../mvnw')
const rel = require('relative')

/**
 * Command to format EO files using the print command.
 * @param {Object} opts - All options
 * @return {Promise} of format task
 */
module.exports = function (opts) {
  const sources = path.resolve(opts.sources)
  console.debug('Formatting EO files in %s', rel(sources))

  return mvnw(
    ['eo:print']
      .concat(flags(opts))
      .concat([
        `-Deo.printSourcesDir=${path.resolve(opts.target, '1-parse')}`,
        `-Deo.printOutputDir=${sources}`
      ]),
    opts.target,
    opts.batch
  ).then(r => {
    console.info('EO files formatted in %s', rel(sources))
    return r
  })
}
