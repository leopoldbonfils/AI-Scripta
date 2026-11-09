"use client";

import React from "react";
import { CharacterMotivationDetail } from "../../types/storyIntelligence";
import { FiRefreshCw, FiZap, FiAlertCircle, FiArrowRight } from "react-icons/fi";

export interface MotivationsMatrixViewProps {
	motivations: CharacterMotivationDetail[];
	onRegenerate: () => void;
	isRegenerating: boolean;
}

export function MotivationsMatrixView({
	motivations,
	onRegenerate,
	isRegenerating,
}: MotivationsMatrixViewProps) {
	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
			{/* Top Bar */}
			<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px" }}>
				<div>
					<h3 style={{ fontSize: "17px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
						Character Motivation Engine & Conflict Matrix
					</h3>
					<p style={{ fontSize: "12.5px", color: "#64748b", margin: "2px 0 0" }}>
						Wants vs. needs, sacrifice thresholds, moral dilemmas, and inter-character clashes.
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
					<span>{isRegenerating ? "Regenerating..." : "Regenerate Motivations"}</span>
				</button>
			</div>

			{/* Motivations Cards */}
			<div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
				{motivations.map((m) => (
					<div
						key={m.characterId}
						style={{
							backgroundColor: "#ffffff",
							border: "1px solid #e2e8f0",
							borderRadius: "10px",
							padding: "18px",
							display: "flex",
							flexDirection: "column",
							gap: "14px",
						}}
					>
						<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
							<h4 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
								{m.characterName}
							</h4>
						</div>

						{/* Goal vs Need */}
						<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
							<div style={{ padding: "12px", backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: "8px" }}>
								<span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#065f46" }}>
									Stated External Goal (What they WANT)
								</span>
								<p style={{ margin: "4px 0 0", fontSize: "13px", fontWeight: 600, color: "#047857" }}>
									{m.explicitGoal}
								</p>
							</div>

							<div style={{ padding: "12px", backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "8px" }}>
								<span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#1e40af" }}>
									Psychological Need (What they NEED)
								</span>
								<p style={{ margin: "4px 0 0", fontSize: "13px", fontWeight: 600, color: "#1d4ed8" }}>
									{m.underlyingNeed}
								</p>
							</div>
						</div>

						{/* Dilemma, Fear & Sacrifice */}
						<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px" }}>
							<div style={{ padding: "10px 12px", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
								<span style={{ fontSize: "11px", fontWeight: 600, color: "#64748b" }}>Root Driving Reason:</span>
								<p style={{ margin: "2px 0 0", fontSize: "12.5px", color: "#1e293b" }}>{m.rootReason}</p>
							</div>

							<div style={{ padding: "10px 12px", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
								<span style={{ fontSize: "11px", fontWeight: 600, color: "#64748b" }}>Fear of Loss:</span>
								<p style={{ margin: "2px 0 0", fontSize: "12.5px", color: "#dc2626" }}>{m.fearOfLoss}</p>
							</div>

							<div style={{ padding: "10px 12px", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
								<span style={{ fontSize: "11px", fontWeight: 600, color: "#64748b" }}>Sacrifice Threshold:</span>
								<p style={{ margin: "2px 0 0", fontSize: "12.5px", color: "#1e293b" }}>{m.sacrificeThreshold}</p>
							</div>

							<div style={{ padding: "10px 12px", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
								<span style={{ fontSize: "11px", fontWeight: 600, color: "#64748b" }}>Moral / Emotional Dilemma:</span>
								<p style={{ margin: "2px 0 0", fontSize: "12.5px", color: "#1e293b" }}>{m.moralEmotionalDilemma}</p>
							</div>
						</div>

						{/* Inter-Character Clashes */}
						{m.interCharacterClashes && m.interCharacterClashes.length > 0 && (
							<div style={{ marginTop: "4px" }}>
								<span style={{ fontSize: "11.5px", fontWeight: 700, textTransform: "uppercase", color: "#475569" }}>
									Active Inter-Character Clashes
								</span>
								<div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "6px" }}>
									{m.interCharacterClashes.map((clash, idx) => (
										<div
											key={idx}
											style={{
												padding: "8px 12px",
												backgroundColor: "#fff1f2",
												border: "1px solid #fecdd3",
												borderRadius: "6px",
												fontSize: "12px",
												display: "flex",
												alignItems: "center",
												gap: "8px",
											}}
										>
											<FiZap size={14} color="#e11d48" />
											<strong>vs. {clash.opposingCharacterName}:</strong>
											<span style={{ color: "#9f1239" }}>{clash.conflictReason}</span>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
}
