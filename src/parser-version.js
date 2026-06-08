/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const {XMLParser} = require('fast-xml-parser');
const {execFileSync} = require('child_process');

const repo = 'org/eolang/eo-maven-plugin';
const base = 'https://repo.maven.apache.org/maven2';

/**
 * Fetch a URL synchronously using a Node.js subprocess.
 * @param {String} url - URL to fetch
 * @param {Number} timeout - Timeout in milliseconds
 * @return {String} Response body
 */
function fetchSync(url, timeout) {
  const script = `
    const https = require('https');
    const url = process.argv[1];
    const req = https.get(url, (res) => {
      if (res.statusCode !== 200) {
        process.stderr.write('HTTP ' + res.statusCode);
        process.exit(1);
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => process.stdout.write(Buffer.concat(chunks)));
    });
    req.on('error', (e) => { process.stderr.write(e.message); process.exit(1); });
  `;
  return execFileSync(
    process.execPath, ['-e', script, url],
    {encoding: 'utf8', timeout}
  );
}

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
        body = fetchSync(url, 35000);
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
      fetchSync(url, 15000);
      return true;
    } catch {
      return false;
    }
  }
};
