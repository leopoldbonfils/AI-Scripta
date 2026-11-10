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
	FiCompass,
	FiCpu,
	FiBook,
} from "react-icons/fi";
import { FaClapperboard } from "react-icons/fa6";
import { useAuth } from "../auth/AuthProvider";

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
	{ label: "Story Analysis", href: "/analysis", icon: FiCompass },
	{ label: "Story Intelligence", href: "/intelligence", icon: FiCpu },
	{ label: "Story Bible", href: "/story-bible", icon: FiBook },
	{ label: "Ideas", href: "/ideas", icon: FiZap },
	{ label: "Characters", href: "/characters", icon: FiUsers },
	{ label: "Templates", href: "/templates", icon: FiLayers },
	{ label: "Settings", href: "/settings", icon: FiSettings },
];

export function Sidebar() {
	const pathname = usePathname();
	const { user, logout } = useAuth();

	const displayName = user?.name || "Leopold";
	const displayPlan = user?.subscriptionTier
		? `${user.subscriptionTier.charAt(0) + user.subscriptionTier.slice(1).toLowerCase()} Plan`
		: "Pro Plan";
	const avatarUrl = user?.avatar || "/images/leopold-hd.png";

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
							src={avatarUrl}
							alt={displayName}
							className="avatar-image"
						/>
					</div>
					<div className="profile-copy">
						<strong>{displayName}</strong>
						<span>{displayPlan}</span>
					</div>
				</div>

				<div className="sidebar-divider" />

				<button
					className="logout"
					type="button"
					onClick={() => logout()}
					style={{ cursor: "pointer" }}
				>
					<span className="logout-icon">
						<FiLogOut size={18} />
					</span>
					<span>Logout</span>
				</button>
			</div>
		</aside>
	);
}
