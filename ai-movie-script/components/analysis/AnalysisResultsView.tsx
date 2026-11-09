"use client";

import React, { useState } from "react";
import { CreativeAnalysisResult } from "../../types/analysis";
import {
	FiCheckCircle,
	FiAlertTriangle,
	FiZap,
	FiUser,
	FiMapPin,
	FiBookOpen,
	FiCpu,
	FiCopy,
	FiCheck,
	FiArrowRight,
	FiLayers,
	FiTrendingUp,
	FiFilm,
} from "react-icons/fi";

export interface AnalysisResultsViewProps {
	analysis: CreativeAnalysisResult;
	onRetry?: () => void;
	onNewAnalysis?: () => void;
	onAssociateMovie?: () => void;
	isRetrying?: boolean;
}

type AnalysisTab =
	| "overview"
	| "concept"
	| "characters"
	| "plot"
	| "arcs"
	| "setting"
	| "critique"
	| "processing";

export function AnalysisResultsView({
	analysis,
	onRetry,
	onNewAnalysis,
	onAssociateMovie,
	isRetrying = false,
}: AnalysisResultsViewProps) {
	const [activeTab, setActiveTab] = useState<AnalysisTab>("overview");
	const [copied, setCopied] = useState(false);

	const handleCopy = () => {
		if (typeof navigator !== "undefined" && navigator.clipboard) {
			const text = `FILMFORGE AI CREATIVE ANALYSIS: ${analysis.title}\nLogline: ${analysis.logline}\nCentral Theme: ${analysis.centralTheme}\nDocument Summary:\n${analysis.documentSummary}`;
			navigator.clipboard.writeText(text);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	};

	const tabs: Array<{ id: AnalysisTab; label: string; count?: number }> = [
		{ id: "overview", label: "Overview" },
		{ id: "concept", label: "Concept & Themes" },
		{ id: "characters", label: "Characters", count: analysis.characters?.length },
		{ id: "plot", label: "Plot & Structure" },
		{ id: "arcs", label: "Character Arcs", count: analysis.characterArcs?.length },
		{ id: "setting", label: "Setting", count: analysis.setting?.length },
		{
			id: "critique",
			label: "Critique & Opportunities",
			count:
				(analysis.strengths?.length || 0) +
				(analysis.weaknesses?.length || 0) +
				(analysis.continuityIssues?.length || 0),
		},
		{ id: "processing", label: "Processing Info" },
	];

	return (
		<div className="analysis-results-container" style={{ background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
			{/* Top Header Card */}
			<div style={{ padding: "24px 28px 18px", borderBottom: "1px solid #e2e8f0", background: "linear-gradient(180deg, #fffbeb 0%, #ffffff 100%)" }}>
				<div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
					<div>
						<div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
							<span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 8px", borderRadius: "4px", backgroundColor: "#fef3c7", color: "#92400e", textTransform: "uppercase" }}>
								{analysis.detectedType.replace(/_/g, " ")}
							</span>
							<span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 8px", borderRadius: "4px", backgroundColor: "#ecfdf5", color: "#065f46" }}>
								Status: {analysis.analysisStatus}
							</span>
							{analysis.processing?.totalChunks > 1 && (
								<span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 8px", borderRadius: "4px", backgroundColor: "#e0e7ff", color: "#3730a3" }}>
									{analysis.processing.chunksProcessed}/{analysis.processing.totalChunks} Chunks Synthesized
								</span>
							)}
						</div>
						<h1 style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", margin: "0 0 6px 0" }}>
							{analysis.title}
						</h1>
						<p style={{ fontSize: "14px", color: "#475569", margin: 0, maxWidth: "780px", lineHeight: "1.5" }}>
							<strong>Logline:</strong> {analysis.logline}
						</p>
					</div>

					<div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
						<button
							type="button"
							onClick={handleCopy}
							style={{
								display: "flex",
								alignItems: "center",
								gap: "6px",
								padding: "8px 12px",
								borderRadius: "8px",
								background: "#ffffff",
								border: "1px solid #cbd5e1",
								color: "#475569",
								fontSize: "12.5px",
								fontWeight: 600,
								cursor: "pointer",
							}}
						>
							{copied ? <FiCheck size={14} color="#059669" /> : <FiCopy size={14} />}
							<span>{copied ? "Copied!" : "Copy"}</span>
						</button>

						{onAssociateMovie && (
							<button
								type="button"
								onClick={onAssociateMovie}
								style={{
									display: "flex",
									alignItems: "center",
									gap: "6px",
									padding: "8px 14px",
									borderRadius: "8px",
									background: "#f8fafc",
									border: "1px solid #cbd5e1",
									color: "#0f172a",
									fontSize: "12.5px",
									fontWeight: 600,
									cursor: "pointer",
								}}
							>
								<FiFilm size={14} />
								<span>Associate with Movie</span>
							</button>
						)}

						{onNewAnalysis && (
							<button
								type="button"
								onClick={onNewAnalysis}
								style={{
									display: "flex",
									alignItems: "center",
									gap: "6px",
									padding: "8px 16px",
									borderRadius: "8px",
									background: "#d97706",
									border: "none",
									color: "#ffffff",
									fontSize: "12.5px",
									fontWeight: 600,
									cursor: "pointer",
								}}
							>
								<FiZap size={14} />
								<span>New Analysis</span>
							</button>
						)}
					</div>
				</div>

				{/* Format Mismatch Alert Banner */}
				{analysis.hasFormatMismatch && analysis.mismatchExplanation && (
					<div style={{ marginTop: "14px", padding: "10px 14px", backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "8px", display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "12.5px", color: "#92400e" }}>
						<FiAlertTriangle size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
						<div>
							<strong>Format Classification Note:</strong> {analysis.mismatchExplanation}
						</div>
					</div>
				)}
			</div>

			{/* Horizontal Tab Navigation */}
			<div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", background: "#f8fafc", overflowX: "auto", padding: "0 16px" }}>
				{tabs.map((tab) => {
					const isActive = activeTab === tab.id;
					return (
						<button
							key={tab.id}
							type="button"
							onClick={() => setActiveTab(tab.id)}
							style={{
								padding: "12px 16px",
								fontSize: "13px",
								fontWeight: isActive ? 700 : 500,
								color: isActive ? "#d97706" : "#64748b",
								background: "transparent",
								border: "none",
								borderBottom: isActive ? "2px solid #d97706" : "2px solid transparent",
								cursor: "pointer",
								display: "flex",
								alignItems: "center",
								gap: "6px",
								whiteSpace: "nowrap",
							}}
						>
							<span>{tab.label}</span>
							{tab.count !== undefined && tab.count > 0 && (
								<span style={{ fontSize: "11px", fontWeight: 600, padding: "1px 6px", borderRadius: "10px", backgroundColor: isActive ? "#fef3c7" : "#e2e8f0", color: isActive ? "#92400e" : "#475569" }}>
									{tab.count}
								</span>
							)}
						</button>
					);
				})}
			</div>

			{/* Tab Body Content */}
			<div style={{ padding: "28px" }}>
				{/* 1. OVERVIEW */}
				{activeTab === "overview" && (
					<div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
						<div>
							<h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", marginBottom: "8px" }}>
								Document Executive Summary
							</h3>
							<p style={{ fontSize: "14px", lineHeight: "1.7", color: "#334155", margin: 0, whiteSpace: "pre-wrap" }}>
								{analysis.documentSummary}
							</p>
						</div>

						<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginTop: "8px" }}>
							<div style={{ padding: "14px", borderRadius: "8px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
								<span style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", color: "#64748b" }}>Primary Genre</span>
								<div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", marginTop: "4px" }}>
									{analysis.genre?.primary || "Drama"}
								</div>
								{analysis.genre?.secondary && analysis.genre.secondary.length > 0 && (
									<div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
										Secondary: {analysis.genre.secondary.join(", ")}
									</div>
								)}
							</div>

							<div style={{ padding: "14px", borderRadius: "8px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
								<span style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", color: "#64748b" }}>Central Theme</span>
								<div style={{ fontSize: "13.5px", fontWeight: 600, color: "#0f172a", marginTop: "4px" }}>
									{analysis.centralTheme}
								</div>
							</div>

							{analysis.targetAudience && (
								<div style={{ padding: "14px", borderRadius: "8px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
									<span style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", color: "#64748b" }}>Target Audience</span>
									<div style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a", marginTop: "4px" }}>
										{analysis.targetAudience}
									</div>
								</div>
							)}

							{analysis.suggestedFormat && (
								<div style={{ padding: "14px", borderRadius: "8px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
									<span style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", color: "#64748b" }}>Suggested Format</span>
									<div style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a", marginTop: "4px" }}>
										{analysis.suggestedFormat}
									</div>
								</div>
							)}
						</div>
					</div>
				)}

				{/* 2. CONCEPT & THEMES */}
				{activeTab === "concept" && (
					<div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
						<div>
							<h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", marginBottom: "8px" }}>
								Core Story Concept
							</h3>
							<p style={{ fontSize: "14px", lineHeight: "1.7", color: "#334155", margin: 0 }}>
								{analysis.storyConcept || "No separate concept text extracted."}
							</p>
						</div>

						<div>
							<h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", marginBottom: "8px" }}>
								Thematic Architecture
							</h3>
							<div style={{ padding: "16px", borderRadius: "8px", backgroundColor: "#fef3c7", border: "1px solid #fde68a" }}>
								<div style={{ fontWeight: 700, color: "#92400e", fontSize: "14px", marginBottom: "4px" }}>
									Primary Thematic Argument
								</div>
								<div style={{ color: "#78350f", fontSize: "13.5px", lineHeight: "1.5" }}>
									{analysis.centralTheme}
								</div>
							</div>

							{analysis.secondaryThemes && analysis.secondaryThemes.length > 0 && (
								<div style={{ marginTop: "12px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
									{analysis.secondaryThemes.map((th, idx) => (
										<span key={idx} style={{ padding: "4px 10px", borderRadius: "6px", backgroundColor: "#f1f5f9", color: "#334155", fontSize: "12px", fontWeight: 500 }}>
											• {th}
										</span>
									))}
								</div>
							)}
						</div>

						{analysis.evidenceQuotes && analysis.evidenceQuotes.length > 0 && (
							<div>
								<h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", marginBottom: "8px" }}>
									Evidence Quotes from Material
								</h3>
								<div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
									{analysis.evidenceQuotes.map((q, idx) => (
										<blockquote key={idx} style={{ margin: 0, padding: "10px 14px", borderLeft: "3px solid #d97706", backgroundColor: "#f8fafc", fontSize: "13px", fontStyle: "italic", color: "#475569" }}>
											&quot;{q}&quot;
										</blockquote>
									))}
								</div>
							</div>
						)}
					</div>
				)}

				{/* 3. CHARACTERS */}
				{activeTab === "characters" && (
					<div>
						<h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", marginBottom: "14px" }}>
							Identified Characters ({analysis.characters?.length || 0})
						</h3>
						{(!analysis.characters || analysis.characters.length === 0) ? (
							<p style={{ color: "#64748b", fontSize: "13px" }}>No distinct characters were identified in this material.</p>
						) : (
							<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
								{analysis.characters.map((char, idx) => (
									<div key={idx} style={{ border: "1px solid #e2e8f0", borderRadius: "10px", padding: "16px", backgroundColor: "#ffffff", boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
										<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
											<span style={{ fontWeight: 700, fontSize: "15px", color: "#0f172a" }}>{char.name}</span>
											<span style={{ fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "4px", backgroundColor: "#fef3c7", color: "#92400e" }}>
												{char.role}
											</span>
										</div>

										{char.goals && char.goals.length > 0 && (
											<div style={{ fontSize: "12px", color: "#475569", marginBottom: "6px" }}>
												<strong>Goals:</strong> {char.goals.join("; ")}
											</div>
										)}
										{char.motivations && char.motivations.length > 0 && (
											<div style={{ fontSize: "12px", color: "#475569", marginBottom: "6px" }}>
												<strong>Motivations:</strong> {char.motivations.join("; ")}
											</div>
										)}
										{char.conflicts && char.conflicts.length > 0 && (
											<div style={{ fontSize: "12px", color: "#475569", marginBottom: "6px" }}>
												<strong>Conflicts:</strong> {char.conflicts.join("; ")}
											</div>
										)}
										{char.relationships && char.relationships.length > 0 && (
											<div style={{ fontSize: "12px", color: "#475569" }}>
												<strong>Relationships:</strong> {char.relationships.join("; ")}
											</div>
										)}
									</div>
								))}
							</div>
						)}
					</div>
				)}

				{/* 4. PLOT & STRUCTURE */}
				{activeTab === "plot" && (
					<div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
						<div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
							<h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
								Narrative Engine & Plot Progression
							</h3>
							<span style={{ fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "4px", backgroundColor: "#f1f5f9", color: "#334155" }}>
								Structure: {analysis.plotStructure?.structureType || "Linear"}
							</span>
						</div>

						{/* Main Conflict breakdown */}
						{analysis.mainConflict && (
							<div style={{ padding: "16px", borderRadius: "8px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
								<div style={{ fontWeight: 700, color: "#0f172a", fontSize: "13.5px", marginBottom: "8px" }}>
									Central Dramatic Conflict
								</div>
								<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px", fontSize: "12.5px" }}>
									<div><strong>Central Problem:</strong> {analysis.mainConflict.centralProblem || "Unstated"}</div>
									<div><strong>Antagonistic Forces:</strong> {analysis.mainConflict.antagonisticForces || "None specified"}</div>
									<div><strong>Internal Conflict:</strong> {analysis.mainConflict.internalConflict || "None specified"}</div>
									<div><strong>External Conflict:</strong> {analysis.mainConflict.externalConflict || "None specified"}</div>
								</div>
							</div>
						)}

						{/* Plot Beats */}
						<div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
							{analysis.plotStructure?.beginning && (
								<div style={{ padding: "12px 14px", borderRadius: "8px", border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
									<span style={{ fontWeight: 700, fontSize: "13px", color: "#0f172a" }}>Beginning / Setup:</span>
									<p style={{ margin: "4px 0 0", fontSize: "13px", color: "#334155", lineHeight: "1.5" }}>{analysis.plotStructure.beginning}</p>
								</div>
							)}
							{analysis.plotStructure?.development && (
								<div style={{ padding: "12px 14px", borderRadius: "8px", border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
									<span style={{ fontWeight: 700, fontSize: "13px", color: "#0f172a" }}>Development / Rising Stakes:</span>
									<p style={{ margin: "4px 0 0", fontSize: "13px", color: "#334155", lineHeight: "1.5" }}>{analysis.plotStructure.development}</p>
								</div>
							)}
							{analysis.plotStructure?.climax && (
								<div style={{ padding: "12px 14px", borderRadius: "8px", border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
									<span style={{ fontWeight: 700, fontSize: "13px", color: "#0f172a" }}>Climax / Turning Crisis:</span>
									<p style={{ margin: "4px 0 0", fontSize: "13px", color: "#334155", lineHeight: "1.5" }}>{analysis.plotStructure.climax}</p>
								</div>
							)}
							{analysis.plotStructure?.resolution && (
								<div style={{ padding: "12px 14px", borderRadius: "8px", border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
									<span style={{ fontWeight: 700, fontSize: "13px", color: "#0f172a" }}>Resolution / Aftermath:</span>
									<p style={{ margin: "4px 0 0", fontSize: "13px", color: "#334155", lineHeight: "1.5" }}>{analysis.plotStructure.resolution}</p>
								</div>
							)}
						</div>
					</div>
				)}

				{/* 5. CHARACTER ARCS */}
				{activeTab === "arcs" && (
					<div>
						<h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", marginBottom: "14px" }}>
							Character Arc Transformations ({analysis.characterArcs?.length || 0})
						</h3>
						{(!analysis.characterArcs || analysis.characterArcs.length === 0) ? (
							<p style={{ color: "#64748b", fontSize: "13px" }}>No distinct character transformations were detected in this material.</p>
						) : (
							<div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
								{analysis.characterArcs.map((arc, idx) => (
									<div key={idx} style={{ padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
										<div style={{ fontWeight: 700, fontSize: "14px", color: "#0f172a", marginBottom: "8px" }}>
											{arc.character}
										</div>
										<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", fontSize: "12.5px" }}>
											<div style={{ padding: "8px 10px", borderRadius: "6px", backgroundColor: "#f8fafc" }}>
												<span style={{ fontWeight: 600, color: "#64748b", display: "block", marginBottom: "2px" }}>Starting State:</span>
												<span style={{ color: "#1e293b" }}>{arc.startingState || "Unspecified"}</span>
											</div>
											<div style={{ padding: "8px 10px", borderRadius: "6px", backgroundColor: "#fef3c7" }}>
												<span style={{ fontWeight: 600, color: "#92400e", display: "block", marginBottom: "2px" }}>Pivotal Shift:</span>
												<span style={{ color: "#78350f" }}>{arc.shift || "Unspecified"}</span>
											</div>
											<div style={{ padding: "8px 10px", borderRadius: "6px", backgroundColor: "#ecfdf5" }}>
												<span style={{ fontWeight: 600, color: "#065f46", display: "block", marginBottom: "2px" }}>Outcome:</span>
												<span style={{ color: "#064e3b" }}>{arc.outcome || "Unspecified"}</span>
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				)}

				{/* 6. SETTING */}
				{activeTab === "setting" && (
					<div>
						<h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", marginBottom: "14px" }}>
							Settings & World Building ({analysis.setting?.length || 0})
						</h3>
						{(!analysis.setting || analysis.setting.length === 0) ? (
							<p style={{ color: "#64748b", fontSize: "13px" }}>No specific geographic locations or settings were extracted.</p>
						) : (
							<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "14px" }}>
								{analysis.setting.map((st, idx) => (
									<div key={idx} style={{ padding: "14px", borderRadius: "8px", border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
										<div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 700, color: "#0f172a", fontSize: "14px" }}>
											<FiMapPin size={14} color="#d97706" />
											<span>{st.location}</span>
										</div>
										{st.timePeriod && (
											<div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
												Era: {st.timePeriod}
											</div>
										)}
										{st.description && (
											<p style={{ fontSize: "12.5px", color: "#334155", margin: "6px 0 0", lineHeight: "1.5" }}>
												{st.description}
											</p>
										)}
									</div>
								))}
							</div>
						)}
					</div>
				)}

				{/* 7. CRITIQUE & GUIDANCE */}
				{activeTab === "critique" && (
					<div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
						{/* Strengths */}
						<div>
							<h3 style={{ fontSize: "15px", fontWeight: 700, color: "#059669", display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
								<FiCheckCircle size={16} />
								<span>Core Narrative Strengths ({analysis.strengths?.length || 0})</span>
							</h3>
							<ul style={{ margin: 0, paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
								{analysis.strengths?.map((s, idx) => (
									<li key={idx} style={{ fontSize: "13px", color: "#334155", lineHeight: "1.5" }}>{s}</li>
								))}
							</ul>
						</div>

						{/* Weaknesses */}
						<div>
							<h3 style={{ fontSize: "15px", fontWeight: 700, color: "#d97706", display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
								<FiAlertTriangle size={16} />
								<span>Weaknesses & Narrative Gaps ({analysis.weaknesses?.length || 0})</span>
							</h3>
							<ul style={{ margin: 0, paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
								{analysis.weaknesses?.map((w, idx) => (
									<li key={idx} style={{ fontSize: "13px", color: "#334155", lineHeight: "1.5" }}>{w}</li>
								))}
							</ul>
						</div>

						{/* Continuity Issues */}
						{analysis.continuityIssues && analysis.continuityIssues.length > 0 && (
							<div>
								<h3 style={{ fontSize: "15px", fontWeight: 700, color: "#dc2626", display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
									<FiAlertTriangle size={16} />
									<span>Continuity & Inconsistencies ({analysis.continuityIssues.length})</span>
								</h3>
								<ul style={{ margin: 0, paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
									{analysis.continuityIssues.map((c, idx) => (
										<li key={idx} style={{ fontSize: "13px", color: "#334155", lineHeight: "1.5" }}>{c}</li>
									))}
								</ul>
							</div>
						)}

						{/* Development Opportunities */}
						<div>
							<h3 style={{ fontSize: "15px", fontWeight: 700, color: "#2563eb", display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
								<FiTrendingUp size={16} />
								<span>Future Development Opportunities ({analysis.developmentOpportunities?.length || 0})</span>
							</h3>
							<ul style={{ margin: 0, paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
								{analysis.developmentOpportunities?.map((d, idx) => (
									<li key={idx} style={{ fontSize: "13px", color: "#334155", lineHeight: "1.5" }}>{d}</li>
								))}
							</ul>
						</div>

						{/* Missing Information */}
						{analysis.missingInformation && analysis.missingInformation.length > 0 && (
							<div>
								<h3 style={{ fontSize: "15px", fontWeight: 700, color: "#7c3aed", display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
									<span>Missing Narrative Information ({analysis.missingInformation.length})</span>
								</h3>
								<ul style={{ margin: 0, paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
									{analysis.missingInformation.map((m, idx) => (
										<li key={idx} style={{ fontSize: "13px", color: "#334155", lineHeight: "1.5" }}>{m}</li>
									))}
								</ul>
							</div>
						)}
					</div>
				)}

				{/* 8. PROCESSING INFO */}
				{activeTab === "processing" && (
					<div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
						<h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>
							Processing & Metadata
						</h3>
						<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
							<div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
								<span style={{ fontSize: "11px", color: "#64748b" }}>Analysis ID</span>
								<div style={{ fontSize: "12px", fontFamily: "monospace", color: "#0f172a", marginTop: "2px" }}>
									{analysis.analysisId}
								</div>
							</div>
							<div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
								<span style={{ fontSize: "11px", color: "#64748b" }}>Chunks Processed</span>
								<div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", marginTop: "2px" }}>
									{analysis.processing?.chunksProcessed || 1} / {analysis.processing?.totalChunks || 1}
								</div>
							</div>
							<div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
								<span style={{ fontSize: "11px", color: "#64748b" }}>Estimated Tokens</span>
								<div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", marginTop: "2px" }}>
									{analysis.processing?.estimatedTokens?.toLocaleString() || "N/A"}
								</div>
							</div>
							<div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
								<span style={{ fontSize: "11px", color: "#64748b" }}>Analysis Duration</span>
								<div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", marginTop: "2px" }}>
									{analysis.processing?.durationMs ? `${(analysis.processing.durationMs / 1000).toFixed(1)}s` : "N/A"}
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

