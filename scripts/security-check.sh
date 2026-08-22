#!/usr/bin/env bash
set -euo pipefail

fail() {
  printf 'Security check failed: %s\n' "$1" >&2
  exit 1
}

tracked_env_files="$({ git ls-files '.env*' || true; } | grep -v '^.env.example$' || true)"
test -z "$tracked_env_files" || fail "a local environment file is tracked"

sensitive_names="$({ git ls-files || true; } | grep -Ei '(^|/)(credentials|secrets?)\.json$|\.(pem|key|p12|pfx|jks|keystore|sqlite|sqlite3|db|dump|backup)$' || true)"
test -z "$sensitive_names" || fail "a credential, key, database, or backup file is tracked"

revealing_photo_names="$(find public/img/industrial -maxdepth 1 -type f -iname 'WhatsApp Image*' -print -quit 2>/dev/null || true)"
test -z "$revealing_photo_names" || fail "an industrial photo still exposes its original WhatsApp timestamp"

secret_patterns='AKIA[0-9A-Z]{16}|gh[pousr]_[0-9A-Za-z]{20,}|github_pat_[0-9A-Za-z_]{20,}|sb_secret_[0-9A-Za-z_-]{20,}|-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----'
secret_matches="$(git grep -Il -E "$secret_patterns" -- . ':(exclude)scripts/security-check.sh' || true)"
test -z "$secret_matches" || fail "a probable secret appears in tracked text"

if [ -d out ]; then
  public_sensitive="$(find out -type f \( -name '.env*' -o -name '*.pem' -o -name '*.key' -o -name '*.p12' -o -name '*.pfx' -o -name '*.sqlite*' -o -name '*.db' -o -name '*.dump' -o -name '*.backup' \) -print -quit)"
  test -z "$public_sensitive" || fail "the Pages artifact contains a sensitive file type"

  public_link="$(find out -type l -print -quit)"
  test -z "$public_link" || fail "the Pages artifact contains a symbolic link"
fi

printf 'Security checks passed.\n'
