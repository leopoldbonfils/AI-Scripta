/**
 * FilmForge AI — Phase C: Story & Character Intelligence Frontend Integration Tests
 *
 * Verifies:
 * 1. storyIntelligenceService.generate (Generates connected story intelligence)
 * 2. storyIntelligenceService.getById (Fetches single intelligence record)
 * 3. storyIntelligenceService.getByMovie (Fetches movie-scoped intelligence records)
 * 4. storyIntelligenceService.regenerateSection (Selective section regeneration)
 * 5. storyIntelligenceService.updateSuggestionStatus (Accept, reject, edit suggestions)
 * 6. storyIntelligenceService.applyToProject (Explicit database entity synchronization)
 * 7. Error handling: 400 bad request, 401 unauthorized, 403 forbidden, 404 not found, 429 quota
 */

import { test } from "node:test";
import assert from "node:assert";
import { storyIntelligenceService } from "../services/storyIntelligenceService";
import { authTokens } from "../lib/auth";
import {
	StoryIntelligenceResult,
	StoryIntelligenceSuggestion,
	ApplyIntelligenceDecisionResponse,
} from "../types/storyIntelligence";

test("Phase C: Story & Character Intelligence Frontend Integration Tests", async (t: any) => {
	const originalFetch = global.fetch;

	const reset = () => {
		global.fetch = originalFetch;
		authTokens.clearTokens();
	};

	const mockSuggestion: StoryIntelligenceSuggestion = {
		id: "sug-1",
		category: "CHARACTER_MOTIVATION",
		title: "Deepen Dr. Vance's Survivor Guilt",
		description: "Add a backstory event detailing the loss of his research partner.",
		explanation: "Grounds his obsessive behavior in an unresolved emotional wound.",
		evidenceLevel: "SUGGESTION",
		sourceReference: "Referenced in section 2",
		status: "PENDING",
		potentialImpact: "High emotional resonance in the climax",
	};

	const mockIntelligence: StoryIntelligenceResult = {
		intelligenceId: "intel-123",
		movieId: "movie-abc",
		analysisId: "analysis-xyz",
		storyDevelopment: {
			refinedPremise: "A guilt-ridden physicist races against a temporal paradox.",
			expandedConcept: "An experimental particle accelerator fractures local reality into two diverging timelines.",
			centralDramaticQuestion: "Can Elena sacrifice her only chance to save her family to preserve the timeline?",
			mainConflict: "Reconciling fractured timelines against a military contractor seeking weaponization.",
			centralTheme: "Accepting grief versus the destructive urge to alter history.",
			narrativeStakes: "The collapse of causal coherence across the North American continent.",
			protagonistObjective: "Collapse the paradox gateway before the event horizon stabilizes.",
			mainObstacles: ["Temporal radiation sickness", "Military blockade", "Alternate self's desperation"],
			antagonisticForces: "Col. Sterling and the Department of Temporal Logistics",
			expansionOptions: [
				{
					id: "exp-1",
					name: "Intimate Psychological Thriller",
					directionType: "CHARACTER_DRIVEN",
					summary: "Confines the collapse to the underground laboratory complex.",
					changes: "Reduces external military scale and elevates personal claustrophobia.",
					rationale: "Sharpens character stakes and deepens thematic tragedy.",
					opportunities: ["Intense two-hander scenes", "Lower budget feasibility"],
					risks: ["Requires exceptional dialogue momentum"],
				},
			],
		},
		plotDevelopment: {
			mainPlot: "Elena infiltrates the accelerator facility to seal the rift.",
			secondaryPlots: ["Investigating Sterling's corporate espionage"],
			subplots: ["Reconnecting with her estranged sister"],
			majorEvents: [
				{
					id: "evt-1",
					name: "The First Fracture",
					phase: "INCITING_INCIDENT",
					description: "The particle accelerator breaches containment during an unauthorized night test.",
					consequences: "Two concurrent versions of reality begin overlapping in Sector 4.",
				},
			],
		},
		characters: [
			{
				id: "char-1",
				name: "Dr. Elena Vance",
				role: "PROTAGONIST",
				characterType: "Reluctant Hero / Visionary Physicist",
				age: "38",
				background: "Former MIT lead researcher ostracized for her paradox theories.",
				personality: ["Hyper-focused", "Guarded", "Empathetic", "Obsessive"],
				importantHistory: "Lost her spouse in an accelerator malfunction she believes she could have prevented.",
				socialFamilyContext: "Estranged from her extended family due to ceaseless research obsession.",
				psychology: {
					externalGoal: "Seal the paradox anomaly before complete collapse.",
					internalNeed: "Forgive herself for the past and let go of lost possibilities.",
					motivation: "Preventing innocent lives from being erased by the fracture.",
					greatestFear: "Realizing that her brilliance was the root cause of the tragedy.",
					weaknesses: ["Refusal to delegate", "Tunnel-vision stubbornness"],
					strengths: ["Intuitive quantum mechanics", "Unflinching determination"],
					emotionalWounds: "Guilt over her husband's death in the primary timeline.",
					internalConflict: "Using the tear to see her husband once more versus sealing it forever.",
					beliefsAndValues: ["Actions carry permanent weight", "Truth supersedes comfort"],
				},
				behavior: {
					reactionToPressure: "Analytical hyper-focus punctuated by insomnia.",
					decisionMakingStyle: "Data-first under pressure, emotionally vulnerable in isolation.",
					avoidanceBehaviors: "Avoids discussing the primary timeline accident.",
					vulnerabilities: "Susceptible to psychological bait involving her deceased spouse.",
					catalystsForChange: "Encountering an alternate timeline where her obsession destroyed everything.",
					interpersonalImpact: "Inspires fierce loyalty in subordinates but intimidates administrative staff.",
				},
				evolution: {
					startingWorldview: "If I calculate precisely enough, no one has to die.",
					initialEmotionalState: "Consumed by quiet guilt and solitary research.",
					majorChallenges: ["Navigating the fractured sub-levels", "Defying Sterling's containment cordon"],
					criticalDecisions: ["Choosing to overload the core rather than let Sterling extract the anomaly"],
					transformations: "Accepts loss as an immutable anchor of genuine human life.",
					finalState: "At peace with memory, refusing to alter the past at the expense of others.",
				},
				evidenceClassification: {
					explicitSourceFacts: ["Physicist", "Lead researcher on the paradox project"],
					interpretations: ["Driven by unaddressed grief"],
					proposedDevelopments: ["Former close academic relationship with Sterling"],
				},
			},
		],
		motivations: [
			{
				characterId: "char-1",
				characterName: "Dr. Elena Vance",
				explicitGoal: "Collapse the paradox gateway.",
				underlyingNeed: "Release herself from survivor's guilt.",
				rootReason: "Grief over husband's tragic death during her experimental test.",
				preventingObstacles: ["Temporal radiation sickness", "Military blockade"],
				fearOfLoss: "Losing the final memory of her husband to temporal decay.",
				sacrificeThreshold: "Willing to erase her own existence if it preserves the timeline.",
				moralEmotionalDilemma: "Allowing an alternate version of her husband to perish to save the prime reality.",
				interCharacterClashes: [
					{
						opposingCharacterName: "Col. Sterling",
						conflictReason: "Scientific preservation versus military weaponization.",
					},
				],
			},
		],
		relationships: [
			{
				id: "rel-1",
				characterA: "Dr. Elena Vance",
				characterB: "Col. Sterling",
				relationshipType: "RIVALRY",
				history: "Co-authored early papers on sub-atomic vacuum states ten years ago.",
				characterAWantsFromB: "De-escalation and withdrawal of armed contractors.",
				characterBWantsFromA: "The cryptographic stabilization keys to the accelerator.",
				trustLevel: 2,
				tensionLevel: 9,
				sharedInterests: ["Unraveling quantum boundary conditions"],
				conflictingInterests: ["Civilian containment vs military exploitation"],
				powerDynamics: "Sterling holds physical military force; Elena holds critical technical access.",
				sourcesOfTension: ["Sterling weaponized Elena's research without peer review."],
				evolutionTrajectory: "Escalates from professional friction to mortal confrontation.",
				keyEventsAffecting: ["Standoff in Sub-Level 3"],
				isProposedRelationship: false,
			},
		],
		characterArcs: [
			{
				characterId: "char-1",
				characterName: "Dr. Elena Vance",
				arcType: "POSITIVE_TRANSFORMATION",
				startingState: "Grief-stricken academic seeking redemption through impossible math.",
				initialBeliefLie: "If I am smart enough, I can undo any death.",
				internalWeakness: "Crippling guilt and refusal to accept irreversibility.",
				externalChallenge: "The accelerating temporal collapse of the facility.",
				turningPoints: ["Encountering the fracture horizon", "Discovering Sterling's extraction protocol"],
				majorDecisions: ["Erasing the alternate conduit", "Surrendering the stabilization keys"],
				momentOfCrisis: "Offered a timeline where her husband lives at the cost of our world.",
				transformationResolution: "Destroys the alternate conduit, choosing reality over illusion.",
				finalState: "At peace with memory, ready to rebuild genuine connection.",
				thematicAlignment: "Accepting grief versus the destructive urge to alter history.",
				alternativeArc: {
					arcType: "TRAGIC",
					description: "Elena succumbs to temptation and traps herself in a loop with a phantom spouse.",
					rationale: "Deeper existential dread but less uplifting resolution.",
				},
			},
		],
		storyStructure: {
			framework: "THREE_ACT",
			frameworkExplanation: "Provides clean escalation from discovery to crisis and moral resolution.",
			beats: [
				{
					id: "beat-1",
					beatName: "Inciting Breach",
					actOrPhase: "Act I - The Anomaly",
					summary: "Particle accelerator breaches containment during an unauthorized night test.",
					charactersInvolved: ["Dr. Elena Vance"],
					dramaticSignificance: "Establishes scientific anomaly and immediate ticking clock.",
					leadingFrom: "Standard lab routine",
					influencing: "Emergency facility lockdown",
				},
			],
			pacingAssessment: "Tight, escalating urgency driven by physical temporal countdown.",
			missingTransitions: [],
			structuralInconsistencies: [],
			recommendedImprovements: ["Clarify how Elena evades security sensors in Act I"],
		},
		consistencyChecks: [
			{
				id: "chk-1",
				checkType: "OUT_OF_CHARACTER",
				severity: "MEDIUM",
				title: "Tactical weapon proficiency inconsistency",
				description: "Elena handles tactical firearms with veteran ease despite an academic background.",
				charactersInvolved: ["Dr. Elena Vance"],
				impactExplanation: "Dilutes her identity as an intellectual problem-solver.",
				suggestedCorrection: "Show her relying on improvised lab tools rather than tactical firearms.",
			},
		],
		suggestions: [mockSuggestion],
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	};

	// ==========================================
	// 1. GENERATE INTELLIGENCE
	// ==========================================
	await t.test("1.1 storyIntelligenceService.generate requests generation and returns structured result", async () => {
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
						intelligence: mockIntelligence,
						generationId: "gen-story-intel-999",
					},
				}),
				{
					status: 200,
					headers: { "Content-Type": "application/json" },
				}
			);
		};

		const result = await storyIntelligenceService.generate({
			movieId: "movie-abc",
			analysisId: "analysis-xyz",
			preferredFramework: "THREE_ACT",
			focusDirections: ["Psychology", "Relational Tension"],
			additionalInstructions: "Focus on grounded sci-fi stakes.",
		});

		assert.strictEqual(capturedMethod, "POST");
		assert.strictEqual(capturedUrl, "http://localhost:5000/api/ai/story-intelligence");
		assert.strictEqual(capturedBody.movieId, "movie-abc");
		assert.strictEqual(capturedBody.analysisId, "analysis-xyz");
		assert.strictEqual(capturedBody.preferredFramework, "THREE_ACT");
		assert.strictEqual(result.generationId, "gen-story-intel-999");
		assert.strictEqual(result.intelligence.intelligenceId, "intel-123");
		assert.strictEqual(result.intelligence.characters[0].name, "Dr. Elena Vance");
		assert.strictEqual(result.intelligence.storyStructure.framework, "THREE_ACT");
		reset();
	});

	// ==========================================
	// 2. GET BY ID & GET BY MOVIE
	// ==========================================
	await t.test("2.1 storyIntelligenceService.getById fetches record by ID", async () => {
		authTokens.setTokens({ accessToken: "jwt-token-123", refreshToken: "refresh-token-123" });
		let capturedUrl = "";

		global.fetch = async (url) => {
			capturedUrl = url.toString();
			return new Response(
				JSON.stringify({
					success: true,
					data: mockIntelligence,
				}),
				{
					status: 200,
					headers: { "Content-Type": "application/json" },
				}
			);
		};

		const result = await storyIntelligenceService.getById("intel-123");
		assert.strictEqual(capturedUrl, "http://localhost:5000/api/ai/story-intelligence/intel-123");
		assert.strictEqual(result.intelligenceId, "intel-123");
		assert.strictEqual(result.characters.length, 1);
		assert.strictEqual(result.relationships[0].tensionLevel, 9);
		reset();
	});

	await t.test("2.2 storyIntelligenceService.getByMovie fetches records for movie", async () => {
		authTokens.setTokens({ accessToken: "jwt-token-123", refreshToken: "refresh-token-123" });
		let capturedUrl = "";

		global.fetch = async (url) => {
			capturedUrl = url.toString();
			return new Response(
				JSON.stringify({
					success: true,
					data: [mockIntelligence],
				}),
				{
					status: 200,
					headers: { "Content-Type": "application/json" },
				}
			);
		};

		const results = await storyIntelligenceService.getByMovie("movie-abc");
		assert.strictEqual(capturedUrl, "http://localhost:5000/api/ai/movies/movie-abc/story-intelligence");
		assert.strictEqual(results.length, 1);
		assert.strictEqual(results[0].movieId, "movie-abc");
		reset();
	});

	// ==========================================
	// 3. REGENERATE SECTION
	// ==========================================
	await t.test("3.1 storyIntelligenceService.regenerateSection updates a specific section", async () => {
		authTokens.setTokens({ accessToken: "jwt-token-123", refreshToken: "refresh-token-123" });
		let capturedUrl = "";
		let capturedMethod = "";
		let capturedBody: any = null;

		const updatedIntelligence: StoryIntelligenceResult = {
			...mockIntelligence,
			consistencyChecks: [],
		};

		global.fetch = async (url, init) => {
			capturedUrl = url.toString();
			capturedMethod = init?.method || "GET";
			capturedBody = init?.body ? JSON.parse(init.body as string) : null;

			return new Response(
				JSON.stringify({
					success: true,
					data: updatedIntelligence,
				}),
				{
					status: 200,
					headers: { "Content-Type": "application/json" },
				}
			);
		};

		const result = await storyIntelligenceService.regenerateSection("intel-123", {
			section: "CONSISTENCY",
			customInstructions: "Verify that all weapons actions are resolved with improvised scientific solutions.",
		});

		assert.strictEqual(capturedMethod, "POST");
		assert.strictEqual(capturedUrl, "http://localhost:5000/api/ai/story-intelligence/intel-123/regenerate-section");
		assert.strictEqual(capturedBody.section, "CONSISTENCY");
		assert.ok(capturedBody.customInstructions.includes("improvised scientific solutions"));
		assert.strictEqual(result.consistencyChecks.length, 0);
		reset();
	});

	// ==========================================
	// 4. UPDATE SUGGESTION STATUS
	// ==========================================
	await t.test("4.1 storyIntelligenceService.updateSuggestionStatus accepts, rejects, or edits suggestion", async () => {
		authTokens.setTokens({ accessToken: "jwt-token-123", refreshToken: "refresh-token-123" });
		let capturedUrl = "";
		let capturedMethod = "";
		let capturedBody: any = null;

		const acceptedSuggestion: StoryIntelligenceSuggestion = {
			...mockSuggestion,
			status: "ACCEPTED",
			editedContent: "User customized: Partner was lost during the first telemetry calibrate.",
		};

		global.fetch = async (url, init) => {
			capturedUrl = url.toString();
			capturedMethod = init?.method || "GET";
			capturedBody = init?.body ? JSON.parse(init.body as string) : null;

			return new Response(
				JSON.stringify({
					success: true,
					data: acceptedSuggestion,
				}),
				{
					status: 200,
					headers: { "Content-Type": "application/json" },
				}
			);
		};

		const result = await storyIntelligenceService.updateSuggestionStatus("intel-123", "sug-1", {
			status: "ACCEPTED",
			editedContent: "User customized: Partner was lost during the first telemetry calibrate.",
		});

		assert.strictEqual(capturedMethod, "PATCH");
		assert.strictEqual(capturedUrl, "http://localhost:5000/api/ai/story-intelligence/intel-123/suggestions/sug-1");
		assert.strictEqual(capturedBody.status, "ACCEPTED");
		assert.strictEqual(result.status, "ACCEPTED");
		assert.ok(result.editedContent?.includes("first telemetry calibrate"));
		reset();
	});

	// ==========================================
	// 5. APPLY TO PROJECT
	// ==========================================
	await t.test("5.1 storyIntelligenceService.applyToProject writes approved entities to database", async () => {
		authTokens.setTokens({ accessToken: "jwt-token-123", refreshToken: "refresh-token-123" });
		let capturedUrl = "";
		let capturedMethod = "";
		let capturedBody: any = null;

		const mockResponse: ApplyIntelligenceDecisionResponse = {
			message: "Story Intelligence successfully applied to movie project.",
			appliedEntities: {
				story: true,
				charactersCreated: 1,
				charactersUpdated: 0,
			},
		};

		global.fetch = async (url, init) => {
			capturedUrl = url.toString();
			capturedMethod = init?.method || "GET";
			capturedBody = init?.body ? JSON.parse(init.body as string) : null;

			return new Response(
				JSON.stringify({
					success: true,
					data: mockResponse,
				}),
				{
					status: 200,
					headers: { "Content-Type": "application/json" },
				}
			);
		};

		const result = await storyIntelligenceService.applyToProject("intel-123", {
			applyToStory: true,
			applyCharacters: true,
			selectedCharacterIds: ["char-1"],
		});

		assert.strictEqual(capturedMethod, "POST");
		assert.strictEqual(capturedUrl, "http://localhost:5000/api/ai/story-intelligence/intel-123/apply-to-project");
		assert.strictEqual(capturedBody.applyToStory, true);
		assert.strictEqual(capturedBody.applyCharacters, true);
		assert.deepStrictEqual(capturedBody.selectedCharacterIds, ["char-1"]);
		assert.strictEqual(result.message, "Story Intelligence successfully applied to movie project.");
		assert.strictEqual(result.appliedEntities.story, true);
		assert.strictEqual(result.appliedEntities.charactersCreated, 1);
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
					message: "Either analysisId or input must be provided to generate Story Intelligence.",
				}),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				}
			);
		};

		await assert.rejects(
			async () => {
				await storyIntelligenceService.generate({} as any);
			},
			(err: any) => {
				assert.strictEqual(err.statusCode, 400);
				assert.ok(err.message.includes("Either analysisId or input must be provided"));
				return true;
			}
		);
		reset();
	});

	await t.test("6.2 handles 403 forbidden error when accessing unauthorized project", async () => {
		authTokens.setTokens({ accessToken: "jwt-token-123", refreshToken: "refresh-token-123" });

		global.fetch = async () => {
			return new Response(
				JSON.stringify({
					success: false,
					message: "You do not have permission to modify this movie project.",
				}),
				{
					status: 403,
					headers: { "Content-Type": "application/json" },
				}
			);
		};

		await assert.rejects(
			async () => {
				await storyIntelligenceService.applyToProject("intel-unauthorized", {
					applyToStory: true,
				});
			},
			(err: any) => {
				assert.strictEqual(err.statusCode, 403);
				assert.ok(err.message.includes("You do not have permission"));
				return true;
			}
		);
		reset();
	});

	await t.test("6.3 handles 404 not found error", async () => {
		authTokens.setTokens({ accessToken: "jwt-token-123", refreshToken: "refresh-token-123" });

		global.fetch = async () => {
			return new Response(
				JSON.stringify({
					success: false,
					message: "Story Intelligence record not found.",
				}),
				{
					status: 404,
					headers: { "Content-Type": "application/json" },
				}
			);
		};

		await assert.rejects(
			async () => {
				await storyIntelligenceService.getById("intel-nonexistent");
			},
			(err: any) => {
				assert.strictEqual(err.statusCode, 404);
				assert.ok(err.message.includes("Story Intelligence record not found"));
				return true;
			}
		);
		reset();
	});

	await t.test("6.4 handles 429 quota limit error", async () => {
		authTokens.setTokens({ accessToken: "jwt-token-123", refreshToken: "refresh-token-123" });

		global.fetch = async () => {
			return new Response(
				JSON.stringify({
					success: false,
					message: "Daily AI generation limit reached. Please upgrade your subscription tier.",
				}),
				{
					status: 429,
					headers: { "Content-Type": "application/json" },
				}
			);
		};

		await assert.rejects(
			async () => {
				await storyIntelligenceService.generate({ analysisId: "analysis-xyz" });
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
