{ pkgs ? import <nixpkgs> {} }:
with pkgs;
let 
 unstableTarball = fetchTarball
    "https://github.com/NixOS/nixpkgs/archive/nixos-unstable.tar.gz";
  unstable = import unstableTarball { };
in mkShell { packages = [ unstable.bun  ]; }
#cargo b --manifest-path=logic/Cargo.toml
