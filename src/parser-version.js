/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const {XMLParser} = require('fast-xml-parser');
const request = require('sync-request');

/**
 * Load the latest version from GitHub releases.
 * @return {String} Latest version, for example '0.23.1'
 */
const version = module.exports = {
  value: '',
  get: function() {
    if (version.value === '') {
      const repo = 'org/eolang/eo-maven-plugin';
      const url = `https://repo.maven.apache.org/maven2/${repo}/maven-metadata.xml`;
      const res = request('GET', url, {timeout: 100000, socketTimeout: 100000});
      if (res.statusCode != 200) {
        throw new Error(`Invalid response status #${res.statusCode} from ${url}: ${res.body}`);
      }
      const xml = new XMLParser().parse(res.body);
      version.value = xml.metadata.versioning.release;
      console.info('The latest version of %s at %s is %s', repo, url, version.value);
    }
    return version.value;
  }
};
