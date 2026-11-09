"use client";

import React, { useState } from "react";
import { CharacterProfile } from "../../types/storyIntelligence";
import { FiRefreshCw, FiUser, FiHeart, FiActivity, FiArrowUpRight, FiShield } from "react-icons/fi";

export interface CharacterIntelligenceViewProps {
	characters: CharacterProfile[];
	selectedCharacterId: string | null;
	onSelectCharacter: (id: string) => void;
	onRegenerate: (characterName?: string) => void;
	isRegenerating: boolean;
}

export function CharacterIntelligenceView({
	characters,
	selectedCharacterId,
	onSelectCharacter,
	onRegenerate,
	isRegenerating,
}: CharacterIntelligenceViewProps) {
	const [activeSubTab, setActiveSubTab] = useState<"psychology" | "behavior" | "evolution" | "evidence">("psychology");

	const selectedChar =
		characters.find((c) => c.id === selectedCharacterId) || characters[0];

	if (!selectedChar) {
		return (
			<div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
				No character profiles generated.
			</div>
		);
	}

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
			{/* Top Bar */}
			<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px" }}>
				<div>
					<h3 style={{ fontSize: "17px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
						Character Intelligence & Psychological Architecture
					</h3>
					<p style={{ fontSize: "12.5px", color: "#64748b", margin: "2px 0 0" }}>
						Deep 360-degree profiles distinguishing source facts, analytical deductions, and creative proposals.
					</p>
				</div>

				<button
					type="button"
					onClick={() => onRegenerate(selectedChar.name)}
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
					<span>{isRegenerating ? "Regenerating..." : `Regenerate ${selectedChar.name}`}</span>
				</button>
			</div>

			{/* Character Selector Pills */}
			<div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "4px" }}>
				{characters.map((c) => {
					const isSelected = c.id === selectedChar.id;
					return (
						<button
							key={c.id}
							type="button"
							onClick={() => onSelectCharacter(c.id)}
							style={{
								padding: "8px 16px",
								borderRadius: "8px",
								border: isSelected ? "2px solid #d97706" : "1px solid #e2e8f0",
								backgroundColor: isSelected ? "#fef3c7" : "#ffffff",
								color: isSelected ? "#92400e" : "#475569",
								fontWeight: isSelected ? 700 : 500,
								fontSize: "13px",
								display: "flex",
								alignItems: "center",
								gap: "8px",
								cursor: "pointer",
								whiteSpace: "nowrap",
							}}
						>
							<FiUser size={14} />
							<span>{c.name}</span>
							<span style={{ fontSize: "11px", opacity: 0.8 }}>({c.role})</span>
						</button>
					);
				})}
			</div>

			{/* Selected Character Dossier */}
			<div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "20px" }}>
				{/* Identity Header */}
				<div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
					<div>
						<div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
							<h4 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
								{selectedChar.name}
							</h4>
							<span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", backgroundColor: "#f1f5f9", color: "#334155" }}>
								{selectedChar.role}
							</span>
							<span style={{ fontSize: "12px", color: "#64748b" }}>
								{selectedChar.characterType} {selectedChar.age ? `• Age ${selectedChar.age}` : ""}
							</span>
						</div>

						<p style={{ margin: "8px 0 0", fontSize: "13px", color: "#475569", lineHeight: "1.5" }}>
							{selectedChar.background}
						</p>

						{selectedChar.personality && selectedChar.personality.length > 0 && (
							<div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "10px" }}>
								{selectedChar.personality.map((trait, idx) => (
									<span
										key={idx}
										style={{
											fontSize: "11px",
											fontWeight: 600,
											padding: "2px 8px",
											borderRadius: "12px",
											backgroundColor: "#eff6ff",
											color: "#1e40af",
											border: "1px solid #dbeafe",
										}}
									>
										{trait}
									</span>
								))}
							</div>
						)}
					</div>
				</div>

				{/* Dossier Tabs */}
				<div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", marginBottom: "16px" }}>
					{[
						{ id: "psychology", label: "Psychology & Goals", icon: FiHeart },
						{ id: "behavior", label: "Behavior & Pressure", icon: FiActivity },
						{ id: "evolution", label: "Arc & Evolution", icon: FiArrowUpRight },
						{ id: "evidence", label: "Evidence Audit", icon: FiShield },
					].map((tab) => {
						const isActive = activeSubTab === tab.id;
						const Icon = tab.icon;
						return (
							<button
								key={tab.id}
								type="button"
								onClick={() => setActiveSubTab(tab.id as any)}
								style={{
									display: "flex",
									alignItems: "center",
									gap: "6px",
									padding: "10px 16px",
									fontSize: "12.5px",
									fontWeight: isActive ? 700 : 500,
									color: isActive ? "#d97706" : "#64748b",
									background: "transparent",
									border: "none",
									borderBottom: isActive ? "2px solid #d97706" : "2px solid transparent",
									cursor: "pointer",
								}}
							>
								<Icon size={14} />
								<span>{tab.label}</span>
							</button>
						);
					})}
				</div>

				{/* 1. Psychology Tab */}
				{activeSubTab === "psychology" && (
					<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
						<div style={{ padding: "14px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
							<span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#059669" }}>External Goal</span>
							<p style={{ margin: "4px 0 0", fontSize: "13px", color: "#0f172a", fontWeight: 600 }}>{selectedChar.psychology.externalGoal}</p>
						</div>

						<div style={{ padding: "14px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
							<span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#2563eb" }}>Internal Need</span>
							<p style={{ margin: "4px 0 0", fontSize: "13px", color: "#0f172a", fontWeight: 600 }}>{selectedChar.psychology.internalNeed}</p>
						</div>

						<div style={{ padding: "14px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
							<span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#dc2626" }}>Greatest Fear</span>
							<p style={{ margin: "4px 0 0", fontSize: "13px", color: "#0f172a" }}>{selectedChar.psychology.greatestFear}</p>
						</div>

						<div style={{ padding: "14px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
							<span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#7c3aed" }}>Emotional Wounds</span>
							<p style={{ margin: "4px 0 0", fontSize: "13px", color: "#0f172a" }}>{selectedChar.psychology.emotionalWounds}</p>
						</div>

						<div style={{ padding: "14px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", gridColumn: "1 / -1" }}>
							<span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#64748b" }}>Core Internal Conflict</span>
							<p style={{ margin: "4px 0 0", fontSize: "13px", color: "#0f172a" }}>{selectedChar.psychology.internalConflict}</p>
						</div>
					</div>
				)}

				{/* 2. Behavior Tab */}
				{activeSubTab === "behavior" && (
					<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
						<div style={{ padding: "14px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
							<span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#d97706" }}>Reaction to Pressure</span>
							<p style={{ margin: "4px 0 0", fontSize: "13px", color: "#0f172a" }}>{selectedChar.behavior.reactionToPressure}</p>
						</div>

						<div style={{ padding: "14px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
							<span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#0284c7" }}>Decision-Making Style</span>
							<p style={{ margin: "4px 0 0", fontSize: "13px", color: "#0f172a" }}>{selectedChar.behavior.decisionMakingStyle}</p>
						</div>

						<div style={{ padding: "14px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
							<span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#e11d48" }}>Vulnerabilities</span>
							<p style={{ margin: "4px 0 0", fontSize: "13px", color: "#0f172a" }}>{selectedChar.behavior.vulnerabilities}</p>
						</div>

						<div style={{ padding: "14px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
							<span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#059669" }}>Catalysts for Change</span>
							<p style={{ margin: "4px 0 0", fontSize: "13px", color: "#0f172a" }}>{selectedChar.behavior.catalystsForChange}</p>
						</div>
					</div>
				)}

				{/* 3. Evolution Tab */}
				{activeSubTab === "evolution" && (
					<div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
						<div style={{ padding: "14px", backgroundColor: "#fffbeb", borderRadius: "8px", border: "1px solid #fde68a" }}>
							<span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#92400e" }}>Starting Worldview</span>
							<p style={{ margin: "4px 0 0", fontSize: "13px", color: "#78350f" }}>{selectedChar.evolution.startingWorldview}</p>
						</div>

						<div style={{ padding: "14px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
							<span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#475569" }}>Transformations</span>
							<p style={{ margin: "4px 0 0", fontSize: "13px", color: "#0f172a" }}>{selectedChar.evolution.transformations}</p>
						</div>

						<div style={{ padding: "14px", backgroundColor: "#ecfdf5", borderRadius: "8px", border: "1px solid #a7f3d0" }}>
							<span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#065f46" }}>Final Psychological State</span>
							<p style={{ margin: "4px 0 0", fontSize: "13px", color: "#047857" }}>{selectedChar.evolution.finalState}</p>
						</div>
					</div>
				)}

				{/* 4. Evidence Classification Tab */}
				{activeSubTab === "evidence" && (
					<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px" }}>
						<div style={{ padding: "14px", backgroundColor: "#ecfdf5", borderRadius: "8px", border: "1px solid #a7f3d0" }}>
							<strong style={{ fontSize: "12px", color: "#065f46" }}>Explicit Source Facts</strong>
							<ul style={{ margin: "6px 0 0", paddingLeft: "16px", fontSize: "12px", color: "#047857" }}>
								{selectedChar.evidenceClassification?.explicitSourceFacts?.map((fact, idx) => (
									<li key={idx}>{fact}</li>
								))}
							</ul>
						</div>

						<div style={{ padding: "14px", backgroundColor: "#eff6ff", borderRadius: "8px", border: "1px solid #bfdbfe" }}>
							<strong style={{ fontSize: "12px", color: "#1e40af" }}>Analytical Interpretations</strong>
							<ul style={{ margin: "6px 0 0", paddingLeft: "16px", fontSize: "12px", color: "#1d4ed8" }}>
								{selectedChar.evidenceClassification?.interpretations?.map((item, idx) => (
									<li key={idx}>{item}</li>
								))}
							</ul>
						</div>

						<div style={{ padding: "14px", backgroundColor: "#faf5ff", borderRadius: "8px", border: "1px solid #e9d5ff" }}>
							<strong style={{ fontSize: "12px", color: "#6b21a8" }}>Proposed Developments</strong>
							<ul style={{ margin: "6px 0 0", paddingLeft: "16px", fontSize: "12px", color: "#7e22ce" }}>
								{selectedChar.evidenceClassification?.proposedDevelopments?.map((prop, idx) => (
									<li key={idx}>{prop}</li>
								))}
							</ul>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
