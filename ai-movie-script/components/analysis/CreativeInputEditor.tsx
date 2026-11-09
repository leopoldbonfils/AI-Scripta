"use client";

import React, { useState } from "react";
import { CreativeInputType } from "../../types/analysis";
import {
	FiFileText,
	FiChevronDown,
	FiChevronUp,
	FiAlertCircle,
	FiCheckCircle,
	FiZap,
	FiBookOpen,
	FiLayers,
} from "react-icons/fi";

export interface CreativeInputEditorProps {
	content: string;
	onContentChange: (val: string) => void;
	inputType: CreativeInputType;
	onInputTypeChange: (type: CreativeInputType) => void;
	genre: string;
	onGenreChange: (val: string) => void;
	targetAudience: string;
	onTargetAudienceChange: (val: string) => void;
	intendedFormat: string;
	onIntendedFormatChange: (val: string) => void;
	additionalInstructions: string;
	onAdditionalInstructionsChange: (val: string) => void;
	isAnalyzing: boolean;
	error: string | null;
	onSubmit: () => void;
	onOpenHistory?: () => void;
	historyCount?: number;
}

const inputTypeOptions: Array<{ type: CreativeInputType; label: string; description: string }> = [
	{
		type: "AUTO_DETECT",
		label: "Auto Detect (Recommended)",
		description: "FilmForge AI inspects sluglines, dialogue, chapters, and structure to determine type automatically.",
	},
	{
		type: "SHORT_IDEA",
		label: "Short Idea / Logline",
		description: "1-3 sentences or high-concept premise looking for dramatic direction.",
	},
	{
		type: "SHORT_SCRIPT",
		label: "Short Script / Scene",
		description: "Complete or partial short film script with scene headings and character dialogue.",
	},
	{
		type: "SYNOPSIS",
		label: "Story Synopsis / Beat Sheet",
		description: "Overview spanning beginning, middle shift, and ending resolution.",
	},
	{
		type: "LONG_STORY",
		label: "Long-Form Story / Prose",
		description: "Multi-page prose narrative, treatment, or novella requiring deep character tracking.",
	},
	{
		type: "NOVEL_CHAPTER",
		label: "Novel Chapter",
		description: "Single chapter of a manuscript to evaluate pacing, POV, and chapter state change.",
	},
	{
		type: "INCOMPLETE_SCREENPLAY",
		label: "Incomplete Screenplay",
		description: "Screenplay draft that ceases before climax or has unfinished acts.",
	},
	{
		type: "EXISTING_SCREENPLAY",
		label: "Complete Screenplay",
		description: "Full feature or short screenplay for coverage, dialogue subtext, and pacing analysis.",
	},
];

