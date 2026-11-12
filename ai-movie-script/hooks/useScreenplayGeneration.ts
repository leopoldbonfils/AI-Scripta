"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api, ApiClientError } from "../lib/api";
import { API_ENDPOINTS } from "../lib/constants";
import type { StreamConnectionState } from "../components/ai/StreamStatusBanner";
import {
	isJobActivelyPolling,
	screenplayGenerationService,
} from "../services/screenplayGenerationService";
import {
	GeneratedActItem,
	GeneratedSceneItem,
	PreGenerationReadinessReport,
	ScreenplayGenerationJob,
	ScreenplayJobHistorySummary,
	StartScreenplayGenerationRequest,
} from "../types/screenplayGeneration";

export function useScreenplayGeneration(movieId: string) {
	const [readiness, setReadiness] = useState<PreGenerationReadinessReport | null>(null);
	const [job, setJob] = useState<ScreenplayGenerationJob | null>(null);
	const [history, setHistory] = useState<ScreenplayJobHistorySummary[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isBusy, setIsBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [notice, setNotice] = useState<string | null>(null);
	const [connectionState, setConnectionState] = useState<StreamConnectionState>("IDLE");
	const [streamError, setStreamError] = useState<string | null>(null);
	const [streamRetryTick, setStreamRetryTick] = useState(0);
	const [overwritePromptScene, setOverwritePromptScene] = useState<{
		sceneId: string;
		sceneTitle: string;
		instructions?: string;
	} | null>(null);

	const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const streamAbortRef = useRef<AbortController | null>(null);
	const inFlightRef = useRef<Set<string>>(new Set());
	const mountedRef = useRef(true);

	const clearPolling = useCallback(() => {
		if (pollTimerRef.current) {
			clearInterval(pollTimerRef.current);
			pollTimerRef.current = null;
		}
	}, []);

	const clearStreaming = useCallback(() => {
		if (streamAbortRef.current) {
			streamAbortRef.current.abort();
			streamAbortRef.current = null;
		}
	}, []);

	const loadInitial = useCallback(async (showSpinner = true) => {
		if (!movieId) return;
		if (showSpinner) {
			setIsLoading(true);
		}
		setError(null);
		try {
			const [readinessData, latestData] = await Promise.all([
				screenplayGenerationService.getReadiness(movieId),
				screenplayGenerationService.getLatest(movieId),
			]);
			if (!mountedRef.current) return;
			setReadiness(readinessData);
			setJob(latestData.latestJob);
			setHistory(latestData.history || []);
		} catch (err: unknown) {
			if (!mountedRef.current) return;
			setError(err instanceof Error ? err.message : "Failed to load generation workspace");
		} finally {
			if (mountedRef.current) setIsLoading(false);
		}
	}, [movieId]);

	const refreshJob = useCallback(
		async (targetJobId?: string) => {
			const idToFetch = targetJobId || job?.id;
			if (!movieId || !idToFetch) return;
			try {
				const fresh = await screenplayGenerationService.getJob(movieId, idToFetch);
				if (!mountedRef.current) return;
				setJob(fresh);
				if (!isJobActivelyPolling(fresh.status)) {
					clearPolling();
					clearStreaming();
					setConnectionState("COMPLETED");
					const latestData = await screenplayGenerationService.getLatest(movieId);
					if (mountedRef.current) setHistory(latestData.history || []);
				}
			} catch {
				// Avoid breaking UI on a single transient poll hiccup
			}
		},
		[movieId, job?.id, clearPolling, clearStreaming]
	);

	useEffect(() => {
		mountedRef.current = true;
		let active = true;
		void (async () => {
			await Promise.resolve();
			if (active) {
				await loadInitial(false);
			}
		})();
		return () => {
			active = false;
			mountedRef.current = false;
			clearPolling();
			clearStreaming();
		};
	}, [loadInitial, clearPolling, clearStreaming]);

	useEffect(() => {
		clearPolling();
		clearStreaming();

		if (!movieId || !job?.id || !isJobActivelyPolling(job.status)) {
			return () => {
				clearPolling();
				clearStreaming();
			};
		}

		const activeJobId = job.id;
		let fallbackTimerStarted = false;

		const startVisibilityAwarePolling = (stateLabel: StreamConnectionState = "POLLING") => {
			if (fallbackTimerStarted || !mountedRef.current) return;
			fallbackTimerStarted = true;
			setConnectionState(stateLabel);
			const isHidden = typeof document !== "undefined" && document.visibilityState === "hidden";
			if (!isHidden) {
				pollTimerRef.current = setInterval(() => {
					if (typeof document === "undefined" || document.visibilityState === "visible") {
						void refreshJob(activeJobId);
					}
				}, 2200);
			}
		};

		const connectStream = () => {
			if (!mountedRef.current) return;
			if (typeof document !== "undefined" && document.visibilityState === "hidden") {
				return;
			}
			clearStreaming();
			const controller = new AbortController();
			streamAbortRef.current = controller;
			setConnectionState("CONNECTING");
			setStreamError(null);

			let lastCompletedCount = -1;
			let lastStatus = "";

			void api
				.streamSSE<{ id?: string; status?: string; job?: ScreenplayGenerationJob }>(
					API_ENDPOINTS.SCREENPLAY_GENERATION.STREAM_JOB(movieId, activeJobId),
					{ method: "GET", signal: controller.signal },
					{
						onProgress: (payload) => {
							if (!mountedRef.current || controller.signal.aborted) return;
							setConnectionState("STREAMING");
							const pStatus = typeof payload.status === "string" ? payload.status : undefined;
							const pCompleted =
								typeof payload.completedScenes === "number" ? payload.completedScenes : undefined;
							setJob((prev) =>
								prev && prev.id === activeJobId
									? {
											...prev,
											status: (pStatus as ScreenplayGenerationJob["status"]) || prev.status,
											progressPercent:
												typeof payload.progressPercent === "number"
													? payload.progressPercent
													: prev.progressPercent,
											currentStage:
												typeof payload.currentStage === "string"
													? payload.currentStage
													: prev.currentStage,
											currentActNumber:
												typeof payload.currentActNumber === "number" || payload.currentActNumber === null
													? payload.currentActNumber
													: prev.currentActNumber,
											currentSceneNumber:
												typeof payload.currentSceneNumber === "number" || payload.currentSceneNumber === null
													? payload.currentSceneNumber
													: prev.currentSceneNumber,
											completedScenes: pCompleted ?? prev.completedScenes,
											failedScenes:
												typeof payload.failedScenes === "number"
													? payload.failedScenes
													: prev.failedScenes,
											totalTokens:
												typeof payload.totalTokens === "number" ? payload.totalTokens : prev.totalTokens,
											estimatedCost:
												typeof payload.estimatedCost === "number"
													? payload.estimatedCost
													: prev.estimatedCost,
											lastError:
												typeof payload.lastError === "string" || payload.lastError === null
													? payload.lastError
													: prev.lastError,
									  }
									: prev
							);
							if (
								(pCompleted !== undefined && pCompleted !== lastCompletedCount) ||
								(pStatus && pStatus !== lastStatus)
							) {
								lastCompletedCount = pCompleted ?? lastCompletedCount;
								lastStatus = pStatus ?? lastStatus;
								void refreshJob(activeJobId);
							}
						},
						onComplete: (payload) => {
							if (!mountedRef.current) return;
							clearPolling();
							if (payload?.job) {
								setJob(payload.job);
							} else {
								void refreshJob(activeJobId);
							}
							setConnectionState("COMPLETED");
						},
						onError: (err) => {
							if (!mountedRef.current || controller.signal.aborted) return;
							setStreamError(err.message);
							startVisibilityAwarePolling("POLLING");
						},
					}
				)
				.catch((err: unknown) => {
					if (!mountedRef.current || controller.signal.aborted) return;
					setStreamError(err instanceof Error ? err.message : "Live SSE disconnected; switched to polling.");
					startVisibilityAwarePolling("POLLING");
				});
		};

		connectStream();

		const handleVisibilityChange = () => {
			if (!mountedRef.current) return;
			if (document.visibilityState === "hidden") {
				clearPolling();
				clearStreaming();
			} else {
				void refreshJob(activeJobId);
				if (fallbackTimerStarted) {
					clearPolling();
					fallbackTimerStarted = false;
					startVisibilityAwarePolling("POLLING");
				} else {
					connectStream();
				}
			}
		};

		if (typeof document !== "undefined") {
			document.addEventListener("visibilitychange", handleVisibilityChange);
		}

		return () => {
			if (typeof document !== "undefined") {
				document.removeEventListener("visibilitychange", handleVisibilityChange);
			}
			clearPolling();
			clearStreaming();
		};
	}, [movieId, job?.id, job?.status, streamRetryTick, refreshJob, clearPolling, clearStreaming]);

	const selectJobFromHistory = useCallback(
		async (jobId: string) => {
			if (!movieId) return;
			setIsBusy(true);
			setError(null);
			try {
				const loaded = await screenplayGenerationService.getJob(movieId, jobId);
				if (mountedRef.current) setJob(loaded);
			} catch (err: unknown) {
				if (mountedRef.current) {
					setError(err instanceof Error ? err.message : "Failed to load historical job");
				}
			} finally {
				if (mountedRef.current) setIsBusy(false);
			}
		},
		[movieId]
	);

	const startGeneration = useCallback(
		async (request: StartScreenplayGenerationRequest) => {
			if (inFlightRef.current.has("start")) return undefined;
			inFlightRef.current.add("start");
			setIsBusy(true);
			setError(null);
			setNotice(null);
			try {
				const outcome = await screenplayGenerationService.startJob(movieId, request);
				setJob(outcome.job);
				setNotice(
					outcome.isDuplicate
						? "Returned active or idempotent screenplay generation job."
						: "Complete screenplay generation started."
				);
				return outcome.job;
			} catch (err: unknown) {
				setError(err instanceof Error ? err.message : "Failed to start generation job");
				throw err;
			} finally {
				inFlightRef.current.delete("start");
				setIsBusy(false);
			}
		},
		[movieId]
	);

	const updateAct = useCallback(
		async (actId: string, data: Partial<GeneratedActItem>) => {
			if (!job) return;
			setIsBusy(true);
			setError(null);
			try {
				await screenplayGenerationService.updateAct(movieId, job.id, actId, data);
				await refreshJob(job.id);
				setNotice("Act updated cleanly and marked Writer Edited.");
			} catch (err: unknown) {
				setError(err instanceof Error ? err.message : "Failed to update Act");
			} finally {
				setIsBusy(false);
			}
		},
		[movieId, job, refreshJob]
	);

	const approveActs = useCallback(
		async (actIds?: string[]) => {
			if (!job) return;
			setIsBusy(true);
			setError(null);
			try {
				const updated = await screenplayGenerationService.approveActs(movieId, job.id, actIds);
				setJob(updated);
				setNotice("Acts approved — generating Act-by-Act scene outlines.");
			} catch (err: unknown) {
				setError(err instanceof Error ? err.message : "Failed to approve Acts");
			} finally {
				setIsBusy(false);
			}
		},
		[movieId, job]
	);

	const updateScene = useCallback(
		async (sceneId: string, data: Partial<GeneratedSceneItem>) => {
			if (!job) return;
			setIsBusy(true);
			setError(null);
			try {
				await screenplayGenerationService.updateScene(movieId, job.id, sceneId, data);
				await refreshJob(job.id);
				setNotice("Scene updated cleanly (manual edit protection enabled on script edits).");
			} catch (err: unknown) {
				setError(err instanceof Error ? err.message : "Failed to update Scene");
			} finally {
				setIsBusy(false);
			}
		},
		[movieId, job, refreshJob]
	);

	const approveScenes = useCallback(
		async (sceneIds?: string[]) => {
			if (!job) return;
			setIsBusy(true);
			setError(null);
			try {
				const updated = await screenplayGenerationService.approveScenes(
					movieId,
					job.id,
					sceneIds
				);
				setJob(updated);
				setNotice("Scene outlines approved — writing progressive screenplay scenes.");
			} catch (err: unknown) {
				setError(err instanceof Error ? err.message : "Failed to approve Scenes");
			} finally {
				setIsBusy(false);
			}
		},
		[movieId, job]
	);

	const pauseGeneration = useCallback(async () => {
		if (!job) return;
		setIsBusy(true);
		setError(null);
		try {
			const updated = await screenplayGenerationService.pauseJob(movieId, job.id);
			setJob(updated);
			setNotice("Pause signal sent — completed scenes remain saved.");
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : "Failed to pause job");
		} finally {
			setIsBusy(false);
		}
	}, [movieId, job]);

	const resumeGeneration = useCallback(async () => {
		if (!job) return;
		setIsBusy(true);
		setError(null);
		try {
			const updated = await screenplayGenerationService.resumeJob(movieId, job.id);
			setJob(updated);
			setNotice("Resuming generation from saved checkpoint.");
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : "Failed to resume job");
		} finally {
			setIsBusy(false);
		}
	}, [movieId, job]);

	const cancelGeneration = useCallback(async () => {
		if (!job) return;
		setIsBusy(true);
		setError(null);
		try {
			const updated = await screenplayGenerationService.cancelJob(movieId, job.id);
			setJob(updated);
			setNotice("Job cancelled cleanly without discarding saved scenes.");
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : "Failed to cancel job");
		} finally {
			setIsBusy(false);
		}
	}, [movieId, job]);

	const retryScene = useCallback(
		async (
			scene: GeneratedSceneItem,
			options?: { confirmOverwriteEdited?: boolean; instructions?: string }
		) => {
			if (!job) return;
			setIsBusy(true);
			setError(null);
			try {
				const res = await screenplayGenerationService.retryScene(movieId, job.id, scene.id, options);
				setJob(res.job);
				setOverwritePromptScene(null);
				setNotice(`Scene ${scene.sceneNumber} regenerated successfully.`);
			} catch (err: unknown) {
				if (err instanceof ApiClientError && err.statusCode === 409) {
					setOverwritePromptScene({
						sceneId: scene.id,
						sceneTitle: `Scene ${scene.sceneNumber}: ${scene.title}`,
						instructions: options?.instructions,
					});
					return;
				}
				setError(err instanceof Error ? err.message : "Failed to regenerate Scene");
			} finally {
				setIsBusy(false);
			}
		},
		[movieId, job]
	);

	const commitScreenplay = useCallback(
		async (options?: { title?: string; syncOutlineActsAndScenes?: boolean }) => {
			if (!job || inFlightRef.current.has("commit")) return null;
			inFlightRef.current.add("commit");
			setIsBusy(true);
			setError(null);
			try {
				const res = await screenplayGenerationService.commitToScreenplay(
					movieId,
					job.id,
					options
				);
				setJob(res.job);
				setNotice(
					`Saved safely as "${res.screenplay.title}" (${res.screenplay.wordCount} words, ${res.screenplay.pageCount} pages) without overwriting existing drafts.`
				);
				return res;
			} catch (err: unknown) {
				setError(
					err instanceof Error ? err.message : "Failed to commit generated screenplay"
				);
				return null;
			} finally {
				inFlightRef.current.delete("commit");
				setIsBusy(false);
			}
		},
		[movieId, job]
	);

	const retryStream = useCallback(() => {
		setStreamError(null);
		setStreamRetryTick((n) => n + 1);
	}, []);

	const cancelStreamConnection = useCallback(() => {
		clearStreaming();
		setConnectionState("CANCELLED");
	}, [clearStreaming]);

	return {
		readiness,
		job,
		history,
		isLoading,
		isBusy,
		error,
		notice,
		connectionState,
		streamError,
		overwritePromptScene,
		clearOverwritePrompt: () => setOverwritePromptScene(null),
		setNotice,
		loadInitial,
		refreshJob,
		retryStream,
		cancelStreamConnection,
		selectJobFromHistory,
		startGeneration,
		updateAct,
		approveActs,
		updateScene,
		approveScenes,
		pauseGeneration,
		resumeGeneration,
		cancelGeneration,
		retryScene,
		commitScreenplay,
	};
}

