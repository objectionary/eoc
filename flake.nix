{
  description = "Command-line toolkit for parsing, compiling, transpiling, optimizing, linking, dataizing, and running EOLANG programs";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.05";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
        package = pkgs.buildNpmPackage {
          pname = "eolang";
          version = "0.33.3";
          src = ./.;

          postPatch = ''
            substituteInPlace package.json \
              --replace "\"node\": \"^25.0.0\"," ""
          '';
          buildInputs = [ pkgs.nodejs ];

          dontNpmBuild = true;

          installPhase = ''
            mkdir -p $out/bin
            cp -r . $out/lib

            ln -s $out/lib/src/eoc.js $out/bin/eoc
            chmod +x $out/bin/eoc
            '';

          npmDepsHash = "sha256-lbVR20QXXcOGphDcOyXmMOfr8fh/V3/E0nvXInMvLfE=";
        };
      in {
        packages.default = package;
      });
}

