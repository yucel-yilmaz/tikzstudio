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

WORKDIR /warmup
COPY docker/compiler/warmup.tex          warmup.tex
COPY docker/compiler/warmup-article.tex  warmup-article.tex
COPY docker/compiler/warmup-beamer.tex   warmup-beamer.tex
COPY docker/compiler/warmup-report.tex   warmup-report.tex
RUN tectonic -X compile --keep-logs warmup.tex         || true \
 && tectonic -X compile --keep-logs warmup-article.tex || true \
 && tectonic -X compile --keep-logs warmup-beamer.tex  || true \
 && tectonic -X compile --keep-logs warmup-report.tex  || true

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
COPY --from=builder /root/.cache/Tectonic /root/.cache/Tectonic
COPY docker/compiler/compile.sh /usr/local/bin/compile.sh

RUN chmod +x /usr/local/bin/compile.sh

WORKDIR /workspace
ENTRYPOINT ["/usr/local/bin/compile.sh"]
