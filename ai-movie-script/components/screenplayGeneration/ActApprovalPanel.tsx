"use client";

import React, { useState } from "react";
import { GeneratedActItem, ScreenplayJobStatus } from "../../types/screenplayGeneration";
import { FiCheck, FiEdit3, FiLayers, FiSave } from "react-icons/fi";

interface ActApprovalPanelProps {
	acts: GeneratedActItem[];
	jobStatus: ScreenplayJobStatus;
	isBusy: boolean;
	onUpdateAct: (actId: string, data: Partial<GeneratedActItem>) => Promise<void>;
	onApproveActs: () => Promise<void>;
}

export function ActApprovalPanel({
	acts,
	jobStatus,
	isBusy,
	onUpdateAct,
	onApproveActs,
}: ActApprovalPanelProps) {
	const [editingId, setEditingId] = useState<string | null>(null);
	const [draftTitle, setDraftTitle] = useState("");
	const [draftPurpose, setDraftPurpose] = useState("");
	const [draftObjective, setDraftObjective] = useState("");
	const [draftConflict, setDraftConflict] = useState("");
	const [draftCount, setDraftCount] = useState(4);

	if (acts.length === 0) return null;

	const startEditing = (act: GeneratedActItem) => {
		setEditingId(act.id);
		setDraftTitle(act.title);
		setDraftPurpose(act.purpose);
		setDraftObjective(act.dramaticObjective);
		setDraftConflict(act.centralConflict);
		setDraftCount(act.estimatedSceneCount);
	};

	const saveEdit = async (actId: string) => {
		await onUpdateAct(actId, {
			title: draftTitle,
			purpose: draftPurpose,
			dramaticObjective: draftObjective,
			centralConflict: draftConflict,
			estimatedSceneCount: Number(draftCount) || 3,
		});
		setEditingId(null);
	};

	const needsApproval = jobStatus === "AWAITING_ACT_APPROVAL";

	return (
		<div
			style={{
				backgroundColor: "#ffffff",
				borderRadius: "12px",
				border: needsApproval ? "2px solid #d97706" : "1px solid #e2e8f0",
				padding: "20px",
			}}
		>
			<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "14px" }}>
				<div>
					<h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
						<FiLayers color="#d97706" /> Stage 2: Narrative Act Architecture ({acts.length} Acts)
					</h3>
					<p style={{ margin: "2px 0 0", fontSize: "12.5px", color: "#64748b" }}>
						Inspect, customize Act objectives, and approve to generate Act-by-Act scenes.
					</p>
				</div>

				{needsApproval && (
					<button
						type="button"
						disabled={isBusy}
						onClick={() => void onApproveActs()}
						style={{
							display: "flex",
							alignItems: "center",
							gap: "6px",
							padding: "9px 16px",
							borderRadius: "8px",
							border: "none",
							backgroundColor: "#d97706",
							color: "#ffffff",
							fontWeight: 700,
							fontSize: "13px",
							cursor: "pointer",
						}}
					>
						<FiCheck /> Approve Acts &amp; Generate Scenes
					</button>
				)}
			</div>

			<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "12px" }}>
				{acts.map((act) => {
					const isEditing = editingId === act.id;
					return (
						<div
							key={act.id}
							style={{
								borderRadius: "10px",
								border: "1px solid #e2e8f0",
								backgroundColor: "#f8fafc",
								padding: "14px",
								display: "flex",
								flexDirection: "column",
								gap: "8px",
							}}
						>
							<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
								<span style={{ fontSize: "11px", fontWeight: 700, color: "#92400e", backgroundColor: "#fef3c7", padding: "2px 8px", borderRadius: "999px" }}>
									ACT {act.actNumber} · {act.originType}
								</span>
								{!isEditing && (
									<button
										type="button"
										onClick={() => startEditing(act)}
										style={{ border: "none", background: "transparent", color: "#475569", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px", fontWeight: 600 }}
									>
										<FiEdit3 /> Edit
									</button>
								)}
							</div>

							{isEditing ? (
								<div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12.5px" }}>
									<input
										value={draftTitle}
										onChange={(e) => setDraftTitle(e.target.value)}
										style={{ padding: "6px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontWeight: 700 }}
									/>
									<textarea
										rows={2}
										value={draftPurpose}
										onChange={(e) => setDraftPurpose(e.target.value)}
										placeholder="Purpose"
										style={{ padding: "6px 8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
									/>
									<textarea
										rows={2}
										value={draftObjective}
										onChange={(e) => setDraftObjective(e.target.value)}
										placeholder="Dramatic objective"
										style={{ padding: "6px 8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
									/>
									<textarea
										rows={2}
										value={draftConflict}
										onChange={(e) => setDraftConflict(e.target.value)}
										placeholder="Central conflict"
										style={{ padding: "6px 8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
									/>
									<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
										<label style={{ fontSize: "11.5px", fontWeight: 600 }}>Target scenes:</label>
										<input
											type="number"
											min={1}
											max={25}
											value={draftCount}
											onChange={(e) => setDraftCount(Number(e.target.value))}
											style={{ width: "64px", padding: "4px 6px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
										/>
									</div>
									<div style={{ display: "flex", gap: "8px" }}>
										<button
											type="button"
											disabled={isBusy}
											onClick={() => void saveEdit(act.id)}
											style={{ display: "flex", alignItems: "center", gap: "4px", padding: "6px 12px", borderRadius: "6px", border: "none", backgroundColor: "#0f172a", color: "#fff", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
										>
											<FiSave /> Save Act
										</button>
										<button
											type="button"
											onClick={() => setEditingId(null)}
											style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", backgroundColor: "#fff", fontSize: "12px", cursor: "pointer" }}
										>
											Cancel
										</button>
									</div>
								</div>
							) : (
								<div style={{ fontSize: "12.5px", color: "#334155", lineHeight: 1.45 }}>
									<div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>{act.title}</div>
									<p style={{ margin: "0 0 6px" }}><strong>Purpose:</strong> {act.purpose}</p>
									<p style={{ margin: "0 0 6px" }}><strong>Objective:</strong> {act.dramaticObjective}</p>
									<p style={{ margin: "0 0 6px" }}><strong>Conflict:</strong> {act.centralConflict}</p>
									<div style={{ fontSize: "11.5px", color: "#64748b" }}>
										Est. Scenes: {act.estimatedSceneCount} · Status: {act.status}
									</div>
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}

