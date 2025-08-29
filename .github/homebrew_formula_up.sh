#!/usr/bin/env bash

# SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
# SPDX-License-Identifier: MIT

set -euo pipefail

GITHUB_REPO="objectionary/eoc"
FORMULA_DIR="Formula"

GITHUB_TOKEN="${1:-}"
TAG_VERSION="${2:-}"

if [ -z "$GITHUB_TOKEN" ]; then
  echo "Error: GitHub token must be provided as the first argument." >&2
  exit 1
fi

if [ -z "$TAG_VERSION" ]; then
  echo "Error: Tag version must be provided as the second argument." >&2
  exit 1
fi

VERSION="${TAG_VERSION#v}"

ORIG_FORMULA="$FORMULA_DIR/eolang.rb"
if [ ! -f "$ORIG_FORMULA" ]; then
  echo "Original formula file $ORIG_FORMULA not found." >&2
  exit 1
fi

ORIG_VERSION=$(grep '^  version "' "$ORIG_FORMULA" | sed -E 's/  version "([^"]+)"/\1/')
FORMULA_FILE_PREV="$FORMULA_DIR/eolang@${ORIG_VERSION}.rb"

if [ -f "$FORMULA_FILE_PREV" ]; then
  echo "$FORMULA_FILE_PREV already exists, not renaming."
else
  cp "$ORIG_FORMULA" "$FORMULA_FILE_PREV"
  echo "Copied $ORIG_FORMULA to $FORMULA_FILE_PREV"
fi

TARBALL_URL="https://github.com/${GITHUB_REPO}/archive/refs/tags/${TAG_VERSION}.tar.gz"

curl -L -o "/tmp/eolang-${VERSION}.tar.gz" "$TARBALL_URL"
SHA256=$(shasum -a 256 "/tmp/eolang-${VERSION}.tar.gz" | awk '{print $1}')

sed -i \
  -e "s|url \".*\"|url \"$TARBALL_URL\"|" \
  -e "s/version \".*\"/version \"$VERSION\"/" \
  -e "s/sha256 \".*\"/sha256 \"$SHA256\"/" \
  "$ORIG_FORMULA"

echo "Created $ORIG_FORMULA and archived previous as $FORMULA_FILE_PREV"
