First, you install [cargo](https://doc.rust-lang.org/cargo/getting-started/installation.html).

Then, you install [eoc](https://crates.io/crates/eoc):

```
$ cargo install eoc
```

Then, you write a [EO](https://www.eolang.org) program in a few `.eo` files
in the current directory.

Then, for example, you compile it to Java and run:

```
$ eoc compile run
```

That's it.

You can also do many other things with `eoc` commands:

  * `parse` converts EO program to XMIR files
  * `optimize` reorganizes XMIR files and prepares them for transpilation
  * `demu` removes `cage` and `memory` objects
  * `dejump` removes `goto` objects
  * `infer` suggests object names where it's possible to infer them
  * `flatten` moves inner objects to upper level
  * `transpile` converts XMIR to target programming language
  * `compile` converts target language to binaries
  * `run` executes the binaries

This command line toolkit integrates other tools available in
this GitHub organization, such as:

  * `eo-parser.java`
  * `eo-cli.java`
  * `phimu.rust`

There will be more...
