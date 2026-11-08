/**
 * General Utilities & Helper Functions
 */

import { ApiErrorResponse } from "../types/api";

/**
 * Extracts a user-friendly error message from an unknown error or ApiErrorResponse
 */
export function extractErrorMessage(
	error: unknown,
	fallback: string = "An unexpected error occurred"
): string {
	if (!error) return fallback;

	if (typeof error === "string") return error;

	if (typeof error === "object") {
		const apiErr = error as Partial<ApiErrorResponse>;
		if (apiErr.message) return apiErr.message;
		if (apiErr.errors && Array.isArray(apiErr.errors) && apiErr.errors.length > 0) {
			return apiErr.errors.map((e) => e.message).join(", ");
		}
		if ("error" in error && typeof (error as { error: unknown }).error === "string") {
			return (error as { error: string }).error;
		}
	}

	if (error instanceof Error) return error.message;

	return fallback;
}

/**
 * Simple conditional classname joiner
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
	return classes.filter(Boolean).join(" ");
}

