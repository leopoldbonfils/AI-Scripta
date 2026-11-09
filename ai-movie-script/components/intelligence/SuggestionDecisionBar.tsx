"use client";

import React, { useState } from "react";
import {
	StoryIntelligenceSuggestion,
	SuggestionDecision,
} from "../../types/storyIntelligence";
import { FiCheck, FiX, FiEdit2, FiCheckCircle } from "react-icons/fi";

export interface SuggestionDecisionBarProps {
	suggestion: StoryIntelligenceSuggestion;
	onDecision: (suggestionId: string, status: SuggestionDecision, editedContent?: string) => Promise<any>;
}

export function SuggestionDecisionBar({ suggestion, onDecision }: SuggestionDecisionBarProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [editDraft, setEditDraft] = useState(suggestion.editedContent || suggestion.description);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleAccept = async () => {
		setIsSubmitting(true);
		try {
			await onDecision(suggestion.id, "ACCEPTED");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleReject = async () => {
		setIsSubmitting(true);
		try {
			await onDecision(suggestion.id, "REJECTED");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleSaveEdit = async () => {
		if (!editDraft.trim()) return;
		setIsSubmitting(true);
		try {
			await onDecision(suggestion.id, "ACCEPTED", editDraft.trim());
			setIsEditing(false);
		} finally {
			setIsSubmitting(false);
		}
	};

	const evidenceBadgeColor =
		suggestion.evidenceLevel === "SOURCE_FACT"
			? { bg: "#ecfdf5", border: "#a7f3d0", text: "#065f46", label: "Source Fact" }
			: suggestion.evidenceLevel === "ANALYSIS"
			? { bg: "#eff6ff", border: "#bfdbfe", text: "#1e40af", label: "Analytical Deduction" }
			: { bg: "#faf5ff", border: "#e9d5ff", text: "#6b21a8", label: "Creative Suggestion" };

	return (
		<div
			style={{
				padding: "14px 16px",
				backgroundColor: "#ffffff",
				border: "1px solid #e2e8f0",
				borderRadius: "8px",
				marginBottom: "12px",
			}}
		>
			<div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
				<div>
					<div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
						<span
							style={{
								fontSize: "11px",
								fontWeight: 700,
								textTransform: "uppercase",
								padding: "2px 8px",
								borderRadius: "4px",
								backgroundColor: evidenceBadgeColor.bg,
								border: `1px solid ${evidenceBadgeColor.border}`,
								color: evidenceBadgeColor.text,
							}}
						>
							{evidenceBadgeColor.label}
						</span>
						<strong style={{ fontSize: "14px", color: "#0f172a" }}>{suggestion.title}</strong>
					</div>

					<p style={{ margin: "4px 0", fontSize: "13px", color: "#334155", lineHeight: "1.5" }}>
						{suggestion.editedContent || suggestion.description}
					</p>

					{suggestion.explanation && (
						<p style={{ margin: "4px 0 0", fontSize: "12px", color: "#64748b", fontStyle: "italic" }}>
							Why this matters: {suggestion.explanation}
						</p>
					)}
				</div>

				<div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
					{suggestion.status === "ACCEPTED" ? (
						<span
							style={{
								display: "flex",
								alignItems: "center",
								gap: "4px",
								fontSize: "12px",
								fontWeight: 600,
								color: "#059669",
								backgroundColor: "#ecfdf5",
								padding: "4px 10px",
								borderRadius: "6px",
								border: "1px solid #a7f3d0",
							}}
						>
							<FiCheckCircle size={14} /> Approved
						</span>
					) : suggestion.status === "REJECTED" ? (
						<span
							style={{
								fontSize: "12px",
								fontWeight: 600,
								color: "#94a3b8",
								backgroundColor: "#f1f5f9",
								padding: "4px 10px",
								borderRadius: "6px",
								border: "1px solid #cbd5e1",
							}}
						>
							Declined
						</span>
					) : (
						<>
							<button
								type="button"
								onClick={() => setIsEditing(!isEditing)}
								disabled={isSubmitting}
								style={{
									display: "flex",
									alignItems: "center",
									gap: "4px",
									padding: "6px 10px",
									fontSize: "12px",
									border: "1px solid #cbd5e1",
									borderRadius: "6px",
									backgroundColor: "#f8fafc",
									color: "#475569",
									cursor: "pointer",
								}}
							>
								<FiEdit2 size={12} /> Edit
							</button>

							<button
								type="button"
								onClick={handleReject}
								disabled={isSubmitting}
								style={{
									display: "flex",
									alignItems: "center",
									gap: "4px",
									padding: "6px 10px",
									fontSize: "12px",
									border: "1px solid #fca5a5",
									borderRadius: "6px",
									backgroundColor: "#fef2f2",
									color: "#b91c1c",
									cursor: "pointer",
								}}
							>
								<FiX size={12} /> Decline
							</button>

							<button
								type="button"
								onClick={handleAccept}
								disabled={isSubmitting}
								style={{
									display: "flex",
									alignItems: "center",
									gap: "4px",
									padding: "6px 12px",
									fontSize: "12px",
									fontWeight: 600,
									border: "none",
									borderRadius: "6px",
									backgroundColor: "#059669",
									color: "#ffffff",
									cursor: "pointer",
								}}
							>
								<FiCheck size={12} /> Approve
							</button>
						</>
					)}
				</div>
			</div>

			{isEditing && (
				<div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #f1f5f9" }}>
					<textarea
						value={editDraft}
						onChange={(e) => setEditDraft(e.target.value)}
						rows={3}
						style={{
							width: "100%",
							padding: "8px 10px",
							fontSize: "12.5px",
							borderRadius: "6px",
							border: "1px solid #cbd5e1",
							fontFamily: "inherit",
						}}
					/>
					<div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "8px" }}>
						<button
							type="button"
							onClick={() => setIsEditing(false)}
							style={{ padding: "5px 10px", fontSize: "12px", border: "1px solid #cbd5e1", borderRadius: "5px", background: "#f8fafc" }}
						>
							Cancel
						</button>
						<button
							type="button"
							onClick={handleSaveEdit}
							disabled={isSubmitting || !editDraft.trim()}
							style={{ padding: "5px 12px", fontSize: "12px", fontWeight: 600, borderRadius: "5px", background: "#059669", color: "#fff", border: "none" }}
						>
							Save & Approve
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
