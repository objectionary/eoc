/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const {XMLParser} = require('fast-xml-parser');
const {execSync} = require('child_process');

const repo = 'org/eolang/eo-maven-plugin';
const base = 'https://repo.maven.apache.org/maven2';

/**
 * Load the latest version from Maven Central.
 * @return {String} Latest version, for example '0.23.1'
 */
const version = module.exports = {
  value: '',
  get() {
    if (version.value === '') {
      const url = `${base}/${repo}/maven-metadata.xml`;
      let body;
      try {
        body = execSync(
          `curl -sL --fail --max-time 30 "${url}"`,
          {encoding: 'utf8', timeout: 35000}
        );
      } catch (e) {
        throw new Error(`Failed to fetch ${url}: ${e.message}`, {cause: e});
      }
      const xml = new XMLParser().parse(body);
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
    if (!ver || ver === 'undefined') {
      return false;
    }
    const artifactId = 'eo-maven-plugin';
    const url = `${base}/${repo}/${ver}/${artifactId}-${ver}.pom`;
    try {
      execSync(
        `curl -sL -o /dev/null --fail --max-time 10 "${url}"`,
        {timeout: 15000}
      );
      return true;
    } catch {
      return false;
    }
  }
};
