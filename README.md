<img alt="logo" src="https://www.objectionary.com/cactus.svg" height="100px" />

[![grunt](https://github.com/objectionary/eoc/actions/workflows/grunt.yml/badge.svg)](https://github.com/objectionary/eoc/actions/workflows/grunt.yml)

First, you install [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
and [Java SE](https://www.oracle.com/java/technologies/downloads/).

Then, you install [eolang](https://www.npmjs.com/package/eolang) package:

```
$ npm install eolang
```

Then, you write a simple [EO](https://www.eolang.org) program in `hello.eo` file
in the current directory:

```
[args...] > hello
  QQ.io.stdout > @
    "Hello, world!\n"
```

Then, you run it:

```
$ eoc dataize hello
```

That's it.

## Commands

You can also do many other things with `eoc` commands
(the flow is explained in [this blog post](https://www.yegor256.com/2021/10/21/objectionary.html)):

  * `register` finds necessary EO files and registers the in a CSV
  * `assemble` parses EO files into XMIR, optimizes them, pulls foreign EO objects
  * `transpile` converts XMIR to target programming language
  * `compile` converts target language to binaries
  * `link` puts all binaries together into a single executable binary
  * `dataize` executes the binary and dataize a single object
  * `test` executes all visible unit tests

There are also commands that help manipulate with XMIR and EO sources (some of them are not implemented as of yet):

  * `audit` inspects all packages and report their status
  * `foreign` inspects all objects found in the program after `assemble` step
  * <del>`translate` converts Java/C++/Python/etc. program to EO program</del>
  * <del>`demu` removes `cage` and `memory` objects</del>
  * <del>`dejump` removes `goto` objects</del>
  * <del>`infer` suggests object names where it's possible to infer them</del>
  * <del>`flatten` moves inner objects to upper level</del>

This command line toolkit simply integrates other tools available in
[@objectionary](https://github.com/objectionary) GitHub organization.

## How to Contribute

First, run `npm install`. Then, run `grunt`. All tests should pass.

If you want to run a single test:

```
$ npm test -- test/test_mvnw.js
```

Then, make a pull request.
