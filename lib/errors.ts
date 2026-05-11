export type AppErrorCode =
	| "UNAUTHORIZED"
	| "FORBIDDEN"
	| "NOT_FOUND"
	| "CONFLICT"
	| "VALIDATION_ERROR"
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

	const payload: AppErrorPayload = {
		error: {
			code: "UNKNOWN_ERROR",
			message: "Unexpected server error.",
		},
	};

	return Response.json(payload, { status: 500 });
}
