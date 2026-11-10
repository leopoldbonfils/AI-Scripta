"use client";

import React, { useState } from "react";
import { StoryBibleSceneConnection } from "../../types/storyBible";
import { EvidenceBadge } from "./EvidenceBadge";
import { FiLink } from "react-icons/fi";

export interface SceneConnectionsSectionProps {
	connections: StoryBibleSceneConnection[];
}

export function SceneConnectionsSection({ connections }: SceneConnectionsSectionProps) {
	const [search, setSearch] = useState("");

	const filtered = connections.filter(
		(c) =>
			!search.trim() ||
			`${c.sceneNumber} ${c.sceneTitle} ${c.locationName || ""} ${(c.charactersPresent || []).join(" ")}`
				.toLowerCase()
				.includes(search.toLowerCase())
	);

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
			<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
				<div>
					<h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
						<FiLink size={17} color="#d97706" /> Scene-to-Story Connections ({connections.length})
					</h3>
					<p style={{ margin: "2px 0 0", fontSize: "12.5px", color: "#64748b" }}>
						Links every scene to characters, decisions, consequences, relationship shifts, objects, and setup/payoff chains.
					</p>
				</div>
				<input
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					placeholder="Filter by scene, cast, location..."
					style={{ padding: "7px 12px", fontSize: "13px", border: "1px solid #cbd5e1", borderRadius: "6px", minWidth: "240px" }}
				/>
			</div>

			{filtered.length === 0 ? (
				<div style={{ padding: "30px", textAlign: "center", color: "#64748b", background: "#f8fafc", borderRadius: "8px", border: "1px dashed #cbd5e1" }}>
					No scene-to-story connections mapped yet.
				</div>
			) : (
				<div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
					{filtered.map((sc) => (
						<div key={sc.id} style={{ padding: "16px", backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "10px" }}>
							<div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
								<div>
									<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
										<span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", backgroundColor: "#0f172a", color: "#fff" }}>
											Scene {sc.sceneNumber}
										</span>
										<strong style={{ fontSize: "15px", color: "#0f172a" }}>{sc.sceneTitle}</strong>
									</div>
									<div style={{ fontSize: "12px", color: "#64748b", marginTop: "3px" }}>
										{sc.locationName || "Unspecified location"} {sc.narrativeTime ? `• ${sc.narrativeTime}` : ""}
									</div>
								</div>
								<EvidenceBadge level={sc.evidenceLevel} />
							</div>

							{sc.narrativeImpactSummary && (
								<p style={{ margin: 0, fontSize: "13px", color: "#334155", lineHeight: "1.5" }}>
									{sc.narrativeImpactSummary}
								</p>
							)}

							<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px", fontSize: "12px", backgroundColor: "#f8fafc", padding: "10px", borderRadius: "6px" }}>
								<div><strong>Cast Present:</strong> {(sc.charactersPresent || []).join(", ") || "—"}</div>
								<div><strong>Key Decisions:</strong> {(sc.characterDecisions || []).join("; ") || "—"}</div>
								<div><strong>Consequences:</strong> {(sc.consequences || []).join("; ") || "—"}</div>
								<div><strong>Arc / Relationship Shifts:</strong> {[...(sc.relationshipDevelopments || []), ...(sc.arcDevelopments || [])].join("; ") || "—"}</div>
							</div>

							{(sc.objectsIntroduced?.length > 0 || sc.objectsUsed?.length > 0 || sc.objectsTransferred?.length > 0 || sc.objectsLost?.length > 0) && (
								<div style={{ display: "flex", gap: "12px", flexWrap: "wrap", fontSize: "12px", color: "#475569" }}>
									{sc.objectsIntroduced?.length > 0 && <span><strong>Objects Introduced:</strong> {sc.objectsIntroduced.join(", ")}</span>}
									{sc.objectsUsed?.length > 0 && <span><strong>Used:</strong> {sc.objectsUsed.join(", ")}</span>}
									{sc.objectsTransferred?.length > 0 && <span><strong>Transferred:</strong> {sc.objectsTransferred.join(", ")}</span>}
									{sc.objectsLost?.length > 0 && <span style={{ color: "#b91c1c" }}><strong>Lost:</strong> {sc.objectsLost.join(", ")}</span>}
								</div>
							)}

							{((sc.setupPayoffLinks && sc.setupPayoffLinks.length > 0) || sc.previousDependencies?.length > 0 || sc.subsequentDependencies?.length > 0) && (
								<div style={{ fontSize: "12px", borderTop: "1px solid #f1f5f9", paddingTop: "8px", display: "flex", gap: "16px", flexWrap: "wrap", color: "#334155" }}>
									{sc.previousDependencies?.length > 0 && <span><strong>Depends On:</strong> {sc.previousDependencies.join(" • ")}</span>}
									{sc.subsequentDependencies?.length > 0 && <span><strong>Feeds Into:</strong> {sc.subsequentDependencies.join(" • ")}</span>}
									{sc.setupPayoffLinks?.map((sp, i) => (
										<span key={i} style={{ backgroundColor: "#eff6ff", color: "#1e40af", padding: "2px 7px", borderRadius: "4px" }}>
											{sp.type} {sp.targetSceneNumber ? `↔ Scene ${sp.targetSceneNumber}` : ""}: {sp.description}
										</span>
									))}
								</div>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	);
}

