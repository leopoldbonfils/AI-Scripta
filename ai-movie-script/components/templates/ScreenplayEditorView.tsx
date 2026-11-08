"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useScreenplay } from "../../hooks/useScreenplay";
import { useAI } from "../../hooks/useAI";
import { screenplayService } from "../../services/screenplayService";
import { Scene, ScreenplayVersion } from "../../types/screenplay";
import { Modal } from "../ui/Modal";
import {
	FiSave,
	FiDownload,
	FiSend,
	FiClock,
	FiCheckCircle,
	FiAlertCircle,
	FiRotateCcw,
	FiGitCommit,
	FiRefreshCw,
	FiList,
} from "react-icons/fi";
import { FaClapperboard } from "react-icons/fa6";

interface ScreenplayEditorViewProps {
	movieId?: string;
	movieTitle?: string;
	onGoToExport: () => void;
	onBackToOutline?: () => void;
}

export function ScreenplayEditorView({
	movieId,
	movieTitle = "Screenplay Draft",
	onGoToExport,
	onBackToOutline,
}: ScreenplayEditorViewProps) {
	const {
		screenplay,
		versions,
		saveStatus,
		isLoading: isScreenplayLoading,
		error: screenplayError,
		updateContent,
		saveScreenplay,
		createVersion,
		restoreVersion,
		syncScenes,
		hasConflict,
		resolveConflict,
	} = useScreenplay({
		movieId,
		defaultTitle: movieTitle,
		enableAutosave: true,
		autosaveDelayMs: 2500,
	});

	const { improveScene, generateScene, isGenerating: isAIGenerating } = useAI(movieId);

	// Local scenes list
	const [scenes, setScenes] = useState<Scene[]>([]);
	const [activeSceneIndex, setActiveSceneIndex] = useState(0);
	const [chatInput, setChatInput] = useState("");
	const [toastMsg, setToastMsg] = useState<string | null>(null);

	// Modals
	const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
	const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
	const [versionSummary, setVersionSummary] = useState("");
	const [isCreatingVersion, setIsCreatingVersion] = useState(false);
	const [restoringVersionId, setRestoringVersionId] = useState<string | null>(null);
	const [isSyncing, setIsSyncing] = useState(false);

	const textareaRef = useRef<HTMLTextAreaElement | null>(null);

	const showNotification = (msg: string) => {
		setToastMsg(msg);
		setTimeout(() => setToastMsg(null), 3000);
	};

	// Fetch scenes for this movie
	const fetchScenes = useCallback(async () => {
		if (!movieId) return;
		try {
			const res = await screenplayService.getScenes(movieId);
			if (res && res.length > 0) {
				setScenes(res);
			}
		} catch {
			// Ignore non-fatal scene list failure
		}
	}, [movieId]);

	useEffect(() => {
		fetchScenes();
	}, [fetchScenes]);

	// Select scene from left panel
	const handleSelectScene = (index: number) => {
		setActiveSceneIndex(index);
		const targetScene = scenes[index];
		if (!targetScene) return;

		// Focus and scroll in textarea if heading is present
		if (textareaRef.current) {
			const text = textareaRef.current.value;
			const search = targetScene.title.toUpperCase();
			const pos = text.toUpperCase().indexOf(search);
			if (pos !== -1) {
				textareaRef.current.focus();
				textareaRef.current.setSelectionRange(pos, pos + search.length);
			}
		}
	};

	// Add scene
	const handleAddScene = async () => {
		if (!movieId) {
			showNotification("Save project first to add scenes");
			return;
		}

		const nextNum = scenes.length + 1;
		const defaultHeading = `EXT. NEW LOCATION ${nextNum} - DAY`;
		try {
			const newScene = await screenplayService.createScene(movieId, {
				sceneNumber: nextNum,
				title: defaultHeading,
				location: "NEW LOCATION",
				timeOfDay: "DAY",
			});

			const updated = [...scenes, newScene];
			setScenes(updated);
			setActiveSceneIndex(updated.length - 1);

			// Append to screenplay text
			const sceneSnippet = `\n\n${defaultHeading}\n\nAction description goes here.\n\n                    CHARACTER\n          First line of dialogue.\n`;
			updateContent((screenplay?.content || "") + sceneSnippet);
			showNotification(`Added Scene ${nextNum}`);
		} catch (err: unknown) {
			showNotification(err instanceof Error ? err.message : "Failed to add scene");
		}
	};

	// Manual save
	const handleSave = async () => {
		try {
			await saveScreenplay();
			showNotification("Screenplay saved successfully! ✓");
		} catch (err: unknown) {
			showNotification(err instanceof Error ? err.message : "Failed to save screenplay");
		}
	};

	// Create version snapshot
	const handleCreateVersionSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsCreatingVersion(true);
		try {
			const v = await createVersion(versionSummary.trim() || undefined);
			setIsVersionModalOpen(false);
			setVersionSummary("");
			showNotification(`Saved version snapshot v${v.versionNumber}`);
		} catch (err: unknown) {
			showNotification(err instanceof Error ? err.message : "Failed to create version snapshot");
		} finally {
			setIsCreatingVersion(false);
		}
	};

	// Restore version
	const handleRestoreVersion = async (version: ScreenplayVersion) => {
		setRestoringVersionId(version.id);
		try {
			await restoreVersion(version.id);
			setIsHistoryModalOpen(false);
			showNotification(`Restored screenplay to version v${version.versionNumber}!`);
		} catch (err: unknown) {
			showNotification(err instanceof Error ? err.message : "Failed to restore version");
		} finally {
			setRestoringVersionId(null);
		}
	};

	// Sync scenes
	const handleSyncScenes = async () => {
		setIsSyncing(true);
		try {
			await syncScenes(false);
			await fetchScenes();
			showNotification("Screenplay synchronized with outline scenes! ✓");
		} catch (err: unknown) {
			showNotification(err instanceof Error ? err.message : "Scene sync failed");
		} finally {
			setIsSyncing(false);
		}
	};

	// AI Action Buttons
	const handleAIAction = async (action: string) => {
		if (!movieId) {
			showNotification("AI assistance requires an active project");
			return;
		}

		showNotification("FilmForge AI is analyzing and drafting dialogue...");
		const currentText = screenplay?.content || "";
		const promptMap: Record<string, string> = {
			improve: "Improve dramatic pacing, subtext, and sensory atmosphere for this scene.",
			rewrite: "Rewrite the character dialogue with sharper subtext and tension.",
			emotional: "Deepen emotional resonance, vulnerability, and internal character stakes.",
			suspense: "Inject acute suspense, pacing escalation, and ticking-clock tension.",
			continue: "Continue this scene naturally with realistic character behavior and conflict.",
		};

		const instruction = promptMap[action] || "Enhance screenplay scene.";

		try {
			const res = await improveScene({
				sceneContent: currentText.slice(-1200) || "EXT. CITY - NIGHT",
				action:
					action === "rewrite"
						? "REWRITE"
						: action === "emotional"
						? "STRENGTHEN_EMOTION"
						: action === "suspense"
						? "IMPROVE_PACING"
						: "IMPROVE_DIALOGUE",
				instructions: instruction,
			});

			if (res && res.output) {
				const generatedText = typeof res.output === "string" ? res.output : JSON.stringify(res.output);
				updateContent(`${currentText}\n\n${generatedText}`);
				showNotification(`✦ Applied FilmForge AI: ${action}`);
			}
		} catch (err: unknown) {
			// Non-destructive fallback message
			showNotification(err instanceof Error ? err.message : "AI generation failed. Please try again.");
		}
	};

	// AI Prompt Chat
	const handleSendChat = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!chatInput.trim() || isAIGenerating) return;
		const query = chatInput.trim();
		setChatInput("");
		showNotification(`FilmForge AI processing: "${query}"...`);

		const currentText = screenplay?.content || "";
		try {
			const res = await generateScene({
				sceneId: scenes[activeSceneIndex]?.id || "scene-active",
				instructions: query,
			});

			if (res && res.output) {
				const generatedText = typeof res.output === "string" ? res.output : JSON.stringify(res.output);
				updateContent(`${currentText}\n\n${generatedText}`);
				showNotification(`✦ FilmForge AI generated script content!`);
			}
		} catch (err: unknown) {
			showNotification(err instanceof Error ? err.message : "AI request failed");
		}
	};

	if (isScreenplayLoading) {
		return (
			<div style={{ padding: "80px 0", textAlign: "center", color: "#64748b" }}>
				<div
					style={{
						display: "inline-block",
						width: "32px",
						height: "32px",
						border: "3px solid #e2e8f0",
						borderTopColor: "#f59e0b",
						borderRadius: "50%",
						animation: "spin 1s linear infinite",
					}}
				/>
				<p style={{ marginTop: "16px", fontSize: "14px" }}>Loading screenplay manuscript and scenes...</p>
			</div>
		);
	}

	return (
		<div className="screenplay-v2-wrapper">
			{/* Top Bar */}
			<div className="screenplay-v2-header">
				<div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
					{onBackToOutline && (
						<button
							type="button"
							onClick={onBackToOutline}
							style={{
								background: "transparent",
								border: "none",
								color: "#64748b",
								cursor: "pointer",
								fontSize: "13px",
								display: "flex",
								alignItems: "center",
								gap: "4px",
							}}
						>
							← Outline
						</button>
					)}
					<h1 className="screenplay-v2-title">
						{screenplay?.title || movieTitle}
					</h1>

					{/* Save status badge */}
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: "5px",
							fontSize: "12px",
							fontWeight: "500",
							padding: "4px 10px",
							borderRadius: "14px",
							background:
								saveStatus === "saved"
									? "#ecfdf5"
									: saveStatus === "saving"
									? "#fffbeb"
									: saveStatus === "unsaved"
									? "#f8fafc"
									: "#fef2f2",
							color:
								saveStatus === "saved"
									? "#059669"
									: saveStatus === "saving"
									? "#d97706"
									: saveStatus === "unsaved"
									? "#64748b"
									: "#dc2626",
							border: "1px solid #e2e8f0",
						}}
					>
						{saveStatus === "saved" && <FiCheckCircle size={12} />}
						{saveStatus === "saving" && <FiClock size={12} />}
						{saveStatus === "unsaved" && <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#f59e0b" }} />}
						{saveStatus === "error" && <FiAlertCircle size={12} />}
						<span>
							{saveStatus === "saved"
								? "Saved"
								: saveStatus === "saving"
								? "Saving..."
								: saveStatus === "unsaved"
								? "Unsaved changes"
								: "Save error"}
						</span>
					</div>
				</div>

				<div className="screenplay-v2-actions">
					{/* Version Snapshot button */}
					<button
						type="button"
						onClick={() => setIsVersionModalOpen(true)}
						style={{
							display: "flex",
							alignItems: "center",
							gap: "5px",
							padding: "7px 12px",
							borderRadius: "16px",
							background: "#f8fafc",
							border: "1px solid #cbd5e1",
							color: "#334155",
							fontSize: "12.5px",
							fontWeight: "600",
							cursor: "pointer",
						}}
						title="Save an immutable version snapshot"
					>
						<FiGitCommit size={13} />
						<span>Save Version</span>
					</button>

					{/* Version History button */}
					<button
						type="button"
						onClick={() => setIsHistoryModalOpen(true)}
						style={{
							display: "flex",
							alignItems: "center",
							gap: "5px",
							padding: "7px 12px",
							borderRadius: "16px",
							background: "#f8fafc",
							border: "1px solid #cbd5e1",
							color: "#334155",
							fontSize: "12.5px",
							fontWeight: "600",
							cursor: "pointer",
						}}
						title="View version history and restore snapshots"
					>
						<FiRotateCcw size={13} />
						<span>History ({versions.length})</span>
					</button>

					{/* Sync Scenes */}
					<button
						type="button"
						onClick={handleSyncScenes}
						disabled={isSyncing}
						style={{
							display: "flex",
							alignItems: "center",
							gap: "5px",
							padding: "7px 12px",
							borderRadius: "16px",
							background: "#f8fafc",
							border: "1px solid #cbd5e1",
							color: "#334155",
							fontSize: "12.5px",
							fontWeight: "600",
							cursor: isSyncing ? "not-allowed" : "pointer",
						}}
						title="Sync outline scenes into screenplay document"
					>
						<FiRefreshCw size={13} className={isSyncing ? "spin" : ""} />
						<span>Sync Scenes</span>
					</button>

					{/* Manual Save */}
					<button
						type="button"
						className="screenplay-btn-save"
						onClick={handleSave}
						disabled={saveStatus === "saving"}
					>
						<FiSave size={15} />
						<span>Save</span>
					</button>

					{/* AI Help */}
					<button
						type="button"
						className="screenplay-btn-ai-help"
						onClick={() => handleAIAction("improve")}
						disabled={isAIGenerating}
					>
						<span>✦</span>
						<span>{isAIGenerating ? "Thinking..." : "AI Help"}</span>
					</button>

					{/* Export button */}
					<button
						type="button"
						className="screenplay-btn-export"
						onClick={onGoToExport}
					>
						<FiDownload size={15} />
						<span>Export</span>
					</button>
				</div>
			</div>

			{/* Conflict Detection Banner */}
			{hasConflict && (
				<div
					style={{
						padding: "12px 20px",
						background: "#fffbeb",
						border: "1px solid #fde68a",
						borderRadius: "10px",
						margin: "0 0 16px",
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						gap: "12px",
						color: "#92400e",
						fontSize: "13.5px",
					}}
				>
					<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
						<FiAlertCircle size={18} />
						<span>
							A newer draft of this screenplay was saved in another session. Reload to inspect updates.
						</span>
					</div>
					<button
						type="button"
						onClick={resolveConflict}
						style={{
							padding: "6px 14px",
							background: "#d97706",
							color: "#ffffff",
							border: "none",
							borderRadius: "6px",
							fontWeight: "600",
							fontSize: "12.5px",
							cursor: "pointer",
						}}
					>
						Reload Latest
					</button>
				</div>
			)}

			{/* Three Column Screenplay Workspace */}
			<div className="screenplay-v2-grid">
				{/* 1. Left Scenes Panel */}
				<aside className="screenplay-scenes-panel">
					<div className="scenes-panel-top">
						<span className="scenes-panel-title">Scenes</span>
						<button
							type="button"
							className="scenes-panel-add-icon"
							onClick={handleAddScene}
							title="Add Scene"
						>
							+
						</button>
					</div>

					<div className="scenes-v2-list">
						{scenes.length === 0 ? (
							<p style={{ padding: "16px 12px", fontSize: "12.5px", color: "#94a3b8", textAlign: "center" }}>
								No scenes added yet. Click &quot;+&quot; or sync from outline.
							</p>
						) : (
							scenes.map((sc, idx) => {
								const isActive = idx === activeSceneIndex;
								return (
									<button
										key={sc.id}
										type="button"
										className={`scene-v2-pill${isActive ? " active" : ""}`}
										onClick={() => handleSelectScene(idx)}
									>
										<span>
											{sc.sceneNumber ? String(sc.sceneNumber).padStart(2, "0") : String(idx + 1).padStart(2, "0")}.{" "}
											{sc.title}
										</span>
										{isActive && (
											<span style={{ fontSize: "11px", opacity: 0.8 }}>●</span>
										)}
									</button>
								);
							})
						)}
					</div>

					<button
						type="button"
						className="scene-v2-add-btn"
						onClick={handleAddScene}
					>
						<span>+</span>
						<span>Add Scene</span>
					</button>
				</aside>

				{/* 2. Center Screenplay Document Paper */}
				<main className="screenplay-paper-wrapper">
					<textarea
						ref={textareaRef}
						className="screenplay-paper-content"
						value={screenplay?.content || ""}
						onChange={(e) => updateContent(e.target.value)}
						placeholder={`FADE IN:\n\nEXT. CITY STREET - DAY\n\nAction lines go here...\n\n                    CHARACTER NAME\n          First line of dialogue.\n`}
						style={{
							width: "100%",
							minHeight: "560px",
							border: "none",
							resize: "none",
							background: "transparent",
							outline: "none",
							fontFamily: "Courier, 'Courier New', monospace",
							fontSize: "14px",
							lineHeight: "1.6",
						}}
						aria-label="Screenplay editor content"
					/>
				</main>

				{/* 3. Right FilmForge AI Assistant Panel */}
				<aside className="screenplay-ai-panel">
					<div className="screenplay-ai-brand">
						<div className="screenplay-ai-badge">
							<FaClapperboard size={15} color="#f59e0b" />
						</div>
						<span className="screenplay-ai-brand-text">FilmForge AI</span>
					</div>

					<p className="screenplay-ai-subtitle">
						How can I help with your screenplay?
					</p>

					{/* 5 Quick Action Buttons */}
					<div className="screenplay-ai-actions">
						<button
							type="button"
							className="screenplay-ai-action-btn"
							onClick={() => handleAIAction("improve")}
							disabled={isAIGenerating}
						>
							<span className="ai-icon-bubble amber">✦</span>
							<span>Improve this scene</span>
						</button>

						<button
							type="button"
							className="screenplay-ai-action-btn"
							onClick={() => handleAIAction("rewrite")}
							disabled={isAIGenerating}
						>
							<span className="ai-icon-bubble blue">↻</span>
							<span>Rewrite dialogue</span>
						</button>

						<button
							type="button"
							className="screenplay-ai-action-btn"
							onClick={() => handleAIAction("emotional")}
							disabled={isAIGenerating}
						>
							<span className="ai-icon-bubble teal">💬</span>
							<span>Make it more emotional</span>
						</button>

						<button
							type="button"
							className="screenplay-ai-action-btn"
							onClick={() => handleAIAction("suspense")}
							disabled={isAIGenerating}
						>
							<span className="ai-icon-bubble indigo">⚡</span>
							<span>Add suspense</span>
						</button>

						<button
							type="button"
							className="screenplay-ai-action-btn"
							onClick={() => handleAIAction("continue")}
							disabled={isAIGenerating}
						>
							<span className="ai-icon-bubble purple">✍️</span>
							<span>Continue scene</span>
						</button>
					</div>

					{/* Chat Input */}
					<form onSubmit={handleSendChat} className="screenplay-ai-chat">
						<input
							type="text"
							placeholder={isAIGenerating ? "Generating..." : "Ask something..."}
							value={chatInput}
							onChange={(e) => setChatInput(e.target.value)}
							disabled={isAIGenerating}
							className="screenplay-ai-input"
						/>
						<button
							type="submit"
							className="screenplay-ai-send"
							aria-label="Send prompt"
							disabled={isAIGenerating}
						>
							<FiSend size={13} />
						</button>
					</form>
				</aside>
			</div>

			{/* Toast */}
			{toastMsg && (
				<div className="studio-toast">
					<span className="studio-toast-icon">✦</span>
					<span>{toastMsg}</span>
				</div>
			)}

			{/* Modal: Save Version Snapshot */}
			<Modal
				isOpen={isVersionModalOpen}
				title="Create Version Snapshot"
				onClose={() => setIsVersionModalOpen(false)}
			>
				<form onSubmit={handleCreateVersionSubmit}>
					<p style={{ color: "#475569", fontSize: "14px", lineHeight: "1.6", margin: "0 0 16px" }}>
						Create an immutable snapshot of your screenplay draft. You can restore or inspect historical snapshots anytime.
					</p>

					<div style={{ marginBottom: "20px" }}>
						<label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
							Change Summary (Optional)
						</label>
						<input
							type="text"
							placeholder="e.g. Revised Act 2 climax and dialogue pacing"
							value={versionSummary}
							onChange={(e) => setVersionSummary(e.target.value)}
							style={{
								width: "100%",
								padding: "10px 14px",
								borderRadius: "8px",
								border: "1px solid #cbd5e1",
								fontSize: "14px",
								outline: "none",
								boxSizing: "border-box",
							}}
						/>
					</div>

					<div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
						<button
							type="button"
							onClick={() => setIsVersionModalOpen(false)}
							style={{
								padding: "8px 16px",
								background: "#f1f5f9",
								border: "1px solid #cbd5e1",
								borderRadius: "8px",
								color: "#475569",
								fontWeight: "600",
								fontSize: "13px",
								cursor: "pointer",
							}}
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={isCreatingVersion}
							style={{
								padding: "8px 18px",
								background: "#0f172a",
								border: "none",
								borderRadius: "8px",
								color: "#ffffff",
								fontWeight: "600",
								fontSize: "13px",
								cursor: isCreatingVersion ? "not-allowed" : "pointer",
							}}
						>
							{isCreatingVersion ? "Saving Snapshot..." : "Save Version"}
						</button>
					</div>
				</form>
			</Modal>

			{/* Modal: Version History */}
			<Modal
				isOpen={isHistoryModalOpen}
				title="Screenplay Version History"
				onClose={() => setIsHistoryModalOpen(false)}
			>
				{versions.length === 0 ? (
					<p style={{ color: "#64748b", fontSize: "14px", textAlign: "center", padding: "24px 0" }}>
						No historical version snapshots created yet. Click &quot;Save Version&quot; to bookmark a milestone.
					</p>
				) : (
					<div style={{ maxHeight: "360px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
						{versions.map((ver) => (
							<div
								key={ver.id}
								style={{
									display: "flex",
									alignItems: "center",
									justifyContent: "space-between",
									padding: "12px 16px",
									background: "#f8fafc",
									border: "1px solid #e2e8f0",
									borderRadius: "8px",
								}}
							>
								<div>
									<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
										<span style={{ fontWeight: "700", color: "#0f172a", fontSize: "14px" }}>
											Version {ver.versionNumber}
										</span>
										<span style={{ fontSize: "12px", color: "#64748b" }}>
											{new Date(ver.createdAt).toLocaleString()}
										</span>
									</div>
									<p style={{ margin: "4px 0 0", fontSize: "13px", color: "#475569" }}>
										{ver.changeSummary || "No description provided"}
									</p>
								</div>

								<button
									type="button"
									onClick={() => handleRestoreVersion(ver)}
									disabled={restoringVersionId === ver.id}
									style={{
										padding: "6px 14px",
										background: "#0f172a",
										color: "#ffffff",
										border: "none",
										borderRadius: "6px",
										fontSize: "12.5px",
										fontWeight: "600",
										cursor: restoringVersionId === ver.id ? "not-allowed" : "pointer",
									}}
								>
									{restoringVersionId === ver.id ? "Restoring..." : "Restore"}
								</button>
							</div>
						))}
					</div>
				)}

				<div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
					<button
						type="button"
						onClick={() => setIsHistoryModalOpen(false)}
						style={{
							padding: "8px 16px",
							background: "#f1f5f9",
							border: "1px solid #cbd5e1",
							borderRadius: "8px",
							color: "#475569",
							fontWeight: "600",
							fontSize: "13px",
							cursor: "pointer",
						}}
					>
						Close
					</button>
				</div>
			</Modal>
		</div>
	);
}
