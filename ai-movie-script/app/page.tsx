import Link from "next/link";
import Image from "next/image";

function ClapperIcon() {
	return (
		<svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path
				d="M3 8h18v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z"
				fill="#18181b"
			/>
			<rect x="3" y="3" width="18" height="5" rx="1" fill="#18181b" />
			<path d="M7 3l-2 5h2.5l2-5H7zm5 0l-2 5h2.5l2-5H12zm5 0l-2 5h2.5l2-5H17z" fill="#f59e0b" />
			<circle cx="12" cy="14.5" r="2" fill="#f59e0b" />
		</svg>
	);
}

function PenIcon() {
	return (
		<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
			<path d="M12 19l7-7 3 3-7 7-3-3z" />
			<path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
			<path d="M2 2l7.586 7.586" />
			<circle cx="11" cy="11" r="2" fill="currentColor" />
		</svg>
	);
}

function StoryIcon() {
	return (
		<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
			<circle cx="6" cy="6" r="3" />
			<circle cx="18" cy="6" r="3" />
			<circle cx="12" cy="18" r="3" />
			<path d="M8.5 7.5l4 7.5" />
			<path d="M15.5 7.5l-4 7.5" />
		</svg>
	);
}

function ScreenplayIcon() {
	return (
		<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
			<rect x="4" y="4" width="16" height="16" rx="2" />
			<line x1="8" y1="9" x2="16" y2="9" />
			<line x1="8" y1="13" x2="16" y2="13" />
			<line x1="8" y1="17" x2="13" y2="17" />
		</svg>
	);
}

function ExportIcon() {
	return (
		<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
			<path d="M4 12v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6" />
			<polyline points="16 6 12 2 8 6" />
			<line x1="12" y1="2" x2="12" y2="15" />
		</svg>
	);
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
						<Link href="/dashboard" className="landing-btn-signin">
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
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
									<line x1="5" y1="12" x2="19" y2="12" />
									<polyline points="12 5 19 12 12 19" />
								</svg>
							</Link>

							<a href="#how-it-works" className="landing-btn-secondary">
								<span>See How It Works</span>
								<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
									<polygon points="6 4 20 12 6 20 6 4" />
								</svg>
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
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
									<line x1="5" y1="12" x2="19" y2="12" />
									<polyline points="12 5 19 12 12 19" />
								</svg>
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
