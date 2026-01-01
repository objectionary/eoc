/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: ['temp', 'coverage'],
    mochacli: {
      test: {
        options: {
          timeout: '1200000',
          files: ['test/**/*.js'],
          require: ['nyc']
        },
      },
    }
  });
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-mocha-cli');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.registerTask('default', ['mochacli']);
  grunt.registerTask('coverage', ['mochacli']);
};
