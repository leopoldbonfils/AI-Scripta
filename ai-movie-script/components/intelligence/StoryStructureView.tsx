"use client";

import React from "react";
import { StoryStructureDetail } from "../../types/storyIntelligence";
import { FiRefreshCw, FiLayers, FiArrowRight, FiAlertTriangle, FiCheckCircle } from "react-icons/fi";

export interface StoryStructureViewProps {
	storyStructure: StoryStructureDetail;
	onRegenerate: () => void;
	isRegenerating: boolean;
}

export function StoryStructureView({
	storyStructure,
	onRegenerate,
	isRegenerating,
}: StoryStructureViewProps) {
	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
			{/* Top Bar */}
			<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px" }}>
				<div>
					<h3 style={{ fontSize: "17px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
						Story Structure & Dramatic Pacing Architecture
					</h3>
					<p style={{ fontSize: "12.5px", color: "#64748b", margin: "2px 0 0" }}>
						Adaptive narrative framework, beat-by-beat causal progression, and pacing evaluation.
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
					<span>{isRegenerating ? "Regenerating..." : "Regenerate Structure"}</span>
				</button>
			</div>

			{/* Framework & Pacing Summary */}
			<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "14px" }}>
				<div style={{ padding: "16px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
					<div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
						<span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#d97706" }}>
							Selected Framework
						</span>
						<span style={{ fontSize: "12px", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", backgroundColor: "#fef3c7", color: "#92400e" }}>
							{storyStructure.framework.replace(/_/g, " ")}
						</span>
					</div>
					<p style={{ margin: "6px 0 0", fontSize: "13px", color: "#334155", lineHeight: "1.5" }}>
						{storyStructure.frameworkExplanation}
					</p>
				</div>

				<div style={{ padding: "16px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
					<span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#2563eb" }}>
						Pacing Assessment
					</span>
					<p style={{ margin: "6px 0 0", fontSize: "13px", color: "#334155", lineHeight: "1.5" }}>
						{storyStructure.pacingAssessment}
					</p>
				</div>
			</div>

			{/* Beats Timeline */}
			<div>
				<h4 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", marginBottom: "12px" }}>
					Dramatic Beats & Causal Progression ({storyStructure.beats.length})
				</h4>

				<div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
					{storyStructure.beats.map((beat, idx) => (
						<div
							key={beat.id}
							style={{
								padding: "16px",
								backgroundColor: "#ffffff",
								border: "1px solid #e2e8f0",
								borderRadius: "8px",
								display: "flex",
								flexDirection: "column",
								gap: "8px",
							}}
						>
							<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
								<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
									<span style={{ fontSize: "12px", fontWeight: 700, color: "#64748b" }}>#{idx + 1}</span>
									<strong style={{ fontSize: "14px", color: "#0f172a" }}>{beat.beatName}</strong>
									<span style={{ fontSize: "11px", fontWeight: 600, padding: "2px 6px", borderRadius: "4px", backgroundColor: "#f1f5f9", color: "#475569" }}>
										{beat.actOrPhase}
									</span>
								</div>

								{beat.charactersInvolved && beat.charactersInvolved.length > 0 && (
									<div style={{ fontSize: "11.5px", color: "#64748b" }}>
										Characters: {beat.charactersInvolved.join(", ")}
									</div>
								)}
							</div>

							<p style={{ margin: 0, fontSize: "13px", color: "#334155", lineHeight: "1.5" }}>
								{beat.summary}
							</p>

							<div style={{ fontSize: "12px", color: "#475569" }}>
								<strong>Dramatic Significance:</strong> {beat.dramaticSignificance}
							</div>

							{/* Causal Links */}
							<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "4px", padding: "8px", backgroundColor: "#f8fafc", borderRadius: "6px" }}>
								<div style={{ fontSize: "11.5px", color: "#64748b" }}>
									<strong>Leading From:</strong> {beat.leadingFrom}
								</div>
								<div style={{ fontSize: "11.5px", color: "#64748b" }}>
									<strong>Influencing:</strong> {beat.influencing}
								</div>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Recommendations & Gaps */}
			<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px" }}>
				{storyStructure.missingTransitions && storyStructure.missingTransitions.length > 0 && (
					<div style={{ padding: "14px", backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "8px" }}>
						<div style={{ fontSize: "12px", fontWeight: 700, color: "#92400e", display: "flex", alignItems: "center", gap: "6px" }}>
							<FiAlertTriangle size={14} /> Missing Transitions ({storyStructure.missingTransitions.length})
						</div>
						<ul style={{ margin: "6px 0 0", paddingLeft: "16px", fontSize: "12px", color: "#b45309" }}>
							{storyStructure.missingTransitions.map((t, idx) => (
								<li key={idx}>{t}</li>
							))}
						</ul>
					</div>
				)}

				{storyStructure.recommendedImprovements && storyStructure.recommendedImprovements.length > 0 && (
					<div style={{ padding: "14px", backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: "8px" }}>
						<div style={{ fontSize: "12px", fontWeight: 700, color: "#065f46", display: "flex", alignItems: "center", gap: "6px" }}>
							<FiCheckCircle size={14} /> Structural Recommendations ({storyStructure.recommendedImprovements.length})
						</div>
						<ul style={{ margin: "6px 0 0", paddingLeft: "16px", fontSize: "12px", color: "#047857" }}>
							{storyStructure.recommendedImprovements.map((r, idx) => (
								<li key={idx}>{r}</li>
							))}
						</ul>
					</div>
				)}
			</div>
		</div>
	);
}
