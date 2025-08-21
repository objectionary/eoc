#
# SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
# SPDX-License-Identifier: MIT
#

require "language/node"
class Eolang < Formula
  desc "Command-line Tool-Kit"
  homepage "https://github.com/objectionary/eoc"
  url "https://github.com/objectionary/eoc/archive/refs/tags/0.31.0.tar.gz"
  version "0.31.0"
  sha256 "d9238aae0d3911a3bc13c35a9351ba600ee4952f9cc36227242b5fa113ea4ebf"
  license "MIT"

  depends_on "node"

  def install
    system "npm", "install", *std_npm_args
    bin.install_symlink Dir["#{libexec}/bin/*"]
  end

  test do
    system "#{bin}/eoc", "--version"
  end
end
