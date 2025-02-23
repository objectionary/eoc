/*
 * The MIT License (MIT)
 *
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: ['temp'],
    mochacli: {
      test: {
        options: {
          timeout: '1200000',
          files: ['test/**/*.js'],
        },
      },
    },
    eslint: {
      options: {
        maxWarnings: '0',
        overrideConfigFile: '.eslintrc.json',
      },
      target: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
    },
  });
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-mocha-cli');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.registerTask('default', ['mochacli', 'eslint']);
};
