FROM rust:1.88-bookworm AS builder

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

# Pin the version and use the crate's own Cargo.lock so new transitive releases
# (which may require a newer rustc) cannot break the image build.
ARG TECTONIC_VERSION=0.17.0
RUN cargo install tectonic --version "${TECTONIC_VERSION}" --locked

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
COPY docker/compiler/warmup-turkish.tex  warmup-turkish.tex
COPY docker/compiler/warmup-math.tex     warmup-math.tex
COPY docker/compiler/warmup-sizes-body.tex warmup-sizes-body.tex
COPY docker/compiler/warmup-sizes-10pt.tex warmup-sizes-10pt.tex
COPY docker/compiler/warmup-sizes-12pt.tex warmup-sizes-12pt.tex

RUN mkdir -p "$XDG_CACHE_HOME" \
 && tectonic --bundle "$TECTONIC_BUNDLE" --keep-logs warmup.tex \
 && tectonic --bundle "$TECTONIC_BUNDLE" --keep-logs warmup-article.tex \
 && tectonic --bundle "$TECTONIC_BUNDLE" --keep-logs warmup-beamer.tex \
 && tectonic --bundle "$TECTONIC_BUNDLE" --keep-logs warmup-report.tex \
 && tectonic --bundle "$TECTONIC_BUNDLE" --keep-logs warmup-turkish.tex \
 && tectonic --bundle "$TECTONIC_BUNDLE" --keep-logs warmup-math.tex \
 && tectonic --bundle "$TECTONIC_BUNDLE" --keep-logs warmup-sizes-10pt.tex \
 && tectonic --bundle "$TECTONIC_BUNDLE" --keep-logs warmup-sizes-12pt.tex

# Compile every official template (written by `npm run warmup:sync`) so all
# packages they use are cached. Each template's main file is main.tex.
COPY docker/compiler/warmup-templates /warmup/templates
RUN for dir in /warmup/templates/*/; do \
      (cd "$dir" && tectonic --bundle "$TECTONIC_BUNDLE" main.tex) || exit 1; \
    done

FROM debian:bookworm-slim

RUN apt-get update \
  && apt-get upgrade -y \
  && apt-get install -y --no-install-recommends \
    ca-certificates \
    fontconfig \
    libfreetype6 \
    libgraphite2-3 \
    libharfbuzz0b \
    libicu72 \
    libssl3 \
    pdf2svg \
    texlive-latex-base \
    texlive-latex-recommended \
    texlive-latex-extra \
    texlive-fonts-recommended \
    texlive-xetex \
    texlive-luatex \
    texlive-bibtex-extra \
    biber \
    texlive-science \
    texlive-pictures \
    texlive-lang-european \
    poppler-utils \
  && rm -rf /var/lib/apt/lists/*

# Prebuild luaotfload's font database so LuaLaTeX does not rebuild it (or fail
# for lack of a writable cache) on every compile; compile.sh copies this
# small tree (~40 KB) into the writable TEXMFVAR.
RUN TEXMFVAR=/opt/texmf-var TEXMFCACHE=/opt/texmf-var luaotfload-tool --update \
 && chmod -R a+rX /opt/texmf-var

COPY --from=builder /usr/local/cargo/bin/tectonic /usr/local/bin/tectonic
COPY --from=builder /opt/tectonic-cache /opt/tectonic-cache
COPY docker/compiler/compile.sh /usr/local/bin/compile.sh

RUN chmod +x /usr/local/bin/compile.sh

WORKDIR /workspace
ENTRYPOINT ["/usr/local/bin/compile.sh"]
