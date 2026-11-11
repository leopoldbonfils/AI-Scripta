"use client";

import React, { useState } from "react";
import {
	NarrativeStructureType,
	PreGenerationReadinessReport,
	ScreenplayJobHistorySummary,
	ScreenplayJobMode,
	StartScreenplayGenerationRequest,
} from "../../types/screenplayGeneration";
import {
	FiCheckCircle,
	FiAlertTriangle,
	FiAlertCircle,
	FiPlay,
	FiClock,
	FiShield,
} from "react-icons/fi";

interface GenerationSetupPanelProps {
	readiness: PreGenerationReadinessReport | null;
	history: ScreenplayJobHistorySummary[];
	activeJobId?: string;
	isBusy: boolean;
	hasActiveJob: boolean;
	onStart: (request: StartScreenplayGenerationRequest) => Promise<unknown>;
	onSelectHistory: (jobId: string) => Promise<void>;
}

const STRUCTURE_OPTIONS: Array<{ value: NarrativeStructureType; label: string }> = [
	{ value: "AUTO", label: "Auto-Select Best Fit Structure (Recommended)" },
	{ value: "THREE_ACT", label: "Three-Act Dramatic Arc" },
	{ value: "FIVE_ACT", label: "Five-Act Classical / Prestige Arc" },
	{ value: "HEROS_JOURNEY", label: "Hero’s Journey Transformation" },
	{ value: "NONLINEAR", label: "Nonlinear / Parallel Timelines" },
	{ value: "EPISODIC", label: "Episodic / Vignette Anthology" },
	{ value: "MYSTERY_INVESTIGATION", label: "Mystery & Investigation Spine" },
	{ value: "CHARACTER_DRIVEN", label: "Character-Driven Psychological Study" },
];

