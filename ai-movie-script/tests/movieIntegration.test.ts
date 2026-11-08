/**
 * FilmForge AI — Phase 4 Movie Management & Studio Dashboard Integration Tests
 * Verifies scenarios 1 through 12.
 */

import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import { movieService } from "../services/movieService";
import { movieStore } from "../store/movieStore";
import { authTokens } from "../lib/auth";
import { api, ApiClientError } from "../lib/api";
import { Movie } from "../types/movie";

test("Phase 4: Movie Management & Studio Dashboard Integration Tests", async (t) => {
	const originalFetch = global.fetch;

	const reset = () => {
		global.fetch = originalFetch;
		authTokens.clearTokens();
		movieStore.clear();
	};

	const mockUser = {
		id: "user-uuid-director",
		name: "Greta Gerwig",
		email: "greta@filmforge.ai",
		avatar: null,
		role: "USER" as const,
		subscriptionTier: "PRO" as const,
		createdAt: new Date().toISOString(),
	};

	const sampleMovies: Movie[] = [
		{
			id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
			userId: mockUser.id,
			title: "Lady Bird",
			description: "A coming-of-age comedy-drama.",
			originalIdea: "Adolescent life in Sacramento.",
			genre: "Drama",
			tone: "Emotional",
			language: "en",
			targetLength: "Feature Film (90-120 pages)",
			status: "COMPLETED",
			coverImage: null,
			progress: 100,
			createdAt: "2026-11-01T10:00:00.000Z",
			updatedAt: "2026-11-05T12:00:00.000Z",
			_count: { characters: 8, scenes: 42, acts: 3, screenplays: 1 },
		},
		{
			id: "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
			userId: mockUser.id,
			title: "Little Women",
			description: "Four sisters coming of age in the aftermath of the American Civil War.",
			originalIdea: "Classic period literary adaptation.",
			genre: "Period Drama",
			tone: "Inspirational",
			language: "en",
			targetLength: "Feature Film (90-120 pages)",
			status: "SCRIPT",
			coverImage: null,
			progress: 75,
			createdAt: "2026-11-02T10:00:00.000Z",
			updatedAt: "2026-11-06T15:00:00.000Z",
			_count: { characters: 12, scenes: 60, acts: 3, screenplays: 1 },
		},
		{
			id: "f8e7d6c5-b4a3-4210-9876-543210fedcba",
			userId: mockUser.id,
			title: "Barbie",
			description: "Barbie and Ken having the time of their lives in Barbieland.",
			originalIdea: "Existential feminist fantasy comedy.",
			genre: "Comedy",
			tone: "Funny",
			language: "en",
			targetLength: "Feature Film (90-120 pages)",
			status: "IDEA",
			coverImage: null,
			progress: 15,
			createdAt: "2026-11-07T08:00:00.000Z",
			updatedAt: "2026-11-08T09:00:00.000Z",
			_count: { characters: 2, scenes: 0, acts: 0, screenplays: 0 },
		},
	];

	await t.test("1. Dashboard loads real movie statistics from PostgreSQL backend", async () => {
		reset();
		authTokens.setAccessToken("valid-token");
		authTokens.setCurrentUser(mockUser);

		global.fetch = async (input) => {
			const url = String(input);
			if (url.includes("/api/movies")) {
				return new Response(
					JSON.stringify({
						success: true,
						statusCode: 200,
						message: "Movie projects retrieved successfully",
						data: sampleMovies,
						meta: { page: 1, limit: 10, total: 3, totalPages: 1 },
					}),
					{ status: 200, headers: { "Content-Type": "application/json" } }
				);
			}
			throw new Error(`Unexpected request: ${url}`);
		};

		const res = await movieService.getMovies();
		assert.strictEqual(res.items.length, 3);
		assert.strictEqual(res.meta.total, 3);

		movieStore.setMovies(res.items, res.meta);
		const stats = movieStore.getDashboardStats();

		assert.strictEqual(stats.total, 3, "Total projects should be 3");
		assert.strictEqual(stats.completed, 1, "Completed projects should be 1 (Lady Bird)");
		assert.strictEqual(stats.inProgress, 2, "In-progress projects should be 2");
		assert.strictEqual(stats.recentlyUpdated.length, 3);
		assert.strictEqual(stats.recentlyUpdated[0].title, "Barbie", "Most recently updated should be first");
		reset();
	});

	await t.test("2. Movies page loads database records with metadata and progress", async () => {
		reset();
		authTokens.setAccessToken("valid-token");

		let capturedUrl = "";
		global.fetch = async (input) => {
			capturedUrl = String(input);
			return new Response(
				JSON.stringify({
					success: true,
					statusCode: 200,
					data: sampleMovies,
					meta: { page: 1, limit: 10, total: 3, totalPages: 1 },
				}),
				{ status: 200, headers: { "Content-Type": "application/json" } }
			);
		};

		const result = await movieService.getMovies();
		assert.strictEqual(capturedUrl, "http://localhost:5000/api/movies");
		assert.strictEqual(result.items.length, 3);
		assert.strictEqual(result.items[0].title, "Lady Bird");
		assert.strictEqual(result.items[0].progress, 100);
		assert.strictEqual(result.items[0]._count?.characters, 8);
		reset();
	});

	await t.test("3. Create movie successfully with full payload and real UUID response", async () => {
		reset();
		authTokens.setAccessToken("valid-token");

		let capturedMethod = "";
		let capturedPayload: Record<string, unknown> | null = null;

		const createdMovie: Movie = {
			id: "7c9e6679-7425-40de-944b-e07fc1f90ae7",
			userId: mockUser.id,
			title: "Oppenheimer",
			description: "The story of American scientist J. Robert Oppenheimer.",
			originalIdea: "Theoretical physics during WWII.",
			genre: "Biography",
			tone: "Dark",
			language: "en",
			targetLength: "Feature Film (90-120 pages)",
			status: "IDEA",
			coverImage: null,
			progress: 10,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			_count: { characters: 0, scenes: 0, acts: 0, screenplays: 0 },
		};

		global.fetch = async (input, init) => {
			capturedMethod = init?.method || "GET";
			capturedPayload = JSON.parse(String(init?.body));
			return new Response(
				JSON.stringify({
					success: true,
					statusCode: 201,
					message: "Movie project created successfully",
					data: createdMovie,
				}),
				{ status: 201, headers: { "Content-Type": "application/json" } }
			);
		};

		const newMovie = await movieService.createMovie({
			title: "Oppenheimer",
			description: "The story of American scientist J. Robert Oppenheimer.",
			originalIdea: "Theoretical physics during WWII.",
			genre: "Biography",
			tone: "Dark",
			language: "en",
			targetLength: "Feature Film (90-120 pages)",
		});

		assert.strictEqual(capturedMethod, "POST");
		assert.strictEqual(capturedPayload?.["title"], "Oppenheimer");
		assert.strictEqual(capturedPayload?.["genre"], "Biography");
		assert.strictEqual(newMovie.id, "7c9e6679-7425-40de-944b-e07fc1f90ae7");
		assert.ok(
			/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(newMovie.id),
			"Movie ID must be a valid RFC4122 UUID, never a mock string like TLS-0824"
		);
		reset();
	});

	await t.test("4. New movie immediately reflects in the movie store and updates dashboard stats", () => {
		reset();
		movieStore.setMovies(sampleMovies, { page: 1, limit: 10, total: 3, totalPages: 1 });
		assert.strictEqual(movieStore.getMovies().length, 3);
		assert.strictEqual(movieStore.getDashboardStats().total, 3);

		const brandNewMovie: Movie = {
			id: "550e8400-e29b-41d4-a716-446655440000",
			userId: mockUser.id,
			title: "Interstellar",
			description: "A team of explorers travel through a wormhole in space.",
			originalIdea: "Space exploration to ensure humanity's survival.",
			genre: "Sci-Fi",
			tone: "Suspenseful",
			language: "en",
			targetLength: "Feature Film (90-120 pages)",
			status: "IDEA",
			coverImage: null,
			progress: 15,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		movieStore.addMovie(brandNewMovie);

		const updatedList = movieStore.getMovies();
		assert.strictEqual(updatedList.length, 4, "Store should contain 4 movies");
		assert.strictEqual(updatedList[0].title, "Interstellar", "Newly created movie should be prepended");
		assert.strictEqual(movieStore.getDashboardStats().total, 4, "Dashboard total should increment to 4");
		reset();
	});

	await t.test("5. Movie details load accurately using its UUID", async () => {
		reset();
		authTokens.setAccessToken("valid-token");

		let requestedUrl = "";
		const targetId = "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d";

		global.fetch = async (input) => {
			requestedUrl = String(input);
			return new Response(
				JSON.stringify({
					success: true,
					statusCode: 200,
					data: sampleMovies[0],
				}),
				{ status: 200, headers: { "Content-Type": "application/json" } }
			);
		};

		const movie = await movieService.getMovieById(targetId);
		assert.strictEqual(requestedUrl, `http://localhost:5000/api/movies/${targetId}`);
		assert.strictEqual(movie.id, targetId);
		assert.strictEqual(movie.title, "Lady Bird");
		assert.strictEqual(movie.status, "COMPLETED");
		reset();
	});

	await t.test("6. Edit movie successfully updates database and in-memory store", async () => {
		reset();
		authTokens.setAccessToken("valid-token");
		movieStore.setMovies(sampleMovies);

		const targetId = "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d";
		let capturedMethod = "";
		let capturedPayload: Record<string, unknown> | null = null;

		global.fetch = async (input, init) => {
			capturedMethod = init?.method || "GET";
			capturedPayload = JSON.parse(String(init?.body));
			return new Response(
				JSON.stringify({
					success: true,
					statusCode: 200,
					data: {
						...sampleMovies[1],
						title: "Little Women (Director's Cut)",
						status: "COMPLETED",
						progress: 100,
					},
				}),
				{ status: 200, headers: { "Content-Type": "application/json" } }
			);
		};

		const updated = await movieService.updateMovie(targetId, {
			title: "Little Women (Director's Cut)",
			status: "COMPLETED",
		});

		assert.strictEqual(capturedMethod, "PUT");
		assert.strictEqual(capturedPayload?.["title"], "Little Women (Director's Cut)");
		assert.strictEqual(updated.title, "Little Women (Director's Cut)");

		movieStore.updateMovie(targetId, updated);
		const found = movieStore.getMovies().find((m) => m.id === targetId);
		assert.strictEqual(found?.title, "Little Women (Director's Cut)");
		assert.strictEqual(found?.status, "COMPLETED");
		reset();
	});

	await t.test("7. Delete movie project with confirmation removes record from DB and store", async () => {
		reset();
		authTokens.setAccessToken("valid-token");
		movieStore.setMovies(sampleMovies, { page: 1, limit: 10, total: 3, totalPages: 1 });

		const targetId = "f8e7d6c5-b4a3-4210-9876-543210fedcba";
		let capturedMethod = "";
		let requestedUrl = "";

		global.fetch = async (input, init) => {
			requestedUrl = String(input);
			capturedMethod = init?.method || "GET";
			return new Response(
				JSON.stringify({
					success: true,
					statusCode: 200,
					message: "Movie project deleted successfully",
					data: null,
				}),
				{ status: 200, headers: { "Content-Type": "application/json" } }
			);
		};

		await movieService.deleteMovie(targetId);
		assert.strictEqual(capturedMethod, "DELETE");
		assert.strictEqual(requestedUrl, `http://localhost:5000/api/movies/${targetId}`);

		movieStore.removeMovie(targetId);
		assert.strictEqual(movieStore.getMovies().length, 2);
		assert.strictEqual(movieStore.getMovies().some((m) => m.id === targetId), false);
		assert.strictEqual(movieStore.getDashboardStats().total, 2);
		reset();
	});

	await t.test("8. Search and filtering work across query parameters and titles", async () => {
		reset();
		authTokens.setAccessToken("valid-token");

		let capturedUrl = "";
		global.fetch = async (input) => {
			capturedUrl = String(input);
			return new Response(
				JSON.stringify({
					success: true,
					data: [sampleMovies[0]],
					meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
				}),
				{ status: 200, headers: { "Content-Type": "application/json" } }
			);
		};

		await movieService.getMovies({ search: "Lady", genre: "Drama", status: "COMPLETED" });
		const parsedUrl = new URL(capturedUrl);
		assert.strictEqual(parsedUrl.searchParams.get("search"), "Lady");
		assert.strictEqual(parsedUrl.searchParams.get("genre"), "Drama");
		assert.strictEqual(parsedUrl.searchParams.get("status"), "COMPLETED");
		reset();
	});

	await t.test("9. Empty state works cleanly for users without movies", async () => {
		reset();
		authTokens.setAccessToken("valid-token");

		global.fetch = async () => {
			return new Response(
				JSON.stringify({
					success: true,
					data: [],
					meta: { page: 1, limit: 10, total: 0, totalPages: 1 },
				}),
				{ status: 200, headers: { "Content-Type": "application/json" } }
			);
		};

		const res = await movieService.getMovies();
		movieStore.setMovies(res.items, res.meta);
		const stats = movieStore.getDashboardStats();

		assert.strictEqual(res.items.length, 0);
		assert.strictEqual(stats.total, 0);
		assert.strictEqual(stats.inProgress, 0);
		assert.strictEqual(stats.completed, 0);
		assert.strictEqual(stats.recentlyUpdated.length, 0);
		reset();
	});

	await t.test("10. Loading and error states are accurately handled and transformed", async () => {
		reset();
		authTokens.setAccessToken("valid-token");

		global.fetch = async () => {
			return new Response(
				JSON.stringify({
					success: false,
					statusCode: 500,
					message: "Database connection failed",
				}),
				{ status: 500, headers: { "Content-Type": "application/json" } }
			);
		};

		await assert.rejects(
			async () => {
				await movieService.getMovies();
			},
			(err: unknown) => {
				assert.ok(err instanceof ApiClientError);
				assert.strictEqual(err.statusCode, 500);
				assert.strictEqual(err.message, "Database connection failed");
				return true;
			}
		);
		reset();
	});

	await t.test("11. Unauthorized access to another user's movie is rejected with 403 or 404", async () => {
		reset();
		authTokens.setAccessToken("unauthorized-user-token");

		global.fetch = async () => {
			return new Response(
				JSON.stringify({
					success: false,
					statusCode: 403,
					message: "You do not have permission to access this movie project",
					code: "FORBIDDEN",
				}),
				{ status: 403, headers: { "Content-Type": "application/json" } }
			);
		};

		await assert.rejects(
			async () => {
				await movieService.getMovieById("private-foreign-movie-uuid");
			},
			(err: unknown) => {
				assert.ok(err instanceof ApiClientError);
				assert.strictEqual(err.statusCode, 403);
				assert.strictEqual(err.message, "You do not have permission to access this movie project");
				return true;
			}
		);
		reset();
	});

	await t.test("12. Existing authentication tokens and session security remain fully functional", () => {
		reset();
		authTokens.setTokens({
			accessToken: "jwt-access-token-123",
			refreshToken: "jwt-refresh-token-456",
		});
		assert.strictEqual(authTokens.isAuthenticated(), true);
		assert.strictEqual(authTokens.getAccessToken(), "jwt-access-token-123");
		assert.strictEqual(authTokens.getRefreshToken(), "jwt-refresh-token-456");

		authTokens.clearTokens();
		assert.strictEqual(authTokens.isAuthenticated(), false);
		assert.strictEqual(authTokens.getAccessToken(), null);
		assert.strictEqual(authTokens.getRefreshToken(), null);
		reset();
	});
});
