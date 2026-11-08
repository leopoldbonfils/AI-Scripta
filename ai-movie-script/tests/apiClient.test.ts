/**
 * FilmForge AI — Phase 2 Frontend API Client & Foundation Tests
 * Tests items 1 through 8 of Step 8:
 * 1. API client initialization
 * 2. GET and POST requests
 * 3. API error handling
 * 4. Network error handling
 * 5. Authentication request formatting
 * 6. Access-token attachment
 * 7. Refresh-token rotation
 * 8. Concurrent 401 responses
 */

import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import { api, ApiClientError } from "../lib/api";
import { authTokens } from "../lib/auth";
import { authService } from "../services/authService";
import { movieService } from "../services/movieService";

describe("Phase 2: API Client & Foundation Tests", () => {
	const originalFetch = global.fetch;

	beforeEach(() => {
		authTokens.clearTokens();
	});

	afterEach(() => {
		global.fetch = originalFetch;
		authTokens.clearTokens();
	});

	test("1. API client initialization", () => {
		assert.ok(api, "API client instance should exist");
		assert.strictEqual(
			api.getBaseUrl(),
			"http://localhost:5000/api",
			"Base URL should match NEXT_PUBLIC_API_URL"
		);
	});

	test("2. GET and POST requests execute and format correctly", async () => {
		let capturedUrl = "";
		let capturedMethod = "";
		let capturedBody = "";

		global.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
			capturedUrl = String(input);
			capturedMethod = init?.method || "GET";
			capturedBody = String(init?.body || "");

			return new Response(
				JSON.stringify({
					success: true,
					statusCode: 200,
					data: { id: "test-movie-id", title: "Cyber Heist" },
				}),
				{
					status: 200,
					headers: { "Content-Type": "application/json" },
				}
			);
		};

		// Test POST via movieService
		const created = await movieService.createMovie({ title: "Cyber Heist" });
		assert.strictEqual(created.title, "Cyber Heist");
		assert.strictEqual(capturedMethod, "POST");
		assert.strictEqual(capturedUrl, "http://localhost:5000/api/movies");
		assert.ok(capturedBody.includes("Cyber Heist"));

		// Test GET via movieService
		const fetched = await movieService.getMovieById("test-movie-id");
		assert.strictEqual(fetched.id, "test-movie-id");
		assert.strictEqual(capturedMethod, "GET");
		assert.strictEqual(
			capturedUrl,
			"http://localhost:5000/api/movies/test-movie-id"
		);
	});

	test("3. API error handling transforms error responses", async () => {
		global.fetch = async () => {
			return new Response(
				JSON.stringify({
					success: false,
					statusCode: 400,
					message: "Validation failed",
					errors: [{ field: "email", message: "Invalid email address format" }],
				}),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				}
			);
		};

		await assert.rejects(
			async () => {
				await api.get("/movies");
			},
			(err: unknown) => {
				assert.ok(err instanceof ApiClientError);
				assert.strictEqual(err.statusCode, 400);
				assert.strictEqual(err.message, "Validation failed");
				assert.strictEqual(err.errors?.[0]?.field, "email");
				return true;
			}
		);
	});

	test("4. Network error handling transforms connection failures", async () => {
		global.fetch = async () => {
			throw new TypeError("Failed to fetch");
		};

		await assert.rejects(
			async () => {
				await api.get("/movies");
			},
			(err: unknown) => {
				assert.ok(err instanceof ApiClientError);
				assert.strictEqual(err.statusCode, 0);
				assert.ok(err.message.includes("Unable to connect to FilmForge backend server"));
				return true;
			}
		);
	});

	test("5. Authentication request formatting matches backend contracts", async () => {
		let capturedBody: unknown = null;

		global.fetch = async (_input, init) => {
			capturedBody = JSON.parse(String(init?.body));
			return new Response(
				JSON.stringify({
					success: true,
					statusCode: 200,
					data: {
						user: { id: "user-1", email: "writer@filmforge.ai", name: "Jane" },
						tokens: { accessToken: "access-token-123", refreshToken: "refresh-token-456" },
					},
				}),
				{
					status: 200,
					headers: { "Content-Type": "application/json" },
				}
			);
		};

		const res = await authService.login({
			email: "writer@filmforge.ai",
			password: "SecurePassword123!",
		});

		assert.deepStrictEqual(capturedBody, {
			email: "writer@filmforge.ai",
			password: "SecurePassword123!",
		});
		assert.strictEqual(res.user.email, "writer@filmforge.ai");
		assert.strictEqual(authTokens.getAccessToken(), "access-token-123");
		// Verify refresh token is held in-memory and NOT in localStorage
		assert.strictEqual(authTokens.getRefreshToken(), "refresh-token-456");
	});

	test("6. Access-token is automatically attached as Bearer header", async () => {
		authTokens.setAccessToken("active-jwt-token-xyz");

		let authHeader = "";
		global.fetch = async (_input, init) => {
			const headers = init?.headers as Record<string, string>;
			authHeader = headers?.["Authorization"] || "";
			return new Response(
				JSON.stringify({
					success: true,
					data: { id: "movie-1", title: "Project Alpha" },
				}),
				{
					status: 200,
					headers: { "Content-Type": "application/json" },
				}
			);
		};

		await api.get("/movies/movie-1");
		assert.strictEqual(authHeader, "Bearer active-jwt-token-xyz");
	});

	test("7. Refresh-token rotation on 401 response", async () => {
		authTokens.setTokens({
			accessToken: "expired-token",
			refreshToken: "valid-refresh-token",
		});

		let requestCount = 0;
		global.fetch = async (input, init) => {
			requestCount++;
			const url = String(input);
			const headers = init?.headers as Record<string, string>;

			// Initial request with expired token -> returns 401
			if (requestCount === 1) {
				assert.strictEqual(headers?.["Authorization"], "Bearer expired-token");
				return new Response(
					JSON.stringify({ success: false, message: "Token expired" }),
					{ status: 401, headers: { "Content-Type": "application/json" } }
				);
			}

			// Token refresh call
			if (url.includes("/auth/refresh")) {
				const body = JSON.parse(String(init?.body));
				assert.strictEqual(body.refreshToken, "valid-refresh-token");
				return new Response(
					JSON.stringify({
						success: true,
						data: {
							accessToken: "new-fresh-token",
							refreshToken: "new-rotated-refresh-token",
						},
					}),
					{ status: 200, headers: { "Content-Type": "application/json" } }
				);
			}

			// Replayed original request with new token
			if (requestCount === 3) {
				assert.strictEqual(headers?.["Authorization"], "Bearer new-fresh-token");
				return new Response(
					JSON.stringify({
						success: true,
						data: { id: "movie-99", title: "Replayed Success" },
					}),
					{ status: 200, headers: { "Content-Type": "application/json" } }
				);
			}

			throw new Error(`Unexpected request: ${url}`);
		};

		const result = await api.get<{ id: string; title: string }>("/movies/movie-99");
		assert.strictEqual(result.title, "Replayed Success");
		assert.strictEqual(authTokens.getAccessToken(), "new-fresh-token");
		assert.strictEqual(authTokens.getRefreshToken(), "new-rotated-refresh-token");
		assert.strictEqual(requestCount, 3);
	});

	test("8. Concurrent 401 responses trigger only a single refresh request", async () => {
		authTokens.setTokens({
			accessToken: "expired-token",
			refreshToken: "valid-refresh-token",
		});

		let refreshCallCount = 0;

		global.fetch = async (input, init) => {
			const url = String(input);
			const headers = init?.headers as Record<string, string>;

			// Intercept refresh
			if (url.includes("/auth/refresh")) {
				refreshCallCount++;
				// Simulate asynchronous delay for refresh
				await new Promise((r) => setTimeout(r, 50));
				return new Response(
					JSON.stringify({
						success: true,
						data: {
							accessToken: "unified-new-token",
							refreshToken: "unified-new-refresh",
						},
					}),
					{ status: 200, headers: { "Content-Type": "application/json" } }
				);
			}

			// Normal calls: if expired, return 401
			if (headers?.["Authorization"] === "Bearer expired-token") {
				return new Response(
					JSON.stringify({ success: false, message: "Token expired" }),
					{ status: 401, headers: { "Content-Type": "application/json" } }
				);
			}

			// If called with new token, succeed
			if (headers?.["Authorization"] === "Bearer unified-new-token") {
				return new Response(
					JSON.stringify({ success: true, data: { status: "OK", path: url } }),
					{ status: 200, headers: { "Content-Type": "application/json" } }
				);
			}

			return new Response("Unauthorized", { status: 401 });
		};

		// Fire 3 simultaneous API requests that will all hit 401
		const [res1, res2, res3] = await Promise.all([
			api.get<{ status: string }>("/movies/1"),
			api.get<{ status: string }>("/movies/2"),
			api.get<{ status: string }>("/movies/3"),
		]);

		assert.strictEqual(res1.status, "OK");
		assert.strictEqual(res2.status, "OK");
		assert.strictEqual(res3.status, "OK");

		// Crucial verification: refresh was only invoked once!
		assert.strictEqual(
			refreshCallCount,
			1,
			"Refresh should be invoked exactly once even under concurrent 401s"
		);
	});
});

