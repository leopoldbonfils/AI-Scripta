"use client";

import React from "react";
import { CharacterRelationshipDetail } from "../../types/storyIntelligence";
import { FiRefreshCw, FiUsers, FiArrowRight, FiShield, FiAlertTriangle } from "react-icons/fi";

export interface RelationshipNetworkViewProps {
	relationships: CharacterRelationshipDetail[];
	onRegenerate: () => void;
	isRegenerating: boolean;
}

export function RelationshipNetworkView({
	relationships,
	onRegenerate,
	isRegenerating,
}: RelationshipNetworkViewProps) {
	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
			{/* Top Bar */}
			<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px" }}>
				<div>
					<h3 style={{ fontSize: "17px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
						Character Relationship Intelligence & Dynamics
					</h3>
					<p style={{ fontSize: "12.5px", color: "#64748b", margin: "2px 0 0" }}>
						Pairwise dynamic tension, trust scores, reciprocal demands, and event-driven evolution.
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
					<span>{isRegenerating ? "Regenerating..." : "Regenerate Relationships"}</span>
				</button>
			</div>

			{/* Relationships Grid */}
			<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "16px" }}>
				{relationships.map((rel) => (
					<div
						key={rel.id}
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
						{/* Header: Pair & Type */}
						<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
							<div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
								<span>{rel.characterA}</span>
								<FiArrowRight size={14} color="#94a3b8" />
								<span>{rel.characterB}</span>
							</div>

							<span
								style={{
									fontSize: "11px",
									fontWeight: 700,
									textTransform: "uppercase",
									padding: "2px 8px",
									borderRadius: "4px",
									backgroundColor: "#f1f5f9",
									color: "#334155",
								}}
							>
								{rel.relationshipType}
							</span>
						</div>

						{/* Relationship History */}
						{rel.history && (
							<p style={{ margin: 0, fontSize: "12.5px", color: "#475569", lineHeight: "1.5" }}>
								{rel.history}
							</p>
						)}

						{/* Reciprocal Wants */}
						<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", padding: "10px", backgroundColor: "#f8fafc", borderRadius: "8px" }}>
							<div>
								<span style={{ fontSize: "10.5px", fontWeight: 700, textTransform: "uppercase", color: "#64748b" }}>
									{rel.characterA} wants:
								</span>
								<p style={{ margin: "2px 0 0", fontSize: "12px", color: "#0f172a" }}>
									{rel.characterAWantsFromB || "Unstated"}
								</p>
							</div>

							<div>
								<span style={{ fontSize: "10.5px", fontWeight: 700, textTransform: "uppercase", color: "#64748b" }}>
									{rel.characterB} wants:
								</span>
								<p style={{ margin: "2px 0 0", fontSize: "12px", color: "#0f172a" }}>
									{rel.characterBWantsFromA || "Unstated"}
								</p>
							</div>
						</div>

						{/* Trust & Tension Meters */}
						<div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
							<div>
								<div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: 600, color: "#059669", marginBottom: "3px" }}>
									<span>Trust Level</span>
									<span>{rel.trustLevel} / 10</span>
								</div>
								<div style={{ height: "6px", width: "100%", backgroundColor: "#e2e8f0", borderRadius: "3px", overflow: "hidden" }}>
									<div style={{ height: "100%", width: `${rel.trustLevel * 10}%`, backgroundColor: "#059669", borderRadius: "3px" }} />
								</div>
							</div>

							<div>
								<div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: 600, color: "#dc2626", marginBottom: "3px" }}>
									<span>Tension Level</span>
									<span>{rel.tensionLevel} / 10</span>
								</div>
								<div style={{ height: "6px", width: "100%", backgroundColor: "#e2e8f0", borderRadius: "3px", overflow: "hidden" }}>
									<div style={{ height: "100%", width: `${rel.tensionLevel * 10}%`, backgroundColor: "#dc2626", borderRadius: "3px" }} />
								</div>
							</div>
						</div>

						{/* Power Dynamics & Trajectory */}
						<div style={{ fontSize: "12px", color: "#475569", display: "flex", flexDirection: "column", gap: "4px" }}>
							<div><strong>Power Dynamics:</strong> {rel.powerDynamics}</div>
							<div><strong>Evolution:</strong> {rel.evolutionTrajectory}</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
