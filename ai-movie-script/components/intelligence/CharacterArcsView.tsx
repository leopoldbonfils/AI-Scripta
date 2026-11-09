"use client";

import React, { useState } from "react";
import { CharacterArcDetail } from "../../types/storyIntelligence";
import { FiRefreshCw, FiTrendingUp, FiAlertCircle, FiRepeat } from "react-icons/fi";

export interface CharacterArcsViewProps {
	characterArcs: CharacterArcDetail[];
	onRegenerate: () => void;
	isRegenerating: boolean;
}

export function CharacterArcsView({
	characterArcs,
	onRegenerate,
	isRegenerating,
}: CharacterArcsViewProps) {
	const [showAltArc, setShowAltArc] = useState<Record<string, boolean>>({});

	const toggleAlt = (id: string) => {
		setShowAltArc((prev) => ({ ...prev, [id]: !prev[id] }));
	};

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
			{/* Top Bar */}
			<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px" }}>
				<div>
					<h3 style={{ fontSize: "17px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
						Character Arc Intelligence & Thematic Transformation
					</h3>
					<p style={{ fontSize: "12.5px", color: "#64748b", margin: "2px 0 0" }}>
						Worldview shifts, the central lie, turning points, moment of crisis, and thematic connection.
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
					<span>{isRegenerating ? "Regenerating..." : "Regenerate Arcs"}</span>
				</button>
			</div>

			{/* Arcs List */}
			<div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
				{characterArcs.map((arc) => {
					const hasAlt = !!arc.alternativeArc;
					const isAltActive = !!showAltArc[arc.characterId];

					return (
						<div
							key={arc.characterId}
							style={{
								backgroundColor: "#ffffff",
								border: "1px solid #e2e8f0",
								borderRadius: "10px",
								padding: "20px",
								display: "flex",
								flexDirection: "column",
								gap: "16px",
							}}
						>
							{/* Arc Header */}
							<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
								<div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
									<h4 style={{ fontSize: "17px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
										{arc.characterName}
									</h4>
									<span
										style={{
											fontSize: "11px",
											fontWeight: 700,
											textTransform: "uppercase",
											padding: "3px 8px",
											borderRadius: "4px",
											backgroundColor: "#eff6ff",
											color: "#1e40af",
											border: "1px solid #dbeafe",
										}}
									>
										{arc.arcType.replace(/_/g, " ")}
									</span>
								</div>

								{hasAlt && (
									<button
										type="button"
										onClick={() => toggleAlt(arc.characterId)}
										style={{
											display: "flex",
											alignItems: "center",
											gap: "6px",
											padding: "4px 10px",
											fontSize: "11.5px",
											fontWeight: 600,
											borderRadius: "6px",
											border: "1px solid #cbd5e1",
											backgroundColor: isAltActive ? "#fef3c7" : "#f8fafc",
											color: isAltActive ? "#92400e" : "#475569",
											cursor: "pointer",
										}}
									>
										<FiRepeat size={12} />
										<span>{isAltActive ? "View Primary Arc" : "Compare Alternative Arc"}</span>
									</button>
								)}
							</div>

							{!isAltActive ? (
								<>
									{/* Worldview & Lie */}
									<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
										<div style={{ padding: "12px", backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "8px" }}>
											<span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#92400e" }}>
												Starting State & Believed Lie
											</span>
											<p style={{ margin: "4px 0 0", fontSize: "12.5px", color: "#78350f" }}>
												{arc.initialBeliefLie}
											</p>
										</div>

										<div style={{ padding: "12px", backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: "8px" }}>
											<span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#065f46" }}>
												Final State & Realized Truth
											</span>
											<p style={{ margin: "4px 0 0", fontSize: "12.5px", color: "#047857" }}>
												{arc.finalState}
											</p>
										</div>
									</div>

									{/* Crisis & Transformation */}
									<div style={{ padding: "14px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
										<strong style={{ fontSize: "12px", textTransform: "uppercase", color: "#dc2626" }}>
											Moment of Crisis & Catalyst
										</strong>
										<p style={{ margin: "4px 0 8px", fontSize: "13px", color: "#0f172a" }}>
											{arc.momentOfCrisis}
										</p>

										<strong style={{ fontSize: "12px", textTransform: "uppercase", color: "#059669" }}>
											Transformation & Resolution
										</strong>
										<p style={{ margin: "4px 0 0", fontSize: "13px", color: "#0f172a" }}>
											{arc.transformationResolution}
										</p>
									</div>

									{/* Thematic Connection */}
									<div style={{ fontSize: "12px", color: "#64748b" }}>
										<strong>Thematic Alignment:</strong> {arc.thematicAlignment}
									</div>
								</>
							) : (
								/* Alternative Arc Proposal */
								<div style={{ padding: "14px", backgroundColor: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: "8px" }}>
									<div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
										<strong style={{ fontSize: "13px", color: "#6b21a8" }}>Alternative Arc Option:</strong>
										<span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 6px", borderRadius: "4px", backgroundColor: "#f3e8ff", color: "#7e22ce" }}>
											{arc.alternativeArc?.arcType.replace(/_/g, " ")}
										</span>
									</div>
									<p style={{ margin: "0 0 6px", fontSize: "13px", color: "#3b0764", lineHeight: "1.5" }}>
										{arc.alternativeArc?.description}
									</p>
									<p style={{ margin: 0, fontSize: "12px", color: "#7e22ce", fontStyle: "italic" }}>
										Rationale: {arc.alternativeArc?.rationale}
									</p>
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}
