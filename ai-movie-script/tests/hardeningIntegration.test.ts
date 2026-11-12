/**
 * FilmForge AI — Phase G Frontend Hardening, SSE Streaming & Diff Windowing Integration Tests
 */

import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import { api, ApiClientError } from "../lib/api";
import { authTokens } from "../lib/auth";
import { API_ENDPOINTS } from "../lib/constants";
import {
	DEFAULT_DIFF_WINDOW_LIMIT,
	sliceDiffRowsForPreview,
} from "../services/scriptDoctorService";

function createSseStreamResponse(frames: string[], status = 200): Response {
	const encoder = new TextEncoder();
	const stream = new ReadableStream<Uint8Array>({
		start(controller) {
			for (const frame of frames) {
				controller.enqueue(encoder.encode(frame));
			}
			controller.close();
		},
	});
	return new Response(stream, {
		status,
		headers: { "Content-Type": "text/event-stream" },
	});
}

describe("Phase G: Frontend Streaming, Timeout, Auth Refresh & Diff Windowing Tests", () => {
	const originalFetch = global.fetch;

	beforeEach(() => {
		authTokens.setTokens({
			accessToken: "phase-g-access-token",
			refreshToken: "phase-g-refresh-token",
		});
	});

	afterEach(() => {
		global.fetch = originalFetch;
		authTokens.clearTokens();
	});

	test("1. API_ENDPOINTS exposes Phase G usage & SSE streaming routes", () => {
		assert.strictEqual(API_ENDPOINTS.AI.USAGE, "/ai/usage");
		assert.strictEqual(API_ENDPOINTS.AI.STREAM_GENERATE, "/ai/stream/generate");
		assert.strictEqual(
			API_ENDPOINTS.SCREENPLAY_GENERATION.STREAM_JOB("m1", "j1"),
			"/movies/m1/screenplay-generation/jobs/j1/stream"
		);
	});

	test("2. api.streamSSE parses stage, delta, progress, and complete SSE frames incrementally", async () => {
		const stages: string[] = [];
		const deltas: string[] = [];
		const state: { finalPayload: { isPartial: boolean; result: { proposedText: string } } | null } = {
			finalPayload: null,
		};

		global.fetch = async () =>
			createSseStreamResponse([
				'event: stage\ndata: {"stage":"PREPARING","message":"Preparing context"}\n\n',
				'event: delta\ndata: {"delta":"Hello ","accumulatedLength":6}\n\n',
				'event: delta\ndata: {"delta":"Harbor!","accumulatedLength":13}\n\n',
				'event: complete\ndata: {"generationId":"gen-1","isPartial":false,"result":{"proposedText":"Hello Harbor!"}}\n\n',
			]);

		await api.streamSSE<{ isPartial: boolean; result: { proposedText: string } }>(
			API_ENDPOINTS.AI.STREAM_GENERATE,
			{ method: "POST", body: { operation: "SCRIPT_DOCTOR_SUGGESTION" } },
			{
				onStage: (p) => stages.push(p.stage),
				onDelta: (p) => deltas.push(p.delta),
				onComplete: (p) => {
					state.finalPayload = p;
				},
			}
		);

		assert.deepStrictEqual(stages, ["PREPARING"]);
		assert.strictEqual(deltas.join(""), "Hello Harbor!");
		assert.ok(state.finalPayload);
		assert.strictEqual(state.finalPayload.isPartial, false);
		assert.strictEqual(state.finalPayload.result.proposedText, "Hello Harbor!");
	});

	test("3. api.streamSSE invokes onError cleanly when stream emits error event with partial state", async () => {
		const state: {
			capturedErr: {
				code?: string;
				message: string;
				isPartial?: boolean;
				partialCharsReceived?: number;
			} | null;
		} = { capturedErr: null };

		global.fetch = async () =>
			createSseStreamResponse([
				'event: delta\ndata: {"delta":"Partial","accumulatedLength":7}\n\n',
				'event: error\ndata: {"code":"STREAM_INTERRUPTED","message":"OpenAI dropped connection","isPartial":true,"partialCharsReceived":7,"retryable":true}\n\n',
			]);

		await api.streamSSE(
			API_ENDPOINTS.AI.STREAM_GENERATE,
			{ method: "POST", body: { operation: "STORY_EXPANSION" } },
			{
				onError: (err) => {
					state.capturedErr = err;
				},
			}
		);

		assert.ok(state.capturedErr);
		assert.strictEqual(state.capturedErr.code, "STREAM_INTERRUPTED");
		assert.strictEqual(state.capturedErr.isPartial, true);
		assert.strictEqual(state.capturedErr.partialCharsReceived, 7);
	});

	test("4. api.streamSSE handles incomplete truncated EOF cleanly and refreshes 401 token before streaming", async () => {
		let callCount = 0;

		global.fetch = async (input) => {
			callCount++;
			const url = typeof input === "string" ? input : input instanceof Request ? input.url : "";
			if (url.endsWith("/auth/refresh")) {
				return new Response(
					JSON.stringify({
						success: true,
						data: {
							accessToken: "rotated-g-token",
							refreshToken: "rotated-g-refresh",
						},
					}),
					{ status: 200, headers: { "Content-Type": "application/json" } }
				);
			}
			if (callCount === 1) {
				return new Response(
					JSON.stringify({ success: false, message: "Expired token" }),
					{ status: 401, headers: { "Content-Type": "application/json" } }
				);
			}
			// Return stream terminating cleanly only with partial delta (missing terminal complete/done/error)
			return createSseStreamResponse([
				'event: delta\ndata: {"delta":"Cut short","accumulatedLength":9}\n\n',
			]);
		};

		const state: {
			errSeen: {
				code?: string;
				message: string;
				isPartial?: boolean;
			} | null;
		} = { errSeen: null };
		await api.streamSSE(
			API_ENDPOINTS.AI.STREAM_GENERATE,
			{ method: "POST", body: { operation: "STORY_EXPANSION" } },
			{
				onError: (e) => {
					state.errSeen = e;
				},
			}
		);

		assert.strictEqual(callCount, 3);
		assert.ok(state.errSeen);
		assert.strictEqual(state.errSeen.code, "STREAM_TRUNCATED");
		assert.strictEqual(state.errSeen.isPartial, true);
	});

	test("5. api.streamSSE throws status 499 on AbortController cancellation without reporting stream error", async () => {
		const controller = new AbortController();
		controller.abort();

		global.fetch = async (_url, init) => {
			if (init?.signal?.aborted) {
				throw new DOMException("The user aborted a request.", "AbortError");
			}
			return createSseStreamResponse([]);
		};

		let errorCalled = false;
		await assert.rejects(
			() =>
				api.streamSSE(
					API_ENDPOINTS.AI.STREAM_GENERATE,
					{ method: "POST", signal: controller.signal, body: {} },
					{
						onError: () => {
							errorCalled = true;
						},
					}
				),
			(err: unknown) => err instanceof ApiClientError && err.statusCode === 499
		);
		assert.strictEqual(errorCalled, false);
	});

	test("6. api.request enforces AbortController request timeouts with statusCode 408", async () => {
		global.fetch = async (_url, init) =>
			new Promise<Response>((_resolve, reject) => {
				init?.signal?.addEventListener(
					"abort",
					() => reject(new DOMException("Aborted due to timeout", "AbortError")),
					{ once: true }
				);
			});

		await assert.rejects(
			() => api.get("/ai/usage", { timeoutMs: 30 }),
			(err: unknown) =>
				err instanceof ApiClientError &&
				err.statusCode === 408 &&
				err.message.toLowerCase().includes("timed out")
		);
	});

	test("7. sliceDiffRowsForPreview windows large diff sets to 250 rows by default and expands when requested", () => {
		const rows = Array.from({ length: 620 }, (_, i) => ({ line: i + 1 }));
		const windowed = sliceDiffRowsForPreview(rows, false);
		assert.strictEqual(windowed.isWindowed, true);
		assert.strictEqual(windowed.visibleRows.length, DEFAULT_DIFF_WINDOW_LIMIT);
		assert.strictEqual(windowed.hiddenRows, 620 - DEFAULT_DIFF_WINDOW_LIMIT);

		const expanded = sliceDiffRowsForPreview(rows, true);
		assert.strictEqual(expanded.isWindowed, false);
		assert.strictEqual(expanded.visibleRows.length, 620);
		assert.strictEqual(expanded.hiddenRows, 0);
	});
});
