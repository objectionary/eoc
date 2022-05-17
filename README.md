<img alt="logo" src="https://www.objectionary.com/cactus.svg" height="100px" />

[![grunt](https://github.com/objectionary/eoc/actions/workflows/grunt.yml/badge.svg)](https://github.com/objectionary/eoc/actions/workflows/grunt.yml)

First, you install [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
and [Java SE](https://www.oracle.com/java/technologies/downloads/).

Then, you install [eolang](https://www.npmjs.com/package/eolang) package:

```
$ npm install eolang
```

Then, you write a [EO](https://www.eolang.org) program in a few `.eo` files
in the current directory.

Then, for example, you compile it to Java and run:

```
$ eoc run
```

That's it.

You can also do many other things with `eoc` commands:

  * `parse` converts EO program to XMIR files
  * `optimize` reorganizes XMIR files and prepares them for transpilation
  * `translate` converts Java/C++/Python/etc. program to EO program
  * `demu` removes `cage` and `memory` objects
  * `dejump` removes `goto` objects
  * `infer` suggests object names where it's possible to infer them
  * `flatten` moves inner objects to upper level
  * `transpile` converts XMIR to target programming language
  * `compile` converts target language to binaries
  * `run` executes the binaries

This command line toolkit simply integrates other tools available in
[@objectionary](https://github.com/objectionary) GitHub organization.