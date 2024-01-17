{ pkgs ? import <nixpkgs> {} }:
with pkgs;
let 
in mkShell { packages = [ nodePackages_latest.pnpm nodejs_latest ]; }
