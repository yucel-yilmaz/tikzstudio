#!/bin/sh
set -u

ENGINE="${1:-tectonic}"
MAIN_FILE="${2:-main.tex}"

# Reuse the cache warmed at image build time, but move it into a writable runtime cache
# so Tectonic and Fontconfig can both work without noisy cache warnings.
export XDG_CACHE_HOME=/tmp/xdg-cache
mkdir -p "$XDG_CACHE_HOME"

if [ ! -d "$XDG_CACHE_HOME/Tectonic" ] && [ -d /root/.cache/Tectonic ]; then
  cp -R /root/.cache/Tectonic "$XDG_CACHE_HOME/Tectonic"
fi

TECTONIC_BUNDLE="https://relay.fullyjustified.net/default_bundle_v33.tar.index.gz"

COMPILE_EXIT=0
case "$ENGINE" in
  tectonic)
    tectonic -X compile --web-bundle "$TECTONIC_BUNDLE" --only-cached --keep-logs --outdir /output --untrusted "$MAIN_FILE" || COMPILE_EXIT=$?
    ;;
  pdflatex)
    pdflatex -interaction=nonstopmode -halt-on-error -no-shell-escape -output-directory=/output "$MAIN_FILE" || COMPILE_EXIT=$?
    ;;
  xelatex)
    xelatex -interaction=nonstopmode -halt-on-error -no-shell-escape -output-directory=/output "$MAIN_FILE" || COMPILE_EXIT=$?
    ;;
  lualatex)
    lualatex -interaction=nonstopmode -halt-on-error -no-shell-escape -output-directory=/output "$MAIN_FILE" || COMPILE_EXIT=$?
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
