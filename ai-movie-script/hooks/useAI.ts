"use client";

/**
 * FilmForge AI — useAI Hook
 *
 * Connects frontend AI requests to real Express backend OpenAI pipelines.
 * Never simulates responses; preserves existing project content on failure.
 */

import { useState, useCallback, useEffect } from "react";
import { aiService } from "../services/aiService";
import {
	AIGeneration,
	AIQuota,
	GenerateIdeaInput,
	GenerateStoryInput,
	GenerateCharactersInput,
	GenerateOutlineInput,
	GenerateSceneInput,
	ImproveSceneInput,
} from "../types/ai";

export function useAI(movieId?: string | null) {
	const [isGenerating, setIsGenerating] = useState<boolean>(false);
	const [lastGeneration, setLastGeneration] = useState<AIGeneration | null>(null);
	const [quota, setQuota] = useState<AIQuota | null>(null);
	const [error, setError] = useState<string | null>(null);

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
		fetchQuota();
	}, [fetchQuota]);

	const generateStory = useCallback(
		async (input?: GenerateStoryInput): Promise<AIGeneration> => {
			if (!movieId) throw new Error("Movie ID is required for story generation");
			setIsGenerating(true);
			setError(null);
			try {
				const gen = await aiService.generateStory(movieId, input);
				setLastGeneration(gen);
				await fetchQuota();
				return gen;
			} catch (err: unknown) {
				const msg =
					err instanceof Error
						? err.message
						: "AI Story Generation failed. Please try again.";
				setError(msg);
				throw err;
			} finally {
				setIsGenerating(false);
			}
		},
		[movieId, fetchQuota]
	);

	const generateCharacters = useCallback(
		async (input?: GenerateCharactersInput): Promise<AIGeneration> => {
			if (!movieId) throw new Error("Movie ID is required for character generation");
			setIsGenerating(true);
			setError(null);
			try {
				const gen = await aiService.generateCharacters(movieId, input);
				setLastGeneration(gen);
				await fetchQuota();
				return gen;
			} catch (err: unknown) {
				const msg =
					err instanceof Error
						? err.message
						: "AI Character Generation failed. Please try again.";
				setError(msg);
				throw err;
			} finally {
				setIsGenerating(false);
			}
		},
		[movieId, fetchQuota]
	);

	const generateOutline = useCallback(
		async (input?: GenerateOutlineInput): Promise<AIGeneration> => {
			if (!movieId) throw new Error("Movie ID is required for outline generation");
			setIsGenerating(true);
			setError(null);
			try {
				const gen = await aiService.generateOutline(movieId, input);
				setLastGeneration(gen);
				await fetchQuota();
				return gen;
			} catch (err: unknown) {
				const msg =
					err instanceof Error
						? err.message
						: "AI Outline Generation failed. Please try again.";
				setError(msg);
				throw err;
			} finally {
				setIsGenerating(false);
			}
		},
		[movieId, fetchQuota]
	);

	const generateScene = useCallback(
		async (input: GenerateSceneInput): Promise<AIGeneration> => {
			if (!movieId) throw new Error("Movie ID is required for scene generation");
			setIsGenerating(true);
			setError(null);
			try {
				const gen = await aiService.generateScene(movieId, input);
				setLastGeneration(gen);
				await fetchQuota();
				return gen;
			} catch (err: unknown) {
				const msg =
					err instanceof Error
						? err.message
						: "AI Scene Generation failed. Please try again.";
				setError(msg);
				throw err;
			} finally {
				setIsGenerating(false);
			}
		},
		[movieId, fetchQuota]
	);

	const improveScene = useCallback(
		async (input: ImproveSceneInput): Promise<AIGeneration> => {
			if (!movieId) throw new Error("Movie ID is required for scene refinement");
			setIsGenerating(true);
			setError(null);
			try {
				const gen = await aiService.improveScene(movieId, input);
				setLastGeneration(gen);
				await fetchQuota();
				return gen;
			} catch (err: unknown) {
				const msg =
					err instanceof Error
						? err.message
						: "AI Scene Refinement failed. Please try again.";
				setError(msg);
				throw err;
			} finally {
				setIsGenerating(false);
			}
		},
		[movieId, fetchQuota]
	);

	const applyGeneration = useCallback(
		async (generationId: string, editedOutput?: unknown): Promise<void> => {
			setIsGenerating(true);
			setError(null);
			try {
				await aiService.applyGeneration(generationId, { editedOutput });
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

	const rejectGeneration = useCallback(async (generationId: string): Promise<void> => {
		try {
			await aiService.rejectGeneration(generationId);
		} catch {
			// Non-blocking reject
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

