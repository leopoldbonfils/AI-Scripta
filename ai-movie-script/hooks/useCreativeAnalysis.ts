"use client";

import { useState, useCallback, useEffect } from "react";
import { analysisService } from "../services/analysisService";
import {
	CreativeAnalysisResult,
	CreativeInputType,
	AnalysisListItem,
	AnalyzeInputRequest,
} from "../types/analysis";

export function useCreativeAnalysis(movieId?: string | null) {
	const [content, setContent] = useState<string>("");
	const [inputType, setInputType] = useState<CreativeInputType>("AUTO_DETECT");
	const [genre, setGenre] = useState<string>("");
	const [targetAudience, setTargetAudience] = useState<string>("");
	const [intendedFormat, setIntendedFormat] = useState<string>("");
	const [additionalInstructions, setAdditionalInstructions] = useState<string>("");

	const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [currentAnalysis, setCurrentAnalysis] = useState<CreativeAnalysisResult | null>(null);
	const [currentGenerationId, setCurrentGenerationId] = useState<string | null>(null);

	const [history, setHistory] = useState<AnalysisListItem[]>([]);
	const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);

	// Fetch history
	const fetchHistory = useCallback(async () => {
		setIsLoadingHistory(true);
		try {
			if (movieId) {
				const items = await analysisService.getMovieAnalyses(movieId);
				setHistory(items);
			} else {
				const res = await analysisService.getAnalyses({ limit: 20 });
				setHistory(res.items || []);
			}
		} catch {
			// Non-blocking history load
		} finally {
			setIsLoadingHistory(false);
		}
	}, [movieId]);

	useEffect(() => {
		fetchHistory();
	}, [fetchHistory]);

	// Execute creative analysis
	const analyze = useCallback(
		async (overrideParams?: Partial<AnalyzeInputRequest>): Promise<CreativeAnalysisResult> => {
			const textToAnalyze = (overrideParams?.content ?? content).trim();
			if (!textToAnalyze) {
				const err = "Please provide some creative writing or concept text to analyze.";
				setError(err);
				throw new Error(err);
			}

			setIsAnalyzing(true);
			setError(null);

			try {
				const res = await analysisService.analyzeInput({
					content: textToAnalyze,
					inputType: overrideParams?.inputType ?? inputType,
					movieId: overrideParams?.movieId ?? (movieId || undefined),
					context: {
						genre: overrideParams?.context?.genre ?? (genre.trim() || undefined),
						targetAudience: overrideParams?.context?.targetAudience ?? (targetAudience.trim() || undefined),
						intendedFormat: overrideParams?.context?.intendedFormat ?? (intendedFormat.trim() || undefined),
						additionalInstructions:
							overrideParams?.context?.additionalInstructions ??
							(additionalInstructions.trim() || undefined),
					},
				});

				setCurrentAnalysis(res.analysis);
				setCurrentGenerationId(res.generationId);
				await fetchHistory();
				return res.analysis;
			} catch (err: unknown) {
				const msg =
					err instanceof Error
						? err.message
						: "Creative analysis failed. Please try again.";
				setError(msg);
				throw err;
			} finally {
				setIsAnalyzing(false);
			}
		},
		[content, inputType, genre, targetAudience, intendedFormat, additionalInstructions, movieId, fetchHistory]
	);

	// Load specific previous analysis by ID
	const loadAnalysis = useCallback(async (analysisId: string) => {
		setIsAnalyzing(true);
		setError(null);
		try {
			const res = await analysisService.getAnalysisById(analysisId);
			setCurrentAnalysis(res.analysis);
			setCurrentGenerationId(res.id);
		} catch (err: unknown) {
			const msg =
				err instanceof Error
					? err.message
					: "Failed to load previous analysis";
			setError(msg);
		} finally {
			setIsAnalyzing(false);
		}
	}, []);

	// Retry current analysis
	const retry = useCallback(async () => {
		if (!currentGenerationId) return;
		setIsAnalyzing(true);
		setError(null);
		try {
			const res = await analysisService.retryAnalysis(currentGenerationId);
			setCurrentAnalysis(res.analysis);
			setCurrentGenerationId(res.generationId);
			await fetchHistory();
		} catch (err: unknown) {
			const msg =
				err instanceof Error ? err.message : "Retry analysis failed";
			setError(msg);
		} finally {
			setIsAnalyzing(false);
		}
	}, [currentGenerationId, fetchHistory]);

	// Link analysis to movie
	const linkToMovie = useCallback(
		async (targetMovieId: string) => {
			if (!currentGenerationId) return;
			try {
				await analysisService.linkMovie(currentGenerationId, targetMovieId);
				await fetchHistory();
			} catch (err: unknown) {
				const msg =
					err instanceof Error ? err.message : "Failed to link analysis to movie";
				setError(msg);
				throw err;
			}
		},
		[currentGenerationId, fetchHistory]
	);

	const clearCurrent = useCallback(() => {
		setCurrentAnalysis(null);
		setCurrentGenerationId(null);
		setError(null);
	}, []);

	return {
		content,
		setContent,
		inputType,
		setInputType,
		genre,
		setGenre,
		targetAudience,
		setTargetAudience,
		intendedFormat,
		setIntendedFormat,
		additionalInstructions,
		setAdditionalInstructions,
		isAnalyzing,
		error,
		currentAnalysis,
		currentGenerationId,
		history,
		isLoadingHistory,
		analyze,
		loadAnalysis,
		retry,
		linkToMovie,
		clearCurrent,
		refetchHistory: fetchHistory,
	};
}

