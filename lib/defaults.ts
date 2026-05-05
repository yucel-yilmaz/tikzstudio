export const DEFAULT_MAIN_FILE_PATH = "main.tex";

export const DEFAULT_PROJECT_SOURCE = String.raw`\documentclass[tikz,border=10pt]{standalone}
\usepackage{tikz}

\begin{document}

\begin{tikzpicture}
  \draw[->] (0,0) -- (3,0);
  \node at (1.5,0.3) {Hello TikZ};
\end{tikzpicture}

\end{document}
`;

export const SIDEBAR_TABS = ["files", "templates", "snippets", "settings"] as const;

export const COMPILE_TERMINAL_STATUSES = ["SUCCESS", "FAILED", "TIMEOUT"] as const;
