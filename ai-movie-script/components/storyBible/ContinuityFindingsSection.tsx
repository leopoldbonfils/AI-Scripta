"use client";

import React, { useState } from "react";
import {
	ContinuityFinding,
	ContinuityStatus,
	ContinuityClassification,
} from "../../types/storyBible";
import { FiAlertTriangle, FiCheck, FiX, FiEyeOff, FiRefreshCw } from "react-icons/fi";

export interface ContinuityFindingsSectionProps {
	findings: ContinuityFinding[];
	onAnalyze: () => Promise<any>;
	onUpdateFinding: (
		findingId: string,
		status: ContinuityStatus,
		note?: string,
		classification?: ContinuityClassification
	) => Promise<any>;
	isAnalyzing: boolean;
	isSaving: boolean;
}

export function ContinuityFindingsSection({
	findings,
	onAnalyze,
	onUpdateFinding,
	isAnalyzing,
	isSaving,
}: ContinuityFindingsSectionProps) {
	const [statusFilter, setStatusFilter] = useState("ALL");
	const [categoryFilter, setCategoryFilter] = useState("ALL");

	const filtered = findings.filter((f) => {
		const matchStatus = statusFilter === "ALL" || f.status === statusFilter;
		const matchCat = categoryFilter === "ALL" || f.category === categoryFilter;
		return matchStatus && matchCat;
	});

	const severityBadge = (sev: string) => {
		if (sev === "CRITICAL") return { bg: "#7f1d1d", color: "#ffffff" };
		if (sev === "HIGH") return { bg: "#fef2f2", color: "#b91c1c" };
		if (sev === "MEDIUM") return { bg: "#fffbeb", color: "#b45309" };
		return { bg: "#eff6ff", color: "#1e40af" };
	};

	const classBadge = (cls: string) => {
		if (cls === "CONFIRMED_CONTRADICTION") return { label: "Confirmed Contradiction", bg: "#fee2e2", color: "#991b1b" };
		if (cls === "INTENTIONAL_MYSTERY") return { label: "Intentional Mystery", bg: "#f3e8ff", color: "#6b21a8" };
		if (cls === "UNEXPLAINED_CHOICE") return { label: "Unexplained Choice", bg: "#e0f2fe", color: "#0369a1" };
		return { label: "Possible Inconsistency", bg: "#fef3c7", color: "#92400e" };
	};

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
			<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
				<div>
					<h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
						<FiAlertTriangle size={17} color="#d97706" /> Continuity Findings ({findings.length})
					</h3>
					<p style={{ margin: "2px 0 0", fontSize: "12.5px", color: "#64748b" }}>
						Separates confirmed contradictions from intentional mysteries. Never auto-rewrites your scenes.
					</p>
				</div>
				<button
					type="button"
					onClick={() => onAnalyze()}
					disabled={isAnalyzing}
					style={{
						display: "flex",
						alignItems: "center",
						gap: "6px",
						padding: "8px 16px",
						fontSize: "12.5px",
						fontWeight: 600,
						borderRadius: "6px",
						border: "none",
						backgroundColor: isAnalyzing ? "#cbd5e1" : "#d97706",
						color: "#ffffff",
						cursor: isAnalyzing ? "not-allowed" : "pointer",
					}}
				>
					<FiRefreshCw size={13} /> {isAnalyzing ? "Auditing Continuity..." : "Run Continuity Audit"}
				</button>
			</div>

			<div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
				<select
					value={statusFilter}
					onChange={(e) => setStatusFilter(e.target.value)}
					style={{ padding: "7px 12px", fontSize: "13px", border: "1px solid #cbd5e1", borderRadius: "6px", backgroundColor: "#fff" }}
				>
					<option value="ALL">All Statuses</option>
					<option value="PENDING">Pending Review</option>
					<option value="ACCEPTED">Tracked / Accepted</option>
					<option value="RESOLVED">Resolved</option>
					<option value="FALSE_POSITIVE">Intentional / False Positive</option>
					<option value="REJECTED">Dismissed</option>
				</select>
				<select
					value={categoryFilter}
					onChange={(e) => setCategoryFilter(e.target.value)}
					style={{ padding: "7px 12px", fontSize: "13px", border: "1px solid #cbd5e1", borderRadius: "6px", backgroundColor: "#fff" }}
				>
					<option value="ALL">All Categories</option>
					<option value="CHARACTER_CONTINUITY">Character Continuity</option>
					<option value="TIMELINE_CONTINUITY">Timeline Continuity</option>
					<option value="RELATIONSHIP_CONTINUITY">Relationship Continuity</option>
					<option value="LOCATION_CONTINUITY">Location Continuity</option>
					<option value="OBJECT_CONTINUITY">Object & Entity Continuity</option>
					<option value="STORY_LOGIC_CONTINUITY">Story Logic Continuity</option>
				</select>
			</div>

			{filtered.length === 0 ? (
				<div style={{ padding: "30px", textAlign: "center", color: "#64748b", background: "#f8fafc", borderRadius: "8px", border: "1px dashed #cbd5e1" }}>
					No continuity findings match the selected filters.
				</div>
			) : (
				<div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
					{filtered.map((f) => {
						const sev = severityBadge(f.severity);
						const cls = classBadge(f.classification);
						return (
							<div key={f.id} style={{ padding: "16px", backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "10px" }}>
								<div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap" }}>
									<div>
										<div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
											<span style={{ fontSize: "10.5px", fontWeight: 700, padding: "2px 7px", borderRadius: "4px", backgroundColor: sev.bg, color: sev.color }}>
												{f.severity}
											</span>
											<span style={{ fontSize: "10.5px", fontWeight: 700, padding: "2px 7px", borderRadius: "4px", backgroundColor: cls.bg, color: cls.color }}>
												{cls.label}
											</span>
											<span style={{ fontSize: "11px", fontWeight: 600, color: "#64748b" }}>
												{f.category.replace(/_/g, " ")} • {Math.round((f.confidenceScore ?? 0.8) * 100)}% Confidence
											</span>
										</div>
										<strong style={{ fontSize: "15px", color: "#0f172a" }}>{f.title}</strong>
									</div>

									<span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 9px", borderRadius: "10px", backgroundColor: f.status === "RESOLVED" ? "#ecfdf5" : "#f1f5f9", color: f.status === "RESOLVED" ? "#047857" : "#334155" }}>
										{f.status}
									</span>
								</div>

								<p style={{ margin: 0, fontSize: "13px", color: "#334155", lineHeight: "1.5" }}>{f.description}</p>

								{f.conflictingEntries && f.conflictingEntries.length > 0 && (
									<div style={{ fontSize: "12px", color: "#475569", backgroundColor: "#f8fafc", padding: "8px 10px", borderRadius: "6px" }}>
										<strong>Conflicting Entries:</strong> {f.conflictingEntries.join(" vs ")}
									</div>
								)}

								{f.supportingEvidence && (
									<div style={{ fontSize: "12px", color: "#64748b" }}>
										<strong>Supporting Evidence:</strong> {f.supportingEvidence}
									</div>
								)}

								{f.suggestedResolution && (
									<div style={{ fontSize: "12px", color: "#065f46", backgroundColor: "#ecfdf5", padding: "8px 10px", borderRadius: "6px" }}>
										<strong>Suggested Resolution:</strong> {f.suggestedResolution}
									</div>
								)}

								{/* Writer Resolution Controls */}
								<div style={{ display: "flex", gap: "8px", flexWrap: "wrap", paddingTop: "6px", borderTop: "1px solid #f1f5f9" }}>
									<button
										type="button"
										disabled={isSaving || f.status === "RESOLVED"}
										onClick={() => onUpdateFinding(f.id, "RESOLVED", "Marked resolved by writer")}
										style={{ display: "flex", alignItems: "center", gap: "4px", padding: "5px 10px", fontSize: "12px", fontWeight: 600, border: "none", borderRadius: "5px", backgroundColor: "#059669", color: "#fff", cursor: "pointer" }}
									>
										<FiCheck size={12} /> Resolve
									</button>
									<button
										type="button"
										disabled={isSaving || (f.status === "FALSE_POSITIVE" && f.classification === "INTENTIONAL_MYSTERY")}
										onClick={() =>
											onUpdateFinding(f.id, "FALSE_POSITIVE", "Marked intentional mystery by writer", "INTENTIONAL_MYSTERY")
										}
										style={{ display: "flex", alignItems: "center", gap: "4px", padding: "5px 10px", fontSize: "12px", fontWeight: 600, border: "1px solid #ddd6fe", borderRadius: "5px", backgroundColor: "#faf5ff", color: "#6b21a8", cursor: "pointer" }}
									>
										<FiEyeOff size={12} /> Mark Intentional Mystery
									</button>
									<button
										type="button"
										disabled={isSaving || f.status === "REJECTED"}
										onClick={() => onUpdateFinding(f.id, "REJECTED", "Dismissed by writer")}
										style={{ display: "flex", alignItems: "center", gap: "4px", padding: "5px 10px", fontSize: "12px", border: "1px solid #fca5a5", borderRadius: "5px", backgroundColor: "#fef2f2", color: "#b91c1c", cursor: "pointer" }}
									>
										<FiX size={12} /> Dismiss
									</button>
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}

