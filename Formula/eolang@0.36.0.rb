#
# SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
# SPDX-License-Identifier: MIT
#

require "language/node"
class EolangAT0371 < Formula
  desc "Command-line Tool-Kit"
  homepage "https://github.com/objectionary/eoc"
  url "https://github.com/objectionary/eoc/archive/refs/tags/0.36.0.tar.gz"
  version "0.36.0"
  sha256 "2f33d115c6a8a2e203a440c50f59380166fdd56eea6cd73a7bfd96fc4ed0782d"
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
