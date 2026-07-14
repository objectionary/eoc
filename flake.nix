# SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
# SPDX-License-Identifier: MIT
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
        packageJson = builtins.fromJSON (builtins.readFile ./package.json);
        srcPatched = pkgs.runCommand "eoc-src" {} ''
          cp -r ${./.} $out
          chmod -R u+w $out
          ${pkgs.jq}/bin/jq 'del(.engines)' ${./.}/package.json > $out/package.json
        '';
      in {
        packages.default = pkgs.buildNpmPackage {
          pname = packageJson.name;
          version = packageJson.version;
          src = srcPatched;

          npmDeps = pkgs.importNpmLock {
            npmRoot = srcPatched;
          };

          npmConfigHook = pkgs.importNpmLock.npmConfigHook;

          dontNpmBuild = true;

          nativeBuildInputs = [ pkgs.makeWrapper ];

          installPhase = ''
            runHook preInstall
            mkdir -p $out/lib
            cp -r . $out/lib
            makeWrapper ${pkgs.nodejs}/bin/node $out/bin/eoc \
              --add-flags "$out/lib/src/eoc.js" \
              --prefix PATH : ${pkgs.lib.makeBinPath [ pkgs.jdk pkgs.nodejs ]}
            runHook postInstall
          '';

          meta = with pkgs.lib; {
            description = packageJson.description;
            homepage = packageJson.homepage;
            license = licenses.mit;
            mainProgram = "eoc";
          };
        };
      }
    );
}
