"use client";

import React from "react";
import { CoreStoryDevelopment } from "../../types/storyIntelligence";
import { FiRefreshCw, FiCompass, FiTarget, FiAlertTriangle, FiTrendingUp } from "react-icons/fi";

export interface IntelligenceOverviewProps {
	storyDevelopment: CoreStoryDevelopment;
	onRegenerate: () => void;
	isRegenerating: boolean;
}

export function IntelligenceOverview({
	storyDevelopment,
	onRegenerate,
	isRegenerating,
}: IntelligenceOverviewProps) {
	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
			{/* Top Bar with Regeneration */}
			<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px" }}>
				<div>
					<h3 style={{ fontSize: "17px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
						Core Story Development & Concept Engine
					</h3>
					<p style={{ fontSize: "12.5px", color: "#64748b", margin: "2px 0 0" }}>
						Deep conceptual narrative architecture, dramatic questions, and potential expansion directions.
					</p>
				</div>

				<button
					type="button"
					onClick={onRegenerate}
					disabled={isRegenerating}
					style={{
						display: "flex",
						alignItems: "center",
						gap: "6px",
						padding: "6px 12px",
						fontSize: "12px",
						fontWeight: 600,
						border: "1px solid #cbd5e1",
						borderRadius: "6px",
						backgroundColor: "#ffffff",
						color: "#475569",
						cursor: isRegenerating ? "not-allowed" : "pointer",
					}}
				>
					<FiRefreshCw size={12} className={isRegenerating ? "animate-spin" : ""} />
					<span>{isRegenerating ? "Regenerating..." : "Regenerate Concept"}</span>
				</button>
			</div>

			{/* Refined Premise & Central Dramatic Question */}
			<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
				<div style={{ padding: "16px", borderRadius: "8px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
					<span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#d97706" }}>
						Refined Story Premise
					</span>
					<p style={{ fontSize: "13.5px", fontWeight: 600, color: "#0f172a", marginTop: "6px", lineHeight: "1.6" }}>
						{storyDevelopment.refinedPremise}
					</p>
				</div>

				<div style={{ padding: "16px", borderRadius: "8px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
					<span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#2563eb" }}>
						Central Dramatic Question
					</span>
					<p style={{ fontSize: "13.5px", fontWeight: 600, color: "#0f172a", marginTop: "6px", lineHeight: "1.6" }}>
						{storyDevelopment.centralDramaticQuestion}
					</p>
				</div>
			</div>

			{/* Expanded Concept */}
			<div>
				<h4 style={{ fontSize: "14px", fontWeight: 700, color: "#1e293b", marginBottom: "6px" }}>
					Expanded Narrative Concept
				</h4>
				<p style={{ fontSize: "13.5px", lineHeight: "1.7", color: "#334155", margin: 0, whiteSpace: "pre-wrap" }}>
					{storyDevelopment.expandedConcept}
				</p>
			</div>

			{/* Conflict, Theme & Stakes Grid */}
			<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px" }}>
				<div style={{ padding: "14px", borderRadius: "8px", backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
					<span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#64748b" }}>Main Conflict</span>
					<p style={{ fontSize: "13px", color: "#0f172a", marginTop: "4px", lineHeight: "1.5" }}>
						{storyDevelopment.mainConflict}
					</p>
				</div>

				<div style={{ padding: "14px", borderRadius: "8px", backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
					<span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#64748b" }}>Central Thematic Argument</span>
					<p style={{ fontSize: "13px", color: "#0f172a", marginTop: "4px", lineHeight: "1.5" }}>
						{storyDevelopment.centralTheme}
					</p>
				</div>

				<div style={{ padding: "14px", borderRadius: "8px", backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
					<span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#64748b" }}>Narrative Stakes</span>
					<p style={{ fontSize: "13px", color: "#0f172a", marginTop: "4px", lineHeight: "1.5" }}>
						{storyDevelopment.narrativeStakes}
					</p>
				</div>

				<div style={{ padding: "14px", borderRadius: "8px", backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
					<span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#64748b" }}>Antagonistic Forces</span>
					<p style={{ fontSize: "13px", color: "#0f172a", marginTop: "4px", lineHeight: "1.5" }}>
						{storyDevelopment.antagonisticForces}
					</p>
				</div>
			</div>

			{/* Protagonist Objective & Obstacles */}
			<div style={{ padding: "16px", borderRadius: "8px", backgroundColor: "#fefce8", border: "1px solid #fef08a" }}>
				<div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#854d0e", fontWeight: 700, fontSize: "13.5px", marginBottom: "8px" }}>
					<FiTarget size={16} />
					<span>Protagonist Objective: {storyDevelopment.protagonistObjective}</span>
				</div>

				{storyDevelopment.mainObstacles && storyDevelopment.mainObstacles.length > 0 && (
					<div>
						<span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#a16207" }}>Key Obstacles:</span>
						<ul style={{ margin: "4px 0 0", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "4px" }}>
							{storyDevelopment.mainObstacles.map((obs, idx) => (
								<li key={idx} style={{ fontSize: "12.5px", color: "#713f12" }}>{obs}</li>
							))}
						</ul>
					</div>
				)}
			</div>

			{/* Alternative Story Expansion Options */}
			{storyDevelopment.expansionOptions && storyDevelopment.expansionOptions.length > 0 && (
				<div>
					<h4 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
						<FiCompass size={16} />
						<span>Story Expansion Options ({storyDevelopment.expansionOptions.length})</span>
					</h4>

					<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
						{storyDevelopment.expansionOptions.map((opt) => (
							<div
								key={opt.id}
								style={{
									padding: "16px",
									borderRadius: "8px",
									backgroundColor: "#ffffff",
									border: "1px solid #e2e8f0",
									display: "flex",
									flexDirection: "column",
									gap: "10px",
								}}
							>
								<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
									<strong style={{ fontSize: "14px", color: "#0f172a" }}>{opt.name}</strong>
									<span
										style={{
											fontSize: "10.5px",
											fontWeight: 700,
											textTransform: "uppercase",
											padding: "2px 6px",
											borderRadius: "4px",
											backgroundColor: "#eff6ff",
											color: "#2563eb",
										}}
									>
										{opt.directionType.replace(/_/g, " ")}
									</span>
								</div>

								<p style={{ margin: 0, fontSize: "13px", color: "#334155", lineHeight: "1.5" }}>
									{opt.summary}
								</p>

								<div style={{ fontSize: "12px", color: "#64748b" }}>
									<strong>Proposed Changes:</strong> {opt.changes}
								</div>

								<div style={{ fontSize: "12px", color: "#64748b" }}>
									<strong>Rationale:</strong> {opt.rationale}
								</div>

								{/* Opportunities & Risks */}
								<div style={{ marginTop: "4px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
									<div style={{ padding: "8px", borderRadius: "6px", backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0" }}>
										<div style={{ fontSize: "11px", fontWeight: 700, color: "#065f46", display: "flex", alignItems: "center", gap: "4px" }}>
											<FiTrendingUp size={12} /> Opportunities
										</div>
										<ul style={{ margin: "4px 0 0", paddingLeft: "14px", fontSize: "11.5px", color: "#047857" }}>
											{opt.opportunities?.map((opp, idx) => (
												<li key={idx}>{opp}</li>
											))}
										</ul>
									</div>

									<div style={{ padding: "8px", borderRadius: "6px", backgroundColor: "#fffbeb", border: "1px solid #fde68a" }}>
										<div style={{ fontSize: "11px", fontWeight: 700, color: "#92400e", display: "flex", alignItems: "center", gap: "4px" }}>
											<FiAlertTriangle size={12} /> Narrative Risks
										</div>
										<ul style={{ margin: "4px 0 0", paddingLeft: "14px", fontSize: "11.5px", color: "#b45309" }}>
											{opt.risks?.map((risk, idx) => (
												<li key={idx}>{risk}</li>
											))}
										</ul>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
