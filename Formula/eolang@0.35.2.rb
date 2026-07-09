#
# SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
# SPDX-License-Identifier: MIT
#

require "language/node"
class EolangAT0360 < Formula
  desc "Command-line Tool-Kit"
  homepage "https://github.com/objectionary/eoc"
  url "https://github.com/objectionary/eoc/archive/refs/tags/0.35.2.tar.gz"
  version "0.35.2"
  sha256 "436b27218fb5acc48bbc56ecd8d6c5c9b4592fa19735e75515e21297938dc7de"
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
