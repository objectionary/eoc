{
  description = "Command-line toolkit for parsing, compiling, transpiling, optimizing, linking, dataizing, and running EOLANG programs";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.05";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
        node2nixPkgs = pkgs.callPackage ./nix/default.nix { src = ./.; };
        eocPackage = node2nixPkgs.package;
      in
      {
        packages.eoc = eocPackage;

        # опционально — приложение (bin)
        apps.eoc = {
          type = "app";
          program = "${eocPackage}/bin/eoc";
        };

        defaultPackage = eocPackage;
        defaultApp = self.apps.eoc;
      }
    );
}

