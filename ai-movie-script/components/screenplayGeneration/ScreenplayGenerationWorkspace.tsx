"use client";

import React from "react";
import { useScreenplayGeneration } from "../../hooks/useScreenplayGeneration";
import { isJobActivelyPolling } from "../../services/screenplayGenerationService";
import { AILoading } from "../ai/AILoading";
import { GenerationSetupPanel } from "./GenerationSetupPanel";
import { LiveProgressPanel } from "./LiveProgressPanel";
import { ActApprovalPanel } from "./ActApprovalPanel";
import { SceneReviewAndPreviewPanel } from "./SceneReviewAndPreviewPanel";
import { FiAlertCircle, FiCheckCircle } from "react-icons/fi";

interface ScreenplayGenerationWorkspaceProps {
	movieId: string;
	movieTitle?: string;
}

export function ScreenplayGenerationWorkspace({
	movieId,
	movieTitle,
}: ScreenplayGenerationWorkspaceProps) {
	const {
		readiness,
		job,
		history,
		isLoading,
		isBusy,
		error,
		notice,
		overwritePromptScene,
		clearOverwritePrompt,
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
	} = useScreenplayGeneration(movieId);

	if (isLoading) {
		return (
			<div style={{ padding: "48px 24px", backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
				<AILoading label="Loading Complete Screenplay Generation Studio..." size="md" />
			</div>
		);
	}

	const hasActiveJob = Boolean(job && isJobActivelyPolling(job.status));

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
			{error && (
				<div
					style={{
						padding: "12px 16px",
						borderRadius: "8px",
						backgroundColor: "#fef2f2",
						border: "1px solid #fecaca",
						color: "#991b1b",
						fontSize: "13px",
						display: "flex",
						alignItems: "center",
						gap: "8px",
					}}
				>
					<FiAlertCircle /> {error}
				</div>
			)}

			{notice && (
				<div
					style={{
						padding: "12px 16px",
						borderRadius: "8px",
						backgroundColor: "#f0fdf4",
						border: "1px solid #bbf7d0",
						color: "#166534",
						fontSize: "13px",
						display: "flex",
						alignItems: "center",
						gap: "8px",
					}}
				>
					<FiCheckCircle /> {notice}
				</div>
			)}

			<GenerationSetupPanel
				readiness={readiness}
				history={history}
				activeJobId={job?.id}
				isBusy={isBusy}
				hasActiveJob={hasActiveJob}
				onStart={startGeneration}
				onSelectHistory={selectJobFromHistory}
			/>

			{job && (
				<>
					<LiveProgressPanel
						movieId={movieId}
						job={job}
						isBusy={isBusy}
						onPause={pauseGeneration}
						onResume={resumeGeneration}
						onCancel={cancelGeneration}
						onCommit={() =>
							commitScreenplay({
								title: movieTitle ? `${movieTitle} — AI Screenplay Draft` : undefined,
								syncOutlineActsAndScenes: false,
							})
						}
					/>

					<ActApprovalPanel
						acts={job.acts || []}
						jobStatus={job.status}
						isBusy={isBusy}
						onUpdateAct={updateAct}
						onApproveActs={() => approveActs()}
					/>

					<SceneReviewAndPreviewPanel
						scenes={job.scenes || []}
						assembledContent={job.assembledContent}
						jobStatus={job.status}
						isBusy={isBusy}
						overwritePromptScene={overwritePromptScene}
						onClearOverwritePrompt={clearOverwritePrompt}
						onUpdateScene={updateScene}
						onApproveScenes={() => approveScenes()}
						onRetryScene={retryScene}
					/>
				</>
			)}
		</div>
	);
}

