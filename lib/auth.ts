import { prismaAdapter } from "@better-auth/prisma-adapter";
import { betterAuth } from "better-auth";
import { createAuthMiddleware, isAPIError } from "better-auth/api";

import { getSocialProviderConfig } from "@/lib/auth-providers";
import {
	passwordChangedEmail,
	resetPasswordEmail,
	verificationEmail,
} from "@/lib/emails";
import { env } from "@/lib/env";
import { requiresEmailVerification, sendMail } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";
import { removeUserTemplatePreviews } from "@/server/services/template-previews";

const requireEmailVerification = requiresEmailVerification();

export const auth = betterAuth({
	secret: env.BETTER_AUTH_SECRET,
	baseURL: env.BETTER_AUTH_URL,
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	emailAndPassword: {
		enabled: true,
		// With verification required, sign-up must not create a session.
		autoSignIn: !requireEmailVerification,
		requireEmailVerification,
		minPasswordLength: 8,
		resetPasswordTokenExpiresIn: 60 * 60,
		revokeSessionsOnPasswordReset: true,
		sendResetPassword: async ({ user, url }) => {
			await sendMail(resetPasswordEmail(user, url));
		},
		onPasswordReset: async ({ user }) => {
			await sendMail(passwordChangedEmail(user));
		},
	},
	emailVerification: {
		sendOnSignUp: true,
		sendOnSignIn: requireEmailVerification,
		autoSignInAfterVerification: true,
		expiresIn: 60 * 60 * 24,
		sendVerificationEmail: async ({ user, url }) => {
			await sendMail(verificationEmail(user, url));
		},
	},
	socialProviders: getSocialProviderConfig(),
	hooks: {
		// Notify the owner when the password is changed from the account page
		// (resets are covered by onPasswordReset), so a hijacked session that
		// changes the password does not go unnoticed.
		after: createAuthMiddleware(async (ctx) => {
			if (ctx.path !== "/change-password") return;
			const returned = ctx.context.returned;
			if (!returned || isAPIError(returned) || returned instanceof Error)
				return;
			const user = (returned as { user?: { email: string; name?: string } })
				.user;
			if (!user?.email) return;
			await sendMail(
				passwordChangedEmail(user, {
					otherSessionsRevoked: Boolean(
						(ctx.body as { revokeOtherSessions?: boolean } | undefined)
							?.revokeOtherSessions,
					),
				}),
			).catch((error) => {
				console.error("[auth] password change notice failed:", error);
			});
		}),
	},
	// Limits are per client IP. A whole classroom often shares one school IP
	// (NAT), so sign-in/sign-up allow a class signing in together while still
	// stopping brute force; email-sending endpoints are kept tight.
	rateLimit: {
		enabled: true,
		window: 60,
		max: 300,
		customRules: {
			"/sign-in/email": { window: 60, max: 40 },
			"/sign-up/email": { window: 60, max: 40 },
			"/request-password-reset": { window: 60, max: 3 },
			"/reset-password": { window: 60, max: 5 },
			"/send-verification-email": { window: 60, max: 3 },
			"/change-password": { window: 60, max: 5 },
			"/delete-user": { window: 60, max: 5 },
		},
	},
	user: {
		modelName: "User",
		// "Hesabımı sil" on the account page. Password accounts must confirm
		// their password; OAuth accounts need a recent sign-in (fresh session).
		// Projects, files, compile jobs, templates and snippets are removed by
		// the database cascade; compile artifacts on disk are pruned by the
		// cleanup worker; template preview images are removed here.
		deleteUser: {
			enabled: true,
			beforeDelete: async (user) => {
				await removeUserTemplatePreviews(user.id);
			},
		},
	},
	session: {
		modelName: "Session",
	},
	account: {
		modelName: "Account",
	},
	verification: {
		modelName: "Verification",
	},
});
