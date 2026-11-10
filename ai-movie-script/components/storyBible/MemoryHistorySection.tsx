"use client";

import React, { useState } from "react";
import { MemoryUpdateProposal, StoryBibleVersion } from "../../types/storyBible";
import { EvidenceBadge } from "./EvidenceBadge";
import { FiClock, FiCheck, FiX, FiRotateCcw, FiEdit2 } from "react-icons/fi";

export interface MemoryHistorySectionProps {
	proposals: MemoryUpdateProposal[];
	versions: StoryBibleVersion[];
	onReviewProposal: (
		proposalId: string,
		status: "ACCEPTED" | "REJECTED",
		editedValue?: Record<string, any>,
		changeReason?: string
	) => Promise<any>;
	onRestoreVersion: (versionId: string, reason?: string) => Promise<any>;
	isSaving: boolean;
}

export function MemoryHistorySection({
	proposals,
	versions,
	onReviewProposal,
	onRestoreVersion,
	isSaving,
}: MemoryHistorySectionProps) {
	const [editingProposalId, setEditingProposalId] = useState<string | null>(null);
	const [editJsonDraft, setEditJsonDraft] = useState("");
	const [jsonError, setJsonError] = useState<string | null>(null);

	const pendingProposals = proposals.filter((p) => p.status === "PENDING");
	const reviewedProposals = proposals.filter((p) => p.status !== "PENDING");

	const startEditing = (p: MemoryUpdateProposal) => {
		setEditingProposalId(p.id);
		setEditJsonDraft(JSON.stringify(p.proposedValue, null, 2));
		setJsonError(null);
	};

	const submitEdit = async (p: MemoryUpdateProposal) => {
		try {
			const parsed = JSON.parse(editJsonDraft);
			setJsonError(null);
			await onReviewProposal(p.id, "ACCEPTED", parsed, `Writer edited & accepted: ${p.targetLabel}`);
			setEditingProposalId(null);
		} catch {
			setJsonError("Invalid JSON syntax. Please provide valid JSON before saving.");
		}
	};

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
			{/* 1. Pending Memory Update Proposals */}
			<div>
				<h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "#0f172a" }}>
					Proposed Narrative Memory Updates ({pendingProposals.length} Pending)
				</h3>
				<p style={{ margin: "2px 0 12px", fontSize: "12.5px", color: "#64748b" }}>
					Changes detected in characters, story, or scenes require your explicit approval before updating persistent Story Bible memory.
				</p>

				{pendingProposals.length === 0 ? (
					<div style={{ padding: "20px", textAlign: "center", color: "#64748b", background: "#f8fafc", borderRadius: "8px", border: "1px dashed #cbd5e1", fontSize: "13px" }}>
						No pending memory update proposals.
					</div>
				) : (
					<div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
						{pendingProposals.map((p) => (
							<div key={p.id} style={{ padding: "16px", backgroundColor: "#fffbeb", borderRadius: "8px", border: "1px solid #fde68a", display: "flex", flexDirection: "column", gap: "10px" }}>
								<div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap" }}>
									<div>
										<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
											<span style={{ fontSize: "10.5px", fontWeight: 700, padding: "2px 6px", borderRadius: "4px", backgroundColor: "#d97706", color: "#fff" }}>
												{p.proposedAction} • {p.targetType}
											</span>
											<EvidenceBadge level={p.evidenceLevel} />
										</div>
										<strong style={{ display: "block", marginTop: "4px", fontSize: "14.5px", color: "#0f172a" }}>
											{p.targetLabel}
										</strong>
										<div style={{ fontSize: "12px", color: "#78350f", marginTop: "2px" }}>
											Reason: {p.changeReason}
										</div>
									</div>

									<div style={{ display: "flex", gap: "6px" }}>
										<button
											type="button"
											disabled={isSaving}
											onClick={() => startEditing(p)}
											style={{ display: "flex", alignItems: "center", gap: "4px", padding: "6px 10px", fontSize: "12px", border: "1px solid #cbd5e1", borderRadius: "5px", backgroundColor: "#fff", cursor: "pointer" }}
										>
											<FiEdit2 size={12} /> Edit & Approve
										</button>
										<button
											type="button"
											disabled={isSaving}
											onClick={() => onReviewProposal(p.id, "REJECTED")}
											style={{ display: "flex", alignItems: "center", gap: "4px", padding: "6px 10px", fontSize: "12px", border: "1px solid #fca5a5", borderRadius: "5px", backgroundColor: "#fef2f2", color: "#b91c1c", cursor: "pointer" }}
										>
											<FiX size={12} /> Reject
										</button>
										<button
											type="button"
											disabled={isSaving}
											onClick={() => onReviewProposal(p.id, "ACCEPTED")}
											style={{ display: "flex", alignItems: "center", gap: "4px", padding: "6px 12px", fontSize: "12px", fontWeight: 600, border: "none", borderRadius: "5px", backgroundColor: "#059669", color: "#fff", cursor: "pointer" }}
										>
											<FiCheck size={12} /> Approve
										</button>
									</div>
								</div>

								<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "11.5px" }}>
									<div style={{ padding: "8px", backgroundColor: "#ffffff", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
										<strong>Previous Value:</strong>
										<pre style={{ margin: "4px 0 0", whiteSpace: "pre-wrap", color: "#64748b", fontFamily: "monospace" }}>
											{p.previousValue ? JSON.stringify(p.previousValue, null, 2) : "None (New Entry)"}
										</pre>
									</div>
									<div style={{ padding: "8px", backgroundColor: "#ffffff", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
										<strong>Proposed New Value:</strong>
										<pre style={{ margin: "4px 0 0", whiteSpace: "pre-wrap", color: "#065f46", fontFamily: "monospace" }}>
											{JSON.stringify(p.proposedValue, null, 2)}
										</pre>
									</div>
								</div>

								{p.potentialConflicts && p.potentialConflicts.length > 0 && (
									<div style={{ fontSize: "12px", color: "#b91c1c", backgroundColor: "#fef2f2", padding: "6px 10px", borderRadius: "5px" }}>
										<strong>Potential Conflicts:</strong> {p.potentialConflicts.join(" | ")}
									</div>
								)}

								{editingProposalId === p.id && (
									<div style={{ paddingTop: "8px", borderTop: "1px solid #fde68a" }}>
										<textarea
											rows={4}
											value={editJsonDraft}
											onChange={(e) => setEditJsonDraft(e.target.value)}
											style={{ width: "100%", padding: "8px", fontFamily: "monospace", fontSize: "12px", border: "1px solid #cbd5e1", borderRadius: "6px" }}
										/>
										{jsonError && <div style={{ fontSize: "12px", color: "#b91c1c", marginTop: "4px" }}>{jsonError}</div>}
										<div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "6px" }}>
											<button type="button" onClick={() => setEditingProposalId(null)} style={{ padding: "5px 10px", fontSize: "12px", border: "1px solid #cbd5e1", borderRadius: "5px", backgroundColor: "#fff" }}>Cancel</button>
											<button type="button" onClick={() => submitEdit(p)} style={{ padding: "5px 12px", fontSize: "12px", fontWeight: 600, border: "none", borderRadius: "5px", backgroundColor: "#059669", color: "#fff" }}>Apply Edited Update</button>
										</div>
									</div>
								)}
							</div>
						))}
					</div>
				)}
			</div>

			{/* 2. Non-Destructive Memory Version Audit Log */}
			<div>
				<h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
					<FiClock size={17} color="#d97706" /> Immutable Memory Audit History ({versions.length})
				</h3>
				<p style={{ margin: "2px 0 12px", fontSize: "12.5px", color: "#64748b" }}>
					Non-destructive version trail recording previous, proposed, and approved states with safe one-click snapshot restore.
				</p>

				{versions.length === 0 ? (
					<div style={{ padding: "20px", textAlign: "center", color: "#64748b", background: "#f8fafc", borderRadius: "8px" }}>
						No memory versions recorded yet.
					</div>
				) : (
					<div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
						{versions.map((v, idx) => (
							<div key={v.id} style={{ padding: "14px 16px", backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap" }}>
								<div style={{ flex: 1 }}>
									<div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
										<span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 7px", borderRadius: "4px", backgroundColor: idx === 0 ? "#059669" : "#f1f5f9", color: idx === 0 ? "#fff" : "#334155" }}>
											Version #{v.versionNumber}
										</span>
										<strong style={{ fontSize: "13.5px", color: "#0f172a" }}>{v.relatedEntity || v.targetType}</strong>
										<span style={{ fontSize: "11.5px", color: "#64748b" }}>• Source: {v.source}</span>
									</div>
									<div style={{ fontSize: "12.5px", color: "#334155", marginTop: "4px" }}>{v.changeReason}</div>
									<div style={{ fontSize: "11.5px", color: "#94a3b8", marginTop: "4px" }}>
										{new Date(v.createdAt).toLocaleString()} {v.approvedByUser ? `• Approved by ${v.approvedByUser.name}` : ""}
									</div>
								</div>

								{idx > 0 && (
									<button
										type="button"
										disabled={isSaving}
										onClick={() => onRestoreVersion(v.id, `Restored snapshot from Version #${v.versionNumber}`)}
										style={{ display: "flex", alignItems: "center", gap: "5px", padding: "6px 12px", fontSize: "12px", fontWeight: 600, border: "1px solid #cbd5e1", borderRadius: "6px", backgroundColor: "#f8fafc", color: "#334155", cursor: "pointer" }}
									>
										<FiRotateCcw size={12} /> Restore Snapshot
									</button>
								)}
							</div>
						))}
					</div>
				)}
			</div>

			{reviewedProposals.length > 0 && (
				<div style={{ paddingTop: "12px", borderTop: "1px solid #e2e8f0" }}>
					<div style={{ fontSize: "13px", fontWeight: 700, color: "#475569", marginBottom: "8px" }}>
						Past Proposal Decisions ({reviewedProposals.length})
					</div>
					<div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
						{reviewedProposals.map((p) => (
							<div key={p.id} style={{ padding: "8px 12px", backgroundColor: "#f8fafc", borderRadius: "6px", fontSize: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
								<span><strong>{p.targetLabel}</strong> — {p.changeReason}</span>
								<span style={{ fontWeight: 700, color: p.status === "ACCEPTED" ? "#047857" : "#b91c1c" }}>{p.status}</span>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}

