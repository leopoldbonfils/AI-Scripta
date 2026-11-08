/**
 * FilmForge AI — Centralized Fetch-based API Client
 *
 * Capabilities:
 * - Full HTTP verbs: GET, POST, PUT, PATCH, DELETE, and binary blob streams.
 * - Automatic Authorization header injection from in-memory token store.
 * - Centralized JSON parsing, error transformation, and network failure handling.
 * - Concurrency-safe token refresh mutex to prevent duplicate refresh calls.
 * - Infinite refresh loop protection.
 */

import { API_BASE_URL, API_ENDPOINTS } from "./constants";
import { authTokens } from "./auth";
import { ApiResponse, ApiErrorResponse, ApiErrorDetail } from "../types/api";
import { AuthTokens } from "../types/user";

export class ApiClientError extends Error {
	public statusCode: number;
	public errors?: ApiErrorDetail[];
	public originalError?: unknown;

	constructor(message: string, statusCode: number = 500, errors?: ApiErrorDetail[], originalError?: unknown) {
		super(message);
		this.name = "ApiClientError";
		this.statusCode = statusCode;
		this.errors = errors;
		this.originalError = originalError;
		Object.setPrototypeOf(this, ApiClientError.prototype);
	}
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
	body?: unknown;
	params?: Record<string, string | number | boolean | undefined | null>;
	skipAuth?: boolean;
	_retry?: boolean;
}

class ApiClient {
	private baseUrl: string;
	private refreshPromise: Promise<string | null> | null = null;

	constructor(baseUrl: string = API_BASE_URL) {
		this.baseUrl = baseUrl.replace(/\/$/, "");
	}

	public getBaseUrl(): string {
		return this.baseUrl;
	}

	/**
	 * Build full URL with query parameters
	 */
	private buildUrl(path: string, params?: Record<string, string | number | boolean | undefined | null>): string {
		const cleanPath = path.startsWith("/") ? path : `/${path}`;
		const url = new URL(`${this.baseUrl}${cleanPath}`);

		if (params) {
			Object.entries(params).forEach(([key, value]) => {
				if (value !== undefined && value !== null && value !== "") {
					url.searchParams.append(key, String(value));
				}
			});
		}

		return url.toString();
	}

