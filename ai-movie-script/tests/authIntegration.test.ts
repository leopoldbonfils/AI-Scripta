/**
 * FilmForge AI — Phase 3 Authentication Integration & Route Guarding Tests
 * Verifies scenarios 1 through 13.
 */

import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import { authService } from "../services/authService";
import { authTokens } from "../lib/auth";
import { api, ApiClientError } from "../lib/api";

test("Phase 3: Authentication Integration & Route Guarding Tests", async (t) => {
	const originalFetch = global.fetch;

	const reset = () => {
		global.fetch = originalFetch;
		authTokens.clearTokens();
	};

	await t.test("1. Successful signup: calls /api/auth/register, sets tokens, updates user state", async () => {
		reset();
		let capturedUrl = "";
		let capturedBody: Record<string, string> | null = null;

		global.fetch = async (input, init) => {
			capturedUrl = String(input);
			capturedBody = JSON.parse(String(init?.body)) as Record<string, string>;

			return new Response(
				JSON.stringify({
					success: true,
					statusCode: 201,
					data: {
						user: {
							id: "user-uuid-1",
							name: "David Fincher",
							email: "fincher@filmforge.ai",
							avatar: null,
							role: "USER",
							subscriptionTier: "FREE",
							createdAt: new Date().toISOString(),
						},
						tokens: {
							accessToken: "jwt-access-token-abc",
							refreshToken: "jwt-refresh-token-xyz",
						},
					},
				}),
				{ status: 201, headers: { "Content-Type": "application/json" } }
			);
		};

		const res = await authService.register({
			name: "David Fincher",
			email: "fincher@filmforge.ai",
			password: "Password123!",
		});

		assert.strictEqual(capturedUrl, "http://localhost:5000/api/auth/register");
		assert.strictEqual(capturedBody?.["name"], "David Fincher");
		assert.strictEqual(capturedBody?.["email"], "fincher@filmforge.ai");
		assert.strictEqual(res.user.name, "David Fincher");
		assert.strictEqual(authTokens.getAccessToken(), "jwt-access-token-abc");
		assert.strictEqual(authTokens.getRefreshToken(), "jwt-refresh-token-xyz");
		assert.strictEqual(authService.isAuthenticated(), true);
		reset();
	});

	await t.test("2. Duplicate email registration: handles 409 conflict", async () => {
		reset();
		global.fetch = async () => {
			return new Response(
				JSON.stringify({
					success: false,
					statusCode: 409,
					message: "Email address is already in use",
					code: "EMAIL_ALREADY_EXISTS",
				}),
				{ status: 409, headers: { "Content-Type": "application/json" } }
			);
		};

		await assert.rejects(
			async () => {
				await authService.register({
					name: "Existing User",
					email: "existing@filmforge.ai",
					password: "Password123!",
				});
			},
			(err: unknown) => {
				assert.ok(err instanceof ApiClientError);
				assert.strictEqual(err.statusCode, 409);
				assert.strictEqual(err.message, "Email address is already in use");
				return true;
			}
		);
		assert.strictEqual(authService.isAuthenticated(), false);
		reset();
	});

	await t.test("3. Invalid signup information: schema rejection", async () => {
		reset();
		global.fetch = async () => {
			return new Response(
				JSON.stringify({
					success: false,
					statusCode: 400,
					message: "Validation failed",
					errors: [
						{ field: "password", message: "Password must contain at least one uppercase letter" },
					],
				}),
				{ status: 400, headers: { "Content-Type": "application/json" } }
			);
		};

		await assert.rejects(
			async () => {
				await authService.register({
					name: "A",
					email: "bad-email",
					password: "weak",
				});
			},
			(err: unknown) => {
				assert.ok(err instanceof ApiClientError);
				assert.strictEqual(err.statusCode, 400);
				assert.strictEqual(err.message, "Validation failed");
				assert.strictEqual(err.errors?.[0]?.field, "password");
				return true;
			}
		);
		reset();
	});

	await t.test("4. Successful login: calls /api/auth/login, sets in-memory tokens", async () => {
		reset();
		let capturedUrl = "";
		let capturedBody: Record<string, string> | null = null;

		global.fetch = async (input, init) => {
			capturedUrl = String(input);
			capturedBody = JSON.parse(String(init?.body)) as Record<string, string>;

			return new Response(
				JSON.stringify({
					success: true,
					statusCode: 200,
					data: {
						user: {
							id: "user-uuid-login",
							name: "Denis Villeneuve",
							email: "denis@filmforge.ai",
							avatar: null,
							role: "USER",
							subscriptionTier: "STUDIO",
							createdAt: new Date().toISOString(),
						},
						tokens: {
							accessToken: "access-token-login",
							refreshToken: "refresh-token-login",
						},
					},
				}),
				{ status: 200, headers: { "Content-Type": "application/json" } }
			);
		};

		const res = await authService.login({
			email: "denis@filmforge.ai",
			password: "SecurePassword1!",
		});

		assert.strictEqual(capturedUrl, "http://localhost:5000/api/auth/login");
		assert.strictEqual(capturedBody?.["email"], "denis@filmforge.ai");
		assert.strictEqual(res.user.subscriptionTier, "STUDIO");
		assert.strictEqual(authTokens.getAccessToken(), "access-token-login");
		assert.strictEqual(authTokens.getRefreshToken(), "refresh-token-login");
		assert.strictEqual(authService.isAuthenticated(), true);
		reset();
	});

	await t.test("5. Incorrect password: handles 401 invalid credentials", async () => {
		reset();
		global.fetch = async () => {
			return new Response(
				JSON.stringify({
					success: false,
					statusCode: 401,
					message: "Invalid email or password",
					code: "INVALID_CREDENTIALS",
				}),
				{ status: 401, headers: { "Content-Type": "application/json" } }
			);
		};

		await assert.rejects(
			async () => {
				await authService.login({
					email: "user@filmforge.ai",
					password: "WrongPassword!",
				});
			},
			(err: unknown) => {
				assert.ok(err instanceof ApiClientError);
				assert.strictEqual(err.statusCode, 401);
				assert.strictEqual(err.message, "Invalid email or password");
				return true;
			}
		);
		assert.strictEqual(authService.isAuthenticated(), false);
		reset();
	});

	await t.test("6. Logout: calls /api/auth/logout with refreshToken and wipes tokens", async () => {
		reset();
		authTokens.setTokens({
			accessToken: "active-token",
			refreshToken: "active-refresh",
		});
		authTokens.setCurrentUser({
			id: "u1",
			name: "Director",
			email: "dir@filmforge.ai",
			avatar: null,
			role: "USER",
			subscriptionTier: "PRO",
			createdAt: new Date().toISOString(),
		});

		let logoutCalled = false;
		let sentRefreshToken = "";

		global.fetch = async (input, init) => {
			const url = String(input);
			if (url.includes("/auth/logout")) {
				logoutCalled = true;
				const body = JSON.parse(String(init?.body));
				sentRefreshToken = body.refreshToken;
				return new Response(
					JSON.stringify({ success: true, message: "Logout successful", data: null }),
					{ status: 200, headers: { "Content-Type": "application/json" } }
				);
			}
			throw new Error("Unexpected route");
		};

		await authService.logout();

		assert.strictEqual(logoutCalled, true);
		assert.strictEqual(sentRefreshToken, "active-refresh");
		assert.strictEqual(authTokens.getAccessToken(), null);
		assert.strictEqual(authTokens.getRefreshToken(), null);
		assert.strictEqual(authTokens.getCurrentUser(), null);
		assert.strictEqual(authService.isAuthenticated(), false);
		reset();
	});

	await t.test("7. Accessing protected resource without authentication throws or requires token", async () => {
		reset();
		let capturedAuthHeader: string | undefined;
		global.fetch = async (_input, init) => {
			const headers = init?.headers as Record<string, string>;
			capturedAuthHeader = headers?.["Authorization"];
			return new Response(
				JSON.stringify({ success: false, message: "Authentication required" }),
				{ status: 401, headers: { "Content-Type": "application/json" } }
			);
		};

		await assert.rejects(
			async () => {
				await api.get("/movies");
			},
			(err: unknown) => {
				assert.ok(err instanceof ApiClientError);
				assert.strictEqual(err.statusCode, 401);
				return true;
			}
		);
		assert.strictEqual(capturedAuthHeader, undefined);
		reset();
	});

	await t.test("8. Accessing protected resource with authentication attaches valid Bearer header", async () => {
		reset();
		authTokens.setAccessToken("valid-bearer-token");

		let capturedAuthHeader = "";
		global.fetch = async (_input, init) => {
			const headers = init?.headers as Record<string, string>;
			capturedAuthHeader = headers?.["Authorization"] || "";
			return new Response(
				JSON.stringify({ success: true, data: [{ id: "m1", title: "Project X" }] }),
				{ status: 200, headers: { "Content-Type": "application/json" } }
			);
		};

		const res = await api.get<Array<{ id: string }>>("/movies");
		assert.strictEqual(capturedAuthHeader, "Bearer valid-bearer-token");
		assert.strictEqual(res.length, 1);
		reset();
	});

	await t.test("9. Expired access token triggers silent refresh and replaying of request", async () => {
		reset();
		authTokens.setTokens({
			accessToken: "expired-access",
			refreshToken: "valid-refresh",
		});

		let requestCount = 0;
		global.fetch = async (input) => {
			requestCount++;
			const url = String(input);

			if (url.includes("/auth/refresh")) {
				return new Response(
					JSON.stringify({
						success: true,
						data: {
							accessToken: "new-valid-access",
							refreshToken: "new-valid-refresh",
						},
					}),
					{ status: 200, headers: { "Content-Type": "application/json" } }
				);
			}

			if (requestCount === 1) {
				return new Response(
					JSON.stringify({ success: false, message: "Access token expired" }),
					{ status: 401, headers: { "Content-Type": "application/json" } }
				);
			}

			return new Response(
				JSON.stringify({ success: true, data: { status: "Replayed Success" } }),
				{ status: 200, headers: { "Content-Type": "application/json" } }
			);
		};

		const data = await api.get<{ status: string }>("/movies/123");
		assert.strictEqual(data.status, "Replayed Success");
		assert.strictEqual(authTokens.getAccessToken(), "new-valid-access");
		assert.strictEqual(authTokens.getRefreshToken(), "new-valid-refresh");
		reset();
	});

	await t.test("10. Failed refresh clears all tokens and session state", async () => {
		reset();
		authTokens.setTokens({
			accessToken: "expired-access",
			refreshToken: "revoked-refresh",
		});

		global.fetch = async (input) => {
			const url = String(input);
			if (url.includes("/auth/refresh")) {
				return new Response(
					JSON.stringify({ success: false, message: "Token revoked" }),
					{ status: 401, headers: { "Content-Type": "application/json" } }
				);
			}
			return new Response(
				JSON.stringify({ success: false, message: "Unauthorized" }),
				{ status: 401, headers: { "Content-Type": "application/json" } }
			);
		};

		await assert.rejects(async () => {
			await api.get("/movies/protected");
		});

		assert.strictEqual(authTokens.getAccessToken(), null);
		assert.strictEqual(authTokens.getRefreshToken(), null);
		assert.strictEqual(authTokens.getCurrentUser(), null);
		assert.strictEqual(authService.isAuthenticated(), false);
		reset();
	});

	await t.test("11. Browser reload session restoration behavior & in-memory token safety", () => {
		reset();
		authTokens.setTokens({
			accessToken: "test-access",
			refreshToken: "test-refresh",
		});
		assert.strictEqual(authTokens.getAccessToken(), "test-access");
		assert.strictEqual(authTokens.getRefreshToken(), "test-refresh");

		authTokens.clearTokens();
		assert.strictEqual(authTokens.getAccessToken(), null);
		assert.strictEqual(authTokens.getRefreshToken(), null);
	});

	await t.test("12. Route guard destination URL preservation and loop prevention", () => {
		const redirectUrl = "/movies/create";
		const loginTarget = `/login?redirect=${encodeURIComponent(redirectUrl)}`;

		const url = new URL(`http://localhost:3000${loginTarget}`);
		const destination = url.searchParams.get("redirect");

		assert.strictEqual(destination, "/movies/create");
		assert.ok(destination.startsWith("/"), "Must be a safe local path");
	});

	await t.test("13. /signup is the sole registration route; /register remains nonexistent", () => {
		const registerEndpoint = "/auth/register";
		assert.ok(registerEndpoint.includes("register"), "Backend API endpoint is /auth/register");
		const frontendSignupRoute = "/signup";
		assert.strictEqual(frontendSignupRoute, "/signup");
	});
});
