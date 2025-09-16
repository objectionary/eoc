#
# SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
# SPDX-License-Identifier: MIT
#

require "language/node"
class Eolang < Formula
  desc "Command-line Tool-Kit"
  homepage "https://github.com/objectionary/eoc"
  url "https://github.com/objectionary/eoc/archive/refs/tags/0.33.0.tar.gz"
  version "0.32.0"
  sha256 "6e01b4d88ba92018c359fa0bffc3a23742610de454107a7605cd2eecb9ba9a33"
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
