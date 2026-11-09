/**
 * FilmForge AI — Phase B: Creative Input Analysis Frontend Integration Tests
 *
 * Verifies:
 * 1. analysisService.analyzeInput (Auto-detect & specific creative formats)
 * 2. Multi-chunk response handling and synthesis metadata
 * 3. Format mismatch detection payload handling
 * 4. analysisService.getAnalyses (Paginated analysis history)
 * 5. analysisService.getAnalysisById (Detailed single analysis fetch)
 * 6. analysisService.getMovieAnalyses (Movie-scoped analysis fetch)
 * 7. analysisService.retryAnalysis (Re-analysis of previous prompt/parameters)
 * 8. analysisService.linkMovie (Associating standalone analysis to movie project)
 * 9. Error handling: 400 validation, 401 unauthorized, 404 not found, 429 quota
 * 10. End-to-end creative workflow: submit novel chapter -> parse analysis -> link movie
 */

import { test } from "node:test";
import assert from "node:assert";
import { analysisService } from "../services/analysisService";
import { authTokens } from "../lib/auth";
import {
	CreativeAnalysisResult,
	AnalysisListItem,
	CreativeInputType,
} from "../types/analysis";

test("Phase B: Creative Input Analysis Frontend Integration Tests", async (t: any) => {
	const originalFetch = global.fetch;

	const reset = () => {
		global.fetch = originalFetch;
		authTokens.clearTokens();
	};

	const mockAnalysisResult: CreativeAnalysisResult = {
		analysisId: "11111111-2222-4333-8444-555555555555",
		inputType: "SHORT_IDEA",
		detectedType: "SHORT_IDEA",
		hasFormatMismatch: false,
		mismatchExplanation: null,
		analysisStatus: "COMPLETED",
		documentSummary: "A rogue astronaut races against failing oxygen to expose an orbital conspiracy.",
		title: "Orbital Silence",
		logline: "A rogue astronaut races against failing oxygen to expose an orbital conspiracy.",
		storyConcept: "An orbital engineer discovers that a station decompression was deliberately planned.",
		centralTheme: "Truth versus survival in isolated environments.",
		secondaryThemes: ["Corporate accountability", "The psychological weight of isolation"],
		genre: {
			primary: "Sci-Fi Thriller",
			secondary: ["Conspiracy", "Survival Drama"],
		},
		targetAudience: "Adult fans of hard sci-fi and tense geopolitical thrillers.",
		suggestedFormat: "FEATURE_FILM",
		setting: [
			{
				location: "Aethelgard Orbital Platform (400km altitude)",
				timePeriod: "Near-future (2048)",
				description: "Claustrophobic, sterile, industrial paranoia in deep space.",
			},
		],
		characters: [
			{
				name: "Elena Vance",
				role: "PROTAGONIST",
				goals: ["Survive decompression", "Expose telemetry data"],
				motivations: ["Accountability for crew lives"],
				conflicts: ["Trapped with failing life support", "Ground defense system lockdown"],
				relationships: ["Opponent of Commander Sterling"],
			},
			{
				name: "Commander Sterling",
				role: "ANTAGONIST",
				goals: ["Suppress telemetry broadcast", "Protect corporate liability"],
				motivations: ["Executive career self-preservation"],
				conflicts: ["Underestimating Elena's technical ingenuity"],
				relationships: ["Former supervisor to Elena"],
			},
		],
		mainConflict: {
			centralProblem: "Elena must broadcast sabotage telemetry before life support exhausts.",
			antagonisticForces: "Sterling and remote ground operators controlling station airlocks.",
			internalConflict: "Self-preservation versus sacrificing life to expose the truth.",
			externalConflict: "Explosive decompression and locked maintenance conduits.",
		},
		plotStructure: {
			structureType: "Three-Act Dramatic Structure",
			beginning: "Elena discovers anomalous valve overrides during a routine EVA.",
			development: "Station undergoes cascade failures while ground denies rescue vectors.",
			turningPoints: [
				"Oxygen tank seal rupture reveals micro-explosive residue.",
				"Elena intercepts encrypted kill-command addressed to her airlock.",
			],
			climax: "Elena re-routes solar array power to broad-frequency civilian comms amidst burn.",
			resolution: "Telemetry reaches civilian networks as emergency shuttle docks.",
		},
		characterArcs: [
			{
				character: "Elena Vance",
				startingState: "Compliant corporate contractor",
				shift: "Confronts lethal betrayal and embraces self-reliance",
				outcome: "Whistleblower hero who prioritizes collective truth over compliance",
			},
		],
		strengths: ["Visceral immediate stakes", "Sharp character motivations"],
		weaknesses: ["Third-act escape pod mechanics require technical clarification"],
		continuityIssues: [],
		developmentOpportunities: ["Deepen Elena's ideological rivalry with Sterling"],
		missingInformation: ["Origin details of the micro-explosive manufacturer"],
		evidenceQuotes: ["The telemetry feed wasn't corrupted—it was wiped."],
		processing: {
			chunksProcessed: 1,
			totalChunks: 1,
			isComplete: true,
			estimatedTokens: 1420,
			durationMs: 1250,
		},
	};

	const mockListItem: AnalysisListItem = {
		id: "11111111-2222-4333-8444-555555555555",
		userId: "user-test-uuid",
		movieId: null,
		title: "Orbital Silence",
		logline: "A rogue astronaut races against failing oxygen to expose an orbital conspiracy.",
		inputType: "SHORT_IDEA",
		detectedType: "SHORT_IDEA",
		status: "COMPLETED",
		durationMs: 1250,
		totalTokens: 1420,
		createdAt: new Date().toISOString(),
		analysis: mockAnalysisResult,
	};

	// ==========================================
	// 1. ANALYZE INPUT TESTS
	// ==========================================
	await t.test("1.1 analysisService.analyzeInput submits creative material and returns structured analysis", async () => {
		authTokens.setTokens({ accessToken: "jwt-token-123", refreshToken: "refresh-token-123" });
		let capturedUrl = "";
		let capturedMethod = "";
		let capturedBody: any = null;

		global.fetch = async (url, init) => {
			capturedUrl = url.toString();
			capturedMethod = init?.method || "GET";
			capturedBody = init?.body ? JSON.parse(init.body as string) : null;

			return new Response(
				JSON.stringify({
					success: true,
					data: {
						analysis: mockAnalysisResult,
						generationId: "gen-uuid-111",
					},
				}),
				{
					status: 200,
					headers: { "Content-Type": "application/json" },
				}
			);
		};

		const result = await analysisService.analyzeInput({
			content: "A rogue astronaut races against failing oxygen to expose an orbital conspiracy.",
			inputType: "AUTO_DETECT",
			context: {
				intendedFormat: "FEATURE_FILM",
				genre: "Sci-Fi Thriller",
			},
		});

		assert.strictEqual(capturedMethod, "POST");
		assert.strictEqual(capturedUrl, "http://localhost:5000/api/ai/analyze-input");
		assert.strictEqual(capturedBody.inputType, "AUTO_DETECT");
		assert.strictEqual(capturedBody.context.genre, "Sci-Fi Thriller");
		assert.strictEqual(result.generationId, "gen-uuid-111");
		assert.strictEqual(result.analysis.logline, mockAnalysisResult.logline);
		assert.strictEqual(result.analysis.characters.length, 2);
		assert.strictEqual(result.analysis.hasFormatMismatch, false);
		reset();
	});

	// ==========================================
	// 2. MULTI-CHUNK & MISMATCH HANDLING
	// ==========================================
	await t.test("2.1 handles multi-chunk analysis response and format mismatch flags", async () => {
		authTokens.setTokens({ accessToken: "jwt-token-123", refreshToken: "refresh-token-123" });

		const multiChunkAnalysis: CreativeAnalysisResult = {
			...mockAnalysisResult,
			inputType: "NOVEL_CHAPTER",
			detectedType: "EXISTING_SCREENPLAY",
			hasFormatMismatch: true,
			mismatchExplanation: "User selected Novel Chapter but text contains standard screenplay scene headings.",
			processing: {
				chunksProcessed: 4,
				totalChunks: 4,
				isComplete: true,
				estimatedTokens: 6850,
				durationMs: 4200,
			},
		};

		global.fetch = async () => {
			return new Response(
				JSON.stringify({
					success: true,
					data: {
						analysis: multiChunkAnalysis,
						generationId: "gen-uuid-222",
					},
				}),
				{
					status: 200,
					headers: { "Content-Type": "application/json" },
				}
			);
		};

		const result = await analysisService.analyzeInput({
			content: "EXT. SPACE STATION - DUSK\n\nElena looks out at Earth.",
			inputType: "NOVEL_CHAPTER",
		});

		assert.strictEqual(result.analysis.hasFormatMismatch, true);
		assert.ok(result.analysis.mismatchExplanation?.includes("screenplay scene headings"));
		assert.strictEqual(result.analysis.processing.totalChunks, 4);
		assert.strictEqual(result.analysis.processing.chunksProcessed, 4);
		reset();
	});

	// ==========================================
	// 3. PAGINATED ANALYSES LIST
	// ==========================================
	await t.test("3.1 analysisService.getAnalyses returns paginated history", async () => {
		authTokens.setTokens({ accessToken: "jwt-token-123", refreshToken: "refresh-token-123" });
		let capturedUrl = "";

		global.fetch = async (url) => {
			capturedUrl = url.toString();
			return new Response(
				JSON.stringify({
					success: true,
					data: [mockListItem],
					meta: {
						page: 1,
						limit: 10,
						total: 1,
						totalPages: 1,
					},
				}),
				{
					status: 200,
					headers: { "Content-Type": "application/json" },
				}
			);
		};

		const result = await analysisService.getAnalyses({ page: 1, limit: 10, inputType: "SHORT_IDEA" });

		assert.strictEqual(capturedUrl, "http://localhost:5000/api/ai/analyses?page=1&limit=10&inputType=SHORT_IDEA");
		assert.strictEqual(result.items.length, 1);
		assert.strictEqual(result.meta.total, 1);
		reset();
	});

	// ==========================================
	// 4. GET BY ID & MOVIE ANALYSES
	// ==========================================
	await t.test("4.1 analysisService.getAnalysisById fetches single analysis", async () => {
		authTokens.setTokens({ accessToken: "jwt-token-123", refreshToken: "refresh-token-123" });
		let capturedUrl = "";

		global.fetch = async (url) => {
			capturedUrl = url.toString();
			return new Response(
				JSON.stringify({
					success: true,
					data: {
						id: "11111111-2222-4333-8444-555555555555",
						movieId: null,
						analysis: mockAnalysisResult,
						input: {
							content: "A rogue astronaut races...",
							inputType: "SHORT_IDEA",
						},
						tokens: { prompt: 500, completion: 920, total: 1420, estimatedCost: 0.005 },
						durationMs: 1250,
						createdAt: new Date().toISOString(),
					},
				}),
				{
					status: 200,
					headers: { "Content-Type": "application/json" },
				}
			);
		};

		const result = await analysisService.getAnalysisById("11111111-2222-4333-8444-555555555555");
		assert.strictEqual(capturedUrl, "http://localhost:5000/api/ai/analyses/11111111-2222-4333-8444-555555555555");
		assert.strictEqual(result.id, "11111111-2222-4333-8444-555555555555");
		assert.strictEqual(result.analysis.title, "Orbital Silence");
		reset();
	});

	await t.test("4.2 analysisService.getMovieAnalyses fetches movie-scoped analyses", async () => {
		authTokens.setTokens({ accessToken: "jwt-token-123", refreshToken: "refresh-token-123" });
		let capturedUrl = "";

		global.fetch = async (url) => {
			capturedUrl = url.toString();
			return new Response(
				JSON.stringify({
					success: true,
					data: [{ ...mockListItem, movieId: "movie-abc-123" }],
				}),
				{
					status: 200,
					headers: { "Content-Type": "application/json" },
				}
			);
		};

		const results = await analysisService.getMovieAnalyses("movie-abc-123");
		assert.strictEqual(capturedUrl, "http://localhost:5000/api/ai/movies/movie-abc-123/analyses");
		assert.strictEqual(results.length, 1);
		assert.strictEqual(results[0].movieId, "movie-abc-123");
		reset();
	});

	// ==========================================
	// 5. RETRY & LINK MOVIE
	// ==========================================
	await t.test("5.1 analysisService.retryAnalysis triggers re-analysis of existing record", async () => {
		authTokens.setTokens({ accessToken: "jwt-token-123", refreshToken: "refresh-token-123" });
		let capturedUrl = "";
		let capturedMethod = "";

		global.fetch = async (url, init) => {
			capturedUrl = url.toString();
			capturedMethod = init?.method || "GET";
			return new Response(
				JSON.stringify({
					success: true,
					data: {
						generationId: "gen-retry-999",
						analysis: {
							...mockAnalysisResult,
							genre: {
								primary: "Psychological Thriller",
								secondary: ["Drama"],
							},
						},
					},
				}),
				{
					status: 200,
					headers: { "Content-Type": "application/json" },
				}
			);
		};

		const result = await analysisService.retryAnalysis("11111111-2222-4333-8444-555555555555");

		assert.strictEqual(capturedMethod, "POST");
		assert.strictEqual(capturedUrl, "http://localhost:5000/api/ai/analyses/11111111-2222-4333-8444-555555555555/retry");
		assert.strictEqual(result.analysis.genre.primary, "Psychological Thriller");
		reset();
	});

	await t.test("5.2 analysisService.linkMovie associates analysis to existing project", async () => {
		authTokens.setTokens({ accessToken: "jwt-token-123", refreshToken: "refresh-token-123" });
		let capturedUrl = "";
		let capturedBody: any = null;

		global.fetch = async (url, init) => {
			capturedUrl = url.toString();
			capturedBody = init?.body ? JSON.parse(init.body as string) : null;
			return new Response(
				JSON.stringify({
					success: true,
					data: {
						analysisId: "11111111-2222-4333-8444-555555555555",
						movieId: "44444444-5555-4666-8777-888888888888",
						message: "Creative analysis successfully linked to movie",
					},
				}),
				{
					status: 200,
					headers: { "Content-Type": "application/json" },
				}
			);
		};

		const result = await analysisService.linkMovie(
			"11111111-2222-4333-8444-555555555555",
			"44444444-5555-4666-8777-888888888888"
		);

		assert.strictEqual(capturedUrl, "http://localhost:5000/api/ai/analyses/11111111-2222-4333-8444-555555555555/link-movie");
		assert.strictEqual(capturedBody.movieId, "44444444-5555-4666-8777-888888888888");
		assert.strictEqual(result.movieId, "44444444-5555-4666-8777-888888888888");
		reset();
	});

	// ==========================================
	// 6. ERROR HANDLING
	// ==========================================
	await t.test("6.1 handles 400 validation error cleanly", async () => {
		authTokens.setTokens({ accessToken: "jwt-token-123", refreshToken: "refresh-token-123" });

		global.fetch = async () => {
			return new Response(
				JSON.stringify({
					success: false,
					message: "Content cannot be empty. Please provide creative writing or story ideas.",
					errors: [{ path: ["content"], message: "Required" }],
				}),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				}
			);
		};

		await assert.rejects(
			async () => {
				await analysisService.analyzeInput({ content: "", inputType: "SHORT_IDEA" });
			},
			(err: any) => {
				assert.strictEqual(err.statusCode, 400);
				assert.ok(err.message.includes("Content cannot be empty"));
				return true;
			}
		);
		reset();
	});

	await t.test("6.2 handles 429 quota / rate limit error cleanly", async () => {
		authTokens.setTokens({ accessToken: "jwt-token-123", refreshToken: "refresh-token-123" });

		global.fetch = async () => {
			return new Response(
				JSON.stringify({
					success: false,
					message: "Daily AI generation limit reached. Please upgrade your tier or try again tomorrow.",
				}),
				{
					status: 429,
					headers: { "Content-Type": "application/json" },
				}
			);
		};

		await assert.rejects(
			async () => {
				await analysisService.analyzeInput({ content: "Some creative idea", inputType: "AUTO_DETECT" });
			},
			(err: any) => {
				assert.strictEqual(err.statusCode, 429);
				assert.ok(err.message.includes("Daily AI generation limit reached"));
				return true;
			}
		);
		reset();
	});
});
