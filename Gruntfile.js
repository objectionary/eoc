/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: ['temp', 'coverage'],
    mochaTest: {
      test: {
        options: {
          timeout: 1200000,
          require: ['nyc']
        },
        src: grunt.option('file') ? [grunt.option('file')] : ['test/**/*.js']
      },
    }
  });
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.registerTask('default', ['mochaTest']);
  grunt.registerTask('coverage', ['mochaTest']);
};
