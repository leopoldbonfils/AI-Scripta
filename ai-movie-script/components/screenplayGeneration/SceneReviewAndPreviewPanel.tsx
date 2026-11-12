"use client";

import React, { useState } from "react";
import { GeneratedSceneItem, ScreenplayJobStatus } from "../../types/screenplayGeneration";
import {
	FiCheck,
	FiRefreshCw,
	FiEdit3,
	FiSave,
	FiFileText,
	FiAlertTriangle,
} from "react-icons/fi";

interface SceneReviewAndPreviewPanelProps {
	scenes: GeneratedSceneItem[];
	assembledContent?: string | null;
	jobStatus: ScreenplayJobStatus;
	isBusy: boolean;
	overwritePromptScene: { sceneId: string; sceneTitle: string; instructions?: string } | null;
	onClearOverwritePrompt: () => void;
	onUpdateScene: (sceneId: string, data: Partial<GeneratedSceneItem>) => Promise<void>;
	onApproveScenes: () => Promise<void>;
	onRetryScene: (
		scene: GeneratedSceneItem,
		options?: { confirmOverwriteEdited?: boolean; instructions?: string }
	) => Promise<void>;
}

export function SceneReviewAndPreviewPanel({
	scenes,
	assembledContent,
	jobStatus,
	isBusy,
	overwritePromptScene,
	onClearOverwritePrompt,
	onUpdateScene,
	onApproveScenes,
	onRetryScene,
}: SceneReviewAndPreviewPanelProps) {
	const [selectedSceneId, setSelectedSceneId] = useState<string>("");
	const [viewMode, setViewMode] = useState<"SCENE_SCRIPT" | "FULL_SCREENPLAY">("SCENE_SCRIPT");
	const [editingOutline, setEditingOutline] = useState(false);
	const [editingScript, setEditingScript] = useState(false);

	const [draftTitle, setDraftTitle] = useState("");
	const [draftPurpose, setDraftPurpose] = useState("");
	const [draftLocation, setDraftLocation] = useState("");
	const [draftScript, setDraftScript] = useState("");
	const [retryInstructions, setRetryInstructions] = useState("");
	const [showFullAssembled, setShowFullAssembled] = useState(false);

	const selectedScene =
		scenes.find((s) => s.id === selectedSceneId) || (scenes.length > 0 ? scenes[0] : null);

	if (scenes.length === 0) return null;

	const needsSceneApproval = jobStatus === "AWAITING_SCENE_APPROVAL";

	const beginOutlineEdit = (scene: GeneratedSceneItem) => {
		setDraftTitle(scene.title);
		setDraftLocation(scene.location);
		setDraftPurpose(scene.scenePurpose);
		setEditingOutline(true);
		setEditingScript(false);
	};

	const beginScriptEdit = (scene: GeneratedSceneItem) => {
		setDraftScript(scene.writerEditedContent ?? scene.screenplayContent ?? "");
		setEditingScript(true);
		setEditingOutline(false);
	};

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
			{overwritePromptScene && (
				<div
					style={{
						backgroundColor: "#fefce8",
						border: "2px solid #eab308",
						borderRadius: "10px",
						padding: "14px 16px",
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						flexWrap: "wrap",
						gap: "12px",
					}}
				>
					<div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#713f12", fontSize: "13px" }}>
						<FiAlertTriangle size={20} color="#ca8a04" />
						<span>
							<strong>Manual Edit Protection:</strong> {overwritePromptScene.sceneTitle} was manually edited by you. Confirming regeneration will overwrite your manual script edits.
						</span>
					</div>
					<div style={{ display: "flex", gap: "8px" }}>
						<button
							type="button"
							disabled={isBusy}
							onClick={() => {
								const s = scenes.find((x) => x.id === overwritePromptScene.sceneId);
								if (s) {
									void onRetryScene(s, {
										confirmOverwriteEdited: true,
										instructions: overwritePromptScene.instructions,
									});
								}
							}}
							style={{
								padding: "7px 14px",
								borderRadius: "6px",
								border: "none",
								backgroundColor: "#b45309",
								color: "#fff",
								fontWeight: 700,
								fontSize: "12.5px",
								cursor: "pointer",
							}}
						>
							Confirm Overwrite &amp; Regenerate
						</button>
						<button
							type="button"
							onClick={onClearOverwritePrompt}
							style={{
								padding: "7px 12px",
								borderRadius: "6px",
								border: "1px solid #cbd5e1",
								backgroundColor: "#fff",
								fontSize: "12.5px",
								cursor: "pointer",
							}}
						>
							Keep My Edits
						</button>
					</div>
				</div>
			)}

			<div
				style={{
					backgroundColor: "#ffffff",
					borderRadius: "12px",
					border: needsSceneApproval ? "2px solid #d97706" : "1px solid #e2e8f0",
					padding: "18px",
				}}
			>
				<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "14px" }}>
					<div>
						<h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
							Scenes Breakdown &amp; Live Screenplay Preview ({scenes.length} Scenes)
						</h3>
						<p style={{ margin: "2px 0 0", fontSize: "12.5px", color: "#64748b" }}>
							Inspect each Act&rsquo;s scene outlines, edit individual scenes, retry failed scenes, or view the assembled screenplay.
						</p>
					</div>

					<div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
						<button
							type="button"
							onClick={() => setViewMode("SCENE_SCRIPT")}
							style={{
								padding: "6px 12px",
								borderRadius: "6px",
								border: "1px solid #cbd5e1",
								backgroundColor: viewMode === "SCENE_SCRIPT" ? "#0f172a" : "#ffffff",
								color: viewMode === "SCENE_SCRIPT" ? "#ffffff" : "#334155",
								fontSize: "12px",
								fontWeight: 600,
								cursor: "pointer",
							}}
						>
							Scene Inspector
						</button>
						<button
							type="button"
							onClick={() => setViewMode("FULL_SCREENPLAY")}
							style={{
								padding: "6px 12px",
								borderRadius: "6px",
								border: "1px solid #cbd5e1",
								backgroundColor: viewMode === "FULL_SCREENPLAY" ? "#0f172a" : "#ffffff",
								color: viewMode === "FULL_SCREENPLAY" ? "#ffffff" : "#334155",
								fontSize: "12px",
								fontWeight: 600,
								cursor: "pointer",
							}}
						>
							<FiFileText style={{ verticalAlign: "middle", marginRight: "4px" }} /> Full Assembled Draft
						</button>

						{needsSceneApproval && (
							<button
								type="button"
								disabled={isBusy}
								onClick={() => void onApproveScenes()}
								style={{
									display: "flex",
									alignItems: "center",
									gap: "6px",
									padding: "8px 16px",
									borderRadius: "8px",
									border: "none",
									backgroundColor: "#d97706",
									color: "#ffffff",
									fontWeight: 700,
									fontSize: "12.5px",
									cursor: "pointer",
								}}
							>
								<FiCheck /> Approve Scenes &amp; Write Screenplay
							</button>
						)}
					</div>
				</div>

				{viewMode === "FULL_SCREENPLAY" ? (
					<div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
						<div
							style={{
								backgroundColor: "#fafaf9",
								border: "1px solid #cbd5e1",
								borderRadius: "10px",
								padding: "28px 32px",
								maxHeight: "640px",
								overflowY: "auto",
								fontFamily: "'Courier New', Courier, monospace",
								fontSize: "13.5px",
								lineHeight: 1.55,
								whiteSpace: "pre-wrap",
								color: "#1e293b",
							}}
						>
							{assembledContent?.trim()
								? showFullAssembled || assembledContent.length <= 25000
									? assembledContent
									: `${assembledContent.slice(0, 25000)}\n\n... [Showing first 25,000 of ${assembledContent.length.toLocaleString()} characters for smooth rendering] ...`
								: "No screenplay scene scripts have been generated yet."}
						</div>
						{assembledContent && assembledContent.length > 25000 && (
							<div style={{ display: "flex", justifyContent: "flex-end" }}>
								<button
									type="button"
									onClick={() => setShowFullAssembled((v) => !v)}
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
									{showFullAssembled
										? "Collapse Long Draft Preview (25k chars)"
										: `Expand Full Draft (${assembledContent.length.toLocaleString()} chars)`}
								</button>
							</div>
						)}
					</div>
				) : (
					<div style={{ display: "grid", gridTemplateColumns: "minmax(250px, 310px) 1fr", gap: "16px" }}>
						{/* Scene Selector Sidebar */}
						<div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "560px", overflowY: "auto", paddingRight: "4px" }}>
							{scenes.map((sc) => {
								const active = selectedScene?.id === sc.id;
								return (
									<button
										key={sc.id}
										type="button"
										onClick={() => {
											setSelectedSceneId(sc.id);
											setEditingOutline(false);
											setEditingScript(false);
										}}
										style={{
											textAlign: "left",
											padding: "10px 12px",
											borderRadius: "8px",
											border: active ? "2px solid #d97706" : "1px solid #e2e8f0",
											backgroundColor: active ? "#fffbeb" : "#f8fafc",
											cursor: "pointer",
										}}
									>
										<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", fontWeight: 700, marginBottom: "2px" }}>
											<span style={{ color: "#64748b" }}>
												ACT {sc.actNumber} · SCENE {sc.sceneNumber}
											</span>
											<span
												style={{
													color:
														sc.status === "COMPLETED"
															? "#15803d"
															: sc.status === "FAILED"
															? "#b91c1c"
															: "#b45309",
												}}
											>
												{sc.status}
											</span>
										</div>
										<div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>{sc.title}</div>
										<div style={{ fontSize: "11.5px", color: "#64748b", marginTop: "2px" }}>
											{sc.intExt} {sc.location} — {sc.timeOfDay}
										</div>
										{sc.isManuallyEdited && (
											<span style={{ display: "inline-block", marginTop: "4px", fontSize: "10px", fontWeight: 700, color: "#1d4ed8", backgroundColor: "#dbeafe", padding: "1px 6px", borderRadius: "4px" }}>
												WRITER EDITED
											</span>
										)}
									</button>
								);
							})}
						</div>

						{/* Selected Scene Inspector & Formatted Script */}
						{selectedScene && (
							<div style={{ border: "1px solid #e2e8f0", borderRadius: "10px", padding: "16px", backgroundColor: "#f8fafc", display: "flex", flexDirection: "column", gap: "12px" }}>
								<div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
									<div>
										<div style={{ fontSize: "11.5px", fontWeight: 700, color: "#92400e" }}>
											{selectedScene.intExt} {selectedScene.location.toUpperCase()} - {selectedScene.timeOfDay.toUpperCase()} ({selectedScene.originType})
										</div>
										<h4 style={{ margin: "2px 0", fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
											Scene {selectedScene.sceneNumber}: {selectedScene.title}
										</h4>
										<div style={{ fontSize: "12px", color: "#475569" }}>
											Characters: {(selectedScene.charactersPresent || []).join(", ") || "TBD"}
										</div>
									</div>

									<div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
										<button
											type="button"
											onClick={() => beginOutlineEdit(selectedScene)}
											style={{ display: "flex", alignItems: "center", gap: "4px", padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", backgroundColor: "#fff", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
										>
											<FiEdit3 /> Edit Outline
										</button>
										<button
											type="button"
											onClick={() => beginScriptEdit(selectedScene)}
											style={{ display: "flex", alignItems: "center", gap: "4px", padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", backgroundColor: "#fff", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
										>
											<FiEdit3 /> Edit Scene Script
										</button>
									</div>
								</div>

								{editingOutline ? (
									<div style={{ display: "flex", flexDirection: "column", gap: "8px", backgroundColor: "#fff", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
										<input
											value={draftTitle}
											onChange={(e) => setDraftTitle(e.target.value)}
											placeholder="Scene Title"
											style={{ padding: "7px 9px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", fontWeight: 700 }}
										/>
										<input
											value={draftLocation}
											onChange={(e) => setDraftLocation(e.target.value)}
											placeholder="Location"
											style={{ padding: "7px 9px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}
										/>
										<textarea
											rows={3}
											value={draftPurpose}
											onChange={(e) => setDraftPurpose(e.target.value)}
											placeholder="Scene purpose"
											style={{ padding: "7px 9px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}
										/>
										<div style={{ display: "flex", gap: "8px" }}>
											<button
												type="button"
												disabled={isBusy}
												onClick={async () => {
													await onUpdateScene(selectedScene.id, {
														title: draftTitle,
														location: draftLocation,
														scenePurpose: draftPurpose,
													});
													setEditingOutline(false);
												}}
												style={{ display: "flex", alignItems: "center", gap: "4px", padding: "6px 12px", borderRadius: "6px", border: "none", backgroundColor: "#0f172a", color: "#fff", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
											>
												<FiSave /> Save Outline
											</button>
											<button
												type="button"
												onClick={() => setEditingOutline(false)}
												style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", backgroundColor: "#fff", fontSize: "12px", cursor: "pointer" }}
											>
												Cancel
											</button>
										</div>
									</div>
								) : (
									<div style={{ fontSize: "12.5px", color: "#334155", lineHeight: 1.5, backgroundColor: "#ffffff", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
										<p style={{ margin: "0 0 6px" }}><strong>Purpose:</strong> {selectedScene.scenePurpose}</p>
										{selectedScene.openingSituation && (
											<p style={{ margin: "0 0 6px" }}><strong>Opening Bridge:</strong> {selectedScene.openingSituation}</p>
										)}
										{selectedScene.endingSituation && (
											<p style={{ margin: 0 }}><strong>Ending Consequence:</strong> {selectedScene.endingSituation}</p>
										)}
									</div>
								)}

								{selectedScene.errorMessage && (
									<div style={{ padding: "8px 12px", borderRadius: "6px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", fontSize: "12px" }}>
										<strong>Error:</strong> {selectedScene.errorMessage}
									</div>
								)}

								{/* Screenplay Script Area or Editor */}
								{editingScript ? (
									<div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
										<textarea
											rows={14}
											value={draftScript}
											onChange={(e) => setDraftScript(e.target.value)}
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
													await onUpdateScene(selectedScene.id, {
														screenplayContent: draftScript,
													});
													setEditingScript(false);
												}}
												style={{ display: "flex", alignItems: "center", gap: "4px", padding: "7px 14px", borderRadius: "6px", border: "none", backgroundColor: "#0f172a", color: "#fff", fontSize: "12.5px", fontWeight: 700, cursor: "pointer" }}
											>
												<FiSave /> Save Script (Protect Manual Edit)
											</button>
											<button
												type="button"
												onClick={() => setEditingScript(false)}
												style={{ padding: "7px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", backgroundColor: "#fff", fontSize: "12.5px", cursor: "pointer" }}
											>
												Cancel
											</button>
										</div>
									</div>
								) : (
									<div
										style={{
											backgroundColor: "#ffffff",
											border: "1px solid #cbd5e1",
											borderRadius: "8px",
											padding: "18px 20px",
											fontFamily: "'Courier New', Courier, monospace",
											fontSize: "13px",
											lineHeight: 1.55,
											whiteSpace: "pre-wrap",
											minHeight: "160px",
											color: "#0f172a",
										}}
									>
										{(selectedScene.writerEditedContent ?? selectedScene.screenplayContent)?.trim() ||
											"Screenplay prose for this scene will appear once Stage 4 reaches it."}
									</div>
								)}

								{/* Independent Scene Regeneration Controls */}
								<div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
									<input
										type="text"
										placeholder="Optional instructions for regenerating this scene only..."
										value={retryInstructions}
										onChange={(e) => setRetryInstructions(e.target.value)}
										style={{ flex: 1, minWidth: "220px", padding: "7px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12.5px", backgroundColor: "#fff" }}
									/>
									<button
										type="button"
										disabled={isBusy}
										onClick={() =>
											void onRetryScene(selectedScene, {
												instructions: retryInstructions.trim() || undefined,
											})
										}
										style={{
											display: "flex",
											alignItems: "center",
											gap: "6px",
											padding: "7px 14px",
											borderRadius: "6px",
											border: "1px solid #d97706",
											backgroundColor: "#fffbeb",
											color: "#b45309",
											fontWeight: 700,
											fontSize: "12.5px",
											cursor: "pointer",
										}}
									>
										<FiRefreshCw /> Retry / Regenerate Scene {selectedScene.sceneNumber}
									</button>
								</div>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}

