"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function FilmForgeBadge() {
	return (
		<div className="ideas-ai-badge">
			<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M3 8h18v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z" fill="#18181b" />
				<rect x="3" y="3" width="18" height="5" rx="1" fill="#18181b" />
				<path d="M7 3l-2 5h2.5l2-5H7zm5 0l-2 5h2.5l2-5H12zm5 0l-2 5h2.5l2-5H17z" fill="#f59e0b" />
				<circle cx="12" cy="14.5" r="2" fill="#f59e0b" />
			</svg>
		</div>
	);
}

function HeartIcon() {
	return (
		<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
		</svg>
	);
}

function SuspenseIcon() {
	return (
		<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
		</svg>
	);
}

function EndingIcon() {
	return (
		<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
			<line x1="4" y1="22" x2="4" y2="15" />
		</svg>
	);
}

function CharacterIcon() {
	return (
		<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
			<circle cx="8.5" cy="7" r="4" />
			<line x1="20" y1="8" x2="20" y2="14" />
			<line x1="23" y1="11" x2="17" y2="11" />
		</svg>
	);
}

function RefreshIcon() {
	return (
		<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<polyline points="23 4 23 10 17 10" />
			<path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
		</svg>
	);
}

const variations = {
	default: {
		title: "The Last Signal..",
		hook: "A young developer discovers a mysterious signal that leads him into a dangerous secret. -------",
		story:
			"Eric, a talented developer, finds a mysterious signal coming from an abandoned building in Kigali. What starts as a simple curiosity quickly turns into a thrilling journey to uncover a hidden truth that could change his life and the city.",
	},
	emotional: {
		title: "The Last Signal..",
		hook: "A grieving coder hears his lost brother's voice pulsing through a forgotten urban frequency.",
		story:
			"Eric, an isolated developer coping with the mysterious disappearance of his younger brother, detects an anomalous broadcast signal pulsating from an abandoned transmission station in Kigali. The encoded modulation mirrors his brother's unfinished synthesiser recordings, transforming an investigation into an emotional search for redemption and truth.",
	},
	suspense: {
		title: "The Last Signal..",
		hook: "Every decrypted frequency brings the watcher closer to his front door.",
		story:
			"Eric, a talented developer, intercepts a rogue encrypted telemetry signal originating beneath an abandoned military communications post in Kigali. Minutes after extracting the initial audio coordinates, his power cuts out and an unmarked surveillance vehicle pulls up curbside, thrusting him into a tense, breathless cat-and-mouse game through the nighttime city streets.",
	},
	ending: {
		title: "The Last Signal..",
		hook: "The truth cannot be contained in one pair of hands; it must belong to everyone.",
		story:
			"Rather than bargaining with the corporate syndicate that designed the broadcast, Eric builds a decentralised radio relay. As police sirens surround his rooftop hideout, he presses deploy—broadcasting the hidden truth across thousands of phones and digital billboards across Kigali simultaneously at dawn.",
	},
	character: {
		title: "The Last Signal..",
		hook: "Two mismatched allies decode the secret before the frequency goes dark forever.",
		story:
			"Eric teams up with Amina, a daring freelance radio journalist armed with a modified frequency scanner and her own vendetta against the telecom syndicate. Together, they decipher the coordinates while dodging surveillance operatives across the back alleys and hillside rooftops of Kigali.",
	},
	alternate: {
		title: "The Kigali Frequency..",
		hook: "An underground sound designer accidentally records a clandestine government transmission.",
		story:
			"While sampling ambient atmospheric noise atop Mount Kigali for a documentary soundtrack, Eric accidentally records an encrypted low-frequency burst. When he isolates the layered track, he unearths an impending systemic blackout scheduled for the city's power grid.",
	},
};

