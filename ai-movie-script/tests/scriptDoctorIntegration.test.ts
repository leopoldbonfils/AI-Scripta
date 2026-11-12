/**
 * FilmForge AI — Phase F Frontend Professional Script Doctor Integration Tests
 */

import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import { ApiClientError } from "../lib/api";
import { authTokens } from "../lib/auth";
import { API_ENDPOINTS } from "../lib/constants";
import {
	filterContinuityFindings,
	scriptDoctorService,
} from "../services/scriptDoctorService";
import {
	ScriptDoctorAnalysis,
	ScriptDoctorContinuityFinding,
	ScriptDoctorSuggestion,
} from "../types/scriptDoctor";

function mockJsonResponse(status: number, body: unknown): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { "Content-Type": "application/json" },
	});
}

describe("Phase F: Professional Script Doctor Frontend Integration Tests", () => {
	const originalFetch = global.fetch;
	const movieId = "44444444-4444-4444-4444-444444444444";
	const sugId = "55555555-5555-5555-5555-555555555555";
	const analysisId = "66666666-6666-6666-6666-666666666666";

	beforeEach(() => {
		authTokens.setTokens({
			accessToken: "phase-f-access-token",
			refreshToken: "phase-f-refresh-token",
		});
	});

	afterEach(() => {
		global.fetch = originalFetch;
		authTokens.clearTokens();
	});

	test("1. API_ENDPOINTS.SCRIPT_DOCTOR resolves all endpoints cleanly", () => {
		assert.strictEqual(API_ENDPOINTS.SCRIPT_DOCTOR.DASHBOARD(movieId), `/movies/${movieId}/script-doctor/dashboard`);
		assert.strictEqual(API_ENDPOINTS.SCRIPT_DOCTOR.ANALYZE(movieId), `/movies/${movieId}/script-doctor/analyze`);
		assert.strictEqual(API_ENDPOINTS.SCRIPT_DOCTOR.CONTINUITY_CHECK(movieId), `/movies/${movieId}/script-doctor/continuity-check`);
		assert.strictEqual(
			API_ENDPOINTS.SCRIPT_DOCTOR.UPDATE_FINDING(movieId, analysisId, "f-1"),
			`/movies/${movieId}/script-doctor/analyses/${analysisId}/findings/f-1`
		);
		assert.strictEqual(API_ENDPOINTS.SCRIPT_DOCTOR.SUGGESTIONS(movieId), `/movies/${movieId}/script-doctor/suggestions`);
		assert.strictEqual(
			API_ENDPOINTS.SCRIPT_DOCTOR.ACCEPT_SUGGESTION(movieId, sugId),
			`/movies/${movieId}/script-doctor/suggestions/${sugId}/accept`
		);
		assert.strictEqual(
			API_ENDPOINTS.SCRIPT_DOCTOR.REJECT_SUGGESTION(movieId, sugId),
			`/movies/${movieId}/script-doctor/suggestions/${sugId}/reject`
		);
		assert.strictEqual(
			API_ENDPOINTS.SCRIPT_DOCTOR.COMPARE_VERSIONS(movieId),
			`/movies/${movieId}/script-doctor/versions/compare`
		);
	});

	test("2. filterContinuityFindings filters by severity, category, and intentionality", () => {
		const findings: ScriptDoctorContinuityFinding[] = [
			{
				id: "f1",
				severity: "CRITICAL",
				category: "DECEASED_APPEARANCE",
				description: "Dead character appears in Scene 4",
				evidenceFromScreenplay: "Scene 4 heading",
				whyItMatters: "Breaks canon",
				suggestedResolution: "Mark Flashback",
				confidence: 0.95,
				intentionality: "CONFIRMED_CONTRADICTION",
			},
			{
				id: "f2",
				severity: "LOW",
				category: "OBJECT_CONTINUITY",
				description: "Key withheld",
				evidenceFromScreenplay: "Scene 1",
				whyItMatters: "Suspense",
				suggestedResolution: "Keep",
				confidence: 0.8,
				intentionality: "INTENTIONAL_CHOICE",
			},
		];

		assert.strictEqual(filterContinuityFindings(findings, { severity: "CRITICAL" }).length, 1);
		assert.strictEqual(filterContinuityFindings(findings, { intentionality: "INTENTIONAL_CHOICE" }).length, 1);
		assert.strictEqual(filterContinuityFindings(findings, { category: "DECEASED_APPEARANCE" }).length, 1);
		assert.strictEqual(filterContinuityFindings(findings, { severity: "ALL" }).length, 2);
	});

	test("3. Full suggestion review flow: analyze -> generate -> edit -> partial accept -> reject -> compare versions", async () => {
		const calls: Array<{ url: string; method: string }> = [];

		global.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
			const url = typeof input === "string" ? input : input.toString();
			const method = init?.method || "GET";
			calls.push({ url, method });

			if (url.endsWith("/continuity-check")) {
				const analysis: Partial<ScriptDoctorAnalysis> = {
					id: analysisId,
					analysisScope: "CONTINUITY_ONLY",
					isPartialAnalysis: false,
					continuityFindingsJson: [],
				};
				return mockJsonResponse(201, { success: true, data: analysis });
			}

			if (url.endsWith("/suggestions")) {
				const sug: Partial<ScriptDoctorSuggestion> = {
					id: sugId,
					operationType: "REWRITE",
					status: "PENDING",
					isStale: false,
				};
				return mockJsonResponse(201, { success: true, data: sug });
			}

			if (method === "PATCH" && url.endsWith(`/suggestions/${sugId}`)) {
				return mockJsonResponse(200, {
					success: true,
					data: { id: sugId, status: "EDITED", writerEditedText: "Edited text" },
				});
			}

			if (url.endsWith("/accept")) {
				return mockJsonResponse(200, {
					success: true,
					data: {
						suggestion: { id: sugId, status: "PARTIALLY_ACCEPTED" },
						screenplay: { id: "sp-1", content: "Updated", version: 2, wordCount: 100, pageCount: 1 },
						appliedVersion: { id: "ver-2", versionNumber: 2 },
						pendingBibleProposalsCreated: 1,
					},
				});
			}

			if (url.endsWith("/reject")) {
				return mockJsonResponse(200, {
					success: true,
					data: { id: sugId, status: "REJECTED" },
				});
			}

			if (url.includes("/versions/compare")) {
				return mockJsonResponse(200, {
					success: true,
					data: {
						fromVersion: { id: "ver-1", versionNumber: 1, title: "Draft" },
						toLabel: "Current Draft (v2)",
						diff: { hasChanges: true, stats: { addedLines: 2, removedLines: 1, modifiedHunks: 1, unchangedLines: 5 }, hunks: [], sideBySideRows: [], sceneMarkers: [] },
					},
				});
			}

			return mockJsonResponse(404, { success: false, message: "Not found" });
		}) as typeof fetch;

		const audit = await scriptDoctorService.runAnalysis(movieId, {
			analysisScope: "CONTINUITY_ONLY",
		});
		assert.strictEqual(audit.id, analysisId);

		const created = await scriptDoctorService.generateSuggestion(movieId, {
			operationType: "REWRITE",
			targetScope: "SCENE",
			targetSceneNumber: 1,
			directions: "Tighten pace",
		});
		assert.strictEqual(created.status, "PENDING");

		const edited = await scriptDoctorService.editSuggestion(movieId, sugId, "Edited text");
		assert.strictEqual(edited.status, "EDITED");

		const accepted = await scriptDoctorService.acceptSuggestion(movieId, sugId, {
			acceptedHunkIds: ["hunk-1"],
		});
		assert.strictEqual(accepted.suggestion.status, "PARTIALLY_ACCEPTED");
		assert.strictEqual(accepted.appliedVersion.versionNumber, 2);

		const rejected = await scriptDoctorService.rejectSuggestion(movieId, sugId, "Keep original");
		assert.strictEqual(rejected.status, "REJECTED");

		const cmp = await scriptDoctorService.compareVersions(movieId, "sp-1", "ver-1", "CURRENT");
		assert.strictEqual(cmp.diff.hasChanges, true);
		assert.strictEqual(calls.length, 6);
	});

	test("4. Propagates 409 STALE_PROPOSAL & DUPLICATE_ACCEPTANCE via ApiClientError", async () => {
		global.fetch = (async () =>
			mockJsonResponse(409, {
				success: false,
				message: "The screenplay was modified after this proposal was generated.",
			})) as typeof fetch;

		await assert.rejects(
			() => scriptDoctorService.acceptSuggestion(movieId, sugId, {}),
			(err: unknown) => {
				assert(err instanceof ApiClientError);
				assert.strictEqual(err.statusCode, 409);
				return true;
			}
		);
	});
});

