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
        eoc = pkgs.stdenv.mkDerivation {
          pname = "eolang";
          version = "0.0.0";

          src = ./.;

          nativeBuildInputs = [ pkgs.nodejs_24 pkgs.makeWrapper ];

          buildPhase = ''
            mkdir -p $out/lib/node_modules/eolang
            cp -r ./* $out/lib/node_modules/eolang
            cd $out/lib/node_modules/eolang
            npm install --omit=dev --ignore-scripts
          '';

          installPhase = ''
            mkdir -p $out/bin
            ${pkgs.makeWrapper}/bin/makeWrapper \
              $out/lib/node_modules/eolang/src/eoc.js \
              $out/bin/eoc \
              --set NODE_PATH $out/lib/node_modules
          '';

          meta = with pkgs.lib; {
            description = "Command-line toolkit for parsing, compiling, transpiling, optimizing, linking, dataizing, and running EOLANG programs";
            license = licenses.mit;
            maintainers = with maintainers; [ yourGitHubNick ];
          };
        };
      in
      {
        packages = {
          eoc = eoc;
        };
        defaultPackage = eoc;
      }
    );
}

