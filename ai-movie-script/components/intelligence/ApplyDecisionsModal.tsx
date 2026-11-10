"use client";

import React, { useState, useEffect } from "react";
import { StoryIntelligenceResult } from "../../types/storyIntelligence";
import { Modal } from "../ui/Modal";
import { FiCheckCircle, FiShield, FiUsers, FiBookOpen } from "react-icons/fi";

export interface ApplyDecisionsModalProps {
	isOpen: boolean;
	onClose: () => void;
	intelligence: StoryIntelligenceResult;
	onApply: (params: {
		applyToStory?: boolean;
		applyCharacters?: boolean;
		selectedCharacterIds?: string[];
	}) => Promise<any>;
	isApplying: boolean;
}

export function ApplyDecisionsModal({
	isOpen,
	onClose,
	intelligence,
	onApply,
	isApplying,
}: ApplyDecisionsModalProps) {
	const [applyStory, setApplyStory] = useState(true);
	const [applyCharacters, setApplyCharacters] = useState(true);
	const [selectedChars, setSelectedChars] = useState<string[]>(
		intelligence.characters.map((c) => c.id)
	);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (isOpen) {
			setSelectedChars(intelligence.characters.map((c) => c.id));
			setError(null);
		}
	}, [isOpen, intelligence.characters]);

	const handleToggleChar = (id: string) => {
		setSelectedChars((prev) =>
			prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
		);
	};

	const handleConfirm = async () => {
		setError(null);
		try {
			await onApply({
				applyToStory: applyStory,
				applyCharacters: applyCharacters,
				selectedCharacterIds: applyCharacters ? selectedChars : [],
			});
			onClose();
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : "Failed to apply decisions to project");
		}
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} title="Apply Approved Decisions to Movie Project">
			<div style={{ padding: "8px 0" }}>
				{/* Non-Destructive Safety Notice */}
				<div
					style={{
						display: "flex",
						gap: "10px",
						padding: "12px 14px",
						backgroundColor: "#eff6ff",
						border: "1px solid #bfdbfe",
						borderRadius: "8px",
						color: "#1e40af",
						fontSize: "12.5px",
						marginBottom: "16px",
					}}
				>
					<FiShield size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
					<div>
						<strong>Data Safety Guarantee:</strong> FilmForge AI only writes approved intelligence decisions to your project when explicitly commanded. Your original screenplay drafts and acts are never automatically overwritten.
					</div>
				</div>

				{/* 1. Story Concept Application */}
				<div style={{ marginBottom: "16px", padding: "12px", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
					<label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}>
						<input
							type="checkbox"
							checked={applyStory}
							onChange={(e) => setApplyStory(e.target.checked)}
							style={{ marginTop: "3px" }}
						/>
						<div>
							<strong style={{ fontSize: "13.5px", color: "#0f172a", display: "flex", alignItems: "center", gap: "6px" }}>
								<FiBookOpen size={14} /> Update Story Concept Framework
							</strong>
							<p style={{ margin: "4px 0 0", fontSize: "12px", color: "#64748b" }}>
								Synchronizes the refined logline, expanded synopsis, and central theme into your project&apos;s story framework.
							</p>
						</div>
					</label>
				</div>

				{/* 2. Character Profiles Application */}
				<div style={{ marginBottom: "16px", padding: "12px", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
					<label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}>
						<input
							type="checkbox"
							checked={applyCharacters}
							onChange={(e) => setApplyCharacters(e.target.checked)}
							style={{ marginTop: "3px" }}
						/>
						<div>
							<strong style={{ fontSize: "13.5px", color: "#0f172a", display: "flex", alignItems: "center", gap: "6px" }}>
								<FiUsers size={14} /> Synchronize Character Dossiers ({intelligence.characters.length})
							</strong>
							<p style={{ margin: "4px 0 0", fontSize: "12px", color: "#64748b" }}>
								Creates or updates project character dossiers with deep goals, psychology, and arcs.
							</p>
						</div>
					</label>

					{applyCharacters && (
						<div style={{ marginTop: "10px", paddingLeft: "26px", display: "flex", flexDirection: "column", gap: "6px" }}>
							{intelligence.characters.map((c) => (
								<label key={c.id} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px", color: "#334155", cursor: "pointer" }}>
									<input
										type="checkbox"
										checked={selectedChars.includes(c.id)}
										onChange={() => handleToggleChar(c.id)}
									/>
									<span>{c.name} <span style={{ color: "#64748b" }}>({c.role})</span></span>
								</label>
							))}
						</div>
					)}
				</div>

				{error && (
					<div style={{ padding: "8px 12px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "6px", color: "#b91c1c", fontSize: "12px", marginBottom: "12px" }}>
						{error}
					</div>
				)}

				<div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
					<button
						type="button"
						onClick={onClose}
						disabled={isApplying}
						style={{ padding: "8px 16px", fontSize: "13px", border: "1px solid #cbd5e1", borderRadius: "6px", backgroundColor: "#f8fafc", cursor: "pointer" }}
					>
						Cancel
					</button>
					<button
						type="button"
						onClick={handleConfirm}
						disabled={isApplying || (!applyStory && !applyCharacters)}
						style={{
							padding: "8px 20px",
							fontSize: "13px",
							fontWeight: 600,
							border: "none",
							borderRadius: "6px",
							backgroundColor: isApplying || (!applyStory && !applyCharacters) ? "#cbd5e1" : "#059669",
							color: "#ffffff",
							cursor: isApplying || (!applyStory && !applyCharacters) ? "not-allowed" : "pointer",
							display: "flex",
							alignItems: "center",
							gap: "6px",
						}}
					>
						<FiCheckCircle size={14} />
						<span>{isApplying ? "Applying Changes..." : "Confirm & Synchronize"}</span>
					</button>
				</div>
			</div>
		</Modal>
	);
}
