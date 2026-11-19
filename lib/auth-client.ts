"use client";

import { createAuthClient } from "better-auth/react";

// better-auth requires an absolute base URL. The auth API is served from the
// same origin as the app, so derive it from the page location. The client is
// only used from event handlers, which never run during server rendering.
export function getAuthClient() {
	return createAuthClient({
		baseURL: `${window.location.origin}/api/auth`,
	});
}
