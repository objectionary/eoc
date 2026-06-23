# EOLANG Command Line Tool-Kit

[![EO principles respected here](https://www.elegantobjects.org/badge.svg)](https://www.elegantobjects.org)
[![We recommend IntelliJ IDEA](https://www.elegantobjects.org/intellij-idea.svg)](https://www.jetbrains.com/idea/)

[![grunt](https://github.com/objectionary/eoc/actions/workflows/grunt.yml/badge.svg)](https://github.com/objectionary/eoc/actions/workflows/grunt.yml)
[![node-current](https://img.shields.io/node/v/eolang)](https://www.npmjs.com/package/eolang)
[![PDD status](https://www.0pdd.com/svg?name=objectionary/eoc)](https://www.0pdd.com/p?name=objectionary/eoc)
[![codecov](https://codecov.io/gh/objectionary/eoc/branch/master/graph/badge.svg)](https://codecov.io/gh/objectionary/eoc)
[![Hits-of-Code](https://hitsofcode.com/github/objectionary/eoc)](https://hitsofcode.com/view/github/objectionary/eoc)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/objectionary/eoc/blob/master/LICENSE.txt)
[![Release](https://img.shields.io/github/v/release/objectionary/eoc.svg)](https://github.com/objectionary/eoc/releases/tag/0.34.1)

This is a command-line tool-kit for [EO](https://www.eolang.org)
programming languages, allowing you to compile EO programs, test, dataize,
and check for errors.

First, you install [npm][npm-install] and [Java SE][java-se].

Then, you install [eolang][npm] package, using [npm][npm-install]:

```bash
npm install -g eolang@0.35.2
```

You can also use [Homebrew] (on macOS):

```bash
brew tap objectionary/eoc https://github.com/objectionary/eoc
brew install objectionary/eoc/eolang@0.35.2
```

Or install it via [Nix flakes](https://nixos.wiki/wiki/Flakes):

```bash
nix run github:objectionary/eoc
```

<details>

<summary>You can also include EOLANG in your own flake</summary>

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

</details>

Then, you write a simple [EO](https://www.eolang.org) program in `hello.eo` file
in the current directory:

```eo
# My first object in EO!
[args] > hello
  io.stdout > @
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

<!-- BEGIN COMMANDS SECTION -->
* `audit` Inspect all packages and report their status
* `foreign` Inspect and print the list of foreign objects
* `clean` Delete all temporary files
* `register` Register all visible EO source files
* `parse` Parse EO files into XMIR
* `assemble` Parse EO files into XMIR and join them with required dependencies
* `print` Generate EO files from XMIR files
* `lint` Lint XMIR files and fail if any issues inside
* `resolve` Resolve all the dependencies required for compilation
* `transpile` Convert EO files into target language
* `compile` Compile target language sources into binaries
* `link` Link together all binaries into a single executable binary
* `dataize` Run the single executable binary and dataize an object
* `test` Run all visible unit tests
* `docs` Generate documentation from XMIR files
* `generate_comments` Generate documentation with LLM
* `jeo:disassemble` Disassemble .class files to .xmir files
* `jeo:assemble` Assemble .xmir files to .class files
* `latex` Generate LaTeX files from EO sources
* `normalize` Normalize EO files using phi-calculus normalization via phino
* `fmt` Format EO files in the source directory
<!-- END COMMANDS SECTION -->

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
[blog]: https://www.yegor256.com/2021/10/21/objectionary.html
[Homebrew]: https://brew.sh/
