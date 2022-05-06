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
  * `transpile` converts XMIR to target programming language
  * `compile` converts target language to binaries
  * `run` executes the binaries

There will be more.