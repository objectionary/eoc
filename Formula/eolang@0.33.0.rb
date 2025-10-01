#
# SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
# SPDX-License-Identifier: MIT
#

require "language/node"
class Eolang < Formula
  desc "Command-line Tool-Kit"
  homepage "https://github.com/objectionary/eoc"
  url "https://github.com/objectionary/eoc/archive/refs/tags/0.33.1.tar.gz"
  version "0.33.0"
  sha256 "ba76c6b5e63db422777583bcf09020683ebfbe59b28bc949df5e178c1756a1f4"
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
