import Link from "next/link";
import Image from "next/image";
import { FaClapperboard } from "react-icons/fa6";
import { FiEdit3, FiGitBranch, FiFileText, FiDownload, FiArrowRight } from "react-icons/fi";

function ClapperIcon() {
	return <FaClapperboard size={20} color="#111827" />;
}

function PenIcon() {
	return <FiEdit3 size={15} />;
}

function StoryIcon() {
	return <FiGitBranch size={15} />;
}

function ScreenplayIcon() {
	return <FiFileText size={15} />;
}

function ExportIcon() {
	return <FiDownload size={15} />;
}

const steps = [
	{
		number: "1. Share Your Idea",
		description: "Tell us what your movie is about.",
		icon: PenIcon,
	},
	{
		number: "2. Build Your Story",
		description: "FilmForge AI helps you develop the plot.",
		icon: StoryIcon,
	},
	{
		number: "3. Write Your Screenplay",
		description: "Turn your story into professional scenes.",
		icon: ScreenplayIcon,
	},
	{
		number: "4. Export & Share",
		description: "Download your finished script.",
		icon: ExportIcon,
	},
];

export default function HomePage() {
	return (
		<div className="landing-container">
			{/* Top Navigation */}
			<header className="landing-header">
				<div className="landing-header-inner">
					<Link href="/" className="landing-brand">
						<div className="landing-brand-badge">
							<ClapperIcon />
						</div>
						<span className="landing-brand-text">
							FilmForge <span className="landing-brand-ai">AI</span>
						</span>
					</Link>

					<nav className="landing-nav">
						<Link href="/" className="landing-nav-link active">
							Home
						</Link>
						<a href="#how-it-works" className="landing-nav-link">
							How It Works
						</a>
						<a href="#features" className="landing-nav-link">
							Features
						</a>
					</nav>

					<div className="landing-actions">
						<Link href="/login" className="landing-btn-signin">
							Sign In
						</Link>
					</div>
				</div>
			</header>

			{/* Hero Section */}
			<section className="landing-hero-section">
				<div className="landing-hero-inner">
					<div className="landing-hero-content">
						<h1 className="landing-hero-title">
							<span>Your Idea.</span>
							<span>Your Story.</span>
							<span>Your Movie.</span>
						</h1>

						<p className="landing-hero-desc">
							Turn a simple idea into characters, scenes, and a complete screenplay with the help of AI.
						</p>

						<div className="landing-hero-buttons">
							<Link href="/create" className="landing-btn-primary">
								<span>Create Your Movie</span>
								<span style={{ fontSize: "17px", fontWeight: "bold" }}>→</span>
							</Link>

							<a href="#how-it-works" className="landing-btn-secondary">
								<span>See How It Works</span>
								<span style={{ fontSize: "11px", marginLeft: "2px" }}>▶</span>
							</a>
						</div>
					</div>

					{/* Right Hero Cinematic Graphic */}
					<div className="landing-hero-visual">
						<div className="landing-hero-visual-blend" />
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src="/images/hero-cinematic.jpg"
							alt="Filmmaker watching sunset over city with giant movie clapper"
							className="landing-hero-img"
						/>
					</div>
				</div>
			</section>

			{/* How It Works Section */}
			<section id="how-it-works" className="landing-steps-section">
				<div className="landing-steps-inner">
					<h2 className="landing-steps-heading">How It Works</h2>

					<div className="landing-steps-grid">
						{steps.map((step) => {
							const Icon = step.icon;
							return (
								<div className="landing-step-card" key={step.number}>
									<div className="landing-step-icon-wrap">
										<Icon />
									</div>
									<h3 className="landing-step-title">{step.number}</h3>
									<p className="landing-step-desc">{step.description}</p>
								</div>
							);
						})}
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section id="features" className="landing-features-section">
				<div className="landing-steps-inner">
					<div className="landing-features-box">
						<div className="landing-features-copy">
							<span className="landing-features-eyebrow">CINEMATIC AI WORKSPACE</span>
							<h3 className="landing-features-title">Everything you need to write your masterpiece</h3>
							<p className="landing-features-desc">
								From logline ideation and dimensional character arcs to scene beats and industry-standard screenplay formatting, FilmForge AI accelerates your creative process.
							</p>
							<div className="landing-features-tags">
								<span>✦ Character Dossiers</span>
								<span>✦ Scene Beats</span>
								<span>✦ Fountain / PDF Export</span>
								<span>✦ AI Screenplay Assistant</span>
							</div>
						</div>
						<div className="landing-features-cta">
							<Link href="/create" className="landing-btn-primary">
								<span>Start Writing Today</span>
								<FiArrowRight size={16} />
							</Link>
						</div>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="landing-footer">
				<div className="landing-footer-inner">
					<div className="landing-footer-brand">
						<div className="landing-brand-badge small">
							<ClapperIcon />
						</div>
						<span>FilmForge AI</span>
					</div>
					<p>© 2026 FilmForge AI. All rights reserved.</p>
					<div className="landing-footer-links">
						<Link href="/dashboard">Open Studio</Link>
						<a href="#how-it-works">How It Works</a>
						<a href="#features">Features</a>
					</div>
				</div>
			</footer>
		</div>
	);
}
