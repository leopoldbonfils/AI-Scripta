"use client";

import { useState } from "react";

export interface OutlineScene {
	id: string;
	actId: number;
	sceneNumber: number;
	title: string;
}

interface StoryOutlineViewProps {
	onOpenScreenplay: (sceneId?: string) => void;
	onImproveStory?: () => void;
}

const initialScenes: OutlineScene[] = [
	{ id: "act1-s1", actId: 1, sceneNumber: 1, title: "Kigali City – Morning" },
	{ id: "act1-s2", actId: 1, sceneNumber: 2, title: "A Mysterious Message" },
	{ id: "act2-s1", actId: 2, sceneNumber: 1, title: "The Investigation" },
	{ id: "act2-s2", actId: 2, sceneNumber: 2, title: "The Chase" },
	{ id: "act3-s1", actId: 3, sceneNumber: 1, title: "The Final Confrontation" },
	{ id: "act3-s2", actId: 3, sceneNumber: 2, title: "A New Beginning" },
];

export function StoryOutlineView({
	onOpenScreenplay,
	onImproveStory,
}: StoryOutlineViewProps) {
	const [scenes, setScenes] = useState<OutlineScene[]>(initialScenes);
	const [showToast, setShowToast] = useState(false);

	const handleAddScene = (actId: number) => {
		const actScenes = scenes.filter((s) => s.actId === actId);
		const nextSceneNum = actScenes.length + 1;
		const defaultTitles: Record<number, string[]> = {
			1: ["Tech Lab Breakthrough", "First Contact", "The Warning"],
			2: ["The Ambush", "Underground Cipher", "Betrayal in the Shadows"],
			3: ["Dawn Over the Hills", "Unmasking the Code", "A Quiet Resolution"],
		};
		const pool = defaultTitles[actId] || ["New Scene"];
		const title = pool[actScenes.length % pool.length];

		const newScene: OutlineScene = {
			id: `act${actId}-s${nextSceneNum}-${Date.now()}`,
			actId,
			sceneNumber: nextSceneNum,
			title,
		};

		setScenes([...scenes, newScene]);
		setShowToast(true);
		setTimeout(() => setShowToast(false), 2500);
	};

	const acts = [
		{
			id: 1,
			badge: "ACT 1",
			subheading: "The Beginning",
		},
		{
			id: 2,
			badge: "ACT 2",
			subheading: "The Conflict",
		},
		{
			id: 3,
			badge: "ACT 3",
			subheading: "The Resolution",
		},
	];

	return (
		<div className="outline-view-wrapper">
			{/* Outline Header */}
			<div className="outline-header">
				<div>
					<h1 className="outline-title">Your Story Outline</h1>
					<p className="outline-subtitle">Plan your movie scene by scene.</p>
				</div>

				<button
					type="button"
					className="outline-btn-improve"
					onClick={() => {
						if (onImproveStory) {
							onImproveStory();
						} else {
							onOpenScreenplay();
						}
					}}
				>
					<span>Improve My Story</span>
					<span className="sparkle">✦</span>
				</button>
			</div>

			{/* Three Act Columns */}
			<div className="outline-acts-grid">
				{acts.map((act) => {
					const actScenes = scenes.filter((s) => s.actId === act.id);
					return (
						<div className="act-column-card" key={act.id}>
							<div className="act-badge-title">
								<span>ACT</span>
								<span className="act-badge-num">{act.id}</span>
							</div>
							<h2 className="act-subheading">{act.subheading}</h2>

							<div className="act-scenes-container">
								{actScenes.map((scene) => (
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
								))}
							</div>

							<button
								type="button"
								className="act-add-scene-btn"
								onClick={() => handleAddScene(act.id)}
							>
								<span>+</span>
								<span>Add Scene</span>
							</button>
						</div>
					);
				})}
			</div>

			{/* Bottom navigation */}
			<div className="outline-footer-nav">
				<span style={{ fontSize: "13px", color: "#64748b" }}>
					Tip: Click on any scene to open the full Screenplay Editor.
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
					<span>New scene added to outline!</span>
				</div>
			)}
		</div>
	);
}

