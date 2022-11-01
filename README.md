<img alt="logo" src="https://www.objectionary.com/cactus.svg" height="92px" />

[![EO principles respected here](https://www.elegantobjects.org/badge.svg)](https://www.elegantobjects.org)
[![We recommend IntelliJ IDEA](https://www.elegantobjects.org/intellij-idea.svg)](https://www.jetbrains.com/idea/)

[![grunt](https://github.com/objectionary/eoc/actions/workflows/grunt.yml/badge.svg)](https://github.com/objectionary/eoc/actions/workflows/grunt.yml)
[![PDD status](http://www.0pdd.com/svg?name=objectionary/eoc)](http://www.0pdd.com/p?name=objectionary/eoc)
[![Hits-of-Code](https://hitsofcode.com/github/objectionary/eoc)](https://hitsofcode.com/view/github/objectionary/eoc)
![Lines of code](https://img.shields.io/tokei/lines/github/objectionary/eoc)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/objectionary/eoc/blob/master/LICENSE.txt)

First, you install [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
and [Java SE](https://www.oracle.com/java/technologies/downloads/).

Then, you install [eolang](https://www.npmjs.com/package/eolang) package:

```
$ npm install -g eolang
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

  * `register` finds necessary EO files and registers them in a JSON catalog
  * `assemble` parses EO files into XMIR, optimizes them, and pulls foreign EO objects
  * `transpile` converts XMIR to target programming language (Java by default)
  * `compile` converts target language sources to binaries
  * `link` puts all binaries together into a single executable binary
  * `dataize` dataizes a single object from the executable binary
    * `--stack=<size>` increases size of stack for recursive workflows in current thread(by default size = 1M, value range to set from 144K to 1G)
  * `test` dataizes all visible unit tests
  * `clean` deletes all temporary files(for example .eoc )
    * `--cached` deletes ~/.eo directory

There are also commands that help manipulate with XMIR and EO sources (some of them are not implemented as of yet):

  * `audit` inspects all required packages and reports their status
  * `foreign` inspects all objects found in the program after `assemble` step
  * `gmi` generates GMI from XMIR, further rederable as XML or [Dot](https://en.wikipedia.org/wiki/DOT_%28graph_description_language%29)
    * `--xml` generates .gmi.xml files
    * `--xembly` generates .gmi.xe files
    * `--graph` generates .gmi.graph files
    * `--dot` generates .gmi.dot files
    * `--include <names>` generates GMI for these object names, using mask(by default: '**')
    * `--exclude <names>` doesn't generate GMI for these objects
  * <del>`translate` converts Java/C++/Python/etc. program to EO program</del>
  * <del>`demu` removes `cage` and `memory` objects</del>
  * <del>`dejump` removes `goto` objects</del>
  * <del>`infer` suggests object names where it's possible to infer them</del>
  * <del>`flatten` moves inner objects to upper level</del>

There are also some global options(flags) for commands which provide some compilation and execution features.
  * `--alone` just runs a single command without dependencies
  * `--verbose` prints debug messages and full output of child processes
  * `-s, --sources <path>` sets directory with .EO sources(by default: current directory)
  * `-t, --target <path>` sets directory with all generated files(by default: .eoc)
  * `--parser <version>` sets the version of parser to use
  * `--hash <hex>` hash in objectionary/home to compile against
  * `--no-color` disables colorization of console messages
  * `--track-optimization-steps` saves intermediate XMIR files

This command line toolkit simply integrates other tools available in
[@objectionary](https://github.com/objectionary) GitHub organization.

## How to Contribute

First, run `npm install`. Then, run `grunt`. All tests should pass.

If you want to run a single test:

```
$ npm test -- test/test_mvnw.js
```

Make your changes and then [make](https://www.yegor256.com/2014/04/15/github-guidelines.html) a pull request.