	/**
	 * Attempt to refresh tokens with concurrency lock
	 */
	/**
	 * Attempt to refresh tokens with concurrency lock
	 */
	private async refreshAccessToken(): Promise<string | null> {
		if (this.refreshPromise) {
			return this.refreshPromise;
		}

		this.refreshPromise = (async () => {
			const currentRefreshToken = authTokens.getRefreshToken();
			if (!currentRefreshToken) {
				authTokens.clearTokens();
				return null;
			}

			try {
				const refreshUrl = `${this.baseUrl}${API_ENDPOINTS.AUTH.REFRESH}`;
				const res = await fetch(refreshUrl, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ refreshToken: currentRefreshToken }),
				});

				if (!res.ok) {
					authTokens.clearTokens();
					return null;
				}

				const json: ApiResponse<AuthTokens> = await res.json();
				if (json.success && json.data?.accessToken) {
					authTokens.setTokens(json.data);
					return json.data.accessToken;
				} else {
					authTokens.clearTokens();
					return null;
				}
			} catch {
				authTokens.clearTokens();
				return null;
			}
		})().finally(() => {
			this.refreshPromise = null;
		});

		return this.refreshPromise;
	}

	/**
	 * Core request executor
	 */
	public async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
		const { body, params, skipAuth = false, _retry = false, headers: customHeaders, ...fetchOptions } = options;

		const url = this.buildUrl(path, params);

		const headers: Record<string, string> = {
			Accept: "application/json",
			...(customHeaders as Record<string, string>),
		};

		// Attach JSON content-type if body is an object and not FormData
		if (body !== undefined && !(body instanceof FormData)) {
			headers["Content-Type"] = "application/json";
		}

		// Inject Authorization Bearer token if not skipped
		if (!skipAuth) {
			const token = authTokens.getAccessToken();
			if (token) {
				headers["Authorization"] = `Bearer ${token}`;
			}
		}

		let response: Response;
		try {
			response = await fetch(url, {
				...fetchOptions,
				headers,
				body: body !== undefined ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
			});
		} catch (networkError) {
			throw new ApiClientError(
				"Unable to connect to FilmForge backend server. Please check your network connection.",
				0,
				undefined,
				networkError
			);
		}

		// Handle 401 Unauthorized with token refresh rotation
		if (response.status === 401 && !skipAuth && !_retry) {
			const isAuthEndpoint =
				path.includes(API_ENDPOINTS.AUTH.LOGIN) ||
				path.includes(API_ENDPOINTS.AUTH.REGISTER) ||
				path.includes(API_ENDPOINTS.AUTH.REFRESH);

			if (!isAuthEndpoint) {
				const newAccessToken = await this.refreshAccessToken();
				if (newAccessToken) {
					// Replay original request with refreshed token
					return this.request<T>(path, {
						...options,
						_retry: true,
					});
				}
			}
		}

		// Parse Response
		const isJson = response.headers.get("content-type")?.includes("application/json");

		if (!response.ok) {
			let errorMessage = `Request failed with status ${response.status}`;
			let errorDetails: ApiErrorDetail[] | undefined;

			if (isJson) {
				try {
					const errorJson = (await response.json()) as ApiErrorResponse;
					errorMessage = errorJson.message || errorMessage;
					errorDetails = errorJson.errors;
				} catch {
					// Fall back to default error message
				}
			} else {
				try {
					const text = await response.text();
					if (text) errorMessage = text;
				} catch {
					// Ignore text read error
				}
			}

			throw new ApiClientError(errorMessage, response.status, errorDetails);
		}

		// Handle 204 No Content
		if (response.status === 204) {
			return null as T;
		}

		if (isJson) {
			const json = (await response.json()) as ApiResponse<T>;
			// Backend standard response envelope unpacks `data`
			if (json && typeof json === "object" && "success" in json) {
				if (!json.success) {
					throw new ApiClientError(json.message || "Operation failed", response.status);
				}
				// If pagination meta is attached at root level, preserve both data and meta
				if (json.meta) {
					return {
						items: json.data,
						meta: json.meta,
					} as unknown as T;
				}
				return json.data;
			}
			return json as unknown as T;
		}

		return (await response.text()) as unknown as T;
	}

	/**
	 * Convenience HTTP Methods
	 */
	public get<T>(path: string, options?: Omit<RequestOptions, "method">): Promise<T> {
		return this.request<T>(path, { ...options, method: "GET" });
	}

	public post<T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">): Promise<T> {
		return this.request<T>(path, { ...options, method: "POST", body });
	}

	public put<T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">): Promise<T> {
		return this.request<T>(path, { ...options, method: "PUT", body });
	}

	public patch<T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">): Promise<T> {
		return this.request<T>(path, { ...options, method: "PATCH", body });
	}

	public delete<T>(path: string, options?: Omit<RequestOptions, "method">): Promise<T> {
		return this.request<T>(path, { ...options, method: "DELETE" });
	}

	/**
	 * Binary file downloader for PDF/DOCX/TXT exports
	 */
	public async downloadBlob(path: string, params?: Record<string, string | number | boolean | undefined | null>): Promise<Blob> {
		const url = this.buildUrl(path, params);
		const headers: Record<string, string> = {};

		const token = authTokens.getAccessToken();
		if (token) {
			headers["Authorization"] = `Bearer ${token}`;
		}

		let response: Response;
		try {
			response = await fetch(url, {
				method: "GET",
				headers,
			});
		} catch (err) {
			throw new ApiClientError("Network error while downloading file", 0, undefined, err);
		}

		if (response.status === 401) {
			const newToken = await this.refreshAccessToken();
			if (newToken) {
				return this.downloadBlob(path, params);
			}
		}

		if (!response.ok) {
			throw new ApiClientError(`File export failed with status ${response.status}`, response.status);
		}

		return await response.blob();
	}
}

export const api = new ApiClient();
