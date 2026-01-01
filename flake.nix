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
        srcPatched = pkgs.runCommand "patched-src" {} ''
          cp -r ${./.} $out
          substituteInPlace $out/package.json \
            --replace-quiet "\"node\": \"^25.0.0\"," ""
        '';
        lockHash = builtins.hashFile "sha512" ./package-lock.json;
        packageJson = builtins.fromJSON (builtins.readFile ./package.json);
        eolangBase = pkgs.buildNpmPackage {
          pname = packageJson.name;
          version = packageJson.version;
          src = srcPatched;

          buildInputs = [ pkgs.nodejs ];
          dontNpmBuild = true;

          installPhase = ''
            mkdir -p $out/lib
            cp -r . $out/lib
            mkdir -p $out/bin
            ln -s $out/lib/src/eoc.js $out/bin/eoc
            chmod +x $out/bin/eoc
          '';

          npmDeps = pkgs.importNpmLock {
            npmRoot = srcPatched;
          };

          npmConfigHook = pkgs.importNpmLock.npmConfigHook;

          meta = with pkgs.lib; {
            description = packageJson.description;
            homepage = packageJson.homepage;
            license = licenses.mit;
            author = packageJson.author;
          };
        };

        eolangWrapped = pkgs.writeShellScriptBin "eoc" ''
          set -euo pipefail

          EOC_STORE="${eolangBase}/lib"
          EOC_STATE="$HOME/.eoc/lib"
          EOC_HASH="${lockHash}"

          mkdir -p "$EOC_STATE"

          if [ ! -f "$EOC_STATE/.hash" ] || [ "$(cat $EOC_STATE/.hash)" != "$EOC_HASH" ]; then
            rm -rf "$EOC_STATE/"
            cp -r "$EOC_STORE/" "$EOC_STATE/"
            chmod -R 755 "$EOC_STATE/"
            echo "$EOC_HASH" > "$EOC_STATE/.hash"
          fi

          exec "${pkgs.nodejs}/bin/node" "$EOC_STATE/src/eoc.js" "$@"
        '';

      in {
        packages.default = eolangWrapped;
        meta = with pkgs.lib; {
          description = packageJson.description;
          homepage = packageJson.homepage;
          license = licenses.mit;
          author = packageJson.author;
        };
      }
    );
}
