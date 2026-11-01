"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	FiHome,
	FiFilm,
	FiEdit3,
	FiZap,
	FiUsers,
	FiLayers,
	FiSettings,
	FiLogOut,
} from "react-icons/fi";
import { FaClapperboard } from "react-icons/fa6";

function LogoIcon() {
	return (
		<div className="brand-icon-wrapper">
			<FaClapperboard size={26} color="#fbbf24" />
		</div>
	);
}

const navItems = [
	{ label: "Home", href: "/dashboard", icon: FiHome },
	{ label: "My Movies", href: "/movies", icon: FiFilm },
	{ label: "Create Movie", href: "/create", icon: FiEdit3 },
	{ label: "Ideas", href: "/ideas", icon: FiZap },
	{ label: "Characters", href: "/characters", icon: FiUsers },
	{ label: "Templates", href: "/templates", icon: FiLayers },
	{ label: "Settings", href: "/settings", icon: FiSettings },
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
								<Icon size={18} />
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
						<FiLogOut size={18} />
					</span>
					<span>Logout</span>
				</button>
			</div>
		</aside>
	);
}
