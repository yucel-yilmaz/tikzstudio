import { env } from "@/lib/env";

export type Img2LatexProvider = "docker" | "pix2tex" | "mathpix";

const LABELS: Record<Img2LatexProvider, string> = {
	docker: "Docker Model Runner",
	pix2tex: "pix2tex",
	mathpix: "Mathpix",
};

export function isImg2LatexProviderConfigured(provider: Img2LatexProvider) {
	switch (provider) {
		case "docker":
			return Boolean(env.DOCKER_MODEL_RUNNER_URL);
		case "pix2tex":
			return Boolean(env.PIX2TEX_URL);
		case "mathpix":
			return Boolean(env.MATHPIX_APP_ID && env.MATHPIX_APP_KEY);
	}
}

/**
 * Providers this server is configured for. The editor hides the
 * "Görselden LaTeX'e" button when the list is empty.
 */
export function listImg2LatexProviders() {
	return (Object.keys(LABELS) as Img2LatexProvider[])
		.filter(isImg2LatexProviderConfigured)
		.map((id) => ({ id, label: LABELS[id] }));
}

export function isImg2LatexProvider(
	value: unknown,
): value is Img2LatexProvider {
	return typeof value === "string" && value in LABELS;
}
