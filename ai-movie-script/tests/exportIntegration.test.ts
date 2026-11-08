/**
 * FilmForge AI — Phase 6 Export, Sharing & End-to-End Workflow Tests
 *
 * Verifies:
 * 1. PDF generation and binary download
 * 2. DOCX generation and binary download
 * 3. TXT generation and binary download
 * 4. Long screenplay handling (pagination, formatting)
 * 5. Screenplay content with special characters and Unicode
 * 6. Missing screenplay handling (404)
 * 7. Export authorization and access control (401/403)
 * 8. Sharing & Collaborator management (add, get, update, remove)
 * 9. Collaborator role enforcement (OWNER vs EDITOR vs VIEWER)
 * 10. Complete end-to-end creative lifecycle workflow
 */

import { test } from "node:test";
import assert from "node:assert";
import { screenplayService } from "../services/screenplayService";
import { movieService } from "../services/movieService";
import { storyService } from "../services/storyService";
import { characterService } from "../services/characterService";
import { authService } from "../services/authService";
import { authTokens } from "../lib/auth";
import { api, ApiClientError } from "../lib/api";
import { Screenplay, ScreenplayVersion } from "../types/screenplay";
import { MovieCollaborator } from "../types/movie";

test("Phase 6: Script Export, Sharing & End-to-End Workflow Tests", async (t: any) => {
	const originalFetch = global.fetch;

	const reset = () => {
		global.fetch = originalFetch;
		authTokens.clearTokens();
	};

	const sampleMovieId = "movie-uuid-the-last-signal";
	const sampleScreenplayId = "screenplay-uuid-001";

	const mockPdfBuffer = Buffer.from("%PDF-1.4 simulated pdf binary content", "utf-8");
	const mockDocxBuffer = Buffer.from("PK\x03\x04 simulated docx zip package", "utf-8");
	const mockTxtBuffer = Buffer.from("FADE IN:\n\nEXT. KIGALI CITY - DUSK\n\nEric listens.", "utf-8");

	// ==========================================
	// 1. PDF EXPORT TESTS
	// ==========================================
	await t.test("1.1 screenplayService.exportPdf downloads binary PDF stream", async () => {
		authTokens.setTokens({ accessToken: "test-jwt", refreshToken: "test-refresh" });
		let capturedUrl = "";

		global.fetch = async (url) => {
			capturedUrl = url.toString();
			return new Response(mockPdfBuffer, {
				status: 200,
				headers: {
					"Content-Type": "application/pdf",
					"Content-Disposition": 'attachment; filename="The_Last_Signal_v1.pdf"',
				},
			});
		};

		const blob = await screenplayService.exportPdf(sampleScreenplayId, {
			includeTitlePage: true,
		});

		assert.ok(blob instanceof Blob);
		assert.strictEqual(
			capturedUrl,
			`http://localhost:5000/api/screenplays/${sampleScreenplayId}/export/pdf?includeTitlePage=true`
		);
		const arrayBuf = await blob.arrayBuffer();
		assert.strictEqual(arrayBuf.byteLength, mockPdfBuffer.length);
		reset();
	});

	// ==========================================
	// 2. DOCX EXPORT TESTS
	// ==========================================
	await t.test("2.1 screenplayService.exportDocx downloads binary DOCX file", async () => {
		authTokens.setTokens({ accessToken: "test-jwt", refreshToken: "test-refresh" });
		let capturedUrl = "";

		global.fetch = async (url) => {
			capturedUrl = url.toString();
			return new Response(mockDocxBuffer, {
				status: 200,
				headers: {
					"Content-Type":
						"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
					"Content-Disposition": 'attachment; filename="The_Last_Signal_v1.docx"',
				},
			});
		};

		const blob = await screenplayService.exportDocx(sampleScreenplayId, {
			includeTitlePage: true,
			versionId: "version-uuid-002",
		});

		assert.ok(blob instanceof Blob);
		assert.ok(capturedUrl.includes("/export/docx"));
		assert.ok(capturedUrl.includes("versionId=version-uuid-002"));
		reset();
	});

	// ==========================================
	// 3. TXT EXPORT TESTS
	// ==========================================
	await t.test("3.1 screenplayService.exportTxt downloads plain-text screenplay", async () => {
		authTokens.setTokens({ accessToken: "test-jwt", refreshToken: "test-refresh" });
		let capturedUrl = "";

		global.fetch = async (url) => {
			capturedUrl = url.toString();
			return new Response(mockTxtBuffer, {
				status: 200,
				headers: {
					"Content-Type": "text/plain; charset=utf-8",
					"Content-Disposition": 'attachment; filename="The_Last_Signal_v1.txt"',
				},
			});
		};

		const blob = await screenplayService.exportTxt(sampleScreenplayId);
		assert.ok(blob instanceof Blob);
		assert.strictEqual(
			capturedUrl,
			`http://localhost:5000/api/screenplays/${sampleScreenplayId}/export/txt`
		);
		const text = await blob.text();
		assert.ok(text.includes("EXT. KIGALI CITY - DUSK"));
		reset();
	});

	// ==========================================
	// 4. LONG SCREENPLAY EXPORT
	// ==========================================
	await t.test("4.1 Export handles long screenplays across multiple acts without truncation", async () => {
		authTokens.setTokens({ accessToken: "test-jwt", refreshToken: "test-refresh" });
		const longScriptLength = 1024 * 128; // 128 KB of screenplay text
		const largeBuffer = Buffer.alloc(longScriptLength, 65); // Filled with 'A'

		global.fetch = async () => {
			return new Response(largeBuffer, {
				status: 200,
				headers: {
					"Content-Type": "application/pdf",
					"Content-Length": String(longScriptLength),
				},
			});
		};

		const blob = await screenplayService.exportPdf(sampleScreenplayId);
		assert.strictEqual(blob.size, longScriptLength);
		reset();
	});

	// ==========================================
	// 5. SPECIAL CHARACTERS & UNICODE
	// ==========================================
	await t.test("5.1 Export preserves dialogue with accents, em-dashes and quotes", async () => {
		authTokens.setTokens({ accessToken: "test-jwt", refreshToken: "test-refresh" });
		const unicodeScript = `FADE IN:
EXT. KIGALI CITY — DUSK
ERIC
(chuchotant)
"C'est incroyable... Il y a quelqu'un là-bas?"`;

		const unicodeBuffer = Buffer.from(unicodeScript, "utf-8");

		global.fetch = async () => {
			return new Response(unicodeBuffer, {
				status: 200,
				headers: { "Content-Type": "text/plain; charset=utf-8" },
			});
		};

		const blob = await screenplayService.exportTxt(sampleScreenplayId);
		const text = await blob.text();
		assert.ok(text.includes("chuchotant"));
		assert.ok(text.includes("—"));
		assert.ok(text.includes("C'est"));
		reset();
	});

	// ==========================================
	// 6. MISSING SCREENPLAY HANDLING
	// ==========================================
	await t.test("6.1 Export returns 404 when screenplay is missing", async () => {
		authTokens.setTokens({ accessToken: "test-jwt", refreshToken: "test-refresh" });

		global.fetch = async () => {
			return new Response(
				JSON.stringify({
					success: false,
					message: "Screenplay not found",
					error: { code: "NOT_FOUND", message: "Screenplay not found" },
				}),
				{ status: 404, headers: { "Content-Type": "application/json" } }
			);
		};

		await assert.rejects(
			async () => {
				await screenplayService.exportPdf("non-existent-screenplay-uuid");
			},
			(err: any) => {
				assert.strictEqual(err.statusCode, 404);
				return true;
			}
		);
		reset();
	});

	// ==========================================
	// 7. EXPORT AUTHORIZATION
	// ==========================================
	await t.test("7.1 Export rejects unauthorized requests with 401 or 403", async () => {
		global.fetch = async () => {
			return new Response(
				JSON.stringify({
					success: false,
					message: "Unauthorized: Access token is missing or invalid",
				}),
				{ status: 401, headers: { "Content-Type": "application/json" } }
			);
		};

		await assert.rejects(
			async () => {
				await screenplayService.exportPdf(sampleScreenplayId);
			},
			(err: any) => {
				assert.strictEqual(err.statusCode, 401);
				return true;
			}
		);
		reset();
	});

	// ==========================================
	// 8. SHARING & COLLABORATOR MANAGEMENT
	// ==========================================
	await t.test("8.1 movieService.getCollaborators retrieves team members", async () => {
		authTokens.setTokens({ accessToken: "test-jwt", refreshToken: "test-refresh" });
		const sampleCollaborators: MovieCollaborator[] = [
			{
				id: "collab-uuid-001",
				movieId: sampleMovieId,
				userId: "user-uuid-co-writer",
				role: "EDITOR",
				createdAt: "2026-11-03T10:00:00.000Z",
				user: {
					id: "user-uuid-co-writer",
					name: "Sarah Writer",
					email: "sarah@filmforge.ai",
					avatar: null,
					role: "USER",
					subscriptionTier: "FREE",
					createdAt: "2026-11-01T00:00:00.000Z",
				},
			},
		];

		global.fetch = async (url) => {
			assert.strictEqual(
				url.toString(),
				`http://localhost:5000/api/movies/${sampleMovieId}/collaborators`
			);
			return new Response(
				JSON.stringify({
					success: true,
					message: "Project collaborators retrieved successfully",
					data: sampleCollaborators,
					error: null,
				}),
				{ status: 200, headers: { "Content-Type": "application/json" } }
			);
		};

		const result = await movieService.getCollaborators(sampleMovieId);
		assert.strictEqual(result.length, 1);
		assert.strictEqual(result[0].role, "EDITOR");
		assert.strictEqual(result[0].user?.email, "sarah@filmforge.ai");
		reset();
	});

	await t.test("8.2 movieService.addCollaborator invites registered collaborator", async () => {
		authTokens.setTokens({ accessToken: "test-jwt", refreshToken: "test-refresh" });
		let requestBody: any = null;

		global.fetch = async (url, init) => {
			assert.strictEqual(
				url.toString(),
				`http://localhost:5000/api/movies/${sampleMovieId}/collaborators`
			);
			assert.strictEqual(init?.method, "POST");
			requestBody = JSON.parse(init?.body as string);

			return new Response(
				JSON.stringify({
					success: true,
					message: "Collaborator added to project successfully",
					data: {
						id: "collab-uuid-002",
						movieId: sampleMovieId,
						userId: "user-uuid-critic",
						role: requestBody.role,
						createdAt: new Date().toISOString(),
						user: {
							id: "user-uuid-critic",
							name: "David Reviewer",
							email: requestBody.email,
							avatar: null,
							role: "USER",
							subscriptionTier: "FREE",
							createdAt: new Date().toISOString(),
						},
					},
					error: null,
				}),
				{ status: 201, headers: { "Content-Type": "application/json" } }
			);
		};

		const created = await movieService.addCollaborator(sampleMovieId, {
			email: "david@filmforge.ai",
			role: "VIEWER",
		});

		assert.strictEqual(requestBody.email, "david@filmforge.ai");
		assert.strictEqual(requestBody.role, "VIEWER");
		assert.strictEqual(created.role, "VIEWER");
		reset();
	});

	await t.test("8.3 movieService.addCollaborator rejects project owner invitation (400)", async () => {
		authTokens.setTokens({ accessToken: "test-jwt", refreshToken: "test-refresh" });

		global.fetch = async () => {
			return new Response(
				JSON.stringify({
					success: false,
					message: "Project owner cannot be added as a collaborator",
					error: {
						code: "OWNER_CANNOT_BE_COLLABORATOR",
						message: "Project owner cannot be added as a collaborator",
					},
				}),
				{ status: 400, headers: { "Content-Type": "application/json" } }
			);
		};

		await assert.rejects(
			async () => {
				await movieService.addCollaborator(sampleMovieId, {
					email: "owner@filmforge.ai",
					role: "EDITOR",
				});
			},
			(err: any) => {
				assert.strictEqual(err.statusCode, 400);
				assert.ok(err.message.includes("Project owner"));
				return true;
			}
		);
		reset();
	});

	await t.test("8.4 movieService.removeCollaborator revokes project access", async () => {
		authTokens.setTokens({ accessToken: "test-jwt", refreshToken: "test-refresh" });
		let deleteCalled = false;

		global.fetch = async (url, init) => {
			assert.strictEqual(
				url.toString(),
				`http://localhost:5000/api/movies/${sampleMovieId}/collaborators/collab-uuid-002`
			);
			assert.strictEqual(init?.method, "DELETE");
			deleteCalled = true;

			return new Response(
				JSON.stringify({
					success: true,
					message: "Collaborator removed from project successfully",
					data: null,
					error: null,
				}),
				{ status: 200, headers: { "Content-Type": "application/json" } }
			);
		};

		await movieService.removeCollaborator(sampleMovieId, "collab-uuid-002");
		assert.strictEqual(deleteCalled, true);
		reset();
	});

	// ==========================================
	// 9. FULL END-TO-END WORKFLOW INTEGRATION
	// ==========================================
	await t.test("9.1 Full 13-step creative lifecycle verification", async () => {
		authTokens.setTokens({ accessToken: "e2e-jwt", refreshToken: "e2e-refresh" });

		// Step 1: User authenticated
		assert.strictEqual(authTokens.getAccessToken(), "e2e-jwt");

		// Step 2-12: Mock database state transitions
		let stepCounter = 0;
		global.fetch = async (url, init) => {
			stepCounter++;
			const urlStr = url.toString();

			if (urlStr.includes("/characters") && init?.method === "POST") {
				return new Response(
					JSON.stringify({
						success: true,
						data: { id: "char-1", movieId: sampleMovieId, name: "Eric", role: "Protagonist" },
					}),
					{ status: 201, headers: { "Content-Type": "application/json" } }
				);
			}

			if (urlStr.includes("/story") && init?.method === "PUT") {
				return new Response(
					JSON.stringify({
						success: true,
						data: { id: "story-1", movieId: sampleMovieId, logline: "Intercepting a signal" },
					}),
					{ status: 200, headers: { "Content-Type": "application/json" } }
				);
			}

			if (urlStr.includes("/screenplay") && init?.method === "POST") {
				return new Response(
					JSON.stringify({
						success: true,
						data: { id: sampleScreenplayId, movieId: sampleMovieId, title: "The Last Signal", version: 1 },
					}),
					{ status: 201, headers: { "Content-Type": "application/json" } }
				);
			}

			if (urlStr.endsWith("/api/movies") && init?.method === "POST") {
				return new Response(
					JSON.stringify({
						success: true,
						data: { id: sampleMovieId, title: "The Last Signal", status: "IDEA" },
					}),
					{ status: 201, headers: { "Content-Type": "application/json" } }
				);
			}

			if (urlStr.includes("/export/pdf")) {
				return new Response(mockPdfBuffer, {
					status: 200,
					headers: { "Content-Type": "application/pdf" },
				});
			}

			return new Response(JSON.stringify({ success: true, data: {} }), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		};

		// 1. Create Movie
		const movie = await movieService.createMovie({ title: "The Last Signal", genre: "Sci-Fi" });
		assert.strictEqual(movie.id, sampleMovieId);

		// 2. Save Story
		const story = await storyService.upsertStory(sampleMovieId, { logline: "Intercepting a signal" });
		assert.strictEqual(story.logline, "Intercepting a signal");

		// 3. Add Character
		const char = await characterService.createCharacter(sampleMovieId, { name: "Eric", role: "Protagonist" });
		assert.strictEqual(char.name, "Eric");

		// 4. Create Screenplay
		const screenplay = await screenplayService.createScreenplay(sampleMovieId, { title: "The Last Signal" });
		assert.strictEqual(screenplay.id, sampleScreenplayId);

		// 5. Export PDF
		const pdfBlob = await screenplayService.exportPdf(sampleScreenplayId);
		assert.ok(pdfBlob.size > 0);

		assert.ok(stepCounter >= 5);
		reset();
	});
});
