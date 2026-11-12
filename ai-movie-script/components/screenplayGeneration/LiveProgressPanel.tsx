"use client";

import React from "react";
import Link from "next/link";
import { ScreenplayGenerationJob } from "../../types/screenplayGeneration";
import { StreamConnectionState, StreamStatusBanner } from "../ai/StreamStatusBanner";
import {
	formatJobStatusLabel,
	isJobActivelyPolling,
} from "../../services/screenplayGenerationService";
import {
	FiPause,
	FiPlay,
	FiXCircle,
	FiSave,
	FiFileText,
	FiDownload,
	FiCheckCircle,
	FiAlertTriangle,
	FiBook,
} from "react-icons/fi";

interface LiveProgressPanelProps {
	movieId: string;
	job: ScreenplayGenerationJob;
	isBusy: boolean;
	connectionState?: StreamConnectionState;
	streamError?: string | null;
	onRetryStream?: () => void;
	onCancelStream?: () => void;
	onPause: () => Promise<void>;
	onResume: () => Promise<void>;
	onCancel: () => Promise<void>;
	onCommit: () => Promise<unknown>;
}

const PIPELINE_STAGES = [
	{ key: "ACTS", label: "Stage 2: Act Structure" },
	{ key: "SCENES", label: "Stage 3: Scene Breakdown" },
	{ key: "WRITING", label: "Stage 4: Scene Scripts" },
	{ key: "AUDIT", label: "Stage 5: Continuity & Assembly" },
];

