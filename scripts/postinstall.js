#!/usr/bin/env node

/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

/**
 * @todo #939:30min Investigate whether `grunt-mocha-test` needs the
 *  Windows-shell fix that previously lived in
 *  `patches/grunt-mocha-cli+7.0.0.patch`. If it does, add a new patch
 *  under `patches/` targeting `grunt-mocha-test`, re-introduce the
 *  `patch-package` invocation here (guarded by the presence of
 *  `node_modules/grunt-mocha-test` for dev-vs-prod), and verify on
 *  Windows CI. If it does not, delete this script together with the
 *  `postinstall` entry in `package.json` and drop the `patch-package`
 *  devDependency.
 */
console.log('postinstall: nothing to do (see scripts/postinstall.js @todo #939).');
