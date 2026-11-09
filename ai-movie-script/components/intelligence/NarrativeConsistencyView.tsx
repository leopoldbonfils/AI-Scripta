"use client";

import React from "react";
import { NarrativeConsistencyCheck } from "../../types/storyIntelligence";
import { FiRefreshCw, FiAlertTriangle, FiAlertOctagon, FiInfo, FiCheckSquare } from "react-icons/fi";

export interface NarrativeConsistencyViewProps {
	consistencyChecks: NarrativeConsistencyCheck[];
	onRegenerate: () => void;
	isRegenerating: boolean;
}

export function NarrativeConsistencyView({
	consistencyChecks,
	onRegenerate,
	isRegenerating,
}: NarrativeConsistencyViewProps) {
	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
			{/* Top Bar */}
			<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px" }}>
				<div>
					<h3 style={{ fontSize: "17px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
						Connected Story Intelligence & Consistency Audit
					</h3>
					<p style={{ fontSize: "12.5px", color: "#64748b", margin: "2px 0 0" }}>
						Cross-entity audit diagnosing out-of-character behavior, unearned shifts, dropped conflicts, and corrective remedies.
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
					<span>{isRegenerating ? "Regenerating..." : "Re-run Consistency Audit"}</span>
				</button>
			</div>

			{/* Consistency Checks List */}
			{consistencyChecks && consistencyChecks.length > 0 ? (
				<div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
					{consistencyChecks.map((check) => {
						const isHigh = check.severity === "HIGH";
						const isMed = check.severity === "MEDIUM";

						const severityStyle = isHigh
							? { bg: "#fef2f2", border: "#fecaca", text: "#b91c1c", badge: "#fee2e2", Icon: FiAlertOctagon }
							: isMed
							? { bg: "#fffbeb", border: "#fde68a", text: "#b45309", badge: "#fef3c7", Icon: FiAlertTriangle }
							: { bg: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8", badge: "#dbeafe", Icon: FiInfo };

						const SeverityIcon = severityStyle.Icon;

						return (
							<div
								key={check.id}
								style={{
									padding: "18px",
									backgroundColor: "#ffffff",
									border: "1px solid #e2e8f0",
									borderLeft: `4px solid ${severityStyle.text}`,
									borderRadius: "8px",
									display: "flex",
									flexDirection: "column",
									gap: "10px",
								}}
							>
								<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
									<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
										<SeverityIcon size={16} color={severityStyle.text} />
										<strong style={{ fontSize: "14px", color: "#0f172a" }}>{check.title}</strong>
										<span
											style={{
												fontSize: "11px",
												fontWeight: 700,
												textTransform: "uppercase",
												padding: "2px 8px",
												borderRadius: "4px",
												backgroundColor: severityStyle.badge,
												color: severityStyle.text,
											}}
										>
											{check.severity} Severity
										</span>
									</div>

									<span
										style={{
											fontSize: "11px",
											fontWeight: 600,
											color: "#64748b",
											padding: "2px 6px",
											borderRadius: "4px",
											backgroundColor: "#f1f5f9",
										}}
									>
										{check.checkType.replace(/_/g, " ")}
									</span>
								</div>

								<p style={{ margin: 0, fontSize: "13px", color: "#334155", lineHeight: "1.5" }}>
									{check.description}
								</p>

								{check.charactersInvolved && check.charactersInvolved.length > 0 && (
									<div style={{ fontSize: "12px", color: "#64748b" }}>
										<strong>Characters Involved:</strong> {check.charactersInvolved.join(", ")}
									</div>
								)}

								<div style={{ fontSize: "12px", color: "#64748b" }}>
									<strong>Dramatic Impact:</strong> {check.impactExplanation}
								</div>

								{/* Suggested Correction */}
								<div
									style={{
										marginTop: "4px",
										padding: "10px 12px",
										backgroundColor: "#f0fdf4",
										border: "1px solid #bbf7d0",
										borderRadius: "6px",
										fontSize: "12.5px",
										color: "#166534",
										display: "flex",
										alignItems: "flex-start",
										gap: "8px",
									}}
								>
									<FiCheckSquare size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
									<div>
										<strong>Suggested Creative Correction:</strong> {check.suggestedCorrection}
									</div>
								</div>
							</div>
						);
					})}
				</div>
			) : (
				<div style={{ padding: "30px", textAlign: "center", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", color: "#059669", fontWeight: 600 }}>
					✓ No narrative contradictions or character inconsistencies detected!
				</div>
			)}
		</div>
	);
}
