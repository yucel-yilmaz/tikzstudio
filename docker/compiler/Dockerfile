FROM rust:1.87-bookworm AS builder

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    pkg-config \
    libfontconfig1-dev \
    libfreetype6-dev \
    libgraphite2-dev \
    libharfbuzz-dev \
    libicu-dev \
    libssl-dev \
    zlib1g-dev \
  && rm -rf /var/lib/apt/lists/*

RUN cargo install tectonic

# Pre-download packages by compiling representative documents.
# Using an explicit bundle URL so the cache is keyed to that URL,
# which must match the URL used in compile.sh at runtime.
ENV TECTONIC_BUNDLE=https://relay.fullyjustified.net/default_bundle_v33.tar
ENV XDG_CACHE_HOME=/opt/tectonic-cache

WORKDIR /warmup
COPY docker/compiler/warmup.tex          warmup.tex
COPY docker/compiler/warmup-article.tex  warmup-article.tex
COPY docker/compiler/warmup-beamer.tex   warmup-beamer.tex
COPY docker/compiler/warmup-report.tex   warmup-report.tex

RUN mkdir -p "$XDG_CACHE_HOME" \
 && tectonic --bundle "$TECTONIC_BUNDLE" --keep-logs warmup.tex \
 && tectonic --bundle "$TECTONIC_BUNDLE" --keep-logs warmup-article.tex \
 && tectonic --bundle "$TECTONIC_BUNDLE" --keep-logs warmup-beamer.tex \
 && tectonic --bundle "$TECTONIC_BUNDLE" --keep-logs warmup-report.tex

FROM debian:bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    ca-certificates \
    fontconfig \
    libfreetype6 \
    libgraphite2-3 \
    libharfbuzz0b \
    libicu72 \
    libssl3 \
    pdf2svg \
  && rm -rf /var/lib/apt/lists/*

COPY --from=builder /usr/local/cargo/bin/tectonic /usr/local/bin/tectonic
COPY --from=builder /opt/tectonic-cache /opt/tectonic-cache
COPY docker/compiler/compile.sh /usr/local/bin/compile.sh

RUN chmod +x /usr/local/bin/compile.sh

WORKDIR /workspace
ENTRYPOINT ["/usr/local/bin/compile.sh"]
