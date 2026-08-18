#!/usr/bin/env bash
set -euo pipefail

export NEXT_PUBLIC_BASE_PATH="${NEXT_PUBLIC_BASE_PATH:-/index}"

npm run build

test -d out
touch out/.nojekyll

if [ -n "${GITHUB_ACTIONS:-}" ]; then
  test -n "${GITHUB_TOKEN:-}"
  test -n "${GITHUB_REPOSITORY:-}"

  git remote set-url origin \
    "https://git:${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}.git"
fi

npx --no-install gh-pages \
  -d out \
  -b gh-pages \
  -t \
  -u "github-actions-bot <support+actions@github.com>"

