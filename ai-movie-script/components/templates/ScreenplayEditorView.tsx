"use client";

import { useState } from "react";

interface SceneItem {
	id: string;
	num: string;
	title: string;
	heading: string;
	content: string;
}

const defaultScenes: SceneItem[] = [
	{
		id: "s1",
		num: "01",
		title: "Opening",
		heading: "EXT. KIGALI CITY - DUSK",
		content: `FADE IN:

EXT. KIGALI CITY - DUSK
The sun dips behind the thousand hills. Amber streetlamps flicker awake along the curving tarmac.

ERIC (24), observant and wearing an oversized dark jacket, steps off the commuter bus. He checks his smartwatch.

A strange pulsing sound emits through his wireless earphones.`,
	},
	{
		id: "s2",
		num: "02",
		title: "Apartment",
		heading: "INT. ERIC'S APARTMENT - NIGHT",
		content: `INT. ERIC'S APARTMENT - NIGHT
Dual computer monitors bathe the small room in cool blue phosphorescence.

Eric dumps his backpack on the sofa and sits at his terminal. Lines of encrypted raw telemetry stream past at breakneck speed.

He leans in closer, eyes reflecting the code.`,
	},
	{
		id: "s3",
		num: "03",
		title: "Discovery",
		heading: "EXT. KIGALI CITY - NIGHT",
		content: `FADE IN:

EXT. KIGALI CITY - NIGHT
The city is quiet.

ERIC, 24, walks home while looking
at his phone.

His phone suddenly vibrates.

                    ERIC
          Who's calling me?

He looks at the screen.`,
	},
	{
		id: "s4",
		num: "04",
		title: "The Signal",
		heading: "INT. ABANDONED BROADCAST TOWER - NIGHT",
		content: `INT. ABANDONED BROADCAST TOWER - NIGHT
Dust motes float in the beam of Eric's flashlight.

In the center of the derelict room sits a military-grade transceiver, its LED relays humming with fresh power.

ERIC
This shouldn't be transmitting anything. Not here.`,
	},
	{
		id: "s5",
		num: "05",
		title: "Chase",
		heading: "EXT. DOWNTOWN ALLEYWAY - NIGHT",
		content: `EXT. DOWNTOWN ALLEYWAY - NIGHT
Heavy footsteps splash through rain puddles.

A black SUV skids around the corner, its high beams slicing into the darkness where Eric is running.

He vaults over a corrugated fence, breath ragged.`,
	},
	{
		id: "s6",
		num: "06",
		title: "Final Scene",
		heading: "INT. OBSERVATORY - DAWN",
		content: `INT. OBSERVATORY - DAWN
The first golden rays of sunlight pierce through the glass dome.

Eric slides the decrypted memory drive into the emergency broadcast console.

On the screen, one phrase appears:
TRANSMISSION ACTIVE.

FADE OUT.`,
	},
];

interface ScreenplayEditorViewProps {
	onGoToExport: () => void;
	onBackToOutline?: () => void;
}