export default function IdeasPage() {
	const router = useRouter();
	const [activeVariant, setActiveVariant] = useState<keyof typeof variations>("default");
	const [activeModifier, setActiveModifier] = useState<string>("");

	const currentContent = variations[activeVariant];

	const handleModifierClick = (
		variantKey: keyof typeof variations,
		modifierLabel: string
	) => {
		setActiveVariant(variantKey);
		setActiveModifier(modifierLabel);
	};

	return (
		<div className="ideas-page-container">
			{/* Top Step Progress Bar */}
			<div className="ideas-stepper-wrap">
				<nav className="ideas-stepper" aria-label="Creation phases">
					<div className="ideas-step completed">
						<span className="step-check">✓</span>
						<span>Idea</span>
						<span className="step-check">✓</span>
					</div>

					<div className="ideas-stepper-line completed" />

					<div className="ideas-step completed">
						<span className="step-check">✓</span>
						<span>Story</span>
						<span className="step-check">✓</span>
					</div>

					<div className="ideas-stepper-line" />

					<Link href="/characters" className="ideas-step upcoming">
						<span className="step-tilde">~</span>
						<span>Characters</span>
					</Link>

					<div className="ideas-stepper-line" />

					<Link href="/templates" className="ideas-step upcoming">
						<span className="step-tilde">~</span>
						<span>Outline</span>
					</Link>

					<div className="ideas-stepper-line" />

					<Link href="/screenplay" className="ideas-step upcoming">
						<span className="step-arrow">&gt;</span>
						<span>Screenplay</span>
					</Link>
				</nav>
			</div>

			{/* Main Workspace Grid (Left Story Card + Right AI Assistant Card) */}
			<div className="ideas-main-layout">
				{/* Left Story Document Card */}
				<section className="ideas-story-card">
					<h1 className="ideas-story-title">{currentContent.title}</h1>
					<p className="ideas-story-hook">{currentContent.hook}</p>

					<h2 className="ideas-story-section-title">Story</h2>
					<p className="ideas-story-body">{currentContent.story}</p>
				</section>

				{/* Right FilmForge AI Assistant Card */}
				<aside className="ideas-ai-card">
					<div className="ideas-ai-header">
						<FilmForgeBadge />
						<span className="ideas-ai-title">FilmForge AI</span>
					</div>

					<p className="ideas-ai-prompt">What would you like to change?</p>

					<div className="ideas-ai-actions">
						<button
							type="button"
							className={`ideas-ai-btn${activeModifier === "emotional" ? " active" : ""}`}
							onClick={() => handleModifierClick("emotional", "emotional")}
						>
							<span className="ideas-ai-btn-icon">
								<HeartIcon />
							</span>
							<span>Make it more emotional</span>
						</button>

						<button
							type="button"
							className={`ideas-ai-btn${activeModifier === "suspense" ? " active" : ""}`}
							onClick={() => handleModifierClick("suspense", "suspense")}
						>
							<span className="ideas-ai-btn-icon">
								<SuspenseIcon />
							</span>
							<span>Add suspense</span>
						</button>

						<button
							type="button"
							className={`ideas-ai-btn${activeModifier === "ending" ? " active" : ""}`}
							onClick={() => handleModifierClick("ending", "ending")}
						>
							<span className="ideas-ai-btn-icon">
								<EndingIcon />
							</span>
							<span>Change the ending</span>
						</button>

						<button
							type="button"
							className={`ideas-ai-btn${activeModifier === "character" ? " active" : ""}`}
							onClick={() => handleModifierClick("character", "character")}
						>
							<span className="ideas-ai-btn-icon">
								<CharacterIcon />
							</span>
							<span>Add a character</span>
						</button>

						<button
							type="button"
							className={`ideas-ai-btn${activeModifier === "alternate" ? " active" : ""}`}
							onClick={() => handleModifierClick("alternate", "alternate")}
						>
							<span className="ideas-ai-btn-icon">
								<RefreshIcon />
							</span>
							<span>Try another version</span>
						</button>
					</div>
				</aside>
			</div>

			{/* Bottom Navigation Buttons */}
			<div className="ideas-footer-nav">
				<button
					type="button"
					className="ideas-btn-back"
					onClick={() => router.push("/create")}
				>
					<span>← Back</span>
				</button>

				<button
					type="button"
					className="ideas-btn-continue"
					onClick={() => router.push("/characters")}
				>
					<span>Continue</span>
					<span>→</span>
				</button>
			</div>
		</div>
	);
}
