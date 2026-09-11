/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const {XMLParser} = require('fast-xml-parser');
const colors = require('colors');
const {execFileSync} = require('child_process');

/**
 * Synchronous HTTP GET using a Node.js subprocess,
 * drop-in replacement for sync-request.
 * @param {String} method - HTTP method (only GET is used)
 * @param {String} url - URL to fetch
 * @param {Object} opts - Options, only timeout is observed
 * @return {Object} Response with statusCode and body
 */
function syncGet(method, url, opts) {
  const script = [
    'const https = require("https");',
    'const url = process.argv[1];',
    'https.get(url, (res) => {',
    '  const chunks = [];',
    '  res.on("data", (c) => chunks.push(c));',
    '  res.on("end", () => {',
    '    process.stdout.write(JSON.stringify({',
    '      s: res.statusCode,',
    '      b: Buffer.concat(chunks).toString()',
    '    }));',
    '  });',
    '}).on("error", (e) => {',
    '  process.stderr.write(e.message);',
    '  process.exit(1);',
    '});',
  ].join('\n');
  const raw = execFileSync(
    process.execPath, ['-e', script, url],
    {encoding: 'utf8', timeout: (opts && opts.timeout) || 35000}
  );
  const parsed = JSON.parse(raw);
  return {statusCode: parsed.s, body: parsed.b};
}

const version = module.exports = {
  value: '',
  /**
   * Load the latest version from Maven Central.
   * @return {String} Latest version, for example '0.23.1'
   */
  get() {
    if (version.value === '') {
      const repo = 'org/eolang/eo-maven-plugin',
        url = `https://repo.maven.apache.org/maven2/${repo}/maven-metadata.xml`,
        res = syncGet('GET', url, {timeout: 100000});
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
   * Build the Maven Central URL of a parser version POM.
   * @param {String} ver - Version to locate, for example '0.23.1'
   * @return {String} Full URL of the eo-maven-plugin POM
   */
  url(ver) {
    const repo = 'org/eolang/eo-maven-plugin',
      artifactId = 'eo-maven-plugin';
    return `https://repo.maven.apache.org/maven2/${repo}/${ver}/${artifactId}-${ver}.pom`;
  },
  /**
   * Check if a specific parser version exists in Maven Central.
   * @param {String} ver - Version to check, for example '0.23.1'
   * @param {function} fetch - HTTP call, defaults to syncGet
   * @return {Boolean} True if version exists or cannot be verified, false if confirmed absent
   */
  exists(ver, fetch = syncGet) {
    let result;
    if (ver && ver !== 'undefined') {
      try {
        const res = fetch('GET', version.url(ver), {timeout: 10000, socketTimeout: 10000});
        if (res.statusCode === 404) {
          result = false;
        } else {
          if (res.statusCode !== 200) {
            console.warn(colors.yellow(
              `Cannot verify parser version ${ver} in Maven Central (HTTP ${res.statusCode}), proceeding anyway`
            ));
          }
          result = true;
        }
      } catch (e) {
        console.warn(colors.yellow(
          `Cannot verify parser version ${ver} in Maven Central (${e.message}), proceeding anyway`
        ));
        result = true;
      }
    } else {
      result = false;
    }
    return result;
  }
};
