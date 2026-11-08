"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { storyService } from "../../services/storyService";
import { useAI } from "../../hooks/useAI";
import { Story, UpsertStoryInput } from "../../types/story";
import {
	FiSave,
	FiCheckCircle,
	FiAlertCircle,
	FiClock,
	FiArrowRight,
	FiLayers,
} from "react-icons/fi";

interface StoryEditorProps {
	movieId: string;
	movieTitle?: string;
}

export function StoryEditor({ movieId, movieTitle = "Movie Project" }: StoryEditorProps) {
	const [story, setStory] = useState<Story | null>(null);
	const [logline, setLogline] = useState("");
	const [synopsis, setSynopsis] = useState("");
	const [theme, setTheme] = useState("");
	const [setting, setSetting] = useState("");
	const [beginning, setBeginning] = useState("");
	const [middle, setMiddle] = useState("");
	const [ending, setEnding] = useState("");

	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved" | "error">("saved");
	const [statusMessage, setStatusMessage] = useState<string | null>(null);

	const { generateStory, isGenerating: isAIGenerating, error: aiError } = useAI(movieId);
	const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);
	const isInitialMount = useRef(true);

	// Load existing story from backend
	const fetchStory = useCallback(async () => {
		if (!movieId) return;
		setIsLoading(true);
		setStatusMessage(null);
		try {
			const data = await storyService.getStory(movieId);
			if (data) {
				setStory(data);
				setLogline(data.logline || "");
				setSynopsis(data.synopsis || "");
				setTheme(data.theme || "");
				setSetting(data.setting || "");
				setBeginning(data.beginning || "");
				setMiddle(data.middle || "");
				setEnding(data.ending || "");
				setSaveStatus("saved");
			}
		} catch (err: unknown) {
			// If not found or error, leave empty for user to start drafting
			setStatusMessage(err instanceof Error ? err.message : "Failed to load story");
			setSaveStatus("error");
		} finally {
			setIsLoading(false);
		}
	}, [movieId]);

	useEffect(() => {
		fetchStory();
	}, [fetchStory]);

	// Mark as unsaved on edit and queue debounced autosave
	const handleFieldChange = (setter: (val: string) => void, val: string) => {
		setter(val);
		setSaveStatus("unsaved");

		if (autosaveTimerRef.current) {
			clearTimeout(autosaveTimerRef.current);
		}

		autosaveTimerRef.current = setTimeout(() => {
			triggerSave({
				logline: setter === setLogline ? val : logline,
				synopsis: setter === setSynopsis ? val : synopsis,
				theme: setter === setTheme ? val : theme,
				setting: setter === setSetting ? val : setting,
				beginning: setter === setBeginning ? val : beginning,
				middle: setter === setMiddle ? val : middle,
				ending: setter === setEnding ? val : ending,
			});
		}, 3000);
	};

	// Save story directly to backend
	const triggerSave = async (overrideData?: UpsertStoryInput) => {
		if (!movieId || isSaving) return;
		setIsSaving(true);
		setSaveStatus("saving");
		setStatusMessage(null);

		const payload: UpsertStoryInput = overrideData || {
			logline: logline.trim() || undefined,
			synopsis: synopsis.trim() || undefined,
			theme: theme.trim() || undefined,
			setting: setting.trim() || undefined,
			beginning: beginning.trim() || undefined,
			middle: middle.trim() || undefined,
			ending: ending.trim() || undefined,
		};

		try {
			const saved = await storyService.upsertStory(movieId, payload);
			setStory(saved);
			setSaveStatus("saved");
			setStatusMessage("Story saved to database");
			setTimeout(() => setStatusMessage(null), 3000);
		} catch (err: unknown) {
			setSaveStatus("error");
			setStatusMessage(err instanceof Error ? err.message : "Failed to save story changes");
		} finally {
			setIsSaving(false);
		}
	};

	// Trigger AI story generation
	const handleAIGenerate = async () => {
		try {
			setStatusMessage("FilmForge AI is analyzing your movie concept...");
			const res = await generateStory();
			if (res && res.output) {
				const output = res.output as unknown as Record<string, string>;
				if (output.logline) setLogline(output.logline);
				if (output.synopsis) setSynopsis(output.synopsis);
				if (output.theme) setTheme(output.theme);
				if (output.setting) setSetting(output.setting);
				if (output.beginning) setBeginning(output.beginning);
				if (output.middle) setMiddle(output.middle);
				if (output.ending) setEnding(output.ending);

				setSaveStatus("unsaved");
				setStatusMessage("AI generated story framework. Review and click Save.");
			}
		} catch (err: unknown) {
			setStatusMessage(err instanceof Error ? err.message : "AI Story Generation failed");
		}
	};

	if (isLoading) {
		return (
			<div style={{ padding: "48px 0", textAlign: "center", color: "#64748b" }}>
				<div style={{ display: "inline-block", width: "24px", height: "24px", border: "3px solid #e2e8f0", borderTopColor: "#f59e0b", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
				<p style={{ marginTop: "12px", fontSize: "14px" }}>Loading story workspace...</p>
			</div>
		);
	}

	return (
		<div style={{ maxWidth: "1100px", margin: "0 auto", paddingBottom: "60px" }}>
			{/* Top Bar with Title, Status & Actions */}
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					flexWrap: "wrap",
					gap: "16px",
					marginBottom: "24px",
					paddingBottom: "16px",
					borderBottom: "1px solid #e2e8f0",
				}}
			>
				<div>
					<h2 style={{ fontSize: "22px", fontWeight: "700", color: "#0f172a", margin: "0 0 4px" }}>
						Story Concept &amp; Premise
					</h2>
					<p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
						Define the dramatic foundation, world setting, and narrative arc for {movieTitle}.
					</p>
				</div>

				<div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
					{/* Save status badge */}
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: "6px",
							fontSize: "13px",
							fontWeight: "500",
							padding: "6px 12px",
							borderRadius: "20px",
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
						{saveStatus === "saved" && <FiCheckCircle size={14} />}
						{saveStatus === "saving" && <FiClock size={14} />}
						{saveStatus === "unsaved" && <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f59e0b" }} />}
						{saveStatus === "error" && <FiAlertCircle size={14} />}
						<span>
							{saveStatus === "saved"
								? "All changes saved"
								: saveStatus === "saving"
								? "Saving..."
								: saveStatus === "unsaved"
								? "Unsaved changes"
								: "Save error"}
						</span>
					</div>

					{/* AI Generation button */}
					<button
						type="button"
						onClick={handleAIGenerate}
						disabled={isAIGenerating || isSaving}
						style={{
							display: "flex",
							alignItems: "center",
							gap: "6px",
							padding: "8px 16px",
							borderRadius: "20px",
							background: "#fef3c7",
							color: "#92400e",
							border: "1px solid #fde68a",
							fontSize: "13.5px",
							fontWeight: "600",
							cursor: isAIGenerating ? "not-allowed" : "pointer",
						}}
					>
						<span style={{ fontSize: "14px", color: "#d97706" }}>✦</span>
						<span>{isAIGenerating ? "Generating..." : "AI Story Assistant"}</span>
					</button>

					{/* Manual Save button */}
					<button
						type="button"
						onClick={() => triggerSave()}
						disabled={isSaving}
						style={{
							display: "flex",
							alignItems: "center",
							gap: "6px",
							padding: "8px 20px",
							borderRadius: "20px",
							background: "#0f172a",
							color: "#ffffff",
							border: "none",
							fontSize: "13.5px",
							fontWeight: "600",
							cursor: isSaving ? "not-allowed" : "pointer",
							boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
						}}
					>
						<FiSave size={14} />
						<span>{isSaving ? "Saving..." : "Save Story"}</span>
					</button>
				</div>
			</div>

			{/* Status / Alert Banner */}
			{statusMessage && (
				<div
					style={{
						padding: "12px 18px",
						borderRadius: "10px",
						marginBottom: "20px",
						fontSize: "13.5px",
						background: saveStatus === "error" ? "#fef2f2" : "#f0fdf4",
						color: saveStatus === "error" ? "#991b1b" : "#166534",
						border: `1px solid ${saveStatus === "error" ? "#fecaca" : "#bbf7d0"}`,
						display: "flex",
						alignItems: "center",
						gap: "8px",
					}}
				>
					{saveStatus === "error" ? <FiAlertCircle size={16} /> : <FiCheckCircle size={16} />}
					<span>{statusMessage}</span>
				</div>
			)}

			{/* Section 1: Concept, Theme & Setting */}
			<div
				style={{
					background: "#ffffff",
					border: "1px solid #e2e8f0",
					borderRadius: "14px",
					padding: "24px 28px",
					marginBottom: "24px",
					boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
				}}
			>
				<h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", margin: "0 0 16px" }}>
					Core Dramatic Premise
				</h3>

				{/* Logline */}
				<div style={{ marginBottom: "18px" }}>
					<label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
						Logline (One-Sentence Hook)
					</label>
					<input
						type="text"
						value={logline}
						onChange={(e) => handleFieldChange(setLogline, e.target.value)}
						placeholder="When an aspiring sound engineer uncovers an encrypted pirate signal, he must expose a corporate conspiracy before he is silenced."
						style={{
							width: "100%",
							padding: "10px 14px",
							borderRadius: "8px",
							border: "1px solid #cbd5e1",
							fontSize: "14px",
							color: "#0f172a",
							outline: "none",
							boxSizing: "border-box",
						}}
					/>
				</div>

				{/* Theme & Setting Row */}
				<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
					<div>
						<label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
							Central Theme &amp; Tone
						</label>
						<input
							type="text"
							value={theme}
							onChange={(e) => handleFieldChange(setTheme, e.target.value)}
							placeholder="e.g. Truth vs. Silence, Paranoia, Family loyalty"
							style={{
								width: "100%",
								padding: "10px 14px",
								borderRadius: "8px",
								border: "1px solid #cbd5e1",
								fontSize: "14px",
								color: "#0f172a",
								outline: "none",
								boxSizing: "border-box",
							}}
						/>
					</div>

					<div>
						<label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
							World Setting &amp; Period
						</label>
						<input
							type="text"
							value={setting}
							onChange={(e) => handleFieldChange(setSetting, e.target.value)}
							placeholder="e.g. Modern Kigali &amp; Lake Kivu, rainy season"
							style={{
								width: "100%",
								padding: "10px 14px",
								borderRadius: "8px",
								border: "1px solid #cbd5e1",
								fontSize: "14px",
								color: "#0f172a",
								outline: "none",
								boxSizing: "border-box",
							}}
						/>
					</div>
				</div>
			</div>

			{/* Section 2: Narrative Synopsis */}
			<div
				style={{
					background: "#ffffff",
					border: "1px solid #e2e8f0",
					borderRadius: "14px",
					padding: "24px 28px",
					marginBottom: "24px",
					boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
				}}
			>
				<h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", margin: "0 0 16px" }}>
					Narrative Synopsis
				</h3>
				<textarea
					rows={5}
					value={synopsis}
					onChange={(e) => handleFieldChange(setSynopsis, e.target.value)}
					placeholder="Provide a comprehensive summary of the story's overall progression, character stakes, and major turning points..."
					style={{
						width: "100%",
						padding: "12px 14px",
						borderRadius: "8px",
						border: "1px solid #cbd5e1",
						fontSize: "14px",
						lineHeight: "1.6",
						color: "#0f172a",
						outline: "none",
						resize: "vertical",
						boxSizing: "border-box",
					}}
				/>
			</div>

			{/* Section 3: Three-Act Structure */}
			<div
				style={{
					background: "#ffffff",
					border: "1px solid #e2e8f0",
					borderRadius: "14px",
					padding: "24px 28px",
					marginBottom: "28px",
					boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
				}}
			>
				<h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", margin: "0 0 6px" }}>
					Three-Act Dramatic Structure
				</h3>
				<p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 20px" }}>
					Draft the overarching trajectory before breaking it down into individual scenes.
				</p>

				<div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>
					{/* Act 1 */}
					<div style={{ borderLeft: "4px solid #f59e0b", paddingLeft: "16px" }}>
						<label style={{ display: "block", fontSize: "14px", fontWeight: "700", color: "#0f172a", marginBottom: "6px" }}>
							Act 1 — The Beginning (Setup &amp; Inciting Incident)
						</label>
						<p style={{ fontSize: "12.5px", color: "#64748b", margin: "0 0 8px" }}>
							Introduce protagonist, ordinary world, and the catalyst that sparks the adventure.
						</p>
						<textarea
							rows={3}
							value={beginning}
							onChange={(e) => handleFieldChange(setBeginning, e.target.value)}
							placeholder="Describe how the story begins and what challenges the protagonist faces..."
							style={{
								width: "100%",
								padding: "10px 14px",
								borderRadius: "8px",
								border: "1px solid #cbd5e1",
								fontSize: "13.5px",
								lineHeight: "1.5",
								color: "#0f172a",
								outline: "none",
								boxSizing: "border-box",
							}}
						/>
					</div>

					{/* Act 2 */}
					<div style={{ borderLeft: "4px solid #3b82f6", paddingLeft: "16px" }}>
						<label style={{ display: "block", fontSize: "14px", fontWeight: "700", color: "#0f172a", marginBottom: "6px" }}>
							Act 2 — The Middle (Rising Action, Obstacles &amp; Midpoint)
						</label>
						<p style={{ fontSize: "12.5px", color: "#64748b", margin: "0 0 8px" }}>
							Rising stakes, trials, confrontations, and the point of no return.
						</p>
						<textarea
							rows={3}
							value={middle}
							onChange={(e) => handleFieldChange(setMiddle, e.target.value)}
							placeholder="Describe the central conflict, confrontations with the antagonist, and complications..."
							style={{
								width: "100%",
								padding: "10px 14px",
								borderRadius: "8px",
								border: "1px solid #cbd5e1",
								fontSize: "13.5px",
								lineHeight: "1.5",
								color: "#0f172a",
								outline: "none",
								boxSizing: "border-box",
							}}
						/>
					</div>

					{/* Act 3 */}
					<div style={{ borderLeft: "4px solid #10b981", paddingLeft: "16px" }}>
						<label style={{ display: "block", fontSize: "14px", fontWeight: "700", color: "#0f172a", marginBottom: "6px" }}>
							Act 3 — The Ending (Climax &amp; Resolution)
						</label>
						<p style={{ fontSize: "12.5px", color: "#64748b", margin: "0 0 8px" }}>
							The ultimate confrontation, resolution of dramatic questions, and new equilibrium.
						</p>
						<textarea
							rows={3}
							value={ending}
							onChange={(e) => handleFieldChange(setEnding, e.target.value)}
							placeholder="Describe the final battle or breakthrough and how the characters transform..."
							style={{
								width: "100%",
								padding: "10px 14px",
								borderRadius: "8px",
								border: "1px solid #cbd5e1",
								fontSize: "13.5px",
								lineHeight: "1.5",
								color: "#0f172a",
								outline: "none",
								boxSizing: "border-box",
							}}
						/>
					</div>
				</div>
			</div>

			{/* Bottom Action Footer */}
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					padding: "16px 24px",
					background: "#f8fafc",
					borderRadius: "12px",
					border: "1px solid #e2e8f0",
				}}
			>
				<span style={{ fontSize: "13.5px", color: "#64748b" }}>
					Next stage in workflow: Define your characters and scene breakdown.
				</span>

				<div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
					<Link
						href={`/movies/${movieId}/characters`}
						style={{
							display: "inline-flex",
							alignItems: "center",
							gap: "6px",
							padding: "9px 18px",
							borderRadius: "20px",
							background: "#ffffff",
							border: "1px solid #cbd5e1",
							color: "#334155",
							fontSize: "13.5px",
							fontWeight: "600",
							textDecoration: "none",
						}}
					>
						<span>Develop Characters</span>
						<FiArrowRight size={14} />
					</Link>

					<Link
						href={`/movies/${movieId}/outline`}
						style={{
							display: "inline-flex",
							alignItems: "center",
							gap: "6px",
							padding: "9px 20px",
							borderRadius: "20px",
							background: "#f59e0b",
							color: "#ffffff",
							fontSize: "13.5px",
							fontWeight: "600",
							textDecoration: "none",
							boxShadow: "0 2px 4px rgba(245, 158, 11, 0.2)",
						}}
					>
						<FiLayers size={14} />
						<span>Go to Story Outline</span>
						<FiArrowRight size={14} />
					</Link>
				</div>
			</div>
		</div>
	);
}
