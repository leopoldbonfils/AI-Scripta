"use client";

import { useState, useCallback, useRef } from "react";
import { storyIntelligenceService } from "../services/storyIntelligenceService";
import {
	StoryIntelligenceResult,
	GenerateStoryIntelligenceRequest,
	IntelligenceSection,
	SuggestionDecision,
	ApplyIntelligenceDecisionRequest,
	ApplyIntelligenceDecisionResponse,
} from "../types/storyIntelligence";

export type IntelligenceTab =
	| "overview"
	| "expansion"
	| "characters"
	| "motivations"
	| "relationships"
	| "arcs"
	| "structure"
	| "consistency";

export function useStoryIntelligence(initialMovieId?: string) {
	const [intelligence, setIntelligence] = useState<StoryIntelligenceResult | null>(null);
	const [history, setHistory] = useState<StoryIntelligenceResult[]>([]);
	const [activeTab, setActiveTab] = useState<IntelligenceTab>("overview");
	const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isRegenerating, setIsRegenerating] = useState(false);
	const [isApplying, setIsApplying] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [applySuccessMessage, setApplySuccessMessage] = useState<string | null>(null);
	const autoLoadedMovieRef = useRef<string | null>(null);
	const inFlightGenerateRef = useRef<Promise<StoryIntelligenceResult> | null>(null);
	const inFlightApplyRef = useRef<Promise<ApplyIntelligenceDecisionResponse | undefined> | null>(null);

	const generateIntelligence = useCallback(
		async (params: GenerateStoryIntelligenceRequest) => {
			if (inFlightGenerateRef.current) return inFlightGenerateRef.current;
			setIsLoading(true);
			setError(null);
			setApplySuccessMessage(null);
			const promise = (async () => {
				try {
					const res = await storyIntelligenceService.generate({
						...params,
						movieId: params.movieId || initialMovieId,
					});
					setIntelligence(res.intelligence);
					if (res.intelligence.characters.length > 0) {
						setSelectedCharacterId(res.intelligence.characters[0].id);
					}
					setHistory((prev) => [res.intelligence, ...prev.filter((h) => h.intelligenceId !== res.intelligence.intelligenceId)]);
					return res.intelligence;
				} catch (err: unknown) {
					const msg = err instanceof Error ? err.message : "Failed to generate Story & Character Intelligence";
					setError(msg);
					throw err;
				} finally {
					inFlightGenerateRef.current = null;
					setIsLoading(false);
				}
			})();
			inFlightGenerateRef.current = promise;
			return promise;
		},
		[initialMovieId]
	);

	const loadIntelligence = useCallback(async (id: string) => {
		setIsLoading(true);
		setError(null);
		try {
			const record = await storyIntelligenceService.getById(id);
			setIntelligence(record);
			if (record.characters.length > 0) {
				setSelectedCharacterId(record.characters[0].id);
			}
			return record;
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : "Failed to load Story Intelligence";
			setError(msg);
			throw err;
		} finally {
			setIsLoading(false);
		}
	}, []);

	const loadMovieHistory = useCallback(async (movieId: string) => {
		try {
			const records = await storyIntelligenceService.getByMovie(movieId);
			setHistory(records);
			if (records.length > 0 && autoLoadedMovieRef.current !== movieId) {
				autoLoadedMovieRef.current = movieId;
				setIntelligence(records[0]);
				if (records[0].characters.length > 0) {
					setSelectedCharacterId(records[0].characters[0].id);
				}
			}
			return records;
		} catch (err: unknown) {
			console.error("Failed to load movie intelligence history:", err);
			return [];
		}
	}, []);

	const regenerateSection = useCallback(
		async (section: IntelligenceSection, characterName?: string, customInstructions?: string) => {
			if (!intelligence) return;
			setIsRegenerating(true);
			setError(null);
			try {
				const updated = await storyIntelligenceService.regenerateSection(intelligence.intelligenceId, {
					section,
					characterName,
					customInstructions,
				});
				setIntelligence(updated);
				setHistory((prev) =>
					prev.map((h) => (h.intelligenceId === updated.intelligenceId ? updated : h))
				);
				return updated;
			} catch (err: unknown) {
				const msg = err instanceof Error ? err.message : `Failed to regenerate section ${section}`;
				setError(msg);
				throw err;
			} finally {
				setIsRegenerating(false);
			}
		},
		[intelligence]
	);

	const updateSuggestionStatus = useCallback(
		async (suggestionId: string, status: SuggestionDecision, editedContent?: string) => {
			if (!intelligence) return;
			const targetId = intelligence.intelligenceId;
			try {
				const updatedSug = await storyIntelligenceService.updateSuggestionStatus(
					targetId,
					suggestionId,
					{ status, editedContent }
				);

				setIntelligence((prev) => {
					if (!prev) return null;
					return {
						...prev,
						suggestions: prev.suggestions.map((s) => (s.id === suggestionId ? updatedSug : s)),
					};
				});
				setHistory((prev) =>
					prev.map((h) =>
						h.intelligenceId === targetId
							? {
									...h,
									suggestions: h.suggestions.map((s) => (s.id === suggestionId ? updatedSug : s)),
							  }
							: h
					)
				);
				return updatedSug;
			} catch (err: unknown) {
				const msg = err instanceof Error ? err.message : "Failed to update suggestion";
				setError(msg);
				throw err;
			}
		},
		[intelligence]
	);

	const applyToProject = useCallback(
		async (params: ApplyIntelligenceDecisionRequest): Promise<ApplyIntelligenceDecisionResponse | undefined> => {
			if (!intelligence) return;
			if (inFlightApplyRef.current) return inFlightApplyRef.current;
			setIsApplying(true);
			setError(null);
			setApplySuccessMessage(null);
			const promise = (async () => {
				try {
					const res = await storyIntelligenceService.applyToProject(intelligence.intelligenceId, params);
					setApplySuccessMessage(res.message);
					return res;
				} catch (err: unknown) {
					const msg = err instanceof Error ? err.message : "Failed to apply intelligence to movie project";
					setError(msg);
					throw err;
				} finally {
					inFlightApplyRef.current = null;
					setIsApplying(false);
				}
			})();
			inFlightApplyRef.current = promise;
			return promise;
		},
		[intelligence]
	);

	return {
		intelligence,
		history,
		activeTab,
		setActiveTab,
		selectedCharacterId,
		setSelectedCharacterId,
		isLoading,
		isRegenerating,
		isApplying,
		error,
		applySuccessMessage,
		generateIntelligence,
		loadIntelligence,
		loadMovieHistory,
		regenerateSection,
		updateSuggestionStatus,
		applyToProject,
		setIntelligence,
	};
}