export function GenerationSetupPanel({
	readiness,
	history,
	activeJobId,
	isBusy,
	hasActiveJob,
	onStart,
	onSelectHistory,
}: GenerationSetupPanelProps) {
	const [mode, setMode] = useState<ScreenplayJobMode>("APPROVAL_GATED");
	const [requestedStructure, setRequestedStructure] = useState<NarrativeStructureType>("AUTO");
	const [targetSceneCount, setTargetSceneCount] = useState<string>("6");
	const [toneOverride, setToneOverride] = useState("");
	const [preferences, setPreferences] = useState("");
	const [acknowledgeAssumptions, setAcknowledgeAssumptions] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const parsedCount = parseInt(targetSceneCount, 10);
		await onStart({
			mode,
			requestedStructure,
			targetSceneCount:
				Number.isFinite(parsedCount) && parsedCount >= 4 && parsedCount <= 60
					? parsedCount
					: undefined,
			toneOverride: toneOverride.trim() || undefined,
			preferences: preferences.trim() || undefined,
			acknowledgeAssumptions,
			idempotencyKey: `ff-gen-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
		});
	};

	const assumptions = readiness?.assumptionsRequiringApproval || [];
	const mustAcknowledge = assumptions.length > 0 && !acknowledgeAssumptions;

	return (
		<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "18px" }}>
			{/* Left: Readiness & Fact Separation */}
			<div
				style={{
					backgroundColor: "#ffffff",
					borderRadius: "12px",
					border: "1px solid #e2e8f0",
					padding: "20px",
				}}
			>
				<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
					<h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
						<FiShield color="#d97706" /> Pre-Generation Readiness Check
					</h3>
					{readiness && (
						<span
							style={{
								fontSize: "11px",
								fontWeight: 700,
								padding: "3px 9px",
								borderRadius: "999px",
								backgroundColor: readiness.readyToGenerate ? "#dcfce7" : "#fee2e2",
								color: readiness.readyToGenerate ? "#166534" : "#991b1b",
							}}
						>
							{readiness.readyToGenerate ? "Ready to Generate" : "Needs Story Seed"}
						</span>
					)}
				</div>

				{!readiness ? (
					<p style={{ color: "#64748b", fontSize: "13px" }}>Assessing project readiness...</p>
				) : (
					<div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "12.5px" }}>
						<div>
							<div style={{ fontWeight: 700, color: "#15803d", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
								<FiCheckCircle /> Approved Facts & Writer Decisions ({readiness.approvedFacts.length + readiness.approvedDecisions.length})
							</div>
							<ul style={{ margin: 0, paddingLeft: "18px", color: "#334155", lineHeight: 1.5 }}>
								{[...readiness.approvedFacts, ...readiness.approvedDecisions].map((item, idx) => (
									<li key={idx}>{item}</li>
								))}
							</ul>
						</div>

						{readiness.aiSuggestions.length > 0 && (
							<div>
								<div style={{ fontWeight: 700, color: "#1d4ed8", marginBottom: "4px" }}>
									Unapplied AI Suggestions ({readiness.aiSuggestions.length})
								</div>
								<ul style={{ margin: 0, paddingLeft: "18px", color: "#475569", lineHeight: 1.5 }}>
									{readiness.aiSuggestions.map((s, idx) => (
										<li key={idx}>{s}</li>
									))}
								</ul>
							</div>
						)}

						{(readiness.unresolvedContinuity.length > 0 || readiness.conflictingInformation.length > 0) && (
							<div style={{ backgroundColor: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "8px", padding: "10px 12px" }}>
								<div style={{ fontWeight: 700, color: "#9a3412", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
									<FiAlertTriangle /> Continuity Warnings / Conflicts
								</div>
								<ul style={{ margin: 0, paddingLeft: "18px", color: "#9a3412", lineHeight: 1.45 }}>
									{[...readiness.conflictingInformation, ...readiness.unresolvedContinuity].map((w, idx) => (
										<li key={idx}>{w}</li>
									))}
								</ul>
							</div>
						)}

						{readiness.missingInformation.length > 0 && (
							<div style={{ backgroundColor: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "10px 12px" }}>
								<div style={{ fontWeight: 700, color: "#475569", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
									<FiAlertCircle /> Missing Information & Scope Notes
								</div>
								<ul style={{ margin: 0, paddingLeft: "18px", color: "#64748b", lineHeight: 1.45 }}>
									{readiness.missingInformation.map((m, idx) => (
										<li key={idx}>{m}</li>
									))}
								</ul>
							</div>
						)}

						{assumptions.length > 0 && (
							<label
								style={{
									display: "flex",
									alignItems: "flex-start",
									gap: "8px",
									padding: "10px 12px",
									backgroundColor: "#fefce8",
									border: "1px solid #fde047",
									borderRadius: "8px",
									cursor: "pointer",
								}}
							>
								<input
									type="checkbox"
									checked={acknowledgeAssumptions}
									onChange={(e) => setAcknowledgeAssumptions(e.target.checked)}
									style={{ marginTop: "2px" }}
								/>
								<div>
									<div style={{ fontWeight: 700, color: "#854d0e" }}>
										Approve Assumptions Before Starting ({assumptions.length})
									</div>
									<ul style={{ margin: "4px 0 0", paddingLeft: "16px", color: "#713f12" }}>
										{assumptions.map((a, idx) => (
											<li key={idx}>{a}</li>
										))}
									</ul>
								</div>
							</label>
						)}
					</div>
				)}
			</div>

			{/* Right: Configuration & Job History */}
			<div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
				<form
					onSubmit={handleSubmit}
					style={{
						backgroundColor: "#ffffff",
						borderRadius: "12px",
						border: "1px solid #e2e8f0",
						padding: "20px",
						display: "flex",
						flexDirection: "column",
						gap: "12px",
					}}
				>
					<h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
						Configure Screenplay Generation Pipeline
					</h3>

					<div>
						<label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
							Workflow Mode
						</label>
						<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
							{(["APPROVAL_GATED", "PROGRESSIVE_AUTO"] as const).map((m) => (
								<button
									key={m}
									type="button"
									onClick={() => setMode(m)}
									style={{
										padding: "10px 12px",
										borderRadius: "8px",
										border: mode === m ? "2px solid #d97706" : "1px solid #cbd5e1",
										backgroundColor: mode === m ? "#fffbeb" : "#ffffff",
										textAlign: "left",
										cursor: "pointer",
									}}
								>
									<div style={{ fontSize: "12.5px", fontWeight: 700, color: "#0f172a" }}>
										{m === "APPROVAL_GATED" ? "Approval-Gated (Recommended)" : "Progressive Auto-Run"}
									</div>
									<div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
										{m === "APPROVAL_GATED"
											? "Review & edit Acts and Scenes before script writing."
											: "Runs Stages 2–5 sequentially, pause/cancel anytime."}
									</div>
								</button>
							))}
						</div>
					</div>

					<div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "10px" }}>
						<div>
							<label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
								Narrative Structure
							</label>
							<select
								value={requestedStructure}
								onChange={(e) => setRequestedStructure(e.target.value as NarrativeStructureType)}
								style={{
									width: "100%",
									padding: "8px 10px",
									borderRadius: "8px",
									border: "1px solid #cbd5e1",
									fontSize: "13px",
									backgroundColor: "#ffffff",
								}}
							>
								{STRUCTURE_OPTIONS.map((opt) => (
									<option key={opt.value} value={opt.value}>
										{opt.label}
									</option>
								))}
							</select>
						</div>
						<div>
							<label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
								Target Scenes
							</label>
							<input
								type="number"
								min={4}
								max={60}
								value={targetSceneCount}
								onChange={(e) => setTargetSceneCount(e.target.value)}
								style={{
									width: "100%",
									padding: "8px 10px",
									borderRadius: "8px",
									border: "1px solid #cbd5e1",
									fontSize: "13px",
								}}
							/>
						</div>
					</div>

					<div>
						<label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
							Tone Override / Pacing Directives (Optional)
						</label>
						<input
							type="text"
							placeholder="e.g., Claustrophobic neo-noir tension, brisk dialogue..."
							value={toneOverride}
							onChange={(e) => setToneOverride(e.target.value)}
							style={{
								width: "100%",
								padding: "8px 10px",
								borderRadius: "8px",
								border: "1px solid #cbd5e1",
								fontSize: "13px",
								marginBottom: "8px",
							}}
						/>
						<textarea
							rows={2}
							placeholder="Additional structural or scene-focus notes for OpenAI writer..."
							value={preferences}
							onChange={(e) => setPreferences(e.target.value)}
							style={{
								width: "100%",
								padding: "8px 10px",
								borderRadius: "8px",
								border: "1px solid #cbd5e1",
								fontSize: "13px",
								resize: "vertical",
							}}
						/>
					</div>

					<button
						type="submit"
						disabled={isBusy || hasActiveJob || !readiness?.readyToGenerate || mustAcknowledge}
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							gap: "8px",
							padding: "11px 18px",
							borderRadius: "8px",
							border: "none",
							backgroundColor:
								isBusy || hasActiveJob || !readiness?.readyToGenerate || mustAcknowledge
									? "#cbd5e1"
									: "#d97706",
							color: "#ffffff",
							fontWeight: 700,
							fontSize: "13.5px",
							cursor:
								isBusy || hasActiveJob || !readiness?.readyToGenerate || mustAcknowledge
									? "not-allowed"
									: "pointer",
						}}
					>
						<FiPlay />
						{hasActiveJob
							? "Generation Already In Progress"
							: mustAcknowledge
							? "Acknowledge Assumptions First"
							: "Start Complete Screenplay Generation"}
					</button>
				</form>

				{history.length > 0 && (
					<div
						style={{
							backgroundColor: "#ffffff",
							borderRadius: "12px",
							border: "1px solid #e2e8f0",
							padding: "16px",
						}}
					>
						<div style={{ fontSize: "12.5px", fontWeight: 700, color: "#0f172a", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
							<FiClock color="#64748b" /> Recent Generation Runs ({history.length})
						</div>
						<div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "180px", overflowY: "auto" }}>
							{history.map((item) => (
								<button
									key={item.id}
									type="button"
									onClick={() => onSelectHistory(item.id)}
									style={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
										padding: "8px 10px",
										borderRadius: "8px",
										border: activeJobId === item.id ? "1.5px solid #d97706" : "1px solid #e2e8f0",
										backgroundColor: activeJobId === item.id ? "#fffbeb" : "#f8fafc",
										cursor: "pointer",
										fontSize: "12px",
									}}
								>
									<div style={{ textAlign: "left" }}>
										<strong style={{ color: "#0f172a" }}>{item.resolvedStructure || item.requestedStructure}</strong>
										<span style={{ color: "#64748b", marginLeft: "8px" }}>
											{item.completedScenes}/{item.totalScenes} scenes
										</span>
									</div>
									<span style={{ fontWeight: 700, color: item.status === "COMPLETED" ? "#15803d" : "#b45309" }}>
										{item.status} ({item.progressPercent}%)
									</span>
								</button>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

