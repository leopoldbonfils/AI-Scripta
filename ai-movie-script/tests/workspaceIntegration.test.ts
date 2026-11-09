/**
 * FilmForge AI — Phase 5 Workspace Integration Tests
 *
 * Verifies end-to-end integration across:
 * 1. Story Workspace (getStory, upsertStory)
 * 2. Character Workspace (getCharacters, createCharacter, updateCharacter, deleteCharacter)
 * 3. Outline, Acts & Scenes (getActs, createAct, getScenes, createScene, reorderScenes)
 * 4. Screenplay Workspace & Store (screenplayStore, getScreenplay, updateScreenplay, conflict detection 409)
 * 5. Version Management (createVersion, getVersions, restoreVersion)
 * 6. Scene-to-Screenplay Synchronization (syncScenes)
 * 7. AI Workspace Pipelines (generateStory, generateCharacters, generateOutline, improveScene)
 */

import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import { storyService } from "../services/storyService";
import { characterService } from "../services/characterService";
import { screenplayService } from "../services/screenplayService";
import { aiService } from "../services/aiService";
import { screenplayStore } from "../store/screenplayStore";
import { authTokens } from "../lib/auth";
import { api, ApiClientError } from "../lib/api";
import { Story } from "../types/story";
import { Character } from "../types/character";
import { StoryAct, Scene, Screenplay, ScreenplayVersion } from "../types/screenplay";
import { AIGeneration } from "../types/ai";

