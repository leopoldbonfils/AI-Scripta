/**
 * FilmForge AI — Phase E Frontend Complete Screenplay Generation Integration Tests
 */

import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import { ApiClientError } from "../lib/api";
import { authTokens } from "../lib/auth";
import { API_ENDPOINTS } from "../lib/constants";
import {
	formatJobStatusLabel,
	isJobActivelyPolling,
	screenplayGenerationService,
} from "../services/screenplayGenerationService";
import {
	PreGenerationReadinessReport,
	ScreenplayGenerationJob,
} from "../types/screenplayGeneration";

function mockJsonResponse(status: number, body: unknown): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { "Content-Type": "application/json" },
	});
}

describe("Phase E: Complete Screenplay Generation Frontend Integration Tests", () => {
	const originalFetch = global.fetch;
	const movieId = "22222222-2222-2222-2222-222222222222";
	const jobId = "33333333-3333-3333-3333-333333333333";

	beforeEach(() => {
		authTokens.setTokens({
			accessToken: "phase-e-access-token",
			refreshToken: "phase-e-refresh-token",
		});
	});

	afterEach(() => {
		global.fetch = originalFetch;
		authTokens.clearTokens();
	});

	test("1. API_ENDPOINTS.SCREENPLAY_GENERATION resolves all 13 endpoints", () => {
		assert.strictEqual(
			API_ENDPOINTS.SCREENPLAY_GENERATION.READINESS(movieId),
			`/movies/${movieId}/screenplay-generation/readiness`
		);
		assert.strictEqual(
			API_ENDPOINTS.SCREENPLAY_GENERATION.LATEST(movieId),
			`/movies/${movieId}/screenplay-generation/latest`
		);
		assert.strictEqual(
			API_ENDPOINTS.SCREENPLAY_GENERATION.START(movieId),
			`/movies/${movieId}/screenplay-generation/start`
		);
		assert.strictEqual(
			API_ENDPOINTS.SCREENPLAY_GENERATION.GET_JOB(movieId, jobId),
			`/movies/${movieId}/screenplay-generation/jobs/${jobId}`
		);
		assert.strictEqual(
			API_ENDPOINTS.SCREENPLAY_GENERATION.UPDATE_ACT(movieId, jobId, "act-1"),
			`/movies/${movieId}/screenplay-generation/jobs/${jobId}/acts/act-1`
		);
		assert.strictEqual(
			API_ENDPOINTS.SCREENPLAY_GENERATION.APPROVE_ACTS(movieId, jobId),
			`/movies/${movieId}/screenplay-generation/jobs/${jobId}/approve-acts`
		);
		assert.strictEqual(
			API_ENDPOINTS.SCREENPLAY_GENERATION.UPDATE_SCENE(movieId, jobId, "sc-1"),
			`/movies/${movieId}/screenplay-generation/jobs/${jobId}/scenes/sc-1`
		);
		assert.strictEqual(
			API_ENDPOINTS.SCREENPLAY_GENERATION.APPROVE_SCENES(movieId, jobId),
			`/movies/${movieId}/screenplay-generation/jobs/${jobId}/approve-scenes`
		);
		assert.strictEqual(
			API_ENDPOINTS.SCREENPLAY_GENERATION.PAUSE(movieId, jobId),
			`/movies/${movieId}/screenplay-generation/jobs/${jobId}/pause`
		);
		assert.strictEqual(
			API_ENDPOINTS.SCREENPLAY_GENERATION.RESUME(movieId, jobId),
			`/movies/${movieId}/screenplay-generation/jobs/${jobId}/resume`
		);
		assert.strictEqual(
			API_ENDPOINTS.SCREENPLAY_GENERATION.CANCEL(movieId, jobId),
			`/movies/${movieId}/screenplay-generation/jobs/${jobId}/cancel`
		);
		assert.strictEqual(
			API_ENDPOINTS.SCREENPLAY_GENERATION.RETRY_SCENE(movieId, jobId, "sc-1"),
			`/movies/${movieId}/screenplay-generation/jobs/${jobId}/scenes/sc-1/retry`
		);
		assert.strictEqual(
			API_ENDPOINTS.SCREENPLAY_GENERATION.COMMIT(movieId, jobId),
			`/movies/${movieId}/screenplay-generation/jobs/${jobId}/commit`
		);
	});

	test("2. Active polling predicate and status labels handle all pipeline checkpoints", () => {
		assert.strictEqual(isJobActivelyPolling("QUEUED"), true);
		assert.strictEqual(isJobActivelyPolling("GENERATING_ACTS"), true);
		assert.strictEqual(isJobActivelyPolling("GENERATING_SCENES"), true);
		assert.strictEqual(isJobActivelyPolling("GENERATING_SCREENPLAY"), true);
		assert.strictEqual(isJobActivelyPolling("VALIDATING_CONTINUITY"), true);
		assert.strictEqual(isJobActivelyPolling("ASSEMBLING"), true);

		assert.strictEqual(isJobActivelyPolling("AWAITING_ACT_APPROVAL"), false);
		assert.strictEqual(isJobActivelyPolling("AWAITING_SCENE_APPROVAL"), false);
		assert.strictEqual(isJobActivelyPolling("PAUSED"), false);
		assert.strictEqual(isJobActivelyPolling("PARTIALLY_COMPLETED"), false);
		assert.strictEqual(isJobActivelyPolling("COMPLETED"), false);
		assert.strictEqual(isJobActivelyPolling("CANCELLED"), false);

		assert.strictEqual(formatJobStatusLabel("AWAITING_ACT_APPROVAL"), "Awaiting Act Approval");
		assert.strictEqual(formatJobStatusLabel("PARTIALLY_COMPLETED"), "Partially Completed");
	});

	test("3. Full frontend service roundtrip: readiness -> start -> approve acts -> approve scenes -> commit", async () => {
		const calls: Array<{ url: string; method: string }> = [];

		global.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
			const url = typeof input === "string" ? input : input.toString();
			const method = init?.method || "GET";
			calls.push({ url, method });

			if (url.endsWith("/readiness")) {
				const report: PreGenerationReadinessReport = {
					readyToGenerate: true,
					hasStoryFoundation: true,
					hasCharacters: true,
					hasStoryIntelligence: true,
					hasStoryBible: true,
					existingActsCount: 0,
					existingScenesCount: 0,
					existingScreenplaysCount: 1,
					approvedFacts: ["Project title: Antwerp"],
					approvedDecisions: ["Ending beat defined"],
					aiSuggestions: [],
					unresolvedContinuity: [],
					missingInformation: [],
					conflictingInformation: [],
					assumptionsRequiringApproval: ["Non-destructive draft will be created"],
				};
				return mockJsonResponse(200, { success: true, data: report });
			}

			if (url.endsWith("/start")) {
				const job: Partial<ScreenplayGenerationJob> = {
					id: jobId,
					movieId,
					mode: "APPROVAL_GATED",
					status: "QUEUED",
					progressPercent: 2,
				};
				return mockJsonResponse(202, {
					success: true,
					data: { job, isDuplicate: false },
				});
			}

			if (url.endsWith("/approve-acts")) {
				return mockJsonResponse(202, {
					success: true,
					data: { id: jobId, status: "GENERATING_SCENES", progressPercent: 20 },
				});
			}

			if (url.endsWith("/approve-scenes")) {
				return mockJsonResponse(202, {
					success: true,
					data: { id: jobId, status: "GENERATING_SCREENPLAY", progressPercent: 40 },
				});
			}

			if (url.endsWith("/commit")) {
				return mockJsonResponse(201, {
					success: true,
					data: {
						screenplay: { id: "sp-new", title: "Draft 2", version: 1, wordCount: 820, pageCount: 4 },
						syncedActs: 3,
						syncedScenes: 6,
						job: { id: jobId, status: "COMPLETED", assembledScreenplayId: "sp-new" },
					},
				});
			}

			return mockJsonResponse(404, { success: false, message: "Not found" });
		}) as typeof fetch;

		const readiness = await screenplayGenerationService.getReadiness(movieId);
		assert.strictEqual(readiness.readyToGenerate, true);

		const start = await screenplayGenerationService.startJob(movieId, {
			mode: "APPROVAL_GATED",
			requestedStructure: "AUTO",
		});
		assert.strictEqual(start.isDuplicate, false);
		assert.strictEqual(start.job.status, "QUEUED");

		const actsApproved = await screenplayGenerationService.approveActs(movieId, jobId);
		assert.strictEqual(actsApproved.status, "GENERATING_SCENES");

		const scenesApproved = await screenplayGenerationService.approveScenes(movieId, jobId);
		assert.strictEqual(scenesApproved.status, "GENERATING_SCREENPLAY");

		const commitRes = await screenplayGenerationService.commitToScreenplay(movieId, jobId, {
			syncOutlineActsAndScenes: true,
		});
		assert.strictEqual(commitRes.screenplay.id, "sp-new");
		assert.strictEqual(commitRes.syncedScenes, 6);
		assert.strictEqual(calls.length, 5);
	});

	test("4. Preserves 409 MANUAL_EDIT_PROTECTION statusCode via ApiClientError on scene retry", async () => {
		global.fetch = (async () =>
			mockJsonResponse(409, {
				success: false,
				message: "Scene has manual writer edits. Pass confirmOverwriteEdited: true to overwrite.",
			})) as typeof fetch;

		await assert.rejects(
			() => screenplayGenerationService.retryScene(movieId, jobId, "sc-1", {}),
			(err: unknown) => {
				assert(err instanceof ApiClientError);
				assert.strictEqual(err.statusCode, 409);
				return true;
			}
		);
	});
});

