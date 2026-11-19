import { ZodError } from "zod";

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

export class AppError extends Error {
	status: number;
	code: AppErrorCode;
	details?: Record<string, unknown>;

	constructor(
		code: AppErrorCode,
		message: string,
		status = 400,
		details?: Record<string, unknown>,
	) {
		super(message);
		this.name = "AppError";
		this.code = code;
		this.status = status;
		this.details = details;
	}
}

export function toErrorResponse(error: unknown): Response {
	if (error instanceof AppError) {
		const payload: AppErrorPayload = {
			error: {
				code: error.code,
				message: error.message,
				details: error.details,
			},
		};

		return Response.json(payload, { status: error.status });
	}

	if (error instanceof ZodError) {
		const payload: AppErrorPayload = {
			error: {
				code: "VALIDATION_ERROR",
				message: error.issues[0]?.message ?? "Geçersiz istek.",
				details: { issues: error.issues },
			},
		};

		return Response.json(payload, { status: 400 });
	}

	console.error("[api] unexpected error:", error);

	const payload: AppErrorPayload = {
		error: {
			code: "UNKNOWN_ERROR",
			message: "Beklenmeyen bir sunucu hatası oluştu.",
		},
	};

	return Response.json(payload, { status: 500 });
}
