"use client";

import React, { useState } from "react";
import {
	ContinuityFindingIntentionality,
	ScriptDoctorAnalysis,
	ScriptDoctorContinuityFinding,
} from "../../types/scriptDoctor";
import { filterContinuityFindings } from "../../services/scriptDoctorService";
import {
	FiAlertTriangle,
	FiCheckCircle,
	FiCompass,
	FiFilter,
	FiTool,
} from "react-icons/fi";

interface AnalysisResultsPanelProps {
	analyses: ScriptDoctorAnalysis[];
	activeAnalysis: ScriptDoctorAnalysis | null;
	isBusy: boolean;
	onSelectAnalysis: (analysis: ScriptDoctorAnalysis) => void;
	onUpdateFinding: (
		analysisId: string,
		findingId: string,
		intentionality: ContinuityFindingIntentionality
	) => Promise<void>;
	onGenerateFixForFinding: (finding: ScriptDoctorContinuityFinding) => Promise<void>;
	onNavigateToScene?: (sceneNumber: number) => void;
}

export function AnalysisResultsPanel({
	analyses,
	activeAnalysis,
	isBusy,
	onSelectAnalysis,
	onUpdateFinding,
	onGenerateFixForFinding,
	onNavigateToScene,
}: AnalysisResultsPanelProps) {
	const [severityFilter, setSeverityFilter] = useState("ALL");
	const [categoryFilter, setCategoryFilter] = useState("ALL");
	const [intentFilter, setIntentFilter] = useState("ALL");

	if (!activeAnalysis) {
		return (
			<div
				style={{
					backgroundColor: "#ffffff",
					borderRadius: "12px",
					border: "1px solid #e2e8f0",
					padding: "40px 24px",
					textAlign: "center",
					color: "#64748b",
					fontSize: "13.5px",
				}}
			>
				Run a Screenplay Analysis or Continuity Check above to review craft strengths, weaknesses, and continuity findings.
			</div>
		);
	}

	const ev = activeAnalysis.evaluationJson;
	const allFindings = activeAnalysis.continuityFindingsJson || [];
	const filteredFindings = filterContinuityFindings(allFindings, {
		severity: severityFilter,
		category: categoryFilter,
		intentionality: intentFilter,
	});

	const categories = Array.from(new Set(allFindings.map((f) => f.category)));

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
			{/* History Selector */}
			{analyses.length > 1 && (
				<div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
					<span style={{ fontSize: "12px", fontWeight: 700, color: "#475569" }}>Saved Audits:</span>
					{analyses.slice(0, 6).map((a) => (
						<button
							key={a.id}
							type="button"
							onClick={() => onSelectAnalysis(a)}
							style={{
								padding: "5px 10px",
								borderRadius: "6px",
								border: activeAnalysis.id === a.id ? "1.5px solid #d97706" : "1px solid #cbd5e1",
								backgroundColor: activeAnalysis.id === a.id ? "#fffbeb" : "#ffffff",
								fontSize: "12px",
								fontWeight: 600,
								cursor: "pointer",
							}}
						>
							{a.targetLabel} (v{a.baseScreenplayVersion})
						</button>
					))}
				</div>
			)}

			{activeAnalysis.isPartialAnalysis && (
				<div
					style={{
						padding: "10px 14px",
						borderRadius: "8px",
						backgroundColor: "#fffbeb",
						border: "1px solid #fcd34d",
						color: "#92400e",
						fontSize: "12.5px",
					}}
				>
					<strong>Partial Audit Notice:</strong> Processed {activeAnalysis.chunksProcessed}/
					{activeAnalysis.totalChunks} chunks (failed chunks:{" "}
					{(activeAnalysis.failedChunkIndices || []).join(", ")}).
				</div>
			)}

			{/* Overall Evaluation Card */}
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
				<div>
					<div style={{ fontSize: "11.5px", fontWeight: 700, color: "#d97706", textTransform: "uppercase" }}>
						AI Diagnostic Evaluation · {activeAnalysis.targetLabel} (Base Script v{activeAnalysis.baseScreenplayVersion})
					</div>
					<p style={{ margin: "6px 0 0", fontSize: "13.5px", color: "#0f172a", lineHeight: 1.55 }}>
						{activeAnalysis.overallAssessment}
					</p>
				</div>

				<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px", fontSize: "12.5px" }}>
					<div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "12px" }}>
						<div style={{ fontWeight: 700, color: "#166534", marginBottom: "4px" }}>Strengths</div>
						<ul style={{ margin: 0, paddingLeft: "16px", color: "#14532d", lineHeight: 1.45 }}>
							{(ev.strengths || []).map((s, idx) => (
								<li key={idx}>{s}</li>
							))}
						</ul>
					</div>
					<div style={{ backgroundColor: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "8px", padding: "12px" }}>
						<div style={{ fontWeight: 700, color: "#9a3412", marginBottom: "4px" }}>Weaknesses &amp; Opportunities</div>
						<ul style={{ margin: 0, paddingLeft: "16px", color: "#7c2d12", lineHeight: 1.45 }}>
							{[...(ev.weaknesses || []), ...(ev.improvementOpportunities || [])].map((w, idx) => (
								<li key={idx}>{w}</li>
							))}
						</ul>
					</div>
					<div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "12px" }}>
						<div style={{ fontWeight: 700, color: "#991b1b", marginBottom: "4px" }}>Critical Issues</div>
						{(ev.criticalIssues || []).length === 0 ? (
							<div style={{ color: "#64748b" }}>No critical structural blockers flagged.</div>
						) : (
							<ul style={{ margin: 0, paddingLeft: "16px", color: "#7f1d1d", lineHeight: 1.45 }}>
								{ev.criticalIssues.map((c, idx) => (
									<li key={idx}>{c}</li>
								))}
							</ul>
						)}
					</div>
				</div>

				{/* Six Craft Dimensions */}
				{ev.dimensions && (
					<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "10px" }}>
						{(
							[
								["Story & Plot", ev.dimensions.storyAndPlot],
								["Characters", ev.dimensions.characters],
								["Scene Quality", ev.dimensions.sceneQuality],
								["Dialogue", ev.dimensions.dialogue],
								["Pacing", ev.dimensions.pacing],
								["Presentation", ev.dimensions.presentation],
							] as const
						).map(([label, dim]) => (
							<div key={label} style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "10px 12px", backgroundColor: "#f8fafc", fontSize: "12px" }}>
								<div style={{ fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>{label}</div>
								<p style={{ margin: "0 0 6px", color: "#334155", lineHeight: 1.45 }}>{dim?.summary}</p>
								{dim?.recommendations?.[0] && (
									<div style={{ color: "#b45309", fontSize: "11.5px" }}>
										<strong>Focus:</strong> {dim.recommendations[0]}
									</div>
								)}
							</div>
						))}
					</div>
				)}
			</div>

			{/* Continuity Findings Panel */}
			<div
				style={{
					backgroundColor: "#ffffff",
					borderRadius: "12px",
					border: "1px solid #e2e8f0",
					padding: "20px",
				}}
			>
				<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "14px" }}>
					<h3 style={{ margin: 0, fontSize: "15.5px", fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
						<FiAlertTriangle color="#d97706" /> Continuity Findings ({filteredFindings.length}/{allFindings.length})
					</h3>

					<div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center", fontSize: "12px" }}>
						<FiFilter color="#64748b" />
						<select
							aria-label="Filter by severity"
							value={severityFilter}
							onChange={(e) => setSeverityFilter(e.target.value)}
							style={{ padding: "5px 8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
						>
							<option value="ALL">All Severities</option>
							<option value="CRITICAL">CRITICAL</option>
							<option value="HIGH">HIGH</option>
							<option value="MEDIUM">MEDIUM</option>
							<option value="LOW">LOW</option>
						</select>
						<select
							aria-label="Filter by category"
							value={categoryFilter}
							onChange={(e) => setCategoryFilter(e.target.value)}
							style={{ padding: "5px 8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
						>
							<option value="ALL">All Categories</option>
							{categories.map((cat) => (
								<option key={cat} value={cat}>
									{cat}
								</option>
							))}
						</select>
						<select
							aria-label="Filter by intentionality"
							value={intentFilter}
							onChange={(e) => setIntentFilter(e.target.value)}
							style={{ padding: "5px 8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
						>
							<option value="ALL">All Statuses</option>
							<option value="CONFIRMED_CONTRADICTION">Confirmed Contradiction</option>
							<option value="POSSIBLE_CONTRADICTION">Possible Contradiction</option>
							<option value="INTENTIONAL_CHOICE">Intentional Choice</option>
							<option value="FALSE_POSITIVE">False Positive</option>
							<option value="RESOLVED">Resolved</option>
						</select>
					</div>
				</div>

				{filteredFindings.length === 0 ? (
					<div style={{ padding: "20px", textAlign: "center", color: "#64748b", fontSize: "13px" }}>
						No findings match the current filter criteria.
					</div>
				) : (
					<div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
						{filteredFindings.map((f) => (
							<div
								key={f.id}
								style={{
									borderRadius: "10px",
									border: "1px solid #e2e8f0",
									backgroundColor: "#f8fafc",
									padding: "14px",
									fontSize: "12.5px",
								}}
							>
								<div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px", marginBottom: "6px" }}>
									<div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
										<span
											style={{
												padding: "2px 8px",
												borderRadius: "999px",
												fontSize: "11px",
												fontWeight: 700,
												backgroundColor:
													f.severity === "CRITICAL" || f.severity === "HIGH" ? "#fee2e2" : "#fef3c7",
												color:
													f.severity === "CRITICAL" || f.severity === "HIGH" ? "#991b1b" : "#92400e",
											}}
										>
											{f.severity}
										</span>
										<span style={{ fontWeight: 700, color: "#0f172a" }}>{f.category}</span>
										<span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "6px", backgroundColor: "#e2e8f0", color: "#334155", fontWeight: 600 }}>
											{f.intentionality}
										</span>
										{f.affectedSceneNumber && (
											<button
												type="button"
												onClick={() => onNavigateToScene?.(f.affectedSceneNumber!)}
												style={{ border: "none", background: "#dbeafe", color: "#1e40af", borderRadius: "6px", padding: "2px 8px", fontSize: "11px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
											>
												<FiCompass size={11} /> Jump to Scene {f.affectedSceneNumber}
											</button>
										)}
									</div>
									<span style={{ fontSize: "11.5px", color: "#64748b" }}>
										Confidence: {Math.round((f.confidence || 0.75) * 100)}%
									</span>
								</div>

								<p style={{ margin: "0 0 6px", color: "#0f172a", fontWeight: 600 }}>{f.description}</p>
								{f.evidenceFromScreenplay && (
									<div style={{ color: "#475569", marginBottom: "4px" }}>
										<strong>Evidence:</strong> {f.evidenceFromScreenplay}
									</div>
								)}
								<div style={{ color: "#475569", marginBottom: "8px" }}>
									<strong>Why it matters:</strong> {f.whyItMatters} · <strong>Suggestion:</strong> {f.suggestedResolution}
								</div>

								<div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
									<button
										type="button"
										disabled={isBusy}
										onClick={() => void onGenerateFixForFinding(f)}
										style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "5px 10px", borderRadius: "6px", border: "none", backgroundColor: "#d97706", color: "#fff", fontSize: "11.5px", fontWeight: 700, cursor: "pointer" }}
									>
										<FiTool size={12} /> Propose Fix Preview
									</button>
									<button
										type="button"
										disabled={isBusy}
										onClick={() => void onUpdateFinding(activeAnalysis.id, f.id, "INTENTIONAL_CHOICE")}
										style={{ padding: "5px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", backgroundColor: "#fff", fontSize: "11.5px", fontWeight: 600, cursor: "pointer" }}
									>
										Mark Intentional Choice
									</button>
									<button
										type="button"
										disabled={isBusy}
										onClick={() => void onUpdateFinding(activeAnalysis.id, f.id, "FALSE_POSITIVE")}
										style={{ padding: "5px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", backgroundColor: "#fff", fontSize: "11.5px", fontWeight: 600, cursor: "pointer" }}
									>
										False Positive
									</button>
									<button
										type="button"
										disabled={isBusy}
										onClick={() => void onUpdateFinding(activeAnalysis.id, f.id, "RESOLVED")}
										style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "5px 10px", borderRadius: "6px", border: "1px solid #bbf7d0", backgroundColor: "#f0fdf4", color: "#166534", fontSize: "11.5px", fontWeight: 600, cursor: "pointer" }}
									>
										<FiCheckCircle size={12} /> Resolve
									</button>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

