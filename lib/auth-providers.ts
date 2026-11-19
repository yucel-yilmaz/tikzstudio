import { env } from "@/lib/env";

export type SocialProviderId = "github" | "google";

/**
 * OAuth providers are opt-in: a provider is enabled only when both its client
 * id and secret are configured. Shared by the auth config and the login UI so
 * buttons are never shown for a provider the server cannot handle.
 */
export function getSocialProviderConfig() {
	return {
		...(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET
			? {
					github: {
						clientId: env.GITHUB_CLIENT_ID,
						clientSecret: env.GITHUB_CLIENT_SECRET,
					},
				}
			: {}),
		...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
			? {
					google: {
						clientId: env.GOOGLE_CLIENT_ID,
						clientSecret: env.GOOGLE_CLIENT_SECRET,
					},
				}
			: {}),
	};
}

export function getEnabledSocialProviders(): SocialProviderId[] {
	return Object.keys(getSocialProviderConfig()) as SocialProviderId[];
}