const sampleInputs: Record<CreativeInputType, { title: string; text: string }> = {
	AUTO_DETECT: {
		title: "The Kigali Pulse",
		text: `EXT. KIGALI ROOFTOP - DUSK\n\nRain washes over the red clay tiles. Below, the roundabout pulses with headlights.\n\nERIC (24), drenched in a canvas jacket, adjusts a copper receiver wire taped to the antenna.\n\nHis wireless headset CRACKLES. A rhythmic encrypted pulse: beep... beep-beep... pause.\n\nERIC\n(into voice memo)\nFrequency 104.7. Modulation matches the telecom syndicate's telemetry test. But this voice... it's my sister's voice.\n\nDown on the street, an unmarked black SUV slow-rolls to a stop directly beneath his ladder.`,
	},
	SHORT_IDEA: {
		title: "Echo Archive",
		text: "A reclusive audio archivist discovers analog tape reels from the 1970s that accurately broadcast the next morning's breaking news catastrophes twelve hours before they occur.",
	},
	SHORT_SCRIPT: {
		title: "Twelve Minutes Late",
		text: `INT. RECORDING BOOTH - NIGHT\n\nSound-dampening foam walls. Neon yellow VU meters bounce into the red.\n\nERIC sits frozen. A voice cuts through the static.\n\n        LUCIA (V.O.)\nIf you are listening to this frequency, the firewall has collapsed. Do not go home.\n\nEric reaches for the fader. His fingers tremble.\n\n        ERIC\nLucia? Where are you transmitting from?\n\nSilence. Then the sound of heavy metal doors BREACHED on the other end of the line.`,
	},
	SYNOPSIS: {
		title: "The Last Signal Synopsis",
		text: "When an observant audio engineer intercepts an encrypted pulse transmitting from an abandoned telecom station in Kigali, he uncovers an illegal corporate mass-surveillance apparatus. Joined by an investigative journalist who lost her brother to the same syndicate, they dodge corporate extraction teams across the nocturnal hills. After their rooftop transmitter is besieged during a torrential thunderstorm, they route the decrypted audio coordinates through the national observatory's public radio relay, broadcasting the truth across thousands of phones and digital billboards at dawn.",
	},
	LONG_STORY: {
		title: "The Signal on the Mountain",
		text: "Eric spent four months cataloging ambient radio interference along the ridge of Mount Kigali. His gear was modest: a refurbished field recorder, a directional parabolic dish, and two notebooks filled with frequency logs. The villagers down in the valley thought he was measuring weather patterns. Only Sarah knew why he slept in the observation shack. Three years earlier, her sister had vanished during an audit of the city's privatized fiber backbone. The police filed it as a runaway case. But on the third Sunday of October, amidst the heavy drum of monsoon rain against the corrugated zinc roof, Eric's headphones clicked alive with a frequency that wasn't supposed to exist.",
	},
	NOVEL_CHAPTER: {
		title: "Chapter 3: The Broken Frequency",
		text: "CHAPTER THREE\n\nThe silence in the sound lab was heavier than usual. It was the specific silence that followed bad news, thick with the smell of ozone and wet wool from Eric's overcoat. He rewound the magnetic spool by hand, feeling the brittle polyester tape glide between his calloused thumb and forefinger. Sarah stood by the frosted window, watching the rain blur the headlights crawling down Boulevard de la Revolution. Neither of them had spoken since the carrier signal cut out at midnight.",
	},
	INCOMPLETE_SCREENPLAY: {
		title: "The Last Signal (Draft)",
		text: `EXT. MOUNT KIGALI OVERLOOK - DAWN\n\nMist rises from the valley like smoke from an extinguished campfire.\n\nERIC and SARAH huddle inside an open communications van. Laptop screens cast cold blue light across their faces.\n\n        SARAH\nThe relay is holding. We have seven minutes before their signal jammer reaches the tower.\n\n        ERIC\nSeven minutes is enough.\n\nHe plugs the auxiliary jack into the broadcast console. The antenna motor GROANS as it angles toward the city center.\n\nSuddenly, the power cuts. Darkness.\n\n[DRAFT CEASES HERE - ACT III CLIMAX UNRESOLVED]`,
	},
	EXISTING_SCREENPLAY: {
		title: "The Last Signal (Full Short Script)",
		text: `EXT. KIGALI STREETS - NIGHT\n\nRain hammers the pavement.\n\nERIC (20s) sprints past glowing shop windows, clutching a hard drive to his chest.\n\nBehind him, headlights glare. A dark SUV accelerates.\n\nINT. RADIO OBSERVATORY - CONTINUOUS\n\nEric bursts through the fire doors, panting, and throws the deadbolt.\n\nSARAH looks up from the master soundboard.\n\n        SARAH\nDid you get it?\n\n        ERIC\nThe entire unedited registry. Connect the antenna.\n\nSarah flips three heavy toggle switches. Red status lights turn GREEN.\n\n        SARAH\nLive on all channels in three... two... one.\n\nEric leans into the microphone.\n\n        ERIC\nThis is not a drill. To everyone listening across the city tonight...\n\nFADE OUT.`,
	},
};

