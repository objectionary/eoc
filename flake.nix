{
  description = "Command-line toolkit for parsing, compiling, transpiling, optimizing, linking, dataizing, and running EOLANG programs";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.05";
  };

  outputs = { self, nixpkgs }:
    let
      systems = [ "x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin" "x86_64-windows" ];
      forAllSystems = nixpkgs.lib.genAttrs systems;
    in
    {
      packages = forAllSystems (system:
        let
          pkgs = import nixpkgs { inherit system; };
          eoc = pkgs.stdenv.mkDerivation {
            pname = "eoc";
            version = "latest";
            src = ./.; 

            nativeBuildInputs = [ pkgs.nodejs pkgs.npm ];

            buildPhase = ''
              echo "Installing eoc dependencies..."
              npm install
            '';

            installPhase = ''
              mkdir -p $out/bin
              npm install -g . --prefix $out
            '';

            meta = with pkgs.lib; {
              description = "Command-line toolkit for parsing, compiling, transpiling, optimizing, linking, dataizing, and running EOLANG programs";
              homepage = "https://github.com/objectionary/eoc";
              license = licenses.mit;
              platforms = platforms.all;
            };
          };
        in {
          default = eoc;
        }
      );

      apps = forAllSystems (system: {
        type = "app";
        program = "${self.packages.${system}.default}/bin/eoc";
      });

      defaultPackage = forAllSystems (system: self.packages.${system}.default);
      defaultApp = forAllSystems (system: self.apps.${system});
    };
}

