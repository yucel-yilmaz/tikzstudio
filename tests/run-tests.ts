import assert from "node:assert/strict";

import { inferCompileErrorCode } from "../server/compiler/parser.ts";
import { compileProjectSchema, createProjectSchema } from "../server/schemas/project.ts";

function run(name: string, fn: () => void) {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

run("inferCompileErrorCode maps timeouts", () => {
  assert.equal(inferCompileErrorCode("Compilation timed out."), "TIMEOUT");
});

run("inferCompileErrorCode maps missing files", () => {
  assert.equal(inferCompileErrorCode("No file missing.tex."), "MISSING_FILE");
});

run("inferCompileErrorCode maps latex syntax errors", () => {
  assert.equal(
    inferCompileErrorCode("! LaTeX Error: Missing \\begin{document}."),
    "LATEX_SYNTAX_ERROR",
  );
});

run("createProjectSchema accepts a valid payload", () => {
  const parsed = createProjectSchema.parse({
    title: "Geometry Diagram",
    description: "Triangle notes",
  });

  assert.equal(parsed.title, "Geometry Diagram");
});

run("compileProjectSchema defaults compile engine to tectonic", () => {
  const parsed = compileProjectSchema.parse({});

  assert.equal(parsed.engine, "TECTONIC");
});
