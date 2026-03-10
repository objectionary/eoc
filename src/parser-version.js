/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const {XMLParser} = require('fast-xml-parser');
const request = require('sync-request'),

  /**
 * Load the latest version from GitHub releases.
 * @return {String} Latest version, for example '0.23.1'
 */
  version = module.exports = {
    value: '',
    get() {
      if (version.value === '') {
        const repo = 'org/eolang/eo-maven-plugin',
          url = `https://repo.maven.apache.org/maven2/${repo}/maven-metadata.xml`,
          res = request('GET', url, {timeout: 100000, socketTimeout: 100000});
        if (res.statusCode !== 200) {
          throw new Error(`Invalid response status #${res.statusCode} from ${url}: ${res.body}`);
        }
        const xml = new XMLParser().parse(res.body);
        version.value = xml.metadata.versioning.release;
        console.info('The latest version of %s at %s is %s', repo, url, version.value);
      }
      return version.value;
    },
    /**
     * Check if a specific parser version exists in Maven Central.
     * @param {String} ver - Version to check, for example '0.23.1'
     * @return {Boolean} True if version exists, false otherwise
     */
    exists(ver) {
      let result;
      if (ver && ver !== 'undefined') {
        try {
          const repo = 'org/eolang/eo-maven-plugin',
            artifactId = 'eo-maven-plugin',
            url = `https://repo.maven.apache.org/maven2/${repo}/${ver}/${artifactId}-${ver}.pom`,
            res = request('GET', url, {timeout: 10000, socketTimeout: 10000});
          result = res.statusCode === 200;
        } catch (e) {
          console.debug('Unable to validate parser version (network error): %s', e.message);
          result = false;
        }
      } else {
        result = false;
      }
      return result;
    }
  };
