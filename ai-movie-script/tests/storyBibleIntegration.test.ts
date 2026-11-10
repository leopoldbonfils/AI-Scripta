/**
 * FilmForge AI — Phase D Frontend Story Bible & Continuity Integration Tests
 */

import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import { ApiClientError } from "../lib/api";
import { authTokens } from "../lib/auth";
import { API_ENDPOINTS } from "../lib/constants";
import { storyBibleService } from "../services/storyBibleService";
import {
	StoryBible,
	ContinuityFinding,
	MemoryUpdateProposal,
	NarrativeTimelineEvent,
	NarrativeContextBundle,
} from "../types/storyBible";

function mockJsonResponse(status: number, body: unknown): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { "Content-Type": "application/json" },
	});
}

describe("Phase D: Story Bible & Continuity Integration Tests", () => {
	const originalFetch = global.fetch;
	const movieId = "11111111-1111-1111-1111-111111111111";

	beforeEach(() => {
		authTokens.setTokens({ accessToken: "test-access-token", refreshToken: "test-refresh-token" });
	});

	afterEach(() => {
		global.fetch = originalFetch;
		authTokens.clearTokens();
	});

	test("1. API_ENDPOINTS.STORY_BIBLE resolves all 13 backend endpoints cleanly", () => {
		assert.strictEqual(API_ENDPOINTS.STORY_BIBLE.GET(movieId), `/movies/${movieId}/story-bible`);
		assert.strictEqual(API_ENDPOINTS.STORY_BIBLE.BUILD(movieId), `/movies/${movieId}/story-bible/build`);
		assert.strictEqual(API_ENDPOINTS.STORY_BIBLE.IDENTITY(movieId), `/movies/${movieId}/story-bible/identity`);
		assert.strictEqual(API_ENDPOINTS.STORY_BIBLE.CREATE_ENTRY(movieId), `/movies/${movieId}/story-bible/entries`);
		assert.strictEqual(
			API_ENDPOINTS.STORY_BIBLE.UPDATE_ENTRY(movieId, "CHARACTER", "c-1"),
			`/movies/${movieId}/story-bible/entries/CHARACTER/c-1`
		);
		assert.strictEqual(
			API_ENDPOINTS.STORY_BIBLE.ANALYZE_CONTINUITY(movieId),
			`/movies/${movieId}/story-bible/continuity/analyze`
		);
		assert.strictEqual(
			API_ENDPOINTS.STORY_BIBLE.UPDATE_FINDING(movieId, "f-1"),
			`/movies/${movieId}/story-bible/continuity/f-1`
		);
		assert.strictEqual(
			API_ENDPOINTS.STORY_BIBLE.DETECT_CHANGES(movieId),
			`/movies/${movieId}/story-bible/detect-changes`
		);
		assert.strictEqual(
			API_ENDPOINTS.STORY_BIBLE.REVIEW_PROPOSAL(movieId, "p-1"),
			`/movies/${movieId}/story-bible/proposals/p-1`
		);
		assert.strictEqual(
			API_ENDPOINTS.STORY_BIBLE.BATCH_REVIEW_PROPOSALS(movieId),
			`/movies/${movieId}/story-bible/proposals/review-batch`
		);
		assert.strictEqual(API_ENDPOINTS.STORY_BIBLE.HISTORY(movieId), `/movies/${movieId}/story-bible/history`);
		assert.strictEqual(
			API_ENDPOINTS.STORY_BIBLE.RESTORE_VERSION(movieId, "v-1"),
			`/movies/${movieId}/story-bible/history/v-1/restore`
		);
		assert.strictEqual(API_ENDPOINTS.STORY_BIBLE.CONTEXT(movieId), `/movies/${movieId}/story-bible/context`);
	});

	test("2. getStoryBible handles uninitialized null state and populated response", async () => {
		let callCount = 0;
		global.fetch = (async () => {
			callCount++;
			if (callCount === 1) {
				return mockJsonResponse(200, { success: true, message: "Empty", data: null });
			}
			const sample: Partial<StoryBible> = {
				id: "sb-1",
				movieId,
				title: "The Watchmaker of Antwerp",
				currentVersion: 2,
				analysisStatus: "COMPLETE",
				isPartialAnalysis: false,
				chunksProcessed: 2,
				totalChunks: 2,
				themes: ["Justice vs Cover-Up"],
				worldRules: [],
				narrativeFacts: [],
				characters: [],
				relationships: [],
				locations: [],
				entities: [],
				timelineEvents: [],
				sceneConnections: [],
				continuityFindings: [],
				proposals: [],
			};
			return mockJsonResponse(200, { success: true, message: "OK", data: sample });
		}) as typeof fetch;

		const empty = await storyBibleService.getStoryBible(movieId);
		assert.strictEqual(empty, null);

		const loaded = await storyBibleService.getStoryBible(movieId);
		assert.ok(loaded);
		assert.strictEqual(loaded.title, "The Watchmaker of Antwerp");
		assert.strictEqual(loaded.currentVersion, 2);
	});

	test("3. buildStoryBible sends sourceText/mode and propagates partial-analysis flags", async () => {
		let capturedBody: any = null;
		global.fetch = (async (_url, init) => {
			capturedBody = JSON.parse(String(init?.body || "{}"));
			return mockJsonResponse(201, {
				success: true,
				message: "Built",
				data: {
					id: "sb-1",
					movieId,
					title: "Partial Draft",
					currentVersion: 2,
					analysisStatus: "PARTIAL",
					isPartialAnalysis: true,
					chunksProcessed: 1,
					totalChunks: 3,
				},
			});
		}) as typeof fetch;

		const result = await storyBibleService.buildStoryBible(movieId, {
			mode: "MERGE_PROPOSALS",
			sourceText: "Chapter 1 long text...",
		});

		assert.strictEqual(capturedBody.mode, "MERGE_PROPOSALS");
		assert.strictEqual(result.isPartialAnalysis, true);
		assert.strictEqual(result.analysisStatus, "PARTIAL");
		assert.strictEqual(result.chunksProcessed, 1);
		assert.strictEqual(result.totalChunks, 3);
	});

	test("4. updateIdentity, createEntry, updateEntry and duplicate 409 conflict handling", async () => {
		const calls: Array<{ method: string; url: string }> = [];
		global.fetch = (async (url, init) => {
			const method = String(init?.method || "GET");
			const urlStr = String(url);
			calls.push({ method, url: urlStr });

			if (urlStr.endsWith("/identity")) {
				return mockJsonResponse(200, {
					success: true,
					message: "Identity updated",
					data: { id: "sb-1", movieId, title: "Updated Title", genre: "Noir" },
				});
			}
			if (method === "POST" && urlStr.endsWith("/entries")) {
				const parsed = JSON.parse(String(init?.body || "{}"));
				if (parsed.data?.name === "Duplicate Hall") {
					return mockJsonResponse(409, {
						success: false,
						message: "Location already exists",
						code: "DUPLICATE_ENTRY",
					});
				}
				return mockJsonResponse(201, {
					success: true,
					message: "Created",
					data: { id: "loc-1", name: parsed.data.name },
				});
			}
			return mockJsonResponse(200, {
				success: true,
				message: "Updated",
				data: { id: "loc-1", geographicContext: "Antwerp Canal" },
			});
		}) as typeof fetch;

		const updatedIdentity = await storyBibleService.updateIdentity(movieId, {
			genre: "Noir",
			changeReason: "Tighten genre",
		});
		assert.strictEqual(updatedIdentity.genre, "Noir");

		const created = await storyBibleService.createEntry(
			movieId,
			"LOCATION",
			{ name: "Voss Workshop" },
			"Add main shop"
		);
		assert.strictEqual(created.id, "loc-1");

		const patched = await storyBibleService.updateEntry(
			movieId,
			"LOCATION",
			"loc-1",
			{ geographicContext: "Antwerp Canal" },
			"Specify canal zone"
		);
		assert.strictEqual(patched.geographicContext, "Antwerp Canal");

		await assert.rejects(
			() => storyBibleService.createEntry(movieId, "LOCATION", { name: "Duplicate Hall" }),
			(err: unknown) => err instanceof ApiClientError && err.statusCode === 409
		);
		assert.strictEqual(calls.length, 4);
	});

	test("5. analyzeContinuity & updateContinuityFinding handle contradictions, intentional mysteries & resolution", async () => {
		const mockFinding: ContinuityFinding = {
			id: "find-1",
			storyBibleId: "sb-1",
			category: "CHARACTER_CONTINUITY",
			classification: "CONFIRMED_CONTRADICTION",
			severity: "CRITICAL",
			title: "Dead character appears in Scene 9",
			description: "Victor Brandt dies in Scene 6 but speaks in Scene 9.",
			affectedSceneIds: ["sc-9"],
			relatedEntityIds: ["char-3"],
			conflictingEntries: ["Scene 6 Death", "Scene 9 Dialogue"],
			confidenceScore: 0.96,
			status: "PENDING",
			createdAt: "2026-11-10T12:00:00Z",
		};

		global.fetch = (async (url, init) => {
			if (String(url).endsWith("/continuity/analyze")) {
				return mockJsonResponse(200, { success: true, message: "Analyzed", data: [mockFinding] });
			}
			const body = JSON.parse(String(init?.body || "{}"));
			return mockJsonResponse(200, {
				success: true,
				message: "Updated",
				data: { ...mockFinding, status: body.status, classification: body.classification || mockFinding.classification, resolutionNote: body.resolutionNote },
			});
		}) as typeof fetch;

		const findings = await storyBibleService.analyzeContinuity(movieId, { includeScreenplayText: true });
		assert.strictEqual(findings.length, 1);
		assert.strictEqual(findings[0].classification, "CONFIRMED_CONTRADICTION");

		const resolved = await storyBibleService.updateContinuityFinding(movieId, "find-1", {
			status: "RESOLVED",
			classification: "INTENTIONAL_MYSTERY",
			resolutionNote: "Frame Scene 9 as hallucination",
		});
		assert.strictEqual(resolved.status, "RESOLVED");
		assert.strictEqual(resolved.classification, "INTENTIONAL_MYSTERY");
	});

	test("6. detectChanges, reviewProposal (accept/edit/reject) & batchReviewProposals empty-array safety", async () => {
		let capturedBatchBody: any = null;
		const baseProposal: MemoryUpdateProposal = {
			id: "prop-1",
			storyBibleId: "sb-1",
			targetType: "CHARACTER",
			targetLabel: "Character: Julian Voss",
			proposedAction: "UPDATE",
			proposedValue: { goals: "Expose Klein" },
			changeReason: "Character goal update",
			sourceType: "CHARACTER_EDIT",
			evidenceLevel: "SOURCE_FACT",
			affectedSceneIds: [],
			potentialConflicts: [],
			status: "PENDING",
			createdAt: "2026-11-10T12:00:00Z",
		};

		global.fetch = (async (url, init) => {
			const urlStr = String(url);
			const body = JSON.parse(String(init?.body || "{}"));
			if (urlStr.endsWith("/detect-changes")) {
				return mockJsonResponse(200, {
					success: true,
					message: "Detected",
					data: { proposalsCreated: 1, warningsCreated: 0, proposals: [baseProposal] },
				});
			}
			if (urlStr.endsWith("/proposals/review-batch")) {
				capturedBatchBody = body;
				return mockJsonResponse(200, {
					success: true,
					message: "Batch reviewed",
					data: {
						reviewedCount: body.proposalIds.length,
						proposals: body.proposalIds.map((id: string) => ({ ...baseProposal, id, status: body.status })),
					},
				});
			}
			return mockJsonResponse(200, {
				success: true,
				message: "Reviewed",
				data: { ...baseProposal, status: body.status, proposedValue: body.editedValue || baseProposal.proposedValue },
			});
		}) as typeof fetch;

		const detectRes = await storyBibleService.detectChanges(movieId, {
			changeType: "CHARACTER_EDIT",
			summary: "Julian shifts objective",
		});
		assert.strictEqual(detectRes.proposalsCreated, 1);

		const emptyBatch = await storyBibleService.batchReviewProposals(movieId, {
			proposalIds: [],
			status: "ACCEPTED",
		});
		assert.deepStrictEqual(capturedBatchBody.proposalIds, []);
		assert.strictEqual(emptyBatch.reviewedCount, 0);

		const acceptedEdited = await storyBibleService.reviewProposal(movieId, "prop-1", {
			status: "ACCEPTED",
			editedValue: { goals: "Writer Approved Custom Goal" },
			changeReason: "Editorial precision",
		});
		assert.strictEqual(acceptedEdited.status, "ACCEPTED");
		assert.strictEqual(acceptedEdited.proposedValue.goals, "Writer Approved Custom Goal");

		const rejected = await storyBibleService.reviewProposal(movieId, "prop-2", { status: "REJECTED" });
		assert.strictEqual(rejected.status, "REJECTED");
	});

	test("7. getHistory, restoreVersion & token-budgeted retrieveContext plus 403/502 error propagation", async () => {
		const contextBundle: NarrativeContextBundle = {
			movieId,
			storyBibleId: "sb-1",
			estimatedTokens: 640,
			tokenBudget: 3000,
			truncated: false,
			storyIdentity: { title: "The Watchmaker", themes: ["Justice"], worldRules: [], keyFacts: [] },
			relevantCharacters: [],
			relevantRelationships: [],
			relevantLocations: [],
			relevantEntities: [],
			timelineConstraints: [],
			relatedSceneConnections: [],
			unresolvedContinuityWarnings: [],
		};

		global.fetch = (async (url) => {
			const u = String(url);
			if (u.endsWith("/history")) {
				return mockJsonResponse(200, {
					success: true,
					message: "History",
					data: [{ id: "ver-2", versionNumber: 2, source: "USER_MANUAL_EDIT", changeReason: "Update" }],
				});
			}
			if (u.endsWith("/restore")) {
				return mockJsonResponse(200, {
					success: true,
					message: "Restored",
					data: { id: "sb-1", movieId, title: "The Watchmaker", currentVersion: 3 },
				});
			}
			if (u.endsWith("/context")) {
				return mockJsonResponse(200, { success: true, message: "Context", data: contextBundle });
			}
			return mockJsonResponse(502, { success: false, message: "Malformed AI schema", code: "SCHEMA_VALIDATION_ERROR" });
		}) as typeof fetch;

		const history = await storyBibleService.getHistory(movieId);
		assert.strictEqual(history.length, 1);
		assert.strictEqual(history[0].versionNumber, 2);

		const restored = await storyBibleService.restoreVersion(movieId, "ver-2", "Rollback draft");
		assert.strictEqual(restored.currentVersion, 3);

		const ctx = await storyBibleService.retrieveContext(movieId, { sceneNumber: 3, maxTokens: 3000 });
		assert.ok(ctx.estimatedTokens <= ctx.tokenBudget);
		assert.strictEqual(ctx.truncated, false);

		await assert.rejects(
			() => storyBibleService.buildStoryBible(movieId, { mode: "INITIALIZE" }),
			(err: unknown) => err instanceof ApiClientError && err.statusCode === 502
		);
	});

	test("8. Timeline chronological vs screenplay ordering & continuity filter logic preserve unknown timing", () => {
		const events: NarrativeTimelineEvent[] = [
			{
				id: "e1",
				storyBibleId: "sb-1",
				title: "Opening Rain",
				eventType: "PLOT_EVENT",
				chronologicalOrder: 3,
				screenplayOrder: 1,
				isFlashback: false,
				isParallel: false,
				timingCertainty: "EXPLICIT",
				narrativeTimeLabel: "Day 1 Dusk",
				relatedCharacters: [],
				relatedLocations: [],
				relatedObjects: [],
				evidenceLevel: "SOURCE_FACT",
			},
			{
				id: "e2",
				storyBibleId: "sb-1",
				title: "Five Years Ago Skiff Sinking",
				eventType: "FLASHBACK",
				chronologicalOrder: 1,
				screenplayOrder: 8,
				isFlashback: true,
				isParallel: false,
				timingCertainty: "UNKNOWN",
				narrativeTimeLabel: null,
				relatedCharacters: [],
				relatedLocations: [],
				relatedObjects: [],
				evidenceLevel: "SOURCE_FACT",
			},
		];

		const byChrono = [...events].sort((a, b) => a.chronologicalOrder - b.chronologicalOrder);
		const byScreenplay = [...events].sort(
			(a, b) => (a.screenplayOrder ?? 9999) - (b.screenplayOrder ?? 9999) || a.chronologicalOrder - b.chronologicalOrder
		);

		assert.strictEqual(byChrono[0].id, "e2");
		assert.strictEqual(byChrono[0].narrativeTimeLabel, null);
		assert.strictEqual(byChrono[0].timingCertainty, "UNKNOWN");
		assert.strictEqual(byScreenplay[0].id, "e1");
		assert.strictEqual(byScreenplay[1].id, "e2");
	});
});