export function ScreenplayEditorView({
	onGoToExport,
	onBackToOutline,
}: ScreenplayEditorViewProps) {
	const [scenes, setScenes] = useState<SceneItem[]>(defaultScenes);
	const [activeSceneIndex, setActiveSceneIndex] = useState(2); // 03. Discovery
	const [scriptText, setScriptText] = useState(defaultScenes[2].content);
	const [chatInput, setChatInput] = useState("");
	const [toastMsg, setToastMsg] = useState<string | null>(null);

	const showNotification = (msg: string) => {
		setToastMsg(msg);
		setTimeout(() => setToastMsg(null), 2500);
	};

	const handleSelectScene = (index: number) => {
		setActiveSceneIndex(index);
		setScriptText(scenes[index].content);
	};

	const handleAddScene = () => {
		const nextNum = (scenes.length + 1).toString().padStart(2, "0");
		const newScene: SceneItem = {
			id: `s${Date.now()}`,
			num: nextNum,
			title: `Scene ${nextNum}`,
			heading: `EXT. NEW LOCATION - DAY`,
			content: `EXT. NEW LOCATION - DAY\n\nERIC arrives at the rendezvous point.\n\nHe waits in silence.\n\n                    ERIC\n          Is anybody there?`,
		};
		const updated = [...scenes, newScene];
		setScenes(updated);
		setActiveSceneIndex(updated.length - 1);
		setScriptText(newScene.content);
		showNotification(`Added Scene ${nextNum}`);
	};

	const handleSave = () => {
		// Update scene content
		const updated = [...scenes];
		updated[activeSceneIndex].content = scriptText;
		setScenes(updated);
		showNotification("Screenplay saved successfully! ✓");
	};

	const handleAIAction = (action: string) => {
		if (action === "improve") {
			setScriptText(
				(prev) =>
					`${prev}\n\nA shadow darts across the reflection in his phone. Eric freezes, feeling the chill of unseen eyes.`
			);
			showNotification("✦ Enhanced scene pacing & atmosphere");
		} else if (action === "rewrite") {
			setScriptText(
				(prev) =>
					`${prev}\n\n                    ERIC\n          (whispering)\n          If you can hear me... tell me what this is.`
			);
			showNotification("↻ Rewrote dialogue with subtext");
		} else if (action === "emotional") {
			setScriptText(
				(prev) =>
					`${prev}\n\nHe clutches a small silver medallion in his pocket. A reminder of his sister's unfinished work.`
			);
			showNotification("💬 Added emotional character beat");
		} else if (action === "suspense") {
			setScriptText(
				(prev) =>
					`${prev}\n\nCLICK. The metallic sound of a cocked hammer echoes from the alleyway behind him.`
			);
			showNotification("⚡ Injected suspense & tension spike");
		} else if (action === "continue") {
			setScriptText(
				(prev) =>
					`${prev}\n\nThe caller ID on the phone flashes: 'THEY KNOW.'\n\nEric turns on his heel and bolts down the staircase.`
			);
			showNotification("✍️ Generated scene continuation");
		}
	};

	const handleSendChat = (e: React.FormEvent) => {
		e.preventDefault();
		if (!chatInput.trim()) return;
		const query = chatInput;
		setChatInput("");
		setScriptText((prev) => `${prev}\n\n[FilmForge AI: Addressing "${query}"]\nEric takes a calculated breath and moves forward into the shadows.`);
		showNotification(`FilmForge AI processed your prompt!`);
	};

	return (
		<div className="screenplay-v2-wrapper">
			{/* Top Bar */}
			<div className="screenplay-v2-header">
				<div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
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
					<h1 className="screenplay-v2-title">The Last Signal</h1>
				</div>

				<div className="screenplay-v2-actions">
					<button
						type="button"
						className="screenplay-btn-save"
						onClick={handleSave}
					>
						<svg
							width="15"
							height="15"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
							<polyline points="17 21 17 13 7 13 7 21" />
							<polyline points="7 3 7 8 15 8" />
						</svg>
						<span>Save</span>
					</button>

					<button
						type="button"
						className="screenplay-btn-ai-help"
						onClick={() => handleAIAction("improve")}
					>
						<span>✦</span>
						<span>AI Help</span>
					</button>

					{/* Critical Export button that navigates to the Export page */}
					<button
						type="button"
						className="screenplay-btn-export"
						onClick={onGoToExport}
					>
						<svg
							width="15"
							height="15"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2.2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
							<polyline points="7 10 12 15 17 10" />
							<line x1="12" y1="15" x2="12" y2="3" />
						</svg>
						<span>Export</span>
					</button>
				</div>
			</div>

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
						{scenes.map((sc, idx) => {
							const isActive = idx === activeSceneIndex;
							return (
								<button
									key={sc.id}
									type="button"
									className={`scene-v2-pill${isActive ? " active" : ""}`}
									onClick={() => handleSelectScene(idx)}
								>
									<span>
										{sc.num}. {sc.title}
									</span>
									{isActive && (
										<span style={{ fontSize: "11px", opacity: 0.8 }}>●</span>
									)}
								</button>
							);
						})}
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
						className="screenplay-paper-content"
						value={scriptText}
						onChange={(e) => setScriptText(e.target.value)}
						style={{
							width: "100%",
							minHeight: "480px",
							border: "none",
							resize: "none",
							background: "transparent",
						}}
						aria-label="Screenplay editor content"
					/>
				</main>

				{/* 3. Right FilmForge AI Assistant Panel */}
				<aside className="screenplay-ai-panel">
					<div className="screenplay-ai-brand">
						<div className="screenplay-ai-badge">
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M3 8h18v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z"
									fill="#18181b"
								/>
								<rect x="3" y="3" width="18" height="5" rx="1" fill="#18181b" />
								<path
									d="M7 3l-2 5h2.5l2-5H7zm5 0l-2 5h2.5l2-5H12zm5 0l-2 5h2.5l2-5H17z"
									fill="#fef08a"
								/>
							</svg>
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
						>
							<span className="ai-icon-bubble amber">✦</span>
							<span>Improve this scene</span>
						</button>

						<button
							type="button"
							className="screenplay-ai-action-btn"
							onClick={() => handleAIAction("rewrite")}
						>
							<span className="ai-icon-bubble blue">↻</span>
							<span>Rewrite dialogue</span>
						</button>

						<button
							type="button"
							className="screenplay-ai-action-btn"
							onClick={() => handleAIAction("emotional")}
						>
							<span className="ai-icon-bubble teal">💬</span>
							<span>Make it more emotional</span>
						</button>

						<button
							type="button"
							className="screenplay-ai-action-btn"
							onClick={() => handleAIAction("suspense")}
						>
							<span className="ai-icon-bubble indigo">⚡</span>
							<span>Add suspense</span>
						</button>

						<button
							type="button"
							className="screenplay-ai-action-btn"
							onClick={() => handleAIAction("continue")}
						>
							<span className="ai-icon-bubble purple">✍️</span>
							<span>Continue scene</span>
						</button>
					</div>

					{/* Chat Input */}
					<form onSubmit={handleSendChat} className="screenplay-ai-chat">
						<input
							type="text"
							placeholder="Ask something..."
							value={chatInput}
							onChange={(e) => setChatInput(e.target.value)}
							className="screenplay-ai-input"
						/>
						<button
							type="submit"
							className="screenplay-ai-send"
							aria-label="Send prompt"
						>
							<svg
								width="13"
								height="13"
								viewBox="0 0 24 24"
								fill="currentColor"
							>
								<path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
							</svg>
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
		</div>
	);
}

