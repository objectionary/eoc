#
# SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
# SPDX-License-Identifier: MIT
#

require "language/node"
class Eolang < Formula
  desc "Command-line Tool-Kit"
  homepage "https://github.com/objectionary/eoc"
  url "https://github.com/objectionary/eoc/archive/refs/tags/0.34.0.tar.gz"
  version "0.32.1"
  sha256 "d29276ab1c51ac3195fd10fb9578c86851bfc2f49a3a6cce6c2d1c3adb72e7aa"
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
