"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function LogoIcon() {
	return (
		<div className="brand-icon-wrapper">
			<svg width="48" height="42" viewBox="0 0 54 46" fill="none" xmlns="http://www.w3.org/2000/svg">
				<defs>
					<linearGradient id="popcorn-grad" x1="0" y1="0" x2="1" y2="1">
						<stop offset="0%" stopColor="#d97706" />
						<stop offset="100%" stopColor="#92400e" />
					</linearGradient>
					<linearGradient id="clapper-grad" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stopColor="#fbbf24" />
						<stop offset="100%" stopColor="#d97706" />
					</linearGradient>
					<filter id="glow" x="-10%" y="-10%" width="120%" height="120%" filterUnits="userSpaceOnUse">
						<feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#f59e0b" floodOpacity="0.25" />
					</filter>
				</defs>

				{/* Warm Popcorn Box / Cinema Reel in background */}
				<path
					d="M8 20L11 42C11.3 43.7 12.8 45 14.5 45H23C24.7 45 26.2 43.7 26.5 42L29.5 20C29.8 18.3 28.5 17 26.8 17H10.7C9 17 7.7 18.3 8 20Z"
					fill="url(#popcorn-grad)"
					opacity="0.85"
				/>
				<path d="M11 20L13 44" stroke="#fcd34d" strokeWidth="1" strokeOpacity="0.4" />
				<path d="M19 19L19 45" stroke="#fcd34d" strokeWidth="1" strokeOpacity="0.4" />
				<path d="M26 20L24 44" stroke="#fcd34d" strokeWidth="1" strokeOpacity="0.4" />

				{/* Clapperboard Body */}
				<rect
					x="17"
					y="18"
					width="30"
					height="24"
					rx="3.5"
					fill="url(#clapper-grad)"
					filter="url(#glow)"
					stroke="#fef08a"
					strokeWidth="0.8"
				/>

				{/* Clapperboard details */}
				<line x1="21" y1="28" x2="43" y2="28" stroke="#78350f" strokeWidth="1.2" strokeLinecap="round" />
				<line x1="21" y1="34" x2="37" y2="34" stroke="#78350f" strokeWidth="1.2" strokeLinecap="round" />
				<circle cx="21" cy="22" r="1.5" fill="#78350f" />

				{/* Clapperboard Stick (tilted clapper top) */}
				<g transform="rotate(-14 17 17)">
					<rect x="17" y="10" width="31" height="7" rx="1.8" fill="#1e1e24" stroke="#fbbf24" strokeWidth="0.8" />
					{/* Diagonal zebra stripes */}
					<path d="M21 17L24 10.5H27L24 17H21Z" fill="#fbbf24" />
					<path d="M29 17L32 10.5H35L32 17H29Z" fill="#fbbf24" />
					<path d="M37 17L40 10.5H43L40 17H37Z" fill="#fbbf24" />
				</g>
			</svg>
		</div>
	);
}

function HomeIcon() {
	return (
		<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
			<path d="M12 2.5L2 11.5h3.2V20.5a.8.8 0 0 0 .8.8h4.5a.5.5 0 0 0 .5-.5V14.5a.8.8 0 0 1 .8-.8h2.4a.8.8 0 0 1 .8.8v6.3a.5.5 0 0 0 .5.5H18a.8.8 0 0 0 .8-.8V11.5H22L12 2.5z" />
		</svg>
	);
}

function MoviesIcon() {
	return (
		<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H14l6 6v11.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 19.5v-15z" />
			<polyline points="14 2 14 8 20 8" />
			<polygon points="10 12 15 15 10 18 10 12" fill="currentColor" stroke="none" />
		</svg>
	);
}

function CreateMovieIcon() {
	return (
		<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<path d="M14.5 4.5l5 5-11 11-4-1-1-4 11-11z" />
			<path d="M13 6l3.5 3.5" />
			<path d="M18 1.5v3M16.5 3h3" strokeWidth="1.6" />
			<path d="M21.5 6.5v3M20 8h3" strokeWidth="1.6" />
			<path d="M12 2l.8 1.5" strokeWidth="1.6" />
		</svg>
	);
}

function IdeasIcon() {
	return (
		<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<path d="M9 18h6" />
			<path d="M10 22h4" />
			<path d="M12 2a7 7 0 0 0-7 7c0 2.6 1.4 4.8 3.5 6h7c2.1-1.2 3.5-3.4 3.5-6a7 7 0 0 0-7-7z" />
		</svg>
	);
}

function CharactersIcon() {
	return (
		<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<circle cx="12" cy="7.5" r="4" />
			<path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
			<path d="M12 6.2c-.3-.4-.8-.4-1.1-.1-.3.3-.2.8.1 1.1l1 1 1-1c.3-.3.4-.8.1-1.1-.3-.3-.8-.3-1.1.1z" fill="currentColor" stroke="none" />
		</svg>
	);
}

function TemplatesIcon() {
	return (
		<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<rect x="3" y="4" width="18" height="16" rx="3" />
			<line x1="3" y1="9" x2="21" y2="9" />
			<line x1="9" y1="20" x2="9" y2="9" />
		</svg>
	);
}

function SettingsIcon() {
	return (
		<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<circle cx="12" cy="12" r="3" />
			<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
		</svg>
	);
}

function LogoutIcon() {
	return (
		<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
			<polyline points="16 17 21 12 16 7" />
			<line x1="21" y1="12" x2="9" y2="12" />
		</svg>
	);
}

const navItems = [
	{ label: "Home", href: "/dashboard", icon: HomeIcon },
	{ label: "My Movies", href: "/movies", icon: MoviesIcon },
	{ label: "Create Movie", href: "/create", icon: CreateMovieIcon },
	{ label: "Ideas", href: "/ideas", icon: IdeasIcon },
	{ label: "Characters", href: "/characters", icon: CharactersIcon },
	{ label: "Templates", href: "/templates", icon: TemplatesIcon },
	{ label: "Settings", href: "/settings", icon: SettingsIcon },
];

export function Sidebar() {
	const pathname = usePathname();

	return (
		<aside className="sidebar">
			<Link className="brand" href="/dashboard">
				<LogoIcon />
				<span className="brand-title">
					FilmForge <span className="brand-ai">AI</span>
				</span>
			</Link>

			<nav className="sidebar-nav" aria-label="Main navigation">
				{navItems.map(({ label, href, icon: Icon }) => {
					const active =
						href === "/dashboard" || href === "/"
							? pathname === "/" || pathname === "/dashboard"
							: pathname === href || pathname.startsWith(`${href}/`);
					return (
						<Link
							className={`nav-item${active ? " active" : ""}`}
							href={href}
							key={href}
						>
							<span className="nav-icon">
								<Icon />
							</span>
							<span className="nav-text">{label}</span>
						</Link>
					);
				})}
			</nav>

			<div className="sidebar-bottom">
				<div className="profile">
					<div className="avatar">
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src="/images/leopold-hd.png"
							alt="Leopold"
							className="avatar-image"
						/>
					</div>
					<div className="profile-copy">
						<strong>Leopold</strong>
						<span>Pro Plan</span>
					</div>
				</div>

				<div className="sidebar-divider" />

				<button className="logout" type="button">
					<span className="logout-icon">
						<LogoutIcon />
					</span>
					<span>Logout</span>
				</button>
			</div>
		</aside>
	);
}