export function CreativeInputEditor({
	content,
	onContentChange,
	inputType,
	onInputTypeChange,
	genre,
	onGenreChange,
	targetAudience,
	onTargetAudienceChange,
	intendedFormat,
	onIntendedFormatChange,
	additionalInstructions,
	onAdditionalInstructionsChange,
	isAnalyzing,
	error,
	onSubmit,
	onOpenHistory,
	historyCount = 0,
}: CreativeInputEditorProps) {
	const [showContextAccordion, setShowContextAccordion] = useState(false);

	const charCount = content.length;
	const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

	const handleLoadSample = (type: CreativeInputType) => {
		const sample = sampleInputs[type];
		if (sample) {
			onContentChange(sample.text);
			onInputTypeChange(type);
		}
	};

	const currentTypeInfo =
		inputTypeOptions.find((opt) => opt.type === inputType) || inputTypeOptions[0];

	return (
		<div className="analysis-editor-card" style={{ background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
			{/* Header with Type Selector & History */}
			<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "18px" }}>
				<div>
					<span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#d97706" }}>
						FilmForge AI Analysis Engine
					</span>
					<h2 style={{ fontSize: "19px", fontWeight: 700, color: "#0f172a", margin: "2px 0 0" }}>
						Submit Creative Material for Deep Analysis
					</h2>
				</div>

				{onOpenHistory && historyCount > 0 && (
					<button
						type="button"
						onClick={onOpenHistory}
						style={{
							display: "flex",
							alignItems: "center",
							gap: "6px",
							padding: "6px 12px",
							borderRadius: "8px",
							background: "#f8fafc",
							border: "1px solid #cbd5e1",
							color: "#334155",
							fontSize: "12.5px",
							fontWeight: 600,
							cursor: "pointer",
						}}
					>
						<FiLayers size={13} />
						<span>Past Analyses ({historyCount})</span>
					</button>
				)}
			</div>

			{/* Input Type Selector Pills */}
			<div style={{ marginBottom: "16px" }}>
				<label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "8px" }}>
					Material Format:
				</label>
				<div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
					{inputTypeOptions.map((opt) => {
						const isSelected = inputType === opt.type;
						return (
							<button
								key={opt.type}
								type="button"
								onClick={() => onInputTypeChange(opt.type)}
								disabled={isAnalyzing}
								style={{
									padding: "6px 12px",
									borderRadius: "8px",
									fontSize: "12px",
									fontWeight: isSelected ? 600 : 500,
									border: isSelected ? "1px solid #d97706" : "1px solid #e2e8f0",
									backgroundColor: isSelected ? "#fef3c7" : "#ffffff",
									color: isSelected ? "#92400e" : "#475569",
									cursor: isAnalyzing ? "not-allowed" : "pointer",
									transition: "all 0.15s ease",
								}}
							>
								{opt.label}
							</button>
						);
					})}
				</div>
				<p style={{ fontSize: "12px", color: "#64748b", margin: "8px 0 0", fontStyle: "italic" }}>
					{currentTypeInfo.description}
				</p>
			</div>

			{/* Text Area Writing / Pasting Zone */}
			<div style={{ position: "relative", marginBottom: "14px" }}>
				<textarea
					value={content}
					onChange={(e) => onContentChange(e.target.value)}
					disabled={isAnalyzing}
					placeholder={`Paste or write your creative material here...\n\nExamples:\n- A high-concept movie logline\n- Scene screenplay with sluglines (EXT./INT.)\n- Story synopsis or beat sheet\n- Novel chapter text\n- Long-form narrative story\n\nFilmForge AI will understand the material, structure, and character relationships without altering your original writing.`}
					style={{
						width: "100%",
						minHeight: "280px",
						padding: "16px",
						borderRadius: "10px",
						border: "1px solid #cbd5e1",
						fontSize: "14px",
						lineHeight: "1.6",
						color: "#0f172a",
						backgroundColor: isAnalyzing ? "#f8fafc" : "#ffffff",
						resize: "vertical",
						outline: "none",
						fontFamily: "ui-sans-serif, system-ui, sans-serif",
					}}
				/>

				{/* Word & Character Count Bar */}
				<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px", fontSize: "12px", color: "#64748b" }}>
					<div style={{ display: "flex", gap: "14px" }}>
						<span><strong>{wordCount.toLocaleString()}</strong> words</span>
						<span><strong>{charCount.toLocaleString()}</strong> characters</span>
						{charCount > 14000 && (
							<span style={{ color: "#d97706", fontWeight: 600 }}>
								⚡ Multi-chunk deep analysis enabled ({Math.ceil(charCount / 9500)} passes)
							</span>
						)}
					</div>

					{/* Quick sample load button */}
					{!content && (
						<button
							type="button"
							onClick={() => handleLoadSample(inputType)}
							style={{
								background: "none",
								border: "none",
								color: "#d97706",
								fontSize: "12px",
								fontWeight: 600,
								cursor: "pointer",
								textDecoration: "underline",
							}}
						>
							Load {currentTypeInfo.label.split(" ")[0]} Example
						</button>
					)}
				</div>
			</div>

			{/* Optional Context Accordion */}
			<div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden", marginBottom: "18px" }}>
				<button
					type="button"
					onClick={() => setShowContextAccordion(!showContextAccordion)}
					style={{
						width: "100%",
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						padding: "10px 14px",
						background: "#f8fafc",
						border: "none",
						fontSize: "12.5px",
						fontWeight: 600,
						color: "#334155",
						cursor: "pointer",
					}}
				>
					<span>Optional Creative Context (Genre, Audience, Target Format)</span>
					{showContextAccordion ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
				</button>

				{showContextAccordion && (
					<div style={{ padding: "16px", background: "#ffffff", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
						<div>
							<label style={{ display: "block", fontSize: "11.5px", fontWeight: 600, color: "#475569", marginBottom: "4px" }}>
								Intended Genre
							</label>
							<input
								type="text"
								value={genre}
								onChange={(e) => onGenreChange(e.target.value)}
								placeholder="e.g. Psychological Thriller, Sci-Fi"
								style={{ width: "100%", padding: "8px 10px", fontSize: "12.5px", border: "1px solid #cbd5e1", borderRadius: "6px" }}
							/>
						</div>

						<div>
							<label style={{ display: "block", fontSize: "11.5px", fontWeight: 600, color: "#475569", marginBottom: "4px" }}>
								Target Audience
							</label>
							<input
								type="text"
								value={targetAudience}
								onChange={(e) => onTargetAudienceChange(e.target.value)}
								placeholder="e.g. Adult drama, Young Adult, Global festival"
								style={{ width: "100%", padding: "8px 10px", fontSize: "12.5px", border: "1px solid #cbd5e1", borderRadius: "6px" }}
							/>
						</div>

						<div>
							<label style={{ display: "block", fontSize: "11.5px", fontWeight: 600, color: "#475569", marginBottom: "4px" }}>
								Intended Format
							</label>
							<input
								type="text"
								value={intendedFormat}
								onChange={(e) => onIntendedFormatChange(e.target.value)}
								placeholder="e.g. Feature Film, 60min Pilot, Short Film"
								style={{ width: "100%", padding: "8px 10px", fontSize: "12.5px", border: "1px solid #cbd5e1", borderRadius: "6px" }}
							/>
						</div>

						<div style={{ gridColumn: "1 / -1" }}>
							<label style={{ display: "block", fontSize: "11.5px", fontWeight: 600, color: "#475569", marginBottom: "4px" }}>
								Additional Author Instructions
							</label>
							<input
								type="text"
								value={additionalInstructions}
								onChange={(e) => onAdditionalInstructionsChange(e.target.value)}
								placeholder="e.g. Focus on pacing flaws in Act 2, or check if the sister's motivation feels earned."
								style={{ width: "100%", padding: "8px 10px", fontSize: "12.5px", border: "1px solid #cbd5e1", borderRadius: "6px" }}
							/>
						</div>
					</div>
				)}
			</div>

			{/* Error Banner */}
			{error && (
				<div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", color: "#b91c1c", fontSize: "13px", marginBottom: "16px" }}>
					<FiAlertCircle size={16} />
					<span>{error}</span>
				</div>
			)}

			{/* Submit Action Bar */}
			<div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "12px" }}>
				<button
					type="button"
					onClick={onSubmit}
					disabled={isAnalyzing || !content.trim()}
					style={{
						display: "flex",
						alignItems: "center",
						gap: "8px",
						padding: "10px 24px",
						borderRadius: "8px",
						backgroundColor: isAnalyzing || !content.trim() ? "#cbd5e1" : "#d97706",
						color: "#ffffff",
						fontWeight: 600,
						fontSize: "14px",
						border: "none",
						cursor: isAnalyzing || !content.trim() ? "not-allowed" : "pointer",
						boxShadow: "0 2px 6px rgba(217, 119, 6, 0.25)",
						transition: "background-color 0.15s ease",
					}}
				>
					<FiZap size={16} />
					<span>{isAnalyzing ? "Analyzing Creative Content..." : "Start Creative Analysis"}</span>
				</button>
			</div>
		</div>
	);
}

