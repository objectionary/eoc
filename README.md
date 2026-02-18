# EOLANG Command Line Tool-Kit

[![EO principles respected here](https://www.elegantobjects.org/badge.svg)](https://www.elegantobjects.org)
[![We recommend IntelliJ IDEA](https://www.elegantobjects.org/intellij-idea.svg)](https://www.jetbrains.com/idea/)

[![grunt](https://github.com/objectionary/eoc/actions/workflows/grunt.yml/badge.svg)](https://github.com/objectionary/eoc/actions/workflows/grunt.yml)
[![node-current](https://img.shields.io/node/v/eolang)](https://www.npmjs.com/package/eolang)
[![PDD status](https://www.0pdd.com/svg?name=objectionary/eoc)](https://www.0pdd.com/p?name=objectionary/eoc)
[![codecov](https://codecov.io/gh/objectionary/eoc/branch/master/graph/badge.svg)](https://codecov.io/gh/objectionary/eoc)
[![Hits-of-Code](https://hitsofcode.com/github/objectionary/eoc)](https://hitsofcode.com/view/github/objectionary/eoc)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/objectionary/eoc/blob/master/LICENSE.txt)

This is a command-line tool-kit for [EO](https://www.eolang.org)
programming languages, allowing you to compile EO programs, test, dataize,
and check for errors.

First, you install [npm][npm-install] and [Java SE][java-se].

Then, you install [eolang][npm] package, using [npm][npm-install]:

```bash
npm install -g eolang@0.33.5
```

You can also use [Homebrew] (on macOS):

```bash
brew tap objectionary/eoc https://github.com/objectionary/eoc
brew install objectionary/eoc/eolang@0.33.5
```

Or install it via [Nix flakes](https://nixos.wiki/wiki/Flakes):

```bash
nix run github:objectionary/eoc
```

You can also include EOLANG in your own flake:

```nix
{
  inputs = {
    eoc.url = "github:objectionary/eoc";
    nixpkgs.url = "github:nixos/nixpkgs/nixos-25.05";
  };

  outputs = { self, nixpkgs, eoc, ... }: {
    nixConfigurations.<hostname> = nixpkgs.lib.nixosSystem {
      modules = [
        {
          nixpkgs.config.packageOverrides = pkgs: {
            eoc = eoc.packages.${system}.default;
          };
        }
      ];
    }
  };
}
```

After that, select one of the methods for installing the package:

```nix
#configuration.nix (Global)
{
  environment.systemPackages = with pkgs; [
    eoc
  ];
}
```

```nix
#configuration.nix (For user)
{
  users.users.<your-user-name>.packages = with pkgs; [
    eoc
  ];
}
```

```nix
#home.nix (For home-manager)
{
  home.packages = with pkgs; [
    eoc
  ];
}
```

Then, you write a simple [EO](https://www.eolang.org) program in `hello.eo` file
in the current directory:

```eo
# My first object in EO!
[args] > hello
  QQ.io.stdout > @
    "Hello, world!\n"
```

Then, you run it:

```bash
eoc --easy dataize hello
```

That's it.

## Commands

You can also do many other things with `eoc` commands
(the flow is explained in [this blog post][blog]):

* `register` finds necessary `.eo` files and registers them in a JSON catalog
* `assemble` parses `.eo` files into `.xmir`, optimizes them,
  and pulls foreign EO objects
* `transpile` converts `.xmir` files to the target programming
language (Java by default)
* `compile` converts target language sources (e.g., `.java`)
to binaries (e.g., `.class`)
* `link` puts all binaries together into a single executable binary
* `dataize` dataizes a single object from the executable binary
* `test` dataizes all visible unit tests
* `lint` finds style-related errors in EO and XMIR files
* `jeo:disassemble` converts Java `.class` files to `.xmir`
(via [jeo](https://github.com/objectionary/jeo-maven-plugin))
* `jeo:assemble` converts `.xmir` files to Java `.class` files
(via [jeo](https://github.com/objectionary/jeo-maven-plugin))

There are also commands that help manipulate with XMIR and EO sources
(the list is not completed, while some of them are not implemented as of yet):

* `audit` inspects all required packages and reports their status
* `foreign` inspects all objects found in the program after the `assemble` step
* `sodg` generates `.sodg` from `.xmir`, further rederable as XML or [Dot][dot]
* `print` generates `.eo` files from `.xmir` files
* `generate_comments` generates `.json` files with LLM-generated
  documentation for `.eo` structures
* `docs` generates HTML documentation from `.xmir` files
* `latex` generates `.tex` files from `.eo` sources
* `fmt` formats `.eo` files in the source directory
* ~~`translate` converts Java/C++/Python/etc. program to EO program~~
* ~~`demu` removes `cage` and `memory` objects~~
* ~~`dejump` removes `goto` objects~~
* ~~`infer` suggests object names where it's possible to infer them~~
* ~~`flatten` moves inner objects to upper level~~

This command line toolkit simply integrates other tools available in
the [@objectionary](https://github.com/objectionary) GitHub organization.

## Linting

There are two ways to work with linting. The `--easy` option enables linting
but ignores warnings, while the `--blind` option completely disables linting.

## How to Test

To execute the project tests, use the following command:

```bash
npx grunt
```

This command will run all the testing steps, including tests, linting,
coverage, and more.
If you only need to run the tests, use:

```bash
npm test
```

To run a specific test based on its description, use the following command:

```bash
npm test -- --grep="<test-description>"
```

For example, to run a test with the description
"formats EO files according to expected patterns," execute:

```bash
npm test -- --grep="formats EO files according to expected patterns"
```

You can also run a specific test file using `npx grunt`:

```bash
npx grunt --file=test/commands/test_fmt.js
```

## How to Contribute

First, run `npm install`.
Make your changes, run [tests](#how-to-test) and then
[make](https://www.yegor256.com/2014/04/15/github-guidelines.html)
a pull request.

[npm]: https://www.npmjs.com/package/eolang
[java-se]: https://www.oracle.com/java/technologies/downloads/
[npm-install]: https://docs.npmjs.com/downloading-and-installing-node-js-and-npm
[dot]: https://en.wikipedia.org/wiki/DOT_%28graph_description_language%29
[blog]: https://www.yegor256.com/2021/10/21/objectionary.html
[Homebrew]: https://brew.sh/
