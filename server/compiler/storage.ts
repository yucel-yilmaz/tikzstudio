import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

export function getArtifactRoot() {
  return path.join(process.cwd(), ".data", "compile-artifacts");
}

export function getArtifactDir(jobId: string) {
  return path.join(getArtifactRoot(), jobId);
}

export function getArtifactPdfPath(jobId: string) {
  return path.join(getArtifactDir(jobId), "output.pdf");
}

export function getArtifactSvgPath(jobId: string) {
  return path.join(getArtifactDir(jobId), "output.svg");
}

export async function saveCompileOutput(jobId: string, output: Buffer) {
  const dir = getArtifactDir(jobId);
  await mkdir(dir, { recursive: true });
  await writeFile(getArtifactPdfPath(jobId), output);
}

export async function saveCompileSvgOutput(jobId: string, output: Buffer) {
  const dir = getArtifactDir(jobId);
  await mkdir(dir, { recursive: true });
  await writeFile(getArtifactSvgPath(jobId), output);
}

export async function readCompileOutput(jobId: string) {
  return readFile(getArtifactPdfPath(jobId));
}

export async function readCompileSvgOutput(jobId: string) {
  return readFile(getArtifactSvgPath(jobId));
}

export async function removeCompileOutput(jobId: string) {
  await rm(getArtifactDir(jobId), { recursive: true, force: true });
}
