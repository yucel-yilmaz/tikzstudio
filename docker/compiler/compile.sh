#!/bin/sh
set -u

ENGINE="${1:-tectonic}"
MAIN_FILE="${2:-main.tex}"

# Reuse the cache warmed at image build time, but move it into a writable runtime cache
# so Tectonic and Fontconfig can both work without noisy cache warnings.
export XDG_CACHE_HOME=/tmp/xdg-cache
mkdir -p "$XDG_CACHE_HOME"

if [ -d /opt/tectonic-cache ]; then
  cp -R /opt/tectonic-cache/. "$XDG_CACHE_HOME/"
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
