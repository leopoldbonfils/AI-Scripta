"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiHeart, FiZap, FiFlag, FiUserPlus, FiRotateCw } from "react-icons/fi";
import { FaClapperboard } from "react-icons/fa6";

function FilmForgeBadge() {
	return (
		<div className="ideas-ai-badge">
			<FaClapperboard size={15} color="#f59e0b" />
		</div>
	);
}

function HeartIcon() {
	return <FiHeart size={15} />;
}

function SuspenseIcon() {
	return <FiZap size={15} />;
}

function EndingIcon() {
	return <FiFlag size={15} />;
}

function CharacterIcon() {
	return <FiUserPlus size={15} />;
}

function RefreshIcon() {
	return <FiRotateCw size={15} />;
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