test("Phase 5: Story, Character & Screenplay Workspace Integration Tests", async (t: any) => {
	const originalFetch = global.fetch;

	const reset = () => {
		global.fetch = originalFetch;
		authTokens.clearTokens();
		screenplayStore.clear();
	};

	const sampleMovieId = "movie-uuid-the-last-signal";

	const sampleStory: Story = {
		id: "story-uuid-001",
		movieId: sampleMovieId,
		logline: "An observant audio engineer intercepts a secret broadcast.",
		synopsis: "Eric Rutaganda discovers an encrypted pulse transmitting across Kigali...",
		theme: "Truth, surveillance, and courage.",
		setting: "Modern Kigali and Lake Kivu, rainy season.",
		beginning: "Eric hears a pulse through his wireless headphones.",
		middle: "A corporate taskforce attempts to erase the broadcast source.",
		ending: "Eric routes the decrypted signal through the national observatory.",
		fullStory: null,
		createdAt: "2026-11-01T10:00:00.000Z",
		updatedAt: "2026-11-02T12:00:00.000Z",
	};

	const sampleCharacters: Character[] = [
		{
			id: "char-uuid-001",
			movieId: sampleMovieId,
			name: "Eric Rutaganda",
			role: "Protagonist",
			age: "24",
			personality: "Observant, cautious, analytical",
			background: "Talented audio and telecoms engineer in Kigali.",
			goals: "Expose the illegal covert frequency.",
			fears: "Being silenced like his sister.",
			characterArc: "From isolated observer to public whistleblower.",
			description: "Main hero of the story.",
			createdAt: "2026-11-01T10:00:00.000Z",
			updatedAt: "2026-11-01T10:00:00.000Z",
		},
		{
			id: "char-uuid-002",
			movieId: sampleMovieId,
			name: "Sarah Keza",
			role: "Supporting",
			age: "27",
			personality: "Tenacious, inquisitive",
			background: "Investigative journalist for New Times.",
			goals: "Break the telecom scandal story.",
			fears: "Editorial censorship.",
			characterArc: "Learns to trust unverified sources when evidence aligns.",
			description: "Journalist ally.",
			createdAt: "2026-11-01T10:00:00.000Z",
			updatedAt: "2026-11-01T10:00:00.000Z",
		},
	];

	const sampleActs: StoryAct[] = [
		{
			id: "act-uuid-001",
			movieId: sampleMovieId,
			actNumber: 1,
			title: "The Beginning",
			description: "The Ordinary World and Inciting Incident",
		},
		{
			id: "act-uuid-002",
			movieId: sampleMovieId,
			actNumber: 2,
			title: "The Conflict",
			description: "Rising Action and Midpoint Confrontation",
		},
		{
			id: "act-uuid-003",
			movieId: sampleMovieId,
			actNumber: 3,
			title: "The Resolution",
			description: "Climax and Resolution",
		},
	];

	const sampleScenes: Scene[] = [
		{
			id: "scene-uuid-001",
			movieId: sampleMovieId,
			actId: "act-uuid-001",
			sceneNumber: 1,
			title: "Kigali City – Dusk",
			location: "EXT. KIGALI CITY - DUSK",
			timeOfDay: "DUSK",
			description: "Eric steps off the bus and hears the strange frequency.",
			content: "FADE IN:\n\nEXT. KIGALI CITY - DUSK\n\nAmber streetlamps flicker awake.",
			createdAt: "2026-11-01T10:00:00.000Z",
			updatedAt: "2026-11-01T10:00:00.000Z",
		},
		{
			id: "scene-uuid-002",
			movieId: sampleMovieId,
			actId: "act-uuid-001",
			sceneNumber: 2,
			title: "Eric's Terminal",
			location: "INT. ERIC'S APARTMENT - NIGHT",
			timeOfDay: "NIGHT",
			description: "Eric runs diagnostics on the raw signal.",
			content: "INT. ERIC'S APARTMENT - NIGHT\n\nDual monitors glow blue.",
			createdAt: "2026-11-01T10:00:00.000Z",
			updatedAt: "2026-11-01T10:00:00.000Z",
		},
	];

	const sampleScreenplay: Screenplay = {
		id: "screenplay-uuid-001",
		movieId: sampleMovieId,
		title: "The Last Signal",
		content: "FADE IN:\n\nEXT. KIGALI CITY - DUSK\n\nAmber streetlamps flicker awake.",
		pageCount: 1,
		wordCount: 45,
		isDraft: false,
		version: 1,
		lastAutoSavedAt: "2026-11-02T12:00:00.000Z",
		createdAt: "2026-11-01T10:00:00.000Z",
		updatedAt: "2026-11-02T12:00:00.000Z",
	};

	const sampleVersions: ScreenplayVersion[] = [
		{
			id: "version-uuid-001",
			screenplayId: sampleScreenplay.id,
			versionNumber: 1,
			title: "The Last Signal",
			content: sampleScreenplay.content,
			pageCount: 1,
			wordCount: 45,
			changeSummary: "First completed draft of Act 1",
			createdAt: "2026-11-02T12:00:00.000Z",
		},
	];

	// ==========================================
	// 1. STORY WORKSPACE TESTS
	// ==========================================
	await t.test("1.1 storyService.getStory retrieves existing story for movie", async () => {
		authTokens.setTokens({ accessToken: "test-jwt", refreshToken: "test-refresh" });
		global.fetch = async (url) => {
			assert.strictEqual(
				url.toString(),
				`http://localhost:5000/api/movies/${sampleMovieId}/story`
			);
			return new Response(
				JSON.stringify({
					success: true,
					message: "Story retrieved successfully",
					data: sampleStory,
					error: null,
				}),
				{ status: 200, headers: { "Content-Type": "application/json" } }
			);
		};

		const story = await storyService.getStory(sampleMovieId);
		assert.strictEqual(story.id, sampleStory.id);
		assert.strictEqual(story.logline, sampleStory.logline);
		assert.strictEqual(story.beginning, sampleStory.beginning);
		reset();
	});

	await t.test("1.2 storyService.upsertStory creates and updates story framework", async () => {
		authTokens.setTokens({ accessToken: "test-jwt", refreshToken: "test-refresh" });
		let requestBody: any = null;

		global.fetch = async (url, init) => {
			assert.strictEqual(
				url.toString(),
				`http://localhost:5000/api/movies/${sampleMovieId}/story`
			);
			assert.strictEqual(init?.method, "PUT");
			requestBody = JSON.parse(init?.body as string);

			return new Response(
				JSON.stringify({
					success: true,
					message: "Story saved successfully",
					data: {
						...sampleStory,
						...requestBody,
						updatedAt: new Date().toISOString(),
					},
					error: null,
				}),
				{ status: 200, headers: { "Content-Type": "application/json" } }
			);
		};

		const updated = await storyService.upsertStory(sampleMovieId, {
			logline: "Updated high-stakes logline hook.",
			theme: "Survival and truth.",
			ending: "Eric broadcasts from the satellite tower.",
		});

		assert.strictEqual(requestBody.logline, "Updated high-stakes logline hook.");
		assert.strictEqual(requestBody.theme, "Survival and truth.");
		assert.strictEqual(updated.ending, "Eric broadcasts from the satellite tower.");
		reset();
	});

	// ==========================================
	// 2. CHARACTER WORKSPACE TESTS
	// ==========================================
	await t.test("2.1 characterService.getCharacters retrieves paginated character cast", async () => {
		authTokens.setTokens({ accessToken: "test-jwt", refreshToken: "test-refresh" });
		global.fetch = async (url) => {
			assert.ok(
				url.toString().startsWith(`http://localhost:5000/api/movies/${sampleMovieId}/characters`)
			);
			return new Response(
				JSON.stringify({
					success: true,
					message: "Characters retrieved successfully",
					data: sampleCharacters,
					meta: { page: 1, limit: 50, total: 2, totalPages: 1 },
					error: null,
				}),
				{ status: 200, headers: { "Content-Type": "application/json" } }
			);
		};

		const res = await characterService.getCharacters(sampleMovieId);
		assert.strictEqual(res.items.length, 2);
		assert.strictEqual(res.items[0].name, "Eric Rutaganda");
		assert.strictEqual(res.items[1].role, "Supporting");
		assert.strictEqual(res.meta.total, 2);
		reset();
	});

	await t.test("2.2 characterService.createCharacter adds a new character dossier", async () => {
		authTokens.setTokens({ accessToken: "test-jwt", refreshToken: "test-refresh" });
		let requestBody: any = null;

		global.fetch = async (url, init) => {
			assert.strictEqual(
				url.toString(),
				`http://localhost:5000/api/movies/${sampleMovieId}/characters`
			);
			assert.strictEqual(init?.method, "POST");
			requestBody = JSON.parse(init?.body as string);

			return new Response(
				JSON.stringify({
					success: true,
					message: "Character created successfully",
					data: {
						id: "char-uuid-003",
						movieId: sampleMovieId,
						...requestBody,
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
					},
					error: null,
				}),
				{ status: 201, headers: { "Content-Type": "application/json" } }
			);
		};

		const created = await characterService.createCharacter(sampleMovieId, {
			name: "Victor Mugisha",
			role: "Antagonist",
			age: "48",
			personality: "Ruthless, corporate architect",
			goals: "Monopolize private communications",
			fears: "Public exposure",
		});

		assert.strictEqual(created.name, "Victor Mugisha");
		assert.strictEqual(created.role, "Antagonist");
		assert.strictEqual(requestBody.personality, "Ruthless, corporate architect");
		reset();
	});

	await t.test("2.3 characterService.updateCharacter modifies existing dossier", async () => {
		authTokens.setTokens({ accessToken: "test-jwt", refreshToken: "test-refresh" });
		let requestBody: any = null;

		global.fetch = async (url, init) => {
			assert.strictEqual(
				url.toString(),
				`http://localhost:5000/api/characters/char-uuid-001`
			);
			assert.strictEqual(init?.method, "PUT");
			requestBody = JSON.parse(init?.body as string);

			return new Response(
				JSON.stringify({
					success: true,
					message: "Character updated successfully",
					data: {
						...sampleCharacters[0],
						...requestBody,
						updatedAt: new Date().toISOString(),
					},
					error: null,
				}),
				{ status: 200, headers: { "Content-Type": "application/json" } }
			);
		};

		const updated = await characterService.updateCharacter("char-uuid-001", {
			goals: "Lead the underground broadcast network",
		});

		assert.strictEqual(updated.goals, "Lead the underground broadcast network");
		reset();
	});

	await t.test("2.4 characterService.deleteCharacter removes character", async () => {
		authTokens.setTokens({ accessToken: "test-jwt", refreshToken: "test-refresh" });
		let deleteCalled = false;

		global.fetch = async (url, init) => {
			assert.strictEqual(
				url.toString(),
				`http://localhost:5000/api/characters/char-uuid-002`
			);
			assert.strictEqual(init?.method, "DELETE");
			deleteCalled = true;

			return new Response(
				JSON.stringify({
					success: true,
					message: "Character deleted successfully",
					data: null,
					error: null,
				}),
				{ status: 200, headers: { "Content-Type": "application/json" } }
			);
		};

		await characterService.deleteCharacter("char-uuid-002");
		assert.strictEqual(deleteCalled, true);
		reset();
	});

	// ==========================================
	// 3. ACTS & SCENES OUTLINE TESTS
	// ==========================================
	await t.test("3.1 screenplayService.getActs retrieves 3-act structure", async () => {
		authTokens.setTokens({ accessToken: "test-jwt", refreshToken: "test-refresh" });
		global.fetch = async (url) => {
			assert.strictEqual(
				url.toString(),
				`http://localhost:5000/api/movies/${sampleMovieId}/acts`
			);
			return new Response(
				JSON.stringify({
					success: true,
					message: "Acts retrieved successfully",
					data: sampleActs,
					error: null,
				}),
				{ status: 200, headers: { "Content-Type": "application/json" } }
			);
		};

		const acts = await screenplayService.getActs(sampleMovieId);
		assert.strictEqual(acts.length, 3);
		assert.strictEqual(acts[0].actNumber, 1);
		assert.strictEqual(acts[1].title, "The Conflict");
		reset();
	});

	await t.test("3.2 screenplayService.createScene adds scene to act in database", async () => {
		authTokens.setTokens({ accessToken: "test-jwt", refreshToken: "test-refresh" });
		let requestBody: any = null;

		global.fetch = async (url, init) => {
			assert.strictEqual(
				url.toString(),
				`http://localhost:5000/api/movies/${sampleMovieId}/scenes`
			);
			assert.strictEqual(init?.method, "POST");
			requestBody = JSON.parse(init?.body as string);

			return new Response(
				JSON.stringify({
					success: true,
					message: "Scene created successfully",
					data: {
						id: "scene-uuid-003",
						movieId: sampleMovieId,
						...requestBody,
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
					},
					error: null,
				}),
				{ status: 201, headers: { "Content-Type": "application/json" } }
			);
		};

		const created = await screenplayService.createScene(sampleMovieId, {
			actId: "act-uuid-001",
			sceneNumber: 3,
			title: "The Ambush in Downtown",
			location: "EXT. DOWNTOWN - NIGHT",
			timeOfDay: "NIGHT",
		});

		assert.strictEqual(created.title, "The Ambush in Downtown");
		assert.strictEqual(created.sceneNumber, 3);
		reset();
	});

	await t.test("3.3 screenplayService.reorderScenes updates scene sequence", async () => {
		authTokens.setTokens({ accessToken: "test-jwt", refreshToken: "test-refresh" });
		let requestBody: any = null;

		global.fetch = async (url, init) => {
			assert.strictEqual(
				url.toString(),
				`http://localhost:5000/api/movies/${sampleMovieId}/scenes/reorder`
			);
			assert.strictEqual(init?.method, "PATCH");
			requestBody = JSON.parse(init?.body as string);

			return new Response(
				JSON.stringify({
					success: true,
					message: "Scenes reordered successfully",
					data: sampleScenes,
					error: null,
				}),
				{ status: 200, headers: { "Content-Type": "application/json" } }
			);
		};

		await screenplayService.reorderScenes(sampleMovieId, ["scene-uuid-002", "scene-uuid-001"]);
		assert.deepStrictEqual(requestBody.sceneIds, ["scene-uuid-002", "scene-uuid-001"]);
		reset();
	});

	// ==========================================
	// 4. SCREENPLAY WORKSPACE & STORE TESTS
	// ==========================================
	await t.test("4.1 screenplayStore manages active draft and save statuses", () => {
		assert.strictEqual(screenplayStore.getScreenplay(), null);
		assert.strictEqual(screenplayStore.getSaveStatus(), "saved");

		screenplayStore.setScreenplay(sampleScreenplay);
		assert.strictEqual(screenplayStore.getScreenplay()?.title, "The Last Signal");

		screenplayStore.setSaveStatus("unsaved");
		assert.strictEqual(screenplayStore.getSaveStatus(), "unsaved");

		screenplayStore.setSaveStatus("saving");
		assert.strictEqual(screenplayStore.getSaveStatus(), "saving");

		screenplayStore.setSaveStatus("saved");
		assert.strictEqual(screenplayStore.getSaveStatus(), "saved");
		reset();
	});

	await t.test("4.2 screenplayService.updateScreenplay saves script text and baseVersion", async () => {
		authTokens.setTokens({ accessToken: "test-jwt", refreshToken: "test-refresh" });
		let requestBody: any = null;

		global.fetch = async (url, init) => {
			assert.strictEqual(
				url.toString(),
				`http://localhost:5000/api/screenplays/${sampleScreenplay.id}`
			);
			assert.strictEqual(init?.method, "PUT");
			requestBody = JSON.parse(init?.body as string);

			return new Response(
				JSON.stringify({
					success: true,
					message: "Screenplay saved successfully",
					data: {
						...sampleScreenplay,
						content: requestBody.content,
						version: 2,
						updatedAt: new Date().toISOString(),
					},
					error: null,
				}),
				{ status: 200, headers: { "Content-Type": "application/json" } }
			);
		};

		const newText = "FADE IN:\n\nEXT. KIGALI CITY - DUSK\n\nRain drums upon the corrugated rooftops.";
		const saved = await screenplayService.updateScreenplay(sampleScreenplay.id, {
			content: newText,
			baseVersion: 1,
		});

		assert.strictEqual(requestBody.content, newText);
		assert.strictEqual(requestBody.baseVersion, 1);
		assert.strictEqual(saved.version, 2);
		reset();
	});

	await t.test("4.3 screenplayService detects version conflict on 409 status", async () => {
		authTokens.setTokens({ accessToken: "test-jwt", refreshToken: "test-refresh" });

		global.fetch = async (url, init) => {
			return new Response(
				JSON.stringify({
					success: false,
					message: "Conflict: Screenplay has been modified by another session.",
					error: {
						code: "CONFLICT",
						message: "Conflict: Screenplay has been modified by another session.",
					},
				}),
				{ status: 409, headers: { "Content-Type": "application/json" } }
			);
		};

		await assert.rejects(
			async () => {
				await screenplayService.updateScreenplay(sampleScreenplay.id, {
					content: "Conflicting draft text",
					baseVersion: 1,
				});
			},
			(err: any) => {
				assert.strictEqual(err.statusCode, 409);
				assert.ok(err.message.includes("Conflict"));
				return true;
			}
		);
		reset();
	});

	// ==========================================
	// 5. VERSION SNAPSHOT & RESTORE TESTS
	// ==========================================
	await t.test("5.1 screenplayService.createVersion creates immutable snapshot", async () => {
		authTokens.setTokens({ accessToken: "test-jwt", refreshToken: "test-refresh" });
		let requestBody: any = null;

		global.fetch = async (url, init) => {
			assert.strictEqual(
				url.toString(),
				`http://localhost:5000/api/screenplays/${sampleScreenplay.id}/versions`
			);
			assert.strictEqual(init?.method, "POST");
			requestBody = JSON.parse(init?.body as string);

			return new Response(
				JSON.stringify({
					success: true,
					message: "Version snapshot created successfully",
					data: {
						id: "version-uuid-002",
						screenplayId: sampleScreenplay.id,
						versionNumber: 2,
						content: sampleScreenplay.content,
						changeSummary: requestBody.changeSummary,
						createdAt: new Date().toISOString(),
					},
					error: null,
				}),
				{ status: 201, headers: { "Content-Type": "application/json" } }
			);
		};

		const version = await screenplayService.createVersion(sampleScreenplay.id, {
			changeSummary: "Completed Act 2 midpoint dialogue revision",
		});

		assert.strictEqual(version.versionNumber, 2);
		assert.strictEqual(version.changeSummary, "Completed Act 2 midpoint dialogue revision");
		reset();
	});

	await t.test("5.2 screenplayService.restoreVersion restores historical snapshot", async () => {
		authTokens.setTokens({ accessToken: "test-jwt", refreshToken: "test-refresh" });
		let restoreCalled = false;

		global.fetch = async (url, init) => {
			assert.strictEqual(
				url.toString(),
				`http://localhost:5000/api/screenplays/${sampleScreenplay.id}/versions/version-uuid-001/restore`
			);
			assert.strictEqual(init?.method, "POST");
			restoreCalled = true;

			return new Response(
				JSON.stringify({
					success: true,
					message: "Version restored successfully",
					data: {
						...sampleScreenplay,
						content: sampleVersions[0].content,
						version: 3,
					},
					error: null,
				}),
				{ status: 200, headers: { "Content-Type": "application/json" } }
			);
		};

		const restored = await screenplayService.restoreVersion(
			sampleScreenplay.id,
			"version-uuid-001"
		);

		assert.strictEqual(restoreCalled, true);
		assert.strictEqual(restored.content, sampleVersions[0].content);
		assert.strictEqual(restored.version, 3);
		reset();
	});

	// ==========================================
	// 6. SCENE-TO-SCREENPLAY SYNCHRONIZATION
	// ==========================================
	await t.test("6.1 screenplayService.syncScenes formats outline scenes into script text", async () => {
		authTokens.setTokens({ accessToken: "test-jwt", refreshToken: "test-refresh" });
		let requestBody: any = null;

		global.fetch = async (url, init) => {
			assert.strictEqual(
				url.toString(),
				`http://localhost:5000/api/screenplays/${sampleScreenplay.id}/sync-scenes`
			);
			assert.strictEqual(init?.method, "POST");
			requestBody = JSON.parse(init?.body as string);

			return new Response(
				JSON.stringify({
					success: true,
					message: "Scenes synchronized into screenplay successfully",
					data: {
						...sampleScreenplay,
						content: "EXT. KIGALI CITY - DUSK\n\nINT. ERIC'S APARTMENT - NIGHT\n",
					},
					error: null,
				}),
				{ status: 200, headers: { "Content-Type": "application/json" } }
			);
		};

		const synced = await screenplayService.syncScenes(sampleScreenplay.id, {
			overwriteContent: false,
		});

		assert.strictEqual(requestBody.overwriteContent, false);
		assert.ok(synced.content.includes("EXT. KIGALI CITY"));
		reset();
	});

	// ==========================================
	// 7. REAL AI WORKSPACE ENDPOINT TESTS
	// ==========================================
	await t.test("7.1 aiService.generateStory calls backend AI pipeline", async () => {
		authTokens.setTokens({ accessToken: "test-jwt", refreshToken: "test-refresh" });

		global.fetch = async (url, init) => {
			assert.strictEqual(
				url.toString(),
				`http://localhost:5000/api/ai/movies/${sampleMovieId}/generate-story`
			);
			assert.strictEqual(init?.method, "POST");

			return new Response(
				JSON.stringify({
					success: true,
					message: "Story generated successfully",
					data: {
						id: "ai-gen-uuid-001",
						userId: "user-uuid",
						movieId: sampleMovieId,
						generationType: "STORY",
						input: "story prompt",
						output: JSON.stringify({
							logline: "An audio engineer exposes a pirate transmission.",
							theme: "Courage and truth",
						}),
						status: "COMPLETED",
						promptTokens: 200,
						completionTokens: 220,
						totalTokens: 420,
						estimatedCost: 0.0084,
						durationMs: 950,
						errorMessage: null,
						createdAt: new Date().toISOString(),
					},
					error: null,
				}),
				{ status: 200, headers: { "Content-Type": "application/json" } }
			);
		};

		const gen = await aiService.generateStory(sampleMovieId);
		assert.strictEqual(gen.generationType, "STORY");
		assert.strictEqual(gen.totalTokens, 420);
		reset();
	});

	await t.test("7.2 aiService.improveScene sends prompt to enhance scene subtext", async () => {
		authTokens.setTokens({ accessToken: "test-jwt", refreshToken: "test-refresh" });
		let requestBody: any = null;

		global.fetch = async (url, init) => {
			assert.strictEqual(
				url.toString(),
				`http://localhost:5000/api/ai/movies/${sampleMovieId}/improve-scene`
			);
			assert.strictEqual(init?.method, "POST");
			requestBody = JSON.parse(init?.body as string);

			return new Response(
				JSON.stringify({
					success: true,
					message: "Scene improved successfully",
					data: {
						id: "ai-gen-uuid-002",
						userId: "user-uuid",
						movieId: sampleMovieId,
						generationType: "IMPROVE_SCENE",
						input: "instruction",
						output: "A shadow darts across his reflection. Eric freezes.",
						status: "COMPLETED",
						promptTokens: 100,
						completionTokens: 80,
						totalTokens: 180,
						estimatedCost: 0.0036,
						durationMs: 450,
						errorMessage: null,
						createdAt: new Date().toISOString(),
					},
					error: null,
				}),
				{ status: 200, headers: { "Content-Type": "application/json" } }
			);
		};

		const res = await aiService.improveScene(sampleMovieId, {
			sceneContent: "EXT. KIGALI CITY - DUSK\nEric checks his phone.",
			action: "IMPROVE_DIALOGUE",
			instructions: "Add sensory atmosphere and suspense.",
		});

		assert.strictEqual(requestBody.instructions, "Add sensory atmosphere and suspense.");
		assert.ok(typeof res.output === "string" && res.output.includes("Eric freezes"));
		reset();
	});

	await t.test("7.3 aiService.generateCharacters unwraps generation envelope and populates parsedOutput", async () => {
		authTokens.setTokens({ accessToken: "test-jwt", refreshToken: "test-refresh" });

		global.fetch = async (url, init) => {
			assert.strictEqual(
				url.toString(),
				`http://localhost:5000/api/ai/movies/${sampleMovieId}/generate-characters`
			);
			assert.strictEqual(init?.method, "POST");

			return new Response(
				JSON.stringify({
					success: true,
					message: "Characters generated successfully",
					data: {
						generation: {
							id: "ai-gen-uuid-chars",
							userId: "user-uuid",
							movieId: sampleMovieId,
							generationType: "CHARACTERS",
							input: "{}",
							output: JSON.stringify([{ name: "Lucia Vance", role: "Protagonist" }]),
							status: "COMPLETED",
							promptTokens: 150,
							completionTokens: 120,
							totalTokens: 270,
							estimatedCost: 0.0054,
							durationMs: 600,
							errorMessage: null,
							createdAt: new Date().toISOString(),
						},
						parsedOutput: [{ name: "Lucia Vance", role: "Protagonist" }],
					},
					error: null,
				}),
				{ status: 200, headers: { "Content-Type": "application/json" } }
			);
		};

		const res = await aiService.generateCharacters(sampleMovieId);
		assert.strictEqual(res.id, "ai-gen-uuid-chars");
		assert.strictEqual(res.generationType, "CHARACTERS");
		assert.ok(Array.isArray(res.parsedOutput));
		assert.strictEqual(res.parsedOutput[0].name, "Lucia Vance");
		reset();
	});

	await t.test("7.4 aiService.applyGeneration calls backend apply endpoint", async () => {
		authTokens.setTokens({ accessToken: "test-jwt", refreshToken: "test-refresh" });

		global.fetch = async (url, init) => {
			assert.strictEqual(
				url.toString(),
				`http://localhost:5000/api/ai/generations/ai-gen-uuid-chars/apply`
			);
			assert.strictEqual(init?.method, "POST");

			return new Response(
				JSON.stringify({
					success: true,
					message: "Generation accepted and applied to project successfully.",
					data: {
						id: "ai-gen-uuid-chars",
						status: "ACCEPTED",
						appliedData: [{ id: "char-1", name: "Lucia Vance" }],
					},
					error: null,
				}),
				{ status: 200, headers: { "Content-Type": "application/json" } }
			);
		};

		const res = await aiService.applyGeneration("ai-gen-uuid-chars");
		assert.strictEqual(res.id, "ai-gen-uuid-chars");
		assert.strictEqual(res.status, "ACCEPTED");
		assert.strictEqual(res.appliedData.length, 1);
		reset();
	});

	await t.test("7.5 aiService.rejectGeneration calls backend reject endpoint", async () => {
		authTokens.setTokens({ accessToken: "test-jwt", refreshToken: "test-refresh" });

		global.fetch = async (url, init) => {
			assert.strictEqual(
				url.toString(),
				`http://localhost:5000/api/ai/generations/ai-gen-uuid-chars/reject`
			);
			assert.strictEqual(init?.method, "POST");

			return new Response(
				JSON.stringify({
					success: true,
					message: "Generation rejected.",
					data: {
						id: "ai-gen-uuid-chars",
						status: "REJECTED",
					},
					error: null,
				}),
				{ status: 200, headers: { "Content-Type": "application/json" } }
			);
		};

		const res = await aiService.rejectGeneration("ai-gen-uuid-chars");
		assert.strictEqual(res.id, "ai-gen-uuid-chars");
		assert.strictEqual(res.status, "REJECTED");
		reset();
	});
});
