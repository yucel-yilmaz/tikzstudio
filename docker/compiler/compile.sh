#!/bin/sh
set -u

ENGINE="${1:-tectonic}"
MAIN_FILE="${2:-main.tex}"

# The root filesystem is read-only; only /tmp (a small tmpfs) is writable.
#
# Tectonic reads its package cache (warmed at image build time, ~60 MB) in
# place via TECTONIC_CACHE_DIR. It must NOT be copied into /tmp: that would
# fill most of the tmpfs on every compile, for every engine.
export TECTONIC_CACHE_DIR=/opt/tectonic-cache/tectonic
# Fontconfig and other XDG caches get a writable location.
export XDG_CACHE_HOME=/tmp/xdg-cache
# TeX Live's variable tree (luaotfload font database, generated fonts) must
# be writable; seed it with the font database built at image build time.
export TEXMFVAR=/tmp/texmf-var
export TEXMFCACHE=/tmp/texmf-var
mkdir -p "$XDG_CACHE_HOME" "$TEXMFVAR"
if [ -d /opt/texmf-var ]; then
  cp -R /opt/texmf-var/. "$TEXMFVAR/"
fi

TECTONIC_BUNDLE="https://relay.fullyjustified.net/default_bundle_v33.tar"

COMPILE_EXIT=0
COMPILE_TIMEOUT=12    # 3 seconds buffer below Docker timeout (15s)
BIBER_STEP_TIMEOUT=30 # per-step timeout for the 4-pass biber pipeline

case "$ENGINE" in
  tectonic)
    timeout $COMPILE_TIMEOUT tectonic --bundle "$TECTONIC_BUNDLE" --only-cached --keep-logs --outdir /output "$MAIN_FILE" || COMPILE_EXIT=$?
    ;;
  pdflatex)
    timeout $COMPILE_TIMEOUT pdflatex -interaction=nonstopmode -halt-on-error -no-shell-escape -output-directory=/output "$MAIN_FILE" || COMPILE_EXIT=$?
    ;;
  xelatex)
    timeout $COMPILE_TIMEOUT xelatex -interaction=nonstopmode -halt-on-error -no-shell-escape -output-directory=/output "$MAIN_FILE" || COMPILE_EXIT=$?
    ;;
  lualatex)
    timeout $COMPILE_TIMEOUT lualatex -interaction=nonstopmode -halt-on-error -no-shell-escape -output-directory=/output "$MAIN_FILE" || COMPILE_EXIT=$?
    ;;
  pdflatex_biber)
    BASE_NAME_BIBER="$(basename "$MAIN_FILE" .tex)"
    # Pass 1 — generate .bcf and aux files
    timeout $BIBER_STEP_TIMEOUT pdflatex -interaction=nonstopmode -no-shell-escape -output-directory=/output "$MAIN_FILE" || COMPILE_EXIT=$?
    if [ $COMPILE_EXIT -eq 0 ] && [ -f "/output/${BASE_NAME_BIBER}.bcf" ]; then
      # Biber pass — process bibliography
      timeout $BIBER_STEP_TIMEOUT biber --input-directory=/output --output-directory=/output "$BASE_NAME_BIBER" || true
      # Pass 2 — incorporate bibliography
      timeout $BIBER_STEP_TIMEOUT pdflatex -interaction=nonstopmode -no-shell-escape -output-directory=/output "$MAIN_FILE" || COMPILE_EXIT=$?
      # Pass 3 — resolve cross-references
      timeout $BIBER_STEP_TIMEOUT pdflatex -interaction=nonstopmode -halt-on-error -no-shell-escape -output-directory=/output "$MAIN_FILE" || COMPILE_EXIT=$?
    fi
    ;;
  *)
    echo "Unsupported engine: $ENGINE" >&2
    exit 2
    ;;
esac

BASE_NAME="$(basename "$MAIN_FILE" .tex)"
if [ -f "/output/${BASE_NAME}.pdf" ] && [ "/output/${BASE_NAME}.pdf" != "/output/output.pdf" ]; then
  cp "/output/${BASE_NAME}.pdf" /output/output.pdf
fi

if [ -f /output/output.pdf ]; then
  pdf2svg /output/output.pdf /output/output.svg || true
  pdftoppm -r 300 -png -f 1 -l 1 -singlefile /output/output.pdf /output/output || true
fi

if [ -f "/output/${BASE_NAME}.log" ] && [ "/output/${BASE_NAME}.log" != "/output/compile.log" ]; then
  cp "/output/${BASE_NAME}.log" /output/compile.log
fi

# Always print the detailed LaTeX log so the frontend parser can extract `l.<N>`
# indicators even when the engine failed.
LOG_FILE="/output/${BASE_NAME}.log"
if [ -f "$LOG_FILE" ]; then
  cat "$LOG_FILE"
fi

exit "$COMPILE_EXIT"
