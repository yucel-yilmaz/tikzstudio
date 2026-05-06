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
RUN printf '\\documentclass[tikz,border=10pt]{standalone}\n\\usepackage{amsmath}\n\\usepackage{tikz}\n\\begin{document}\n\\begin{tikzpicture}\n  \\node[draw, circle] (a) at (0,0) {$A_i$};\n  \\node[draw, circle] (b) at (2,1) {$B^2$};\n  \\draw[->] (a) -- node[above] {$\\alpha + \\beta$} (b);\n\\end{tikzpicture}\n\\[\n  \\int_0^1 x^2\\,dx = \\frac{1}{3}\n\\]\n\\end{document}\n' > main.tex \
  && tectonic -X compile --keep-logs main.tex

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
