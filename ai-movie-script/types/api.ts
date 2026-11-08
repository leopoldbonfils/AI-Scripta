/**
 * Standard FilmForge AI API Response Envelopes & Types
 */

export interface ApiResponse<T = unknown> {
	success: boolean;
	statusCode?: number;
	message?: string;
	data: T;
	error?: string | null;
	meta?: PaginationMeta;
}

export interface ApiErrorDetail {
	field?: string;
	message: string;
}

export interface ApiErrorResponse {
	success: false;
	statusCode: number;
	message: string;
	errors?: ApiErrorDetail[];
	timestamp?: string;
	code?: string;
}

export interface PaginationMeta {
	total: number;
	page: number;
	limit: number;
	totalPages: number;
	hasNext?: boolean;
	hasPrev?: boolean;
}

export interface PaginationParams {
	page?: number;
	limit?: number;
}

