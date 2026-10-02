/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const {XMLParser} = require('fast-xml-parser');
const colors = require('colors');
const request = require('sync-request'),

  /**
   * Load the latest version from Maven Central.
   *
   * Answers with an empty string when Maven Central cannot be reached or
   * refuses, the way `exists` below does, so that a machine with no network
   * keeps the version the repository pins instead of dying on a stack trace
   * before the command line is even parsed.
   * @param {function} fetch - HTTP call, defaults to sync-request
   * @return {String} Latest version, for example '0.23.1', or an empty string
   */
  version = module.exports = {
    value: '',
    get(fetch = request) {
      if (version.value === '') {
        const repo = 'org/eolang/eo-maven-plugin',
          url = `https://repo.maven.apache.org/maven2/${repo}/maven-metadata.xml`;
        try {
          const res = fetch('GET', url, {timeout: 100000, socketTimeout: 100000});
          if (res.statusCode === 200) {
            version.value = new XMLParser().parse(res.body).metadata.versioning.release;
            console.info('The latest version of %s at %s is %s', repo, url, version.value);
          } else {
            console.warn(colors.yellow(
              `Cannot ask ${url} for the latest version (HTTP ${res.statusCode}), using the pinned one`
            ));
          }
        } catch (e) {
          console.warn(colors.yellow(
            `Cannot ask ${url} for the latest version (${e.message}), using the pinned one`
          ));
        }
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
     * @param {function} fetch - HTTP call, defaults to sync-request
     * @return {Boolean} True if version exists or cannot be verified, false if confirmed absent
     */
    exists(ver, fetch = request) {
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
