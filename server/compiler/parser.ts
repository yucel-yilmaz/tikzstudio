import type { AppErrorCode } from "@/lib/errors";

export function inferCompileErrorCode(log: string): AppErrorCode {
  if (/timed out|timeout/i.test(log)) {
    return "TIMEOUT";
  }

  if (/shell escape|security|not allowed/i.test(log)) {
    return "SECURITY_BLOCKED";
  }

  if (/No file .*|not found/i.test(log)) {
    return "MISSING_FILE";
  }

  if (/Package .* Error|LaTeX Error/i.test(log)) {
    return "LATEX_SYNTAX_ERROR";
  }

  if (/bundle.*not found|package .* not found|missing package/i.test(log)) {
    return "MISSING_PACKAGE";
  }

  return "UNKNOWN_ERROR";
}
