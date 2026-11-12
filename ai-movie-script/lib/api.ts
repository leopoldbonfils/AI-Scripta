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
	timeoutMs?: number;
	_retry?: boolean;
}

export interface StreamSSECallbacks<TComplete = unknown> {
	onStage?: (payload: { stage: string; message: string; generationId?: string }) => void;
	onDelta?: (payload: { delta: string; accumulatedLength: number }) => void;
	onProgress?: (payload: Record<string, unknown>) => void;
	onComplete?: (payload: TComplete) => void;
	onError?: (payload: {
		code?: string;
		message: string;
		isPartial?: boolean;
		partialCharsReceived?: number;
		retryable?: boolean;
	}) => void;
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
		const {
			body,
			params,
			skipAuth = false,
			timeoutMs = 65000,
			_retry = false,
			headers: customHeaders,
			signal: callerSignal,
			...fetchOptions
		} = options;

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

		const abortCtrl = new AbortController();
		let didTimeout = false;
		const timeoutHandle =
			timeoutMs > 0
				? setTimeout(() => {
						didTimeout = true;
						abortCtrl.abort();
				  }, timeoutMs)
				: null;

		const onCallerAbort = () => abortCtrl.abort();
		if (callerSignal) {
			if (callerSignal.aborted) {
				abortCtrl.abort();
			} else {
				callerSignal.addEventListener("abort", onCallerAbort, { once: true });
			}
		}

		let response: Response;
		try {
			response = await fetch(url, {
				...fetchOptions,
				headers,
				signal: abortCtrl.signal,
				body: body !== undefined ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
			});
		} catch (networkError) {
			if (timeoutHandle) clearTimeout(timeoutHandle);
			callerSignal?.removeEventListener("abort", onCallerAbort);
			if (didTimeout) {
				throw new ApiClientError(
					`Request timed out after ${Math.round(timeoutMs / 1000)}s. Please retry.`,
					408,
					undefined,
					networkError
				);
			}
			if (callerSignal?.aborted) {
				throw new ApiClientError("Request was cancelled.", 499, undefined, networkError);
			}
			throw new ApiClientError(
				"Unable to connect to FilmForge backend server. Please check your network connection.",
				0,
				undefined,
				networkError
			);
		} finally {
			if (timeoutHandle) clearTimeout(timeoutHandle);
			callerSignal?.removeEventListener("abort", onCallerAbort);
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

	/**
	 * Reliable Server-Sent Events (SSE) stream consumer over fetch + ReadableStream.
	 * Supports POST or GET, Bearer token refresh, AbortSignal cancellation, and frame parsing.
	 */
	public async streamSSE<TComplete = unknown>(
		path: string,
		options: {
			method?: "GET" | "POST";
			body?: unknown;
			params?: Record<string, string | number | boolean | undefined | null>;
			signal?: AbortSignal;
			_retry?: boolean;
		},
		callbacks: StreamSSECallbacks<TComplete>
	): Promise<void> {
		const method = options.method || "POST";
		const url = this.buildUrl(path, options.params);
		const headers: Record<string, string> = {
			Accept: "text/event-stream",
		};
		if (options.body !== undefined) {
			headers["Content-Type"] = "application/json";
		}
		const token = authTokens.getAccessToken();
		if (token) {
			headers["Authorization"] = `Bearer ${token}`;
		}

		let response: Response;
		try {
			response = await fetch(url, {
				method,
				headers,
				signal: options.signal,
				body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
			});
		} catch (err) {
			if (options.signal?.aborted) {
				throw new ApiClientError("Stream cancelled by user.", 499, undefined, err);
			}
			throw new ApiClientError("Unable to open AI stream connection.", 0, undefined, err);
		}

		if (response.status === 401 && !options._retry) {
			const refreshed = await this.refreshAccessToken();
			if (refreshed) {
				return this.streamSSE(path, { ...options, _retry: true }, callbacks);
			}
		}

		if (!response.ok || !response.body) {
			let msg = `Stream request failed with status ${response.status}`;
			try {
				const errJson = (await response.json()) as ApiErrorResponse;
				if (errJson.message) msg = errJson.message;
			} catch {
				// fallback message
			}
			throw new ApiClientError(msg, response.status);
		}

		const reader = response.body.getReader();
		const decoder = new TextDecoder();
		let buffer = "";
		let receivedTerminalEvent = false;

		const dispatchFrame = (rawFrame: string) => {
			let eventName = "message";
			const dataLines: string[] = [];
			for (const line of rawFrame.split("\n")) {
				if (line.startsWith("event:")) {
					eventName = line.slice(6).trim();
				} else if (line.startsWith("data:")) {
					dataLines.push(line.slice(5).trim());
				}
			}
			if (dataLines.length === 0) return;
			const rawData = dataLines.join("\n");
			let parsed: unknown = rawData;
			try {
				parsed = JSON.parse(rawData);
			} catch {
				// leave as text
			}

			if (eventName === "stage") {
				callbacks.onStage?.(parsed as { stage: string; message: string; generationId?: string });
			} else if (eventName === "delta") {
				callbacks.onDelta?.(parsed as { delta: string; accumulatedLength: number });
			} else if (eventName === "progress") {
				callbacks.onProgress?.(parsed as Record<string, unknown>);
			} else if (eventName === "complete" || eventName === "done") {
				receivedTerminalEvent = true;
				callbacks.onComplete?.(parsed as TComplete);
			} else if (eventName === "error") {
				receivedTerminalEvent = true;
				callbacks.onError?.(
					parsed as {
						code?: string;
						message: string;
						isPartial?: boolean;
						partialCharsReceived?: number;
						retryable?: boolean;
					}
				);
			}
		};

		try {
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n");

				let boundaryIdx = buffer.indexOf("\n\n");
				while (boundaryIdx !== -1) {
					const frame = buffer.slice(0, boundaryIdx).trim();
					buffer = buffer.slice(boundaryIdx + 2);
					if (frame) dispatchFrame(frame);
					boundaryIdx = buffer.indexOf("\n\n");
				}
			}

			if (buffer.trim()) {
				dispatchFrame(buffer.trim());
			}

			if (!receivedTerminalEvent && !options.signal?.aborted) {
				callbacks.onError?.({
					code: "STREAM_TRUNCATED",
					message: "Connection closed before final completion event was received. Results may be incomplete.",
					isPartial: true,
					retryable: true,
				});
			}
		} catch (streamErr) {
			if (options.signal?.aborted) {
				throw new ApiClientError("Stream cancelled.", 499, undefined, streamErr);
			}
			throw new ApiClientError("Stream interrupted unexpectedly.", 0, undefined, streamErr);
		} finally {
			reader.releaseLock();
		}
	}
}

export const api = new ApiClient();
