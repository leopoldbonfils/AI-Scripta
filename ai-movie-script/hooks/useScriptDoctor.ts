"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api, ApiClientError } from "../lib/api";
import { API_ENDPOINTS } from "../lib/constants";
import type { StreamConnectionState } from "../components/ai/StreamStatusBanner";
import { screenplayService } from "../services/screenplayService";
import { scriptDoctorService } from "../services/scriptDoctorService";
import {
	ContinuityFindingIntentionality,
	ScriptDoctorAnalysis,
	ScriptDoctorAnalysisScope,
	ScriptDoctorDashboardData,
	ScriptDoctorOperation,
	ScriptDoctorSuggestion,
	ScriptDoctorTargetScope,
	VersionComparisonResult,
} from "../types/scriptDoctor";

export function useScriptDoctor(movieId: string) {
	const [dashboard, setDashboard] = useState<ScriptDoctorDashboardData | null>(null);
	const [selectedScreenplayId, setSelectedScreenplayId] = useState<string | undefined>(undefined);
	const [activeAnalysis, setActiveAnalysis] = useState<ScriptDoctorAnalysis | null>(null);
	const [activeSuggestion, setActiveSuggestion] = useState<ScriptDoctorSuggestion | null>(null);
	const [versionComparison, setVersionComparison] = useState<VersionComparisonResult | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isBusy, setIsBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [notice, setNotice] = useState<string | null>(null);
	const [staleWarning, setStaleWarning] = useState<string | null>(null);

	const [streamState, setStreamState] = useState<StreamConnectionState>("IDLE");
	const [streamStage, setStreamStage] = useState<string | undefined>(undefined);
	const [streamPreviewText, setStreamPreviewText] = useState<string>("");
	const [streamError, setStreamError] = useState<string | null>(null);

	const streamAbortRef = useRef<AbortController | null>(null);
	const inFlightRef = useRef<Set<string>>(new Set());
	const lastStreamParamsRef = useRef<{
		operationType: ScriptDoctorOperation;
		targetScope: ScriptDoctorTargetScope;
		targetActNumber?: number;
		targetSceneNumber?: number;
		selectedText?: string;
		directions?: string;
	} | null>(null);

	const dashboardScreenplayId = dashboard?.screenplay?.id;
	const activeAnalysisId = activeAnalysis?.id;

	const loadDashboard = useCallback(
		async (spId?: string, showSpinner = true) => {
			if (!movieId) return;
			if (showSpinner) {
				setIsLoading(true);
			}
			setError(null);
			try {
				const data = await scriptDoctorService.getDashboard(
					movieId,
					spId ?? selectedScreenplayId
				);
				setDashboard(data);
				setSelectedScreenplayId(data.screenplay.id);
				setActiveAnalysis((prev) =>
					prev && data.analyses.some((a) => a.id === prev.id)
						? data.analyses.find((a) => a.id === prev.id) || data.analyses[0] || null
						: data.analyses[0] || null
				);
				setActiveSuggestion((prev) => {
					if (prev && data.suggestions.some((s) => s.id === prev.id)) {
						return data.suggestions.find((s) => s.id === prev.id) || null;
					}
					return (
						data.suggestions.find((s) => s.status === "PENDING" || s.status === "EDITED") ||
						data.suggestions[0] ||
						null
					);
				});
			} catch (err: unknown) {
				setError(
					err instanceof Error ? err.message : "Failed to load Script Doctor workspace"
				);
			} finally {
				setIsLoading(false);
			}
		},
		[movieId, selectedScreenplayId]
	);

	useEffect(() => {
		let active = true;
		void (async () => {
			await Promise.resolve();
			if (active) {
				await loadDashboard(undefined, false);
			}
		})();
		return () => {
			active = false;
			if (streamAbortRef.current) {
				streamAbortRef.current.abort();
				streamAbortRef.current = null;
			}
		};
	}, [loadDashboard]);

	const runAnalysis = useCallback(
		async (params: {
			analysisScope: ScriptDoctorAnalysisScope;
			targetActNumber?: number;
			targetSceneNumber?: number;
			includeStoryBible?: boolean;
			focusNotes?: string;
		}) => {
			if (!dashboardScreenplayId || inFlightRef.current.has("analysis")) return null;
			inFlightRef.current.add("analysis");
			setIsBusy(true);
			setError(null);
			setNotice(null);
			try {
				const created = await scriptDoctorService.runAnalysis(movieId, {
					screenplayId: dashboardScreenplayId,
					...params,
				});
				setActiveAnalysis(created);
				await loadDashboard(dashboardScreenplayId);
				setNotice(
					created.isPartialAnalysis
						? `Partial evaluation saved (${created.chunksProcessed}/${created.totalChunks} chunks). Original screenplay untouched.`
						: `Evaluation complete (${created.continuityFindingsJson.length} continuity finding(s)). Original screenplay untouched.`
				);
				return created;
			} catch (err: unknown) {
				setError(err instanceof Error ? err.message : "Failed to run Script Doctor analysis");
				return null;
			} finally {
				inFlightRef.current.delete("analysis");
				setIsBusy(false);
			}
		},
		[movieId, dashboardScreenplayId, loadDashboard]
	);

	const updateFindingStatus = useCallback(
		async (
			analysisId: string,
			findingId: string,
			intentionality: ContinuityFindingIntentionality,
			resolutionNote?: string
		) => {
			setIsBusy(true);
			setError(null);
			try {
				const updated = await scriptDoctorService.updateFindingStatus(
					movieId,
					analysisId,
					findingId,
					intentionality,
					resolutionNote
				);
				setActiveAnalysis(updated);
				await loadDashboard(dashboardScreenplayId);
				setNotice(`Continuity finding updated to ${intentionality}.`);
			} catch (err: unknown) {
				setError(err instanceof Error ? err.message : "Failed to update continuity finding");
			} finally {
				setIsBusy(false);
			}
		},
		[movieId, dashboardScreenplayId, loadDashboard]
	);

	const generateSuggestion = useCallback(
		async (params: {
			operationType: ScriptDoctorOperation;
			targetScope: ScriptDoctorTargetScope;
			targetActNumber?: number;
			targetSceneNumber?: number;
			targetStartOffset?: number;
			targetEndOffset?: number;
			selectedText?: string;
			directions?: string;
			dialogueMode?: string;
			polishFocus?: string;
			findingId?: string;
		}) => {
			if (!dashboardScreenplayId || inFlightRef.current.has("suggestion")) return null;
			inFlightRef.current.add("suggestion");
			setIsBusy(true);
			setError(null);
			setNotice(null);
			setStaleWarning(null);
			try {
				const created = await scriptDoctorService.generateSuggestion(movieId, {
					screenplayId: dashboardScreenplayId,
					analysisId: activeAnalysisId,
					...params,
				});
				setActiveSuggestion(created);
				await loadDashboard(dashboardScreenplayId);
				setNotice(
					`Preview ready (${created.operationType} on ${created.targetLabel}). Original screenplay remains unchanged until you explicitly accept.`
				);
				return created;
			} catch (err: unknown) {
				setError(err instanceof Error ? err.message : "Failed to generate proposal");
				return null;
			} finally {
				inFlightRef.current.delete("suggestion");
				setIsBusy(false);
			}
		},
		[movieId, dashboardScreenplayId, activeAnalysisId, loadDashboard]
	);

	const cancelSuggestionStream = useCallback(() => {
		if (streamAbortRef.current) {
			streamAbortRef.current.abort();
			streamAbortRef.current = null;
		}
		inFlightRef.current.delete("streamSuggestion");
		setStreamState("CANCELLED");
		setIsBusy(false);
	}, []);

	const streamSuggestionPreview = useCallback(
		async (params: {
			operationType: ScriptDoctorOperation;
			targetScope: ScriptDoctorTargetScope;
			targetActNumber?: number;
			targetSceneNumber?: number;
			selectedText?: string;
			directions?: string;
		}) => {
			if (!dashboardScreenplayId || inFlightRef.current.has("streamSuggestion")) return;
			inFlightRef.current.add("streamSuggestion");
			lastStreamParamsRef.current = params;

			if (streamAbortRef.current) {
				streamAbortRef.current.abort();
			}
			const controller = new AbortController();
			streamAbortRef.current = controller;

			setIsBusy(true);
			setError(null);
			setNotice(null);
			setStreamError(null);
			setStreamPreviewText("");
			setStreamStage("Connecting to OpenAI stream...");
			setStreamState("CONNECTING");

			try {
				await api.streamSSE<{
					generationId: string;
					isPartial: boolean;
					result?: { proposedText?: string; rationale?: string };
				}>(
					API_ENDPOINTS.AI.STREAM_GENERATE,
					{
						method: "POST",
						signal: controller.signal,
						body: {
							operation: "SCRIPT_DOCTOR_SUGGESTION",
							movieId,
							screenplayId: dashboardScreenplayId,
							targetScope: params.targetScope,
							targetActNumber: params.targetActNumber,
							targetSceneNumber: params.targetSceneNumber,
							selectedText: params.selectedText,
							doctorOperationType: params.operationType,
							directions: params.directions,
						},
					},
					{
						onStage: (payload) => {
							if (controller.signal.aborted) return;
							setStreamStage(payload.message || payload.stage);
						},
						onDelta: (payload) => {
							if (controller.signal.aborted) return;
							setStreamState("STREAMING");
							setStreamPreviewText((prev) => prev + payload.delta);
						},
						onComplete: (payload) => {
							if (controller.signal.aborted) return;
							setStreamState("COMPLETED");
							setStreamStage("Structured proposal validated cleanly");
							if (payload.result?.proposedText) {
								setStreamPreviewText(payload.result.proposedText);
							}
							setNotice("Live AI revision stream completed cleanly. Original screenplay remains untouched.");
						},
						onError: (err) => {
							if (controller.signal.aborted) return;
							setStreamState("INTERRUPTED");
							setStreamError(
								err.isPartial
									? `${err.message} (${err.partialCharsReceived ?? 0} partial characters received before interruption)`
									: err.message
							);
						},
					}
				);
			} catch (err: unknown) {
				if (controller.signal.aborted) {
					setStreamState("CANCELLED");
				} else {
					setStreamState("INTERRUPTED");
					setStreamError(err instanceof Error ? err.message : "Streaming connection failed");
				}
			} finally {
				if (streamAbortRef.current === controller) {
					streamAbortRef.current = null;
				}
				inFlightRef.current.delete("streamSuggestion");
				setIsBusy(false);
			}
		},
		[movieId, dashboardScreenplayId]
	);

	const retrySuggestionStream = useCallback(() => {
		if (lastStreamParamsRef.current) {
			void streamSuggestionPreview(lastStreamParamsRef.current);
		}
	}, [streamSuggestionPreview]);

	const editSuggestion = useCallback(
		async (suggestionId: string, editedText: string, changeSummary?: string) => {
			setIsBusy(true);
			setError(null);
			try {
				const updated = await scriptDoctorService.editSuggestion(
					movieId,
					suggestionId,
					editedText,
					changeSummary
				);
				setActiveSuggestion(updated);
				await loadDashboard(dashboardScreenplayId);
				setNotice("Edited proposal preview saved (original screenplay still untouched).");
				return updated;
			} catch (err: unknown) {
				setError(err instanceof Error ? err.message : "Failed to edit proposal");
				return null;
			} finally {
				setIsBusy(false);
			}
		},
		[movieId, dashboardScreenplayId, loadDashboard]
	);

	const regenerateSuggestion = useCallback(
		async (suggestionId: string, directions?: string) => {
			if (inFlightRef.current.has(`regen:${suggestionId}`)) return null;
			inFlightRef.current.add(`regen:${suggestionId}`);
			setIsBusy(true);
			setError(null);
			setStaleWarning(null);
			try {
				const updated = await scriptDoctorService.regenerateSuggestion(
					movieId,
					suggestionId,
					directions
				);
				setActiveSuggestion(updated);
				await loadDashboard(dashboardScreenplayId);
				setNotice("Proposal regenerated cleanly against current screenplay.");
				return updated;
			} catch (err: unknown) {
				setError(err instanceof Error ? err.message : "Failed to regenerate proposal");
				return null;
			} finally {
				inFlightRef.current.delete(`regen:${suggestionId}`);
				setIsBusy(false);
			}
		},
		[movieId, dashboardScreenplayId, loadDashboard]
	);

	const acceptSuggestion = useCallback(
		async (
			suggestionId: string,
			options?: {
				acceptedHunkIds?: string[];
				editedText?: string;
				createBibleProposals?: boolean;
			}
		) => {
			if (inFlightRef.current.has(`accept:${suggestionId}`)) return null;
			inFlightRef.current.add(`accept:${suggestionId}`);
			setIsBusy(true);
			setError(null);
			setStaleWarning(null);
			try {
				const res = await scriptDoctorService.acceptSuggestion(movieId, suggestionId, options);
				setActiveSuggestion(res.suggestion);
				await loadDashboard(dashboardScreenplayId);
				setNotice(
					`Changes explicitly applied to screenplay (Version #${res.appliedVersion.versionNumber} saved)${
						res.pendingBibleProposalsCreated > 0
							? ` + ${res.pendingBibleProposalsCreated} Story Bible proposal(s) queued for approval`
							: ""
					}.`
				);
				return res;
			} catch (err: unknown) {
				if (err instanceof ApiClientError && err.statusCode === 409) {
					setStaleWarning(err.message);
					await loadDashboard(dashboardScreenplayId);
					return null;
				}
				setError(err instanceof Error ? err.message : "Failed to accept proposal");
				return null;
			} finally {
				inFlightRef.current.delete(`accept:${suggestionId}`);
				setIsBusy(false);
			}
		},
		[movieId, dashboardScreenplayId, loadDashboard]
	);

	const rejectOrDismissSuggestion = useCallback(
		async (suggestionId: string, mode: "REJECT" | "DISMISS", reason?: string) => {
			setIsBusy(true);
			setError(null);
			try {
				const updated =
					mode === "REJECT"
						? await scriptDoctorService.rejectSuggestion(movieId, suggestionId, reason)
						: await scriptDoctorService.dismissSuggestion(movieId, suggestionId);
				setActiveSuggestion(updated);
				await loadDashboard(dashboardScreenplayId);
				setNotice(
					mode === "REJECT"
						? "Proposal rejected. Original screenplay unchanged."
						: "Proposal dismissed. Original screenplay unchanged."
				);
				return updated;
			} catch (err: unknown) {
				setError(err instanceof Error ? err.message : "Action failed");
				return null;
			} finally {
				setIsBusy(false);
			}
		},
		[movieId, dashboardScreenplayId, loadDashboard]
	);

	const compareVersions = useCallback(
		async (fromVersionId: string, toVersionId?: string) => {
			if (!dashboardScreenplayId) return null;
			setIsBusy(true);
			setError(null);
			try {
				const cmp = await scriptDoctorService.compareVersions(
					movieId,
					dashboardScreenplayId,
					fromVersionId,
					toVersionId
				);
				setVersionComparison(cmp);
				return cmp;
			} catch (err: unknown) {
				setError(err instanceof Error ? err.message : "Failed to compare versions");
				return null;
			} finally {
				setIsBusy(false);
			}
		},
		[movieId, dashboardScreenplayId]
	);

	const restoreVersion = useCallback(
		async (versionId: string) => {
			if (!dashboardScreenplayId) return null;
			setIsBusy(true);
			setError(null);
			try {
				const restored = await screenplayService.restoreVersion(dashboardScreenplayId, versionId);
				await loadDashboard(dashboardScreenplayId);
				setNotice(
					`Restored historical snapshot into a new safe version (current draft backed up automatically).`
				);
				return restored;
			} catch (err: unknown) {
				setError(err instanceof Error ? err.message : "Failed to restore version");
				return null;
			} finally {
				setIsBusy(false);
			}
		},
		[dashboardScreenplayId, loadDashboard]
	);

	return {
		dashboard,
		activeAnalysis,
		setActiveAnalysis,
		activeSuggestion,
		setActiveSuggestion,
		versionComparison,
		setVersionComparison,
		isLoading,
		isBusy,
		error,
		notice,
		staleWarning,
		streamState,
		streamStage,
		streamPreviewText,
		streamError,
		loadDashboard,
		selectScreenplay: (id: string) => {
			setSelectedScreenplayId(id);
			void loadDashboard(id);
		},
		runAnalysis,
		updateFindingStatus,
		generateSuggestion,
		streamSuggestionPreview,
		cancelSuggestionStream,
		retrySuggestionStream,
		editSuggestion,
		regenerateSuggestion,
		acceptSuggestion,
		rejectOrDismissSuggestion,
		compareVersions,
		restoreVersion,
	};
}

