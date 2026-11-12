"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useScriptDoctor } from "../../hooks/useScriptDoctor";
import { AILoading } from "../ai/AILoading";
import { StreamStatusBanner } from "../ai/StreamStatusBanner";
import { AnalysisResultsPanel } from "./AnalysisResultsPanel";
import { ProposalDiffPreviewPanel } from "./ProposalDiffPreviewPanel";
import { VersionComparisonPanel } from "./VersionComparisonPanel";
import {
	ScriptDoctorAnalysisScope,
	ScriptDoctorOperation,
	ScriptDoctorTargetScope,
} from "../../types/scriptDoctor";
import {
	FiAlertCircle,
	FiCheckCircle,
	FiCpu,
	FiEdit3,
	FiFileText,
	FiShield,
	FiSliders,
} from "react-icons/fi";

interface ScriptDoctorWorkspaceProps {
	movieId: string;
}

export function ScriptDoctorWorkspace({ movieId }: ScriptDoctorWorkspaceProps) {
	const {
		dashboard,
		activeAnalysis,
		setActiveAnalysis,
		activeSuggestion,
		setActiveSuggestion,
		versionComparison,
		isLoading,
		isBusy,
		error,
		notice,
		staleWarning,
		streamState,
		streamStage,
		streamPreviewText,
		streamError,
		selectScreenplay,
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
	} = useScriptDoctor(movieId);

	const [activeSubTab, setActiveSubTab] = useState<"PROPOSALS" | "ANALYSIS" | "VERSIONS">("PROPOSALS");
	const [operation, setOperation] = useState<"ANALYSIS" | "CONTINUITY" | ScriptDoctorOperation>("REWRITE");
	const [targetScope, setTargetScope] = useState<ScriptDoctorTargetScope>("SCENE");
	const [targetActNumber, setTargetActNumber] = useState<number>(1);
	const [targetSceneNumber, setTargetSceneNumber] = useState<number>(1);
	const [selectedText, setSelectedText] = useState("");
	const [directions, setDirections] = useState("");
	const [dialogueMode, setDialogueMode] = useState("NATURAL");
	const [polishFocus, setPolishFocus] = useState("FULL_POLISH");

	if (isLoading) {
		return (
			<div style={{ padding: "48px 24px", backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
				<AILoading label="Loading Professional Script Doctor Workspace..." size="md" />
			</div>
		);
	}

	if (!dashboard) {
		return (
			<div style={{ padding: "36px 24px", backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", textAlign: "center" }}>
				<FiAlertCircle size={32} color="#d97706" />
				<h3 style={{ margin: "10px 0 6px", color: "#0f172a" }}>No Screenplay Available Yet</h3>
				<p style={{ color: "#64748b", fontSize: "13.5px", marginBottom: "16px" }}>
					{error || "Create or generate a screenplay for this project before launching Script Doctor."}
				</p>
				<div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
					<Link
						href={`/movies/${movieId}/screenplay`}
						style={{ padding: "9px 16px", backgroundColor: "#0f172a", color: "#fff", borderRadius: "8px", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}
					>
						Open Screenplay Editor
					</Link>
					<Link
						href={`/movies/${movieId}/generate`}
						style={{ padding: "9px 16px", backgroundColor: "#d97706", color: "#fff", borderRadius: "8px", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}
					>
						Generate Screenplay
					</Link>
				</div>
			</div>
		);
	}

	const pendingCount = dashboard.suggestions.filter((s) =>
		["PENDING", "EDITED", "STALE"].includes(s.status)
	).length;
	const acceptedCount = dashboard.suggestions.filter((s) =>
		["ACCEPTED", "PARTIALLY_ACCEPTED"].includes(s.status)
	).length;
	const rejectedCount = dashboard.suggestions.filter((s) =>
		["REJECTED", "DISMISSED"].includes(s.status)
	).length;
	const unresolvedFindingsCount = (activeAnalysis?.continuityFindingsJson || []).filter((f) =>
		["CONFIRMED_CONTRADICTION", "POSSIBLE_CONTRADICTION"].includes(f.intentionality)
	).length;

	const selectedScenePreview =
		targetScope === "SCENE"
			? dashboard.screenplay.parsedScenes.find((s) => s.sceneNumber === targetSceneNumber)
			: undefined;

	const handleSubmitOperation = async (e: React.FormEvent) => {
		e.preventDefault();
		if (operation === "ANALYSIS" || operation === "CONTINUITY") {
			const scope: ScriptDoctorAnalysisScope =
				operation === "CONTINUITY"
					? "CONTINUITY_ONLY"
					: targetScope === "ACT" || targetScope === "SCENE"
					? targetScope
					: "ENTIRE_SCREENPLAY";
			const res = await runAnalysis({
				analysisScope: scope,
				targetActNumber: scope === "ACT" ? targetActNumber : undefined,
				targetSceneNumber: scope === "SCENE" ? targetSceneNumber : undefined,
				includeStoryBible: true,
				focusNotes: directions.trim() || undefined,
			});
			if (res) setActiveSubTab("ANALYSIS");
		} else {
			const res = await generateSuggestion({
				operationType: operation,
				targetScope,
				targetActNumber: targetScope === "ACT" ? targetActNumber : undefined,
				targetSceneNumber: targetScope === "SCENE" ? targetSceneNumber : undefined,
				selectedText: ["SELECTION", "DIALOGUE", "ACTION", "SECTION"].includes(targetScope)
					? selectedText
					: undefined,
				directions: directions.trim() || undefined,
				dialogueMode: operation === "DIALOGUE" ? dialogueMode : undefined,
				polishFocus: operation === "POLISH" ? polishFocus : undefined,
			});
			if (res) setActiveSubTab("PROPOSALS");
		}
	};

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
			{error && (
				<div style={{ padding: "12px 16px", borderRadius: "8px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
					<FiAlertCircle /> {error}
				</div>
			)}

			{notice && (
				<div style={{ padding: "12px 16px", borderRadius: "8px", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
					<FiCheckCircle /> {notice}
				</div>
			)}

			{/* A. Script Doctor Dashboard Header */}
			<div
				style={{
					backgroundColor: "#ffffff",
					borderRadius: "12px",
					border: "1px solid #e2e8f0",
					padding: "18px 20px",
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					flexWrap: "wrap",
					gap: "12px",
				}}
			>
				<div>
					<div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
						<h2 style={{ margin: 0, fontSize: "17px", fontWeight: 800, color: "#0f172a" }}>
							{dashboard.screenplay.title}
						</h2>
						<span style={{ padding: "2px 9px", borderRadius: "999px", backgroundColor: "#fef3c7", color: "#92400e", fontSize: "11.5px", fontWeight: 700 }}>
							Live Version v{dashboard.screenplay.version}
						</span>
						{dashboard.movie.hasStoryBible && (
							<span style={{ padding: "2px 9px", borderRadius: "999px", backgroundColor: "#dcfce7", color: "#166534", fontSize: "11.5px", fontWeight: 700 }}>
								Story Bible Grounded
							</span>
						)}
					</div>
					<div style={{ fontSize: "12.5px", color: "#64748b", marginTop: "4px" }}>
						{dashboard.screenplay.stats.sceneCount} scenes · {dashboard.screenplay.stats.wordCount} words ·{" "}
						{pendingCount} pending · {acceptedCount} accepted · {rejectedCount} rejected ·{" "}
						{unresolvedFindingsCount} unresolved continuity item(s)
					</div>
				</div>

				<div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
					{dashboard.availableScreenplays.length > 1 && (
						<select
							value={dashboard.screenplay.id}
							onChange={(e) => selectScreenplay(e.target.value)}
							style={{ padding: "7px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "12.5px", fontWeight: 600 }}
						>
							{dashboard.availableScreenplays.map((sp) => (
								<option key={sp.id} value={sp.id}>
									{sp.title} (v{sp.version})
								</option>
							))}
						</select>
					)}
					<Link
						href={`/movies/${movieId}/screenplay`}
						style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: "#f8fafc", color: "#0f172a", fontSize: "12.5px", fontWeight: 600, textDecoration: "none" }}
					>
						<FiFileText /> Open Editor
					</Link>
				</div>
			</div>

			{/* B/C/D. Operation, Target Selection & Instruction Console */}
			<form
				onSubmit={handleSubmitOperation}
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
				<div>
					<div style={{ fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "8px" }}>
						1. Choose Script Doctor Operation (No Auto-Mutation — Preview Before Applying)
					</div>
					<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))", gap: "8px" }}>
						{(
							[
								["REWRITE", "Targeted Rewrite", FiEdit3],
								["POLISH", "Polish Screenplay", FiSliders],
								["DIALOGUE", "Improve Dialogue", FiCpu],
								["CONTINUITY", "Continuity Check", FiShield],
								["ANALYSIS", "Full Script Analysis", FiFileText],
							] as const
						).map(([key, label, Icon]) => (
							<button
								key={key}
								type="button"
								onClick={() => setOperation(key)}
								style={{
									display: "flex",
									alignItems: "center",
									gap: "8px",
									padding: "10px 12px",
									borderRadius: "8px",
									border: operation === key ? "2px solid #d97706" : "1px solid #cbd5e1",
									backgroundColor: operation === key ? "#fffbeb" : "#f8fafc",
									fontWeight: 700,
									fontSize: "12.5px",
									color: "#0f172a",
									cursor: "pointer",
								}}
							>
								<Icon color={operation === key ? "#d97706" : "#64748b"} />
								{label}
							</button>
						))}
					</div>
				</div>

				<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
					<div>
						<label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
							2. Target Screenplay Scope
						</label>
						<select
							value={targetScope}
							onChange={(e) => setTargetScope(e.target.value as ScriptDoctorTargetScope)}
							style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
						>
							<option value="SCENE">Selected Scene</option>
							<option value="ACT">Selected Act</option>
							<option value="ENTIRE_SCREENPLAY">Entire Screenplay</option>
							<option value="DIALOGUE">Selected Dialogue Excerpt</option>
							<option value="ACTION">Selected Action Paragraph</option>
							<option value="SELECTION">Exact Custom Text Selection</option>
						</select>
					</div>

					{targetScope === "SCENE" && (
						<div>
							<label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
								Select Scene
							</label>
							<select
								value={targetSceneNumber}
								onChange={(e) => setTargetSceneNumber(Number(e.target.value))}
								style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
							>
								{dashboard.screenplay.parsedScenes.length > 0 ? (
									dashboard.screenplay.parsedScenes.map((s) => (
										<option key={s.sceneNumber} value={s.sceneNumber}>
											Scene {s.sceneNumber} (Act {s.actNumber}): {s.heading}
										</option>
									))
								) : (
									<option value={1}>Scene 1</option>
								)}
							</select>
						</div>
					)}

					{targetScope === "ACT" && (
						<div>
							<label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
								Act Number
							</label>
							<input
								type="number"
								min={1}
								max={10}
								value={targetActNumber}
								onChange={(e) => setTargetActNumber(Number(e.target.value))}
								style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
							/>
						</div>
					)}

					{operation === "DIALOGUE" && (
						<div>
							<label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
								Dialogue Improvement Goal
							</label>
							<select
								value={dialogueMode}
								onChange={(e) => setDialogueMode(e.target.value)}
								style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
							>
								<option value="NATURAL">More Natural Speech Rhythm</option>
								<option value="EMOTIONAL">Deepen Emotional Authenticity</option>
								<option value="INCREASE_TENSION">Increase Confrontation Tension</option>
								<option value="SUBTEXT">Add Meaningful Subtext</option>
								<option value="CONCISE">Tighten &amp; Make Concise</option>
								<option value="CHARACTER_VOICE">Sharpen Unique Character Voice</option>
								<option value="REDUCE_EXPOSITION">Reduce Unnecessary Exposition</option>
							</select>
						</div>
					)}

					{operation === "POLISH" && (
						<div>
							<label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
								Polish Focus
							</label>
							<select
								value={polishFocus}
								onChange={(e) => setPolishFocus(e.target.value)}
								style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
							>
								<option value="FULL_POLISH">Full Technical + Rhythm Polish</option>
								<option value="GRAMMAR_AND_CLARITY">Grammar &amp; Sentence Clarity</option>
								<option value="ACTION_LINES">Tighten Action Descriptions</option>
								<option value="FORMATTING">Screenplay Formatting &amp; Transitions</option>
								<option value="TRIM_EXPOSITION">Trim Redundant Exposition</option>
							</select>
						</div>
					)}
				</div>

				{["SELECTION", "DIALOGUE", "ACTION", "SECTION"].includes(targetScope) && (
					<div>
						<label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
							Exact Excerpt from Screenplay to Revise
						</label>
						<textarea
							rows={4}
							placeholder="Paste exact dialogue or paragraph from the screenplay..."
							value={selectedText}
							onChange={(e) => setSelectedText(e.target.value)}
							style={{ width: "100%", fontFamily: "'Courier New', Courier, monospace", fontSize: "12.5px", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
						/>
					</div>
				)}

				{selectedScenePreview && (
					<div style={{ padding: "8px 12px", borderRadius: "8px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", fontSize: "12px", color: "#475569" }}>
						<strong>Selected Target Preview:</strong>{" "}
						<code>{selectedScenePreview.heading}</code> —{" "}
						{selectedScenePreview.text.slice(0, 140)}...
					</div>
				)}

				<div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
					<input
						type="text"
						placeholder='Instruction (e.g., "Make confrontation sharper without altering motives")'
						value={directions}
						onChange={(e) => setDirections(e.target.value)}
						style={{ flex: 1, minWidth: "260px", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
					/>
					<button
						type="submit"
						disabled={isBusy}
						style={{
							padding: "10px 20px",
							borderRadius: "8px",
							border: "none",
							backgroundColor: isBusy ? "#cbd5e1" : "#d97706",
							color: "#ffffff",
							fontWeight: 700,
							fontSize: "13px",
							cursor: isBusy ? "not-allowed" : "pointer",
						}}
					>
						{operation === "ANALYSIS" || operation === "CONTINUITY"
							? "Run Diagnostic Audit"
							: "Generate Reviewable Preview"}
					</button>
					{operation !== "ANALYSIS" && operation !== "CONTINUITY" && (
						<button
							type="button"
							disabled={isBusy}
							onClick={() =>
								void streamSuggestionPreview({
									operationType: operation,
									targetScope,
									targetActNumber: targetScope === "ACT" ? targetActNumber : undefined,
									targetSceneNumber: targetScope === "SCENE" ? targetSceneNumber : undefined,
									selectedText: ["SELECTION", "DIALOGUE", "ACTION", "SECTION"].includes(targetScope)
										? selectedText
										: undefined,
									directions: directions.trim() || undefined,
								})
							}
							style={{
								padding: "10px 16px",
								borderRadius: "8px",
								border: "1px solid #d97706",
								backgroundColor: "#fffbeb",
								color: "#b45309",
								fontWeight: 700,
								fontSize: "13px",
								cursor: isBusy ? "not-allowed" : "pointer",
							}}
						>
							Stream Live Preview
						</button>
					)}
				</div>
			</form>

			<StreamStatusBanner
				state={streamState}
				stageLabel={streamStage}
				streamPreviewText={streamPreviewText}
				errorMessage={streamError}
				onCancel={cancelSuggestionStream}
				onRetry={retrySuggestionStream}
			/>

			{/* Workspace Section Tabs */}
			<div style={{ display: "flex", gap: "8px", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px" }}>
				{(
					[
						["PROPOSALS", `Diff Preview & Review (${dashboard.suggestions.length})`],
						["ANALYSIS", `Evaluations & Continuity (${dashboard.analyses.length})`],
						["VERSIONS", `Version History (${dashboard.versions.length})`],
					] as const
				).map(([key, label]) => (
					<button
						key={key}
						type="button"
						onClick={() => setActiveSubTab(key)}
						style={{
							padding: "8px 16px",
							borderRadius: "8px",
							border: "none",
							backgroundColor: activeSubTab === key ? "#0f172a" : "#e2e8f0",
							color: activeSubTab === key ? "#ffffff" : "#334155",
							fontWeight: 700,
							fontSize: "13px",
							cursor: "pointer",
						}}
					>
						{label}
					</button>
				))}
			</div>

			{activeSubTab === "PROPOSALS" && (
				<ProposalDiffPreviewPanel
					suggestions={dashboard.suggestions}
					activeSuggestion={activeSuggestion}
					staleWarning={staleWarning}
					isBusy={isBusy}
					onSelectSuggestion={setActiveSuggestion}
					onEditSuggestion={editSuggestion}
					onRegenerateSuggestion={regenerateSuggestion}
					onAcceptSuggestion={acceptSuggestion}
					onRejectOrDismiss={rejectOrDismissSuggestion}
				/>
			)}

			{activeSubTab === "ANALYSIS" && (
				<AnalysisResultsPanel
					analyses={dashboard.analyses}
					activeAnalysis={activeAnalysis}
					isBusy={isBusy}
					onSelectAnalysis={setActiveAnalysis}
					onUpdateFinding={updateFindingStatus}
					onGenerateFixForFinding={async (f) => {
						const res = await generateSuggestion({
							operationType: "CONTINUITY_FIX",
							targetScope: f.affectedSceneNumber ? "SCENE" : "ENTIRE_SCREENPLAY",
							targetSceneNumber: f.affectedSceneNumber ?? undefined,
							findingId: f.id,
							directions: `Fix continuity issue: ${f.description}. Suggested approach: ${f.suggestedResolution}`,
						});
						if (res) setActiveSubTab("PROPOSALS");
					}}
					onNavigateToScene={(sceneNum) => {
						setTargetScope("SCENE");
						setTargetSceneNumber(sceneNum);
					}}
				/>
			)}

			{activeSubTab === "VERSIONS" && (
				<VersionComparisonPanel
					versions={dashboard.versions}
					currentVersion={dashboard.screenplay.version}
					comparison={versionComparison}
					isBusy={isBusy}
					onCompare={compareVersions}
					onRestore={restoreVersion}
				/>
			)}
		</div>
	);
}

