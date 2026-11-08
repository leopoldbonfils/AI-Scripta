"use client";

import { useState, useEffect, useCallback } from "react";
import { screenplayService } from "../../services/screenplayService";
import { useAI } from "../../hooks/useAI";
import { StoryAct, Scene } from "../../types/screenplay";
import { FiPlus, FiSparkles, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

export interface OutlineScene {
	id: string;
	actId: number | string;
	sceneNumber: number;
	title: string;
	location?: string;
	timeOfDay?: string;
}

interface StoryOutlineViewProps {
	movieId?: string;
	onOpenScreenplay: (sceneId?: string) => void;
	onImproveStory?: () => void;
}

const defaultActsConfig = [
	{ actNumber: 1, title: "The Beginning", description: "Setup, world introduction, and inciting incident." },
	{ actNumber: 2, title: "The Conflict", description: "Rising stakes, confrontations, and midpoint shift." },
	{ actNumber: 3, title: "The Resolution", description: "Climax, resolution, and character transformation." },
];

export function StoryOutlineView({
	movieId,
	onOpenScreenplay,
	onImproveStory,
}: StoryOutlineViewProps) {
	const [acts, setActs] = useState<StoryAct[]>([]);
	const [scenes, setScenes] = useState<Scene[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [isAddingScene, setIsAddingScene] = useState<string | null>(null); // actId being added to
	const [newSceneTitle, setNewSceneTitle] = useState("");
	const [showToast, setShowToast] = useState(false);
	const [toastMsg, setToastMsg] = useState("New scene added to outline!");
	const [errorMsg, setErrorMsg] = useState<string | null>(null);

	const { generateOutline, isGenerating: isAIGenerating } = useAI(movieId);

	const triggerToast = (msg: string) => {
		setToastMsg(msg);
		setShowToast(true);
		setTimeout(() => setShowToast(false), 3000);
	};

	// Fetch or initialize acts & scenes
	const fetchOutlineData = useCallback(async () => {
		if (!movieId) {
			setIsLoading(false);
			return;
		}

		setIsLoading(true);
		setErrorMsg(null);

		try {
			let actList = await screenplayService.getActs(movieId);

			// If no acts exist in DB yet, initialize standard 3-act structure
			if (!actList || actList.length === 0) {
				const createdActs: StoryAct[] = [];
				for (const def of defaultActsConfig) {
					try {
						const created = await screenplayService.createAct(movieId, def);
						createdActs.push(created);
					} catch {
						// Continue if act already created
					}
				}
				actList = createdActs.length > 0 ? createdActs : actList;
			}

			// Sort acts by actNumber
			actList.sort((a, b) => a.actNumber - b.actNumber);
			setActs(actList);

			// Fetch all scenes for this movie
			const sceneList = await screenplayService.getScenes(movieId);
			setScenes(sceneList || []);
		} catch (err: unknown) {
			setErrorMsg(err instanceof Error ? err.message : "Failed to load story outline");
		} finally {
			setIsLoading(false);
		}
	}, [movieId]);

	useEffect(() => {
		fetchOutlineData();
	}, [fetchOutlineData]);

	// Add scene to a specific act
	const handleAddSceneSubmit = async (actId: string, actNumber: number) => {
		if (!movieId) return;
		const title = newSceneTitle.trim() || `Scene ${scenes.filter(s => s.actId === actId).length + 1}`;
		setIsAddingScene(null);
		setNewSceneTitle("");

		try {
			const actScenes = scenes.filter((s) => s.actId === actId);
			const sceneNumber = scenes.length + 1;

			const created = await screenplayService.createScene(movieId, {
				actId,
				sceneNumber,
				title,
				location: "INT. UNKNOWN LOCATION",
				timeOfDay: "DAY",
			});

			setScenes((prev) => [...prev, created]);
			triggerToast(`Added "${created.title}" to Act ${actNumber}`);
		} catch (err: unknown) {
			setErrorMsg(err instanceof Error ? err.message : "Failed to add scene");
		}
	};

	// AI Outline generation
	const handleAIImprove = async () => {
		if (onImproveStory && !movieId) {
			onImproveStory();
			return;
		}

		try {
			triggerToast("FilmForge AI is analyzing acts and dramatic pacing...");
			await generateOutline();
			await fetchOutlineData();
			triggerToast("AI updated your story outline with new beats!");
		} catch (err: unknown) {
			triggerToast(err instanceof Error ? err.message : "AI Outline generation failed");
		}
	};

	if (isLoading) {
		return (
			<div style={{ padding: "60px 0", textAlign: "center", color: "#64748b" }}>
				<div
					style={{
						display: "inline-block",
						width: "28px",
						height: "28px",
						border: "3px solid #e2e8f0",
						borderTopColor: "#f59e0b",
						borderRadius: "50%",
						animation: "spin 1s linear infinite",
					}}
				/>
				<p style={{ marginTop: "12px", fontSize: "14px" }}>Loading 3-act story outline...</p>
			</div>
		);
	}

	return (
		<div className="outline-view-wrapper">
			{/* Outline Header */}
			<div className="outline-header">
				<div>
					<h1 className="outline-title">Your Story Outline</h1>
					<p className="outline-subtitle">
						Plan your movie scene by scene across classical 3-act structure.
					</p>
				</div>

				<button
					type="button"
					className="outline-btn-improve"
					onClick={handleAIImprove}
					disabled={isAIGenerating}
				>
					<span>{isAIGenerating ? "Generating..." : "Improve My Story"}</span>
					<span className="sparkle">✦</span>
				</button>
			</div>

			{/* Error Alert */}
			{errorMsg && (
				<div
					style={{
						padding: "12px 18px",
						borderRadius: "10px",
						background: "#fef2f2",
						border: "1px solid #fecaca",
						color: "#991b1b",
						marginBottom: "20px",
						fontSize: "13.5px",
						display: "flex",
						alignItems: "center",
						gap: "8px",
					}}
				>
					<FiAlertCircle size={16} />
					<span>{errorMsg}</span>
				</div>
			)}

			{/* Three Act Columns */}
			<div className="outline-acts-grid">
				{acts.map((act) => {
					const actScenes = scenes.filter((s) => s.actId === act.id);
					return (
						<div className="act-column-card" key={act.id}>
							<div className="act-badge-title">
								<span>ACT</span>
								<span className="act-badge-num">{act.actNumber}</span>
							</div>
							<h2 className="act-subheading">{act.title}</h2>
							{act.description && (
								<p style={{ fontSize: "12px", color: "#64748b", margin: "-6px 0 14px", lineHeight: "1.4" }}>
									{act.description}
								</p>
							)}

							<div className="act-scenes-container">
								{actScenes.length === 0 ? (
									<div
										style={{
											padding: "24px 12px",
											textAlign: "center",
											border: "1px dashed #cbd5e1",
											borderRadius: "10px",
											color: "#94a3b8",
											fontSize: "13px",
										}}
									>
										No scenes in Act {act.actNumber} yet.
									</div>
								) : (
									actScenes.map((scene) => (
										<button
											key={scene.id}
											type="button"
											className="outline-scene-card"
											onClick={() => onOpenScreenplay(scene.id)}
											title="Click to write this scene in Screenplay Editor"
										>
											<span className="scene-card-label">
												Scene {scene.sceneNumber}
											</span>
											<p className="scene-card-desc">
												<span className="scene-card-bullet">✦</span>
												<span>{scene.title}</span>
											</p>
										</button>
									))
								)}
							</div>

							{/* Add Scene Inline Form or Button */}
							{isAddingScene === act.id ? (
								<div style={{ marginTop: "12px", padding: "10px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
									<input
										type="text"
										autoFocus
										placeholder="Scene heading or title..."
										value={newSceneTitle}
										onChange={(e) => setNewSceneTitle(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === "Enter") handleAddSceneSubmit(act.id, act.actNumber);
											if (e.key === "Escape") setIsAddingScene(null);
										}}
										style={{
											width: "100%",
											padding: "8px 10px",
											borderRadius: "6px",
											border: "1px solid #cbd5e1",
											fontSize: "13px",
											marginBottom: "8px",
											outline: "none",
											boxSizing: "border-box",
										}}
									/>
									<div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
										<button
											type="button"
											onClick={() => setIsAddingScene(null)}
											style={{
												padding: "4px 10px",
												background: "transparent",
												border: "none",
												color: "#64748b",
												fontSize: "12px",
												cursor: "pointer",
											}}
										>
											Cancel
										</button>
										<button
											type="button"
											onClick={() => handleAddSceneSubmit(act.id, act.actNumber)}
											style={{
												padding: "5px 12px",
												background: "#0f172a",
												color: "#ffffff",
												border: "none",
												borderRadius: "6px",
												fontSize: "12px",
												fontWeight: "600",
												cursor: "pointer",
											}}
										>
											Add
										</button>
									</div>
								</div>
							) : (
								<button
									type="button"
									className="act-add-scene-btn"
									onClick={() => {
										setIsAddingScene(act.id);
										setNewSceneTitle("");
									}}
								>
									<span>+</span>
									<span>Add Scene</span>
								</button>
							)}
						</div>
					);
				})}
			</div>

			{/* Bottom navigation */}
			<div className="outline-footer-nav">
				<span style={{ fontSize: "13px", color: "#64748b" }}>
					Tip: Click on any scene to open the full Screenplay Editor and write dialogue.
				</span>
				<button
					type="button"
					className="outline-btn-screenplay"
					onClick={() => onOpenScreenplay()}
				>
					<span>Continue to Screenplay</span>
					<span>→</span>
				</button>
			</div>

			{/* Toast */}
			{showToast && (
				<div className="studio-toast">
					<span className="studio-toast-icon">✓</span>
					<span>{toastMsg}</span>
				</div>
			)}
		</div>
	);
}
