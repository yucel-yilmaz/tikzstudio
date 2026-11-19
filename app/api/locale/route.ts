import { cookies } from "next/headers";

import { errorResponse } from "@/lib/errors";
import {
	isLocale,
	LOCALE_COOKIE,
	LOCALE_COOKIE_MAX_AGE,
} from "@/lib/i18n/config";
import { getLocale } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromHeaders } from "@/lib/session";

/**
 * Switches the UI language: stores it in the `locale` cookie and, for a
 * signed-in user, on the account (so emails follow the same language).
 */
export async function POST(request: Request) {
	const body = (await request.json().catch(() => null)) as {
		locale?: unknown;
	} | null;
	const locale = body?.locale;
	if (!isLocale(locale)) {
		return errorResponse(
			await getLocale(),
			"VALIDATION_ERROR",
			"invalidLocale",
			400,
		);
	}

	const cookieStore = await cookies();
	cookieStore.set(LOCALE_COOKIE, locale, {
		path: "/",
		maxAge: LOCALE_COOKIE_MAX_AGE,
		sameSite: "lax",
		secure: new URL(request.url).protocol === "https:",
	});

	const session = await getSessionFromHeaders(request.headers).catch(
		() => null,
	);
	if (session) {
		await prisma.user.update({
			where: { id: session.user.id },
			data: { locale },
		});
	}

	return Response.json({ locale });
}
