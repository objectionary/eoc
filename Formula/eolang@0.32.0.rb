#
# SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
# SPDX-License-Identifier: MIT
#

require "language/node"
class Eolang < Formula
  desc "Command-line Tool-Kit"
  homepage "https://github.com/objectionary/eoc"
  url "https://github.com/objectionary/eoc/archive/refs/tags/0.33.3.tar.gz"
  version "0.32.0"
  sha256 "69054081fcc09f2efca424770a098acb19261e8a3c5b237e0dd66cfbd9e21bc9"
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
