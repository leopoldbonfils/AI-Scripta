"use client";

import React, { useMemo, useState } from "react";
import { ScriptDoctorSuggestion } from "../../types/scriptDoctor";
import { sliceDiffRowsForPreview } from "../../services/scriptDoctorService";
import {
	FiCheck,
	FiEdit3,
	FiRefreshCw,
	FiSave,
	FiX,
	FiSlash,
	FiAlertTriangle,
	FiShield,
} from "react-icons/fi";

interface ProposalDiffPreviewPanelProps {
	suggestions: ScriptDoctorSuggestion[];
	activeSuggestion: ScriptDoctorSuggestion | null;
	staleWarning: string | null;
	isBusy: boolean;
	onSelectSuggestion: (suggestion: ScriptDoctorSuggestion) => void;
	onEditSuggestion: (id: string, editedText: string) => Promise<unknown>;
	onRegenerateSuggestion: (id: string, directions?: string) => Promise<unknown>;
	onAcceptSuggestion: (
		id: string,
		options?: { acceptedHunkIds?: string[]; editedText?: string }
	) => Promise<unknown>;
	onRejectOrDismiss: (id: string, mode: "REJECT" | "DISMISS", reason?: string) => Promise<unknown>;
}

export function ProposalDiffPreviewPanel({
	suggestions,
	activeSuggestion,
	staleWarning,
	isBusy,
	onSelectSuggestion,
	onEditSuggestion,
	onRegenerateSuggestion,
	onAcceptSuggestion,
	onRejectOrDismiss,
}: ProposalDiffPreviewPanelProps) {
	const [diffMode, setDiffMode] = useState<"SIDE_BY_SIDE" | "UNIFIED" | "CLEAN_PREVIEW">("SIDE_BY_SIDE");
	const [editingSuggestionId, setEditingSuggestionId] = useState<string | null>(null);
	const [draftTextMap, setDraftTextMap] = useState<Record<string, string>>({});
	const [regenDirections, setRegenDirections] = useState("");
	const [hunkSelectionMap, setHunkSelectionMap] = useState<Record<string, string[]>>({});
	const [sceneFilterMap, setSceneFilterMap] = useState<Record<string, number | null>>({});
	const [showAllRows, setShowAllRows] = useState(false);

	const activeId = activeSuggestion?.id || "";
	const isEditingDraft = Boolean(activeSuggestion && editingSuggestionId === activeSuggestion.id);
	const draftText = activeSuggestion
		? draftTextMap[activeId] ?? activeSuggestion.activeProposedText
		: "";

	const changeHunks = useMemo(
		() => (activeSuggestion?.diff?.hunks || []).filter((h) => h.type !== "UNCHANGED"),
		[activeSuggestion]
	);

	const selectedHunkIds = useMemo(
		() => (activeSuggestion ? hunkSelectionMap[activeId] ?? changeHunks.map((h) => h.id) : []),
		[activeSuggestion, activeId, hunkSelectionMap, changeHunks]
	);

	const activeSceneFilter = activeSuggestion ? sceneFilterMap[activeId] ?? null : null;

	const filteredSideBySideRows = useMemo(() => {
		const rows = activeSuggestion?.diff?.sideBySideRows || [];
		return rows.filter(
			(r) => !activeSceneFilter || (r.rightLineNumber ?? r.leftLineNumber ?? 0) >= activeSceneFilter
		);
	}, [activeSuggestion, activeSceneFilter]);

	const rowWindow = useMemo(
		() => sliceDiffRowsForPreview(filteredSideBySideRows, showAllRows),
		[filteredSideBySideRows, showAllRows]
	);

	const hunkWindow = useMemo(
		() => sliceDiffRowsForPreview(activeSuggestion?.diff?.hunks || [], showAllRows, 120),
		[activeSuggestion, showAllRows]
	);

	if (suggestions.length === 0 || !activeSuggestion) {
		return (
			<div
				style={{
					backgroundColor: "#ffffff",
					borderRadius: "12px",
					border: "1px solid #e2e8f0",
					padding: "40px 24px",
					textAlign: "center",
					color: "#64748b",
					fontSize: "13.5px",
				}}
			>
				Select an operation (Rewrite, Polish, Dialogue Improvement, or Continuity Fix) and target section above to preview AI revisions cleanly before changing a single line of your screenplay.
			</div>
		);
	}

	const isPending = ["PENDING", "EDITED", "STALE"].includes(activeSuggestion.status);
	const toggleHunk = (id: string) => {
		setHunkSelectionMap((prev) => {
			const current = prev[activeId] ?? changeHunks.map((h) => h.id);
			const next = current.includes(id)
				? current.filter((x) => x !== id)
				: [...current, id];
			return { ...prev, [activeId]: next };
		});
	};

	const impact = activeSuggestion.continuityImpact;
	const impactTags = [
		...(impact?.charactersAffected || []).map((x) => `Char: ${x}`),
		...(impact?.motivationsAffected || []).map((x) => `Motivation: ${x}`),
		...(impact?.relationshipsAffected || []).map((x) => `Relation: ${x}`),
		...(impact?.timelineAffected || []).map((x) => `Timeline: ${x}`),
		...(impact?.locationsAffected || []).map((x) => `Location: ${x}`),
		...(impact?.eventsAffected || []).map((x) => `Event: ${x}`),
		...(impact?.otherScenesAffected || []).map((s) => `Scene ${s}`),
	];

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
			{/* Proposal Selector Strip */}
			<div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
				{suggestions.slice(0, 8).map((s) => (
					<button
						key={s.id}
						type="button"
						onClick={() => onSelectSuggestion(s)}
						style={{
							padding: "6px 10px",
							borderRadius: "8px",
							border: activeSuggestion.id === s.id ? "2px solid #d97706" : "1px solid #cbd5e1",
							backgroundColor: activeSuggestion.id === s.id ? "#fffbeb" : "#ffffff",
							fontSize: "12px",
							fontWeight: 600,
							cursor: "pointer",
						}}
					>
						<span>{s.operationType}</span> ·{" "}
						<span style={{ color: "#475569" }}>{s.targetLabel}</span>{" "}
						<span
							style={{
								marginLeft: "4px",
								fontSize: "10.5px",
								fontWeight: 700,
								color:
									s.status === "ACCEPTED" || s.status === "PARTIALLY_ACCEPTED"
										? "#15803d"
										: s.status === "REJECTED"
										? "#b91c1c"
										: "#b45309",
							}}
						>
							[{s.status}]
						</span>
					</button>
				))}
			</div>

			{(activeSuggestion.isStale || staleWarning) && (
				<div
					style={{
						padding: "12px 14px",
						borderRadius: "8px",
						backgroundColor: "#fef2f2",
						border: "1px solid #fecaca",
						color: "#991b1b",
						fontSize: "12.5px",
						display: "flex",
						alignItems: "center",
						gap: "8px",
					}}
				>
					<FiAlertTriangle size={18} />
					<span>
						<strong>Stale Proposal Warning:</strong>{" "}
						{staleWarning ||
							`Your screenplay advanced past base v${activeSuggestion.baseScreenplayVersion}. Regenerate this proposal to reconcile cleanly before applying.`}
					</span>
				</div>
			)}

			<div
				style={{
					backgroundColor: "#ffffff",
					borderRadius: "12px",
					border: "1px solid #e2e8f0",
					padding: "20px",
					display: "flex",
					flexDirection: "column",
					gap: "14px",
				}}
			>
				{/* Top Summary & Review Controls */}
				<div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
					<div>
						<div style={{ fontSize: "11.5px", fontWeight: 700, color: "#d97706", textTransform: "uppercase" }}>
							{activeSuggestion.operationType} Proposal · {activeSuggestion.targetLabel} · Base v{activeSuggestion.baseScreenplayVersion}
						</div>
						<p style={{ margin: "4px 0", fontSize: "13.5px", fontWeight: 600, color: "#0f172a" }}>
							{activeSuggestion.changeSummary}
						</p>
						<div style={{ fontSize: "12px", color: "#64748b" }}>
							+{activeSuggestion.diff?.stats.addedLines ?? 0} added · -
							{activeSuggestion.diff?.stats.removedLines ?? 0} removed ·{" "}
							{changeHunks.length} change hunk(s) · Status:{" "}
							<strong>{activeSuggestion.status}</strong>
						</div>
					</div>

					<div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
						{isPending && (
							<>
								<button
									type="button"
									disabled={isBusy || activeSuggestion.isStale}
									onClick={() =>
										void onAcceptSuggestion(activeSuggestion.id, {
											editedText: isEditingDraft ? draftText : undefined,
										})
									}
									style={{
										display: "flex",
										alignItems: "center",
										gap: "5px",
										padding: "8px 14px",
										borderRadius: "8px",
										border: "none",
										backgroundColor: activeSuggestion.isStale ? "#cbd5e1" : "#15803d",
										color: "#ffffff",
										fontSize: "12.5px",
										fontWeight: 700,
										cursor: activeSuggestion.isStale ? "not-allowed" : "pointer",
									}}
								>
									<FiCheck /> Accept Entire Revision
								</button>

								{changeHunks.length > 1 && (
									<button
										type="button"
										disabled={isBusy || activeSuggestion.isStale || selectedHunkIds.length === 0}
										onClick={() =>
											void onAcceptSuggestion(activeSuggestion.id, {
												acceptedHunkIds: selectedHunkIds,
											})
										}
										style={{
											display: "flex",
											alignItems: "center",
											gap: "5px",
											padding: "8px 12px",
											borderRadius: "8px",
											border: "1px solid #15803d",
											backgroundColor: "#f0fdf4",
											color: "#15803d",
											fontSize: "12px",
											fontWeight: 700,
											cursor: "pointer",
										}}
									>
										Accept Selected ({selectedHunkIds.length})
									</button>
								)}

								<button
									type="button"
									onClick={() =>
										setEditingSuggestionId((prev) =>
											prev === activeSuggestion.id ? null : activeSuggestion.id
										)
									}
									style={{
										display: "flex",
										alignItems: "center",
										gap: "4px",
										padding: "8px 12px",
										borderRadius: "8px",
										border: "1px solid #cbd5e1",
										backgroundColor: "#ffffff",
										fontSize: "12px",
										fontWeight: 600,
										cursor: "pointer",
									}}
								>
									<FiEdit3 /> {isEditingDraft ? "View Diff" : "Edit Proposal"}
								</button>

								<button
									type="button"
									disabled={isBusy}
									onClick={() => void onRejectOrDismiss(activeSuggestion.id, "REJECT")}
									style={{
										display: "flex",
										alignItems: "center",
										gap: "4px",
										padding: "8px 12px",
										borderRadius: "8px",
										border: "1px solid #fecaca",
										backgroundColor: "#fef2f2",
										color: "#b91c1c",
										fontSize: "12px",
										fontWeight: 600,
										cursor: "pointer",
									}}
								>
									<FiX /> Reject
								</button>

								<button
									type="button"
									disabled={isBusy}
									onClick={() => void onRejectOrDismiss(activeSuggestion.id, "DISMISS")}
									style={{
										display: "flex",
										alignItems: "center",
										gap: "4px",
										padding: "8px 12px",
										borderRadius: "8px",
										border: "1px solid #e2e8f0",
										backgroundColor: "#f8fafc",
										color: "#475569",
										fontSize: "12px",
										fontWeight: 600,
										cursor: "pointer",
									}}
								>
									<FiSlash /> Dismiss
								</button>
							</>
						)}
					</div>
				</div>

				{/* Technical vs Creative Notes & Continuity Impact */}
				<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "10px", fontSize: "12px" }}>
					<div style={{ padding: "10px 12px", borderRadius: "8px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
						<div style={{ fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>Technical &amp; Creative Distinction</div>
						{(activeSuggestion.technicalNotes || []).map((n, i) => (
							<div key={i} style={{ color: "#15803d" }}>[Technical] {n}</div>
						))}
						{(activeSuggestion.creativeSuggestions || []).map((c, i) => (
							<div key={i} style={{ color: "#1d4ed8", marginTop: "2px" }}>[Creative] {c}</div>
						))}
					</div>

					<div style={{ padding: "10px 12px", borderRadius: "8px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
						<div style={{ fontWeight: 700, color: "#0f172a", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
							<FiShield color="#d97706" /> Continuity Impact
						</div>
						<div style={{ color: "#334155" }}>{impact?.summary || "Preserves approved Story Bible continuity."}</div>
						{impactTags.length > 0 && (
							<div style={{ marginTop: "6px", display: "flex", gap: "4px", flexWrap: "wrap" }}>
								{impactTags.map((t, idx) => (
									<span key={idx} style={{ padding: "2px 6px", borderRadius: "4px", backgroundColor: "#e2e8f0", fontSize: "11px" }}>
										{t}
									</span>
								))}
							</div>
						)}
						{(activeSuggestion.proposedBibleUpdates || []).length > 0 && (
							<div style={{ marginTop: "6px", color: "#92400e", fontSize: "11.5px", fontWeight: 600 }}>
								{activeSuggestion.proposedBibleUpdates.length} Story Bible update proposal(s) will queue as PENDING upon acceptance.
							</div>
						)}
					</div>
				</div>

				{/* Diff Mode Bar & Scene Jump Markers */}
				{!isEditingDraft && (
					<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
						<div style={{ display: "flex", gap: "6px" }}>
							{(
								[
									["SIDE_BY_SIDE", "Side-by-Side Comparison"],
									["UNIFIED", "Unified Hunk Review"],
									["CLEAN_PREVIEW", "Clean Proposed Preview"],
								] as const
							).map(([mode, label]) => (
								<button
									key={mode}
									type="button"
									onClick={() => setDiffMode(mode)}
									style={{
										padding: "5px 10px",
										borderRadius: "6px",
										border: "1px solid #cbd5e1",
										backgroundColor: diffMode === mode ? "#0f172a" : "#ffffff",
										color: diffMode === mode ? "#ffffff" : "#334155",
										fontSize: "11.5px",
										fontWeight: 600,
										cursor: "pointer",
									}}
								>
									{label}
								</button>
							))}
						</div>

						{(activeSuggestion.diff?.sceneMarkers || []).length > 1 && (
							<div style={{ display: "flex", gap: "4px", alignItems: "center", flexWrap: "wrap", fontSize: "11px" }}>
								<span style={{ color: "#64748b", fontWeight: 700 }}>Scene Jump:</span>
								<button
									type="button"
									onClick={() => setSceneFilterMap((prev) => ({ ...prev, [activeId]: null }))}
									style={{ padding: "2px 7px", borderRadius: "4px", border: "1px solid #cbd5e1", backgroundColor: activeSceneFilter === null ? "#fef3c7" : "#fff", cursor: "pointer" }}
								>
									All
								</button>
								{activeSuggestion.diff.sceneMarkers.map((m) => (
									<button
										key={m.sceneNumber}
										type="button"
										onClick={() =>
											setSceneFilterMap((prev) => ({ ...prev, [activeId]: m.lineNumber }))
										}
										style={{ padding: "2px 7px", borderRadius: "4px", border: "1px solid #cbd5e1", backgroundColor: activeSceneFilter === m.lineNumber ? "#fef3c7" : "#fff", cursor: "pointer" }}
									>
										Sc {m.sceneNumber}
									</button>
								))}
							</div>
						)}
					</div>
				)}

				{/* Main Comparison / Proposal Editor */}
				{isEditingDraft ? (
					<div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
						<textarea
							rows={14}
							value={draftText}
							onChange={(e) =>
								setDraftTextMap((prev) => ({ ...prev, [activeId]: e.target.value }))
							}
							style={{
								fontFamily: "'Courier New', Courier, monospace",
								fontSize: "13px",
								padding: "12px",
								borderRadius: "8px",
								border: "1px solid #94a3b8",
								lineHeight: 1.5,
							}}
						/>
						<div style={{ display: "flex", gap: "8px" }}>
							<button
								type="button"
								disabled={isBusy}
								onClick={async () => {
									await onEditSuggestion(activeSuggestion.id, draftText);
									setEditingSuggestionId(null);
								}}
								style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 14px", borderRadius: "6px", border: "none", backgroundColor: "#0f172a", color: "#fff", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
							>
								<FiSave /> Save Proposal Draft (Keep Original Untouched)
							</button>
							<button
								type="button"
								onClick={() => {
									setDraftTextMap((prev) => ({
										...prev,
										[activeId]: activeSuggestion.activeProposedText,
									}));
									setEditingSuggestionId(null);
								}}
								style={{ padding: "7px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", backgroundColor: "#fff", fontSize: "12px", cursor: "pointer" }}
							>
								Cancel
							</button>
						</div>
					</div>
				) : diffMode === "CLEAN_PREVIEW" ? (
					<div
						style={{
							backgroundColor: "#fafaf9",
							border: "1px solid #cbd5e1",
							borderRadius: "8px",
							padding: "20px",
							fontFamily: "'Courier New', Courier, monospace",
							fontSize: "13px",
							lineHeight: 1.55,
							whiteSpace: "pre-wrap",
							maxHeight: "480px",
							overflowY: "auto",
						}}
					>
						{activeSuggestion.activeProposedText}
					</div>
				) : diffMode === "UNIFIED" ? (
					<div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "520px", overflowY: "auto" }}>
						{hunkWindow.visibleRows.map((h) => {
							const isChange = h.type !== "UNCHANGED";
							const checked = selectedHunkIds.includes(h.id);
							return (
								<div
									key={h.id}
									style={{
										border: isChange ? "1px solid #f59e0b" : "1px solid #e2e8f0",
										borderRadius: "8px",
										overflow: "hidden",
										fontFamily: "'Courier New', Courier, monospace",
										fontSize: "12.5px",
									}}
								>
									<div style={{ padding: "4px 10px", backgroundColor: isChange ? "#fffbeb" : "#f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "inherit" }}>
										<span style={{ fontWeight: 700, fontSize: "11px", color: "#475569" }}>
											{h.id} · {h.type} · {h.summary}
										</span>
										{isChange && isPending && (
											<label style={{ fontSize: "11.5px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
												<input
													type="checkbox"
													checked={checked}
													onChange={() => toggleHunk(h.id)}
												/>
												Include Hunk
											</label>
										)}
									</div>
									{h.type === "UNCHANGED" ? (
										<pre style={{ margin: 0, padding: "6px 10px", color: "#475569", whiteSpace: "pre-wrap" }}>
											{h.originalLines.join("\n")}
										</pre>
									) : (
										<div>
											{h.originalLines.length > 0 && (
												<pre style={{ margin: 0, padding: "6px 10px", backgroundColor: "#fef2f2", color: "#991b1b", whiteSpace: "pre-wrap" }}>
													{h.originalLines.map((l) => `- ${l}`).join("\n")}
												</pre>
											)}
											{h.proposedLines.length > 0 && (
												<pre style={{ margin: 0, padding: "6px 10px", backgroundColor: "#f0fdf4", color: "#166534", whiteSpace: "pre-wrap" }}>
													{h.proposedLines.map((l) => `+ ${l}`).join("\n")}
												</pre>
											)}
										</div>
									)}
								</div>
							);
						})}
					</div>
				) : (
					<div style={{ border: "1px solid #cbd5e1", borderRadius: "8px", overflow: "auto", maxHeight: "520px", fontFamily: "'Courier New', Courier, monospace", fontSize: "12.5px" }}>
						<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", backgroundColor: "#f1f5f9", borderBottom: "1px solid #cbd5e1", fontFamily: "sans-serif", fontSize: "11.5px", fontWeight: 700, padding: "6px 10px", color: "#334155" }}>
							<div>Original Version (v{activeSuggestion.baseScreenplayVersion})</div>
							<div>AI Proposed Revision</div>
						</div>
						{rowWindow.visibleRows.map((row, idx) => (
								<div
									key={idx}
									style={{
										display: "grid",
										gridTemplateColumns: "1fr 1fr",
										borderBottom: "1px solid #f1f5f9",
									}}
								>
									<div
										style={{
											padding: "3px 10px",
											borderRight: "1px solid #e2e8f0",
											backgroundColor:
												row.rowType === "REMOVED" || row.rowType === "MODIFIED"
													? "#fef2f2"
													: "#ffffff",
											color:
												row.rowType === "REMOVED" || row.rowType === "MODIFIED"
													? "#991b1b"
													: "#334155",
											whiteSpace: "pre-wrap",
										}}
									>
										<span style={{ color: "#94a3b8", marginRight: "8px", userSelect: "none" }}>
											{row.leftLineNumber ?? ""}
										</span>
										{row.leftText}
									</div>
									<div
										style={{
											padding: "3px 10px",
											backgroundColor:
												row.rowType === "ADDED" || row.rowType === "MODIFIED"
													? "#f0fdf4"
													: "#ffffff",
											color:
												row.rowType === "ADDED" || row.rowType === "MODIFIED"
													? "#166534"
													: "#334155",
											whiteSpace: "pre-wrap",
										}}
									>
										<span style={{ color: "#94a3b8", marginRight: "8px", userSelect: "none" }}>
											{row.rightLineNumber ?? ""}
										</span>
										{row.rightText}
									</div>
								</div>
							))}
					</div>
				)}

				{!isEditingDraft &&
					((diffMode === "SIDE_BY_SIDE" && (rowWindow.isWindowed || showAllRows) && rowWindow.totalRows > 250) ||
						(diffMode === "UNIFIED" && (hunkWindow.isWindowed || showAllRows) && hunkWindow.totalRows > 120)) && (
						<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", color: "#475569", paddingTop: "4px" }}>
							<span>
								Showing{" "}
								{diffMode === "UNIFIED"
									? `${hunkWindow.visibleRows.length} of ${hunkWindow.totalRows} hunks`
									: `${rowWindow.visibleRows.length} of ${rowWindow.totalRows} diff lines`}
							</span>
							<button
								type="button"
								onClick={() => setShowAllRows((v) => !v)}
								style={{
									padding: "5px 12px",
									borderRadius: "6px",
									border: "1px solid #cbd5e1",
									backgroundColor: "#ffffff",
									fontSize: "12px",
									fontWeight: 600,
									cursor: "pointer",
								}}
							>
								{showAllRows ? "Collapse Large Diff Window" : "Render All Lines"}
							</button>
						</div>
					)}

				{/* Regenerate Bar */}
				{["PENDING", "EDITED", "STALE", "REJECTED", "DISMISSED"].includes(activeSuggestion.status) && (
					<div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
						<input
							type="text"
							placeholder="Optional adjusted directions to regenerate this proposal..."
							value={regenDirections}
							onChange={(e) => setRegenDirections(e.target.value)}
							style={{ flex: 1, minWidth: "240px", padding: "7px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12.5px" }}
						/>
						<button
							type="button"
							disabled={isBusy}
							onClick={() =>
								void onRegenerateSuggestion(
									activeSuggestion.id,
									regenDirections.trim() || undefined
								)
							}
							style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 14px", borderRadius: "6px", border: "1px solid #d97706", backgroundColor: "#fffbeb", color: "#b45309", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
						>
							<FiRefreshCw /> Regenerate Proposal
						</button>
					</div>
				)}
			</div>
		</div>
	);
}

