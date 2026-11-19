import { ZodError } from "zod";

import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { getMessages, getTranslator } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/server";
import { type KeysOf, lookup, type MessageParams } from "@/lib/i18n/translate";

export type AppErrorCode =
	| "UNAUTHORIZED"
	| "FORBIDDEN"
	| "NOT_FOUND"
	| "CONFLICT"
	| "BAD_REQUEST"
	| "VALIDATION_ERROR"
	| "RATE_LIMITED"
	| "TIMEOUT"
	| "LATEX_SYNTAX_ERROR"
	| "MISSING_PACKAGE"
	| "MISSING_FILE"
	| "SECURITY_BLOCKED"
	| "UNKNOWN_ERROR";

export type AppErrorPayload = {
	error: {
		code: AppErrorCode;
		message: string;
		details?: Record<string, unknown>;
	};
};

/** Key of a user-facing server error message (`errors.*` in the dictionary). */
export type ErrorMessageKey = KeysOf<"errors">;

/** A message key, optionally with interpolation parameters. */
export type ErrorMessage =
	| ErrorMessageKey
	| readonly [ErrorMessageKey, MessageParams];

/** Typed helper for Zod messages: the key is translated when responding. */
export function zodMessage(key: ErrorMessageKey): string {
	return key;
}

export class AppError extends Error {
	status: number;
	code: AppErrorCode;
	details?: Record<string, unknown>;
	messageKey: ErrorMessageKey;
	messageParams?: MessageParams;

	constructor(
		code: AppErrorCode,
		message: ErrorMessage,
		status = 400,
		details?: Record<string, unknown>,
	) {
		const [key, params] = typeof message === "string" ? [message] : message;
		// `message` stays in the default language for logs and stored compile
		// logs; responses are translated per request (see `toErrorResponse`).
		super(getTranslator(DEFAULT_LOCALE)(`errors.${key}`, params));
		this.name = "AppError";
		this.code = code;
		this.status = status;
		this.details = details;
		this.messageKey = key;
		this.messageParams = params;
	}

	/** The message in the given language. */
	localizedMessage(locale: Locale): string {
		return getTranslator(locale)(
			`errors.${this.messageKey}`,
			this.messageParams,
		);
	}
}

/** A JSON error response, translated into `locale`. */
export function errorResponse(
	locale: Locale,
	code: AppErrorCode,
	key: ErrorMessageKey,
	status: number,
	params?: MessageParams,
): Response {
	const payload: AppErrorPayload = {
		error: { code, message: getTranslator(locale)(`errors.${key}`, params) },
	};
	return Response.json(payload, { status });
}

/** 401 for API routes, in the request's language. */
export async function unauthorizedResponse(): Promise<Response> {
	return errorResponse(await getLocale(), "UNAUTHORIZED", "unauthorized", 401);
}

/** 404 for API routes, in the request's language. */
export async function notFoundResponse(
	key: ErrorMessageKey,
): Promise<Response> {
	return errorResponse(await getLocale(), "NOT_FOUND", key, 404);
}

/**
 * Zod issues carry an `errors.*` key as their message (see `zodMessage`);
 * Zod's own default messages are English-only, so they become a generic
 * "invalid request" in the user's language.
 */
function zodIssueMessage(locale: Locale, error: ZodError): string {
	const issue = error.issues[0];
	const t = getTranslator(locale);
	if (issue && lookup(getMessages(locale), `errors.${issue.message}`)) {
		const params: MessageParams = {};
		if ("maximum" in issue && typeof issue.maximum === "number") {
			params.max = issue.maximum;
		}
		if ("minimum" in issue && typeof issue.minimum === "number") {
			params.min = issue.minimum;
		}
		return t(`errors.${issue.message as ErrorMessageKey}`, params);
	}
	return t("errors.invalidRequest");
}

/** Converts any thrown value into a JSON error response for API routes. */
export async function toErrorResponse(error: unknown): Promise<Response> {
	const locale = await getLocale();

	if (error instanceof AppError) {
		const payload: AppErrorPayload = {
			error: {
				code: error.code,
				message: error.localizedMessage(locale),
				details: error.details,
			},
		};

		return Response.json(payload, { status: error.status });
	}

	if (error instanceof ZodError) {
		const payload: AppErrorPayload = {
			error: {
				code: "VALIDATION_ERROR",
				message: zodIssueMessage(locale, error),
				details: { issues: error.issues },
			},
		};

		return Response.json(payload, { status: 400 });
	}

	console.error("[api] unexpected error:", error);

	return errorResponse(locale, "UNKNOWN_ERROR", "unexpected", 500);
}
