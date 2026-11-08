"use client";

/**
 * FilmForge AI — useScreenplay Hook
 *
 * Provides reactive screenplay editing, version management, safe debounced autosaving,
 * conflict detection, and scene-to-screenplay synchronization.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { screenplayService } from "../services/screenplayService";
import { screenplayStore, SaveStatus } from "../store/screenplayStore";
import { Screenplay, ScreenplayVersion } from "../types/screenplay";

interface UseScreenplayOptions {
	movieId?: string | null;
	defaultTitle?: string;
	enableAutosave?: boolean;
	autosaveDelayMs?: number;
}

export function useScreenplay(options: UseScreenplayOptions) {
	const {
		movieId,
		defaultTitle = "Untitled Screenplay",
		enableAutosave = true,
		autosaveDelayMs = 2500,
	} = options;

	const [screenplay, setScreenplay] = useState<Screenplay | null>(() =>
		screenplayStore.getScreenplay()
	);
	const [versions, setVersions] = useState<ScreenplayVersion[]>(() =>
		screenplayStore.getVersions()
	);
	const [saveStatus, setSaveStatus] = useState<SaveStatus>(() =>
		screenplayStore.getSaveStatus()
	);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [hasConflict, setHasConflict] = useState<boolean>(false);

	const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);
	const isSavingRef = useRef<boolean>(false);

	// Sync local component state with screenplayStore
	useEffect(() => {
		const unsubscribe = screenplayStore.subscribe(() => {
			setScreenplay(screenplayStore.getScreenplay());
			setVersions(screenplayStore.getVersions());
			setSaveStatus(screenplayStore.getSaveStatus());
		});

		return unsubscribe;
	}, []);

	// Initial fetch / creation
	const fetchOrCreateScreenplay = useCallback(async () => {
		if (!movieId) {
			setScreenplay(null);
			setIsLoading(false);
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			const res = await screenplayService.getScreenplayForMovie(movieId);
			let activeDraft: Screenplay | null = null;

			if (Array.isArray(res) && res.length > 0) {
				activeDraft = res[0];
			} else if (res && !Array.isArray(res) && (res as Screenplay).id) {
				activeDraft = res as Screenplay;
			}

			// If no screenplay draft exists in DB yet, create initial draft from scenes
			if (!activeDraft) {
				activeDraft = await screenplayService.createScreenplay(movieId, {
					title: defaultTitle,
					importScenes: true,
				});
			}

			screenplayStore.setScreenplay(activeDraft);
			setScreenplay(activeDraft);

			// Load historical versions
			if (activeDraft?.id) {
				try {
					const versionList = await screenplayService.getVersions(activeDraft.id);
					screenplayStore.setVersions(versionList || []);
					setVersions(versionList || []);
				} catch {
					// Ignore version fetch errors on initial load
				}
			}
		} catch (err: unknown) {
			const msg =
				err instanceof Error ? err.message : "Failed to load screenplay draft";
			setError(msg);
		} finally {
			setIsLoading(false);
		}
	}, [movieId, defaultTitle]);

	useEffect(() => {
		fetchOrCreateScreenplay();
	}, [fetchOrCreateScreenplay]);

	// Save screenplay with conflict protection
	const saveScreenplay = useCallback(
		async (newContent?: string, isDraft?: boolean): Promise<Screenplay | null> => {
			const current = screenplayStore.getScreenplay();
			if (!current?.id) return null;

			if (isSavingRef.current) return current;
			isSavingRef.current = true;

			screenplayStore.setSaveStatus("saving");
			try {
				const contentToSave =
					newContent !== undefined ? newContent : current.content;
				const updated = await screenplayService.updateScreenplay(current.id, {
					content: contentToSave,
					isDraft,
					baseVersion: current.version,
					lastAutoSavedAt: new Date().toISOString(),
				});

				screenplayStore.setScreenplay(updated);
				screenplayStore.setSaveStatus("saved");
				setHasConflict(false);
				return updated;
			} catch (err: unknown) {
				const isConflict =
					(err as { statusCode?: number })?.statusCode === 409 ||
					(err instanceof Error && err.message.toLowerCase().includes("conflict"));
				if (isConflict) {
					setHasConflict(true);
				}
				const msg =
					err instanceof Error ? err.message : "Failed to save screenplay";
				screenplayStore.setSaveStatus("error", msg);
				setError(msg);
				throw err;
			} finally {
				isSavingRef.current = false;
			}
		},
		[]
	);

	// User types into editor: updates store content & schedules autosave
	const handleContentChange = useCallback(
		(content: string) => {
			screenplayStore.updateContent(content);

			if (enableAutosave) {
				if (autosaveTimerRef.current) {
					clearTimeout(autosaveTimerRef.current);
				}

				autosaveTimerRef.current = setTimeout(() => {
					saveScreenplay(content).catch(() => {});
				}, autosaveDelayMs);
			}
		},
		[enableAutosave, autosaveDelayMs, saveScreenplay]
	);

	// Version snapshot creation
	const createVersion = useCallback(
		async (changeSummary?: string): Promise<ScreenplayVersion> => {
			const current = screenplayStore.getScreenplay();
			if (!current?.id) throw new Error("No active screenplay to snapshot");

			// Ensure active content is saved first
			await saveScreenplay();

			const newVersion = await screenplayService.createVersion(current.id, {
				changeSummary: changeSummary || `Version ${current.version} snapshot`,
			});

			screenplayStore.addVersion(newVersion);
			return newVersion;
		},
		[saveScreenplay]
	);

	// Version restoration
	const restoreVersion = useCallback(
		async (versionId: string): Promise<Screenplay> => {
			const current = screenplayStore.getScreenplay();
			if (!current?.id) throw new Error("No active screenplay");

			const restored = await screenplayService.restoreVersion(current.id, versionId);
			screenplayStore.setScreenplay(restored);

			// Refresh versions list
			const updatedVersions = await screenplayService.getVersions(current.id);
			screenplayStore.setVersions(updatedVersions);

			return restored;
		},
		[]
	);

	// Sync outline scenes into screenplay
	const syncScenes = useCallback(
		async (overwriteContent = false): Promise<Screenplay> => {
			const current = screenplayStore.getScreenplay();
			if (!current?.id) throw new Error("No active screenplay");

			const synced = await screenplayService.syncScenes(current.id, {
				overwriteContent,
			});
			screenplayStore.setScreenplay(synced);
			return synced;
		},
		[]
	);

	// Cleanup timer on unmount
	useEffect(() => {
		return () => {
			if (autosaveTimerRef.current) {
				clearTimeout(autosaveTimerRef.current);
			}
		};
	}, []);

	const resolveConflict = useCallback(async () => {
		setHasConflict(false);
		await fetchOrCreateScreenplay();
	}, [fetchOrCreateScreenplay]);

	return {
		screenplay,
		versions,
		saveStatus,
		isLoading,
		error,
		setContent: handleContentChange,
		updateContent: handleContentChange,
		saveScreenplay,
		createVersion,
		restoreVersion,
		syncScenes,
		refetch: fetchOrCreateScreenplay,
		hasConflict,
		resolveConflict,
	};
}
