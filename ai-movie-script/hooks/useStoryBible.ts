"use client";

import { useState, useCallback, useEffect } from "react";
import { storyBibleService } from "../services/storyBibleService";
import {
	StoryBible,
	BuildStoryBibleRequest,
	ContinuityCategory,
	ContinuityStatus,
	ContinuityClassification,
} from "../types/storyBible";

export type StoryBibleTab =
	| "overview"
	| "characters"
	| "relationships"
	| "locations"
	| "entities"
	| "timeline"
	| "scenes"
	| "continuity"
	| "history";

export function useStoryBible(movieId: string) {
	const [storyBible, setStoryBible] = useState<StoryBible | null>(null);
	const [activeTab, setActiveTab] = useState<StoryBibleTab>("overview");
	const [isLoading, setIsLoading] = useState<boolean>(Boolean(movieId));
	const [isBuilding, setIsBuilding] = useState(false);
	const [isAnalyzingContinuity, setIsAnalyzingContinuity] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [toastMessage, setToastMessage] = useState<string | null>(null);

	const loadStoryBible = useCallback(async () => {
		if (!movieId) return;
		setIsLoading(true);
		setError(null);
		try {
			const data = await storyBibleService.getStoryBible(movieId);
			setStoryBible(data);
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : "Failed to load Story Bible");
		} finally {
			setIsLoading(false);
		}
	}, [movieId]);

	useEffect(() => {
		loadStoryBible();
	}, [loadStoryBible]);

	const buildStoryBible = useCallback(
		async (request: BuildStoryBibleRequest = {}) => {
			if (!movieId) return;
			setIsBuilding(true);
			setError(null);
			setToastMessage(null);
			try {
				const built = await storyBibleService.buildStoryBible(movieId, request);
				setStoryBible(built);
				setToastMessage(
					request.mode === "MERGE_PROPOSALS"
						? "Story Bible analyzed — review proposed updates in Memory History."
						: "Story Bible built and synchronized safely."
				);
				return built;
			} catch (err: unknown) {
				const msg = err instanceof Error ? err.message : "Failed to build Story Bible";
				setError(msg);
				throw err;
			} finally {
				setIsBuilding(false);
			}
		},
		[movieId]
	);

	const updateIdentity = useCallback(
		async (data: Record<string, any>) => {
			if (!movieId) return;
			setIsSaving(true);
			setError(null);
			try {
				const updated = await storyBibleService.updateIdentity(movieId, data);
				setStoryBible(updated);
				setToastMessage("Story Identity updated and versioned.");
				return updated;
			} catch (err: unknown) {
				setError(err instanceof Error ? err.message : "Failed to update Story Identity");
				throw err;
			} finally {
				setIsSaving(false);
			}
		},
		[movieId]
	);

	const createEntry = useCallback(
		async (targetType: string, data: Record<string, any>, changeReason?: string) => {
			if (!movieId) return;
			setIsSaving(true);
			setError(null);
			try {
				await storyBibleService.createEntry(movieId, targetType, data, changeReason);
				await loadStoryBible();
				setToastMessage(`Added ${targetType.toLowerCase()} entry cleanly.`);
			} catch (err: unknown) {
				setError(err instanceof Error ? err.message : "Failed to create entry");
				throw err;
			} finally {
				setIsSaving(false);
			}
		},
		[movieId, loadStoryBible]
	);

	const updateEntry = useCallback(
		async (targetType: string, entryId: string, data: Record<string, any>, changeReason?: string) => {
			if (!movieId) return;
			setIsSaving(true);
			setError(null);
			try {
				await storyBibleService.updateEntry(movieId, targetType, entryId, data, changeReason);
				await loadStoryBible();
				setToastMessage(`Updated ${targetType.toLowerCase()} memory entry cleanly.`);
			} catch (err: unknown) {
				setError(err instanceof Error ? err.message : "Failed to update entry");
				throw err;
			} finally {
				setIsSaving(false);
			}
		},
		[movieId, loadStoryBible]
	);

	const analyzeContinuity = useCallback(
		async (focusCategories?: ContinuityCategory[]) => {
			if (!movieId) return;
			setIsAnalyzingContinuity(true);
			setError(null);
			try {
				const findings = await storyBibleService.analyzeContinuity(movieId, { focusCategories });
				await loadStoryBible();
				setToastMessage(`Continuity audit completed: ${findings.length} finding(s) tracked.`);
				return findings;
			} catch (err: unknown) {
				const msg = err instanceof Error ? err.message : "Continuity analysis failed";
				setError(msg);
				throw err;
			} finally {
				setIsAnalyzingContinuity(false);
			}
		},
		[movieId, loadStoryBible]
	);

	const updateFindingStatus = useCallback(
		async (
			findingId: string,
			status: ContinuityStatus,
			resolutionNote?: string,
			classification?: ContinuityClassification
		) => {
			if (!movieId) return;
			setIsSaving(true);
			setError(null);
			try {
				await storyBibleService.updateContinuityFinding(movieId, findingId, {
					status,
					resolutionNote,
					classification,
				});
				await loadStoryBible();
				setToastMessage(`Finding marked as ${status}.`);
			} catch (err: unknown) {
				setError(err instanceof Error ? err.message : "Failed to update continuity finding");
				throw err;
			} finally {
				setIsSaving(false);
			}
		},
		[movieId, loadStoryBible]
	);

	const reviewProposal = useCallback(
		async (
			proposalId: string,
			status: "ACCEPTED" | "REJECTED",
			editedValue?: Record<string, any>,
			changeReason?: string
		) => {
			if (!movieId) return;
			setIsSaving(true);
			setError(null);
			try {
				await storyBibleService.reviewProposal(movieId, proposalId, {
					status,
					editedValue,
					changeReason,
				});
				await loadStoryBible();
				setToastMessage(
					status === "ACCEPTED"
						? "Memory update approved and applied with audit version."
						: "Proposed memory update declined."
				);
			} catch (err: unknown) {
				setError(err instanceof Error ? err.message : "Failed to review proposal");
				throw err;
			} finally {
				setIsSaving(false);
			}
		},
		[movieId, loadStoryBible]
	);

	const batchReviewProposals = useCallback(
		async (proposalIds: string[], status: "ACCEPTED" | "REJECTED", changeReason?: string) => {
			if (!movieId || proposalIds.length === 0) return { reviewedCount: 0, proposals: [] };
			setIsSaving(true);
			setError(null);
			try {
				const res = await storyBibleService.batchReviewProposals(movieId, {
					proposalIds,
					status,
					changeReason,
				});
				await loadStoryBible();
				setToastMessage(
					`${status === "ACCEPTED" ? "Approved" : "Declined"} ${res.reviewedCount} selected memory proposal(s).`
				);
				return res;
			} catch (err: unknown) {
				setError(err instanceof Error ? err.message : "Failed to batch review proposals");
				throw err;
			} finally {
				setIsSaving(false);
			}
		},
		[movieId, loadStoryBible]
	);

	const restoreVersion = useCallback(
		async (versionId: string, changeReason?: string) => {
			if (!movieId) return;
			setIsSaving(true);
			setError(null);
			try {
				const restored = await storyBibleService.restoreVersion(movieId, versionId, changeReason);
				setStoryBible(restored);
				setToastMessage("Restored Story Bible state non-destructively.");
				return restored;
			} catch (err: unknown) {
				setError(err instanceof Error ? err.message : "Failed to restore Story Bible version");
				throw err;
			} finally {
				setIsSaving(false);
			}
		},
		[movieId]
	);

	return {
		storyBible,
		activeTab,
		setActiveTab,
		isLoading,
		isBuilding,
		isAnalyzingContinuity,
		isSaving,
		error,
		toastMessage,
		setToastMessage,
		loadStoryBible,
		buildStoryBible,
		updateIdentity,
		createEntry,
		updateEntry,
		analyzeContinuity,
		updateFindingStatus,
		reviewProposal,
		batchReviewProposals,
		restoreVersion,
	};
}

