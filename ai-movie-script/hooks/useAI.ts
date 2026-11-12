"use client";

/**
 * FilmForge AI — useAI Hook
 *
 * Connects frontend AI requests to real Express backend OpenAI pipelines.
 * Never simulates responses; preserves existing project content on failure.
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { aiService } from "../services/aiService";
import {
	AIGeneration,
	AIQuota,
	GenerateStoryInput,
	GenerateCharactersInput,
	GenerateOutlineInput,
	GenerateSceneInput,
	ImproveSceneInput,
	ApplyGenerationResult,
	RejectGenerationResult,
} from "../types/ai";

export function useAI(movieId?: string | null) {
	const [isGenerating, setIsGenerating] = useState<boolean>(false);
	const [lastGeneration, setLastGeneration] = useState<AIGeneration | null>(null);
	const [quota, setQuota] = useState<AIQuota | null>(null);
	const [error, setError] = useState<string | null>(null);
	const inFlightMapRef = useRef<Map<string, Promise<AIGeneration>>>(new Map());

	// Load quota
	const fetchQuota = useCallback(async () => {
		try {
			const res = await aiService.getQuota();
			setQuota(res);
		} catch {
			// Non-blocking quota fetch
		}
	}, []);

	useEffect(() => {
		let active = true;
		void (async () => {
			await Promise.resolve();
			if (active) {
				await fetchQuota();
			}
		})();
		return () => {
			active = false;
		};
	}, [fetchQuota]);

	const runGuardedGeneration = useCallback(
		(key: string, fn: () => Promise<AIGeneration>, fallbackMsg: string): Promise<AIGeneration> => {
			const existing = inFlightMapRef.current.get(key);
			if (existing) return existing;

			setIsGenerating(true);
			setError(null);
			const promise = (async () => {
				try {
					const gen = await fn();
					setLastGeneration(gen);
					await fetchQuota();
					return gen;
				} catch (err: unknown) {
					const msg = err instanceof Error ? err.message : fallbackMsg;
					setError(msg);
					throw err;
				} finally {
					inFlightMapRef.current.delete(key);
					setIsGenerating(inFlightMapRef.current.size > 0);
				}
			})();
			inFlightMapRef.current.set(key, promise);
			return promise;
		},
		[fetchQuota]
	);

	const generateStory = useCallback(
		async (input?: GenerateStoryInput): Promise<AIGeneration> => {
			if (!movieId) throw new Error("Movie ID is required for story generation");
			return runGuardedGeneration(
				`story:${movieId}`,
				() => aiService.generateStory(movieId, input),
				"AI Story Generation failed. Please try again."
			);
		},
		[movieId, runGuardedGeneration]
	);

	const generateCharacters = useCallback(
		async (input?: GenerateCharactersInput): Promise<AIGeneration> => {
			if (!movieId) throw new Error("Movie ID is required for character generation");
			return runGuardedGeneration(
				`characters:${movieId}`,
				() => aiService.generateCharacters(movieId, input),
				"AI Character Generation failed. Please try again."
			);
		},
		[movieId, runGuardedGeneration]
	);

	const generateOutline = useCallback(
		async (input?: GenerateOutlineInput): Promise<AIGeneration> => {
			if (!movieId) throw new Error("Movie ID is required for outline generation");
			return runGuardedGeneration(
				`outline:${movieId}`,
				() => aiService.generateOutline(movieId, input),
				"AI Outline Generation failed. Please try again."
			);
		},
		[movieId, runGuardedGeneration]
	);

	const generateScene = useCallback(
		async (input: GenerateSceneInput): Promise<AIGeneration> => {
			if (!movieId) throw new Error("Movie ID is required for scene generation");
			return runGuardedGeneration(
				`scene:${movieId}:${input.sceneId}`,
				() => aiService.generateScene(movieId, input),
				"AI Scene Generation failed. Please try again."
			);
		},
		[movieId, runGuardedGeneration]
	);

	const improveScene = useCallback(
		async (input: ImproveSceneInput): Promise<AIGeneration> => {
			if (!movieId) throw new Error("Movie ID is required for scene refinement");
			return runGuardedGeneration(
				`improve:${movieId}:${input.sceneId ?? "draft"}`,
				() => aiService.improveScene(movieId, input),
				"AI Scene Refinement failed. Please try again."
			);
		},
		[movieId, runGuardedGeneration]
	);

	const applyGeneration = useCallback(
		async (generationId: string, editedOutput?: unknown): Promise<ApplyGenerationResult> => {
			setIsGenerating(true);
			setError(null);
			try {
				const res = await aiService.applyGeneration(generationId, { editedOutput });
				return res;
			} catch (err: unknown) {
				const msg =
					err instanceof Error
						? err.message
						: "Failed to apply AI generation output to project.";
				setError(msg);
				throw err;
			} finally {
				setIsGenerating(false);
			}
		},
		[]
	);

	const rejectGeneration = useCallback(async (generationId: string): Promise<RejectGenerationResult> => {
		try {
			return await aiService.rejectGeneration(generationId);
		} catch (err: unknown) {
			const msg =
				err instanceof Error
					? err.message
					: "Failed to reject AI proposal.";
			setError(msg);
			throw err;
		}
	}, []);

	return {
		isGenerating,
		lastGeneration,
		quota,
		error,
		generateStory,
		generateCharacters,
		generateOutline,
		generateScene,
		improveScene,
		applyGeneration,
		rejectGeneration,
		refetchQuota: fetchQuota,
	};
}

