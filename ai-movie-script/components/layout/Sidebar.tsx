"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
	["Home", "/dashboard", "⌂"], ["My Movies", "/movies", "▣"],
	["Create Movie", "/create", "+"], ["Ideas", "/ideas", "✦"],
	["Characters", "/characters", "♙"], ["Templates", "/templates", "▤"],
	["Settings", "/settings", "⚙"],
];

export function Sidebar() {
	const pathname = usePathname();
	return (
		<aside className="sidebar">
			<Link className="brand" href="/dashboard"><span className="brand-mark">•</span><span>FILMFORGE <b>AI</b></span></Link>
			<nav className="sidebar-nav" aria-label="Main navigation">
				<p className="nav-label">Workspace</p>
				{navigation.map(([label, href, icon]) => {
					const active = pathname === href || pathname.startsWith(`${href}/`);
					return <Link className={`nav-item${active ? " active" : ""}`} href={href} key={href}><span className="nav-icon">{icon}</span><span>{label}</span></Link>;
				})}
			</nav>
			<div className="sidebar-bottom"><div className="profile"><div className="avatar">BK</div><div className="profile-copy"><strong>Backer K.</strong><span>Writer account</span></div><span className="profile-menu">•••</span></div><button className="logout" type="button"><span>↪</span> Log out</button></div>
		</aside>
	);
}