export function LiveProgressPanel({
	movieId,
	job,
	isBusy,
	connectionState = "IDLE",
	streamError,
	onRetryStream,
	onCancelStream,
	onPause,
	onResume,
	onCancel,
	onCommit,
}: LiveProgressPanelProps) {
	const isActive = isJobActivelyPolling(job.status);
	const canPause =
		isActive ||
		job.status === "AWAITING_ACT_APPROVAL" ||
		job.status === "AWAITING_SCENE_APPROVAL";
	const canResume =
		job.status === "PAUSED" ||
		job.status === "PARTIALLY_COMPLETED" ||
		job.status === "FAILED";
	const canCancel = job.status !== "COMPLETED" && job.status !== "CANCELLED";
	const canCommit = Boolean(job.assembledContent && job.assembledContent.trim().length > 10);

	const getStageDone = (idx: number) => {
		if (idx === 0) return job.acts.length > 0 && job.status !== "GENERATING_ACTS";
		if (idx === 1) return job.scenes.length > 0 && !["GENERATING_ACTS", "AWAITING_ACT_APPROVAL", "GENERATING_SCENES"].includes(job.status);
		if (idx === 2) return job.completedScenes > 0 && job.completedScenes === job.totalScenes && job.totalScenes > 0;
		return job.status === "COMPLETED";
	};

	return (
		<div
			style={{
				backgroundColor: "#ffffff",
				borderRadius: "12px",
				border: "1px solid #e2e8f0",
				padding: "20px",
				display: "flex",
				flexDirection: "column",
				gap: "14px",
			}}
		>
			<div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
				<div>
					<div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
						<span
							style={{
								padding: "4px 10px",
								borderRadius: "999px",
								fontSize: "11.5px",
								fontWeight: 700,
								backgroundColor:
									job.status === "COMPLETED"
										? "#dcfce7"
										: job.status === "FAILED" || job.status === "CANCELLED"
										? "#fee2e2"
										: "#fef3c7",
								color:
									job.status === "COMPLETED"
										? "#166534"
										: job.status === "FAILED" || job.status === "CANCELLED"
										? "#991b1b"
										: "#92400e",
							}}
						>
							{formatJobStatusLabel(job.status)}
						</span>
						<span style={{ fontSize: "12px", color: "#475569", fontWeight: 600 }}>
							Structure: {job.resolvedStructure || job.requestedStructure} · Mode: {job.mode}
						</span>
					</div>
					<h2 style={{ margin: "8px 0 2px", fontSize: "17px", fontWeight: 700, color: "#0f172a" }}>
						{job.currentStage}
					</h2>
					<div style={{ fontSize: "12.5px", color: "#64748b" }}>
						Acts: {job.totalActs} · Scenes Completed: {job.completedScenes}/{job.totalScenes}
						{job.failedScenes > 0 ? ` (${job.failedScenes} failed)` : ""}
						{job.stats ? ` · ${job.stats.wordCount} words (~${job.stats.pageCount} pages)` : ""}
						{` · Tokens: ${job.totalTokens.toLocaleString()} ($${job.estimatedCost.toFixed(4)})`}
					</div>
				</div>

				{/* Control Buttons */}
				<div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
					{canPause && (
						<button
							type="button"
							disabled={isBusy}
							onClick={() => void onPause()}
							style={{
								display: "flex",
								alignItems: "center",
								gap: "6px",
								padding: "7px 12px",
								borderRadius: "8px",
								border: "1px solid #cbd5e1",
								backgroundColor: "#ffffff",
								fontSize: "12.5px",
								fontWeight: 600,
								cursor: "pointer",
							}}
						>
							<FiPause /> Pause
						</button>
					)}
					{canResume && (
						<button
							type="button"
							disabled={isBusy}
							onClick={() => void onResume()}
							style={{
								display: "flex",
								alignItems: "center",
								gap: "6px",
								padding: "7px 12px",
								borderRadius: "8px",
								border: "none",
								backgroundColor: "#d97706",
								color: "#ffffff",
								fontSize: "12.5px",
								fontWeight: 700,
								cursor: "pointer",
							}}
						>
							<FiPlay /> Resume
						</button>
					)}
					{canCancel && (
						<button
							type="button"
							disabled={isBusy}
							onClick={() => void onCancel()}
							style={{
								display: "flex",
								alignItems: "center",
								gap: "6px",
								padding: "7px 12px",
								borderRadius: "8px",
								border: "1px solid #fecaca",
								backgroundColor: "#fef2f2",
								color: "#b91c1c",
								fontSize: "12.5px",
								fontWeight: 600,
								cursor: "pointer",
							}}
						>
							<FiXCircle /> Cancel
						</button>
					)}
					{canCommit && (
						<button
							type="button"
							disabled={isBusy}
							onClick={() => void onCommit()}
							style={{
								display: "flex",
								alignItems: "center",
								gap: "6px",
								padding: "8px 14px",
								borderRadius: "8px",
								border: "none",
								backgroundColor: "#0f172a",
								color: "#ffffff",
								fontSize: "12.5px",
								fontWeight: 700,
								cursor: "pointer",
							}}
						>
							<FiSave />
							{job.assembledScreenplayId ? "Save New Revision to Editor" : "Save Draft to Screenplay Editor"}
						</button>
					)}
				</div>
			</div>

			{/* Progress Bar */}
			<div>
				<div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
					<span>Pipeline Progress</span>
					<span>{job.progressPercent}%</span>
				</div>
				<div style={{ height: "10px", backgroundColor: "#e2e8f0", borderRadius: "999px", overflow: "hidden" }}>
					<div
						style={{
							width: `${Math.min(100, Math.max(0, job.progressPercent))}%`,
							height: "100%",
							backgroundColor:
								job.status === "FAILED" ? "#dc2626" : job.status === "COMPLETED" ? "#16a34a" : "#d97706",
							transition: "width 0.35s ease",
						}}
					/>
				</div>
			</div>

			{connectionState !== "IDLE" && (
				<StreamStatusBanner
					state={connectionState}
					stageLabel={job.currentStage || formatJobStatusLabel(job.status)}
					errorMessage={streamError}
					onCancel={onCancelStream}
					onRetry={onRetryStream}
				/>
			)}

			{/* Stage Checkpoints */}
			<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "8px" }}>
				{PIPELINE_STAGES.map((st, idx) => {
					const done = getStageDone(idx);
					return (
						<div
							key={st.key}
							style={{
								padding: "8px 10px",
								borderRadius: "8px",
								border: done ? "1px solid #bbf7d0" : "1px solid #e2e8f0",
								backgroundColor: done ? "#f0fdf4" : "#f8fafc",
								fontSize: "12px",
								fontWeight: 600,
								color: done ? "#166534" : "#475569",
								display: "flex",
								alignItems: "center",
								gap: "6px",
							}}
						>
							<FiCheckCircle color={done ? "#16a34a" : "#94a3b8"} /> {st.label}
						</div>
					);
				})}
			</div>

			{/* Continuity Summary & Downstream Navigation */}
			{job.continuityValidation && (
				<div
					style={{
						padding: "12px 14px",
						borderRadius: "8px",
						backgroundColor:
							job.continuityValidation.confirmedContradictionsCount > 0 ? "#fef2f2" : "#f8fafc",
						border:
							job.continuityValidation.confirmedContradictionsCount > 0
								? "1px solid #fecaca"
								: "1px solid #cbd5e1",
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						flexWrap: "wrap",
						gap: "10px",
						fontSize: "12.5px",
					}}
				>
					<div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#0f172a" }}>
						<FiAlertTriangle
							color={job.continuityValidation.confirmedContradictionsCount > 0 ? "#dc2626" : "#d97706"}
						/>
						<span>
							<strong>Final Continuity Audit:</strong>{" "}
							{job.continuityValidation.confirmedContradictionsCount} confirmed contradiction(s),{" "}
							{job.continuityValidation.possibleInconsistenciesCount} warnings,{" "}
							{job.continuityValidation.pendingMemoryProposalsCount} pending Story Bible proposal(s) awaiting writer review.
						</span>
					</div>
					<div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
						<Link
							href={`/movies/${movieId}/story-bible`}
							style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "#b45309", fontWeight: 700, textDecoration: "none" }}
						>
							<FiBook /> Review Story Bible Proposals
						</Link>
						{job.assembledScreenplayId && (
							<>
								<Link
									href={`/movies/${movieId}/screenplay`}
									style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "#0f172a", fontWeight: 700, textDecoration: "none" }}
								>
									<FiFileText /> Open Screenplay Editor
								</Link>
								<Link
									href={`/movies/${movieId}/export`}
									style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "#0369a1", fontWeight: 700, textDecoration: "none" }}
								>
									<FiDownload /> Export PDF / DOCX
								</Link>
							</>
						)}
					</div>
				</div>
			)}

			{job.lastError && (
				<div style={{ padding: "10px 12px", borderRadius: "8px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", fontSize: "12.5px" }}>
					<strong>Last Error ({job.failedStage || "Pipeline"}):</strong> {job.lastError}
				</div>
			)}
		</div>
	);
}

