"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { FiSearch, FiBell, FiSettings, FiFilm, FiEdit3, FiZap, FiLogOut, FiCheckCircle } from "react-icons/fi";
import { useAuth } from "../auth/AuthProvider";

function HeaderContent() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const { user, logout } = useAuth();

	const initialQuery = searchParams ? searchParams.get("search") || "" : "";
	const [query, setQuery] = useState(initialQuery);
	const [showNotifications, setShowNotifications] = useState(false);
	const [showProfile, setShowProfile] = useState(false);
	const [hasUnread, setHasUnread] = useState(true);

	const notificationsRef = useRef<HTMLDivElement>(null);
	const profileRef = useRef<HTMLDivElement>(null);

	const displayName = user?.name || "Leopold";
	const displayPlan = user?.subscriptionTier
		? `✦ ${user.subscriptionTier.charAt(0) + user.subscriptionTier.slice(1).toLowerCase()} Plan`
		: "✦ Pro Plan";
	const avatarUrl = user?.avatar || "/images/leopold-hd.png";

	const handleLogout = async (e: React.MouseEvent) => {
		e.preventDefault();
		setShowProfile(false);
		await logout();
	};

	// Sync local query if URL search parameter changes
	useEffect(() => {
		const q = searchParams ? searchParams.get("search") || "" : "";
		setQuery(q);
	}, [searchParams]);

	// Close popovers when clicking outside
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				notificationsRef.current &&
				!notificationsRef.current.contains(event.target as Node)
			) {
				setShowNotifications(false);
			}
			if (
				profileRef.current &&
				!profileRef.current.contains(event.target as Node)
			) {
				setShowProfile(false);
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const handleSearchChange = (val: string) => {
		setQuery(val);
		if (pathname === "/movies") {
			const params = new URLSearchParams(window.location.search);
			if (val.trim()) {
				params.set("search", val);
			} else {
				params.delete("search");
			}
			const newUrl = `${pathname}${params.toString() ? `?${params.toString()}` : ""}`;
			window.history.replaceState(null, "", newUrl);
			// Dispatch popstate so components listening to searchParams or window can react
			window.dispatchEvent(new Event("moviesSearchChanged"));
		}
	};

	const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			if (pathname !== "/movies") {
				router.push(`/movies?search=${encodeURIComponent(query.trim())}`);
			}
		}
	};

	const handleClearSearch = () => {
		handleSearchChange("");
	};

	return (
		<header className="app-top-header" role="banner">
			<div className="app-top-header-right">
				{/* Search box matching screenshot */}
				<div className="app-header-search">
					<FiSearch className="app-header-search-icon" size={17} />
					<input
						type="text"
						placeholder="Search anything..."
						value={query}
						onChange={(e) => handleSearchChange(e.target.value)}
						onKeyDown={handleSearchKeyDown}
						className="app-header-search-input"
						aria-label="Search"
					/>
					{query && (
						<button
							type="button"
							className="app-header-search-clear"
							onClick={handleClearSearch}
							aria-label="Clear search"
						>
							✕
						</button>
					)}
				</div>

				{/* Notification Bell matching screenshot */}
				<div className="app-header-popover-anchor" ref={notificationsRef}>
					<button
						type="button"
						className={`app-header-icon-btn${showNotifications ? " active" : ""}`}
						onClick={() => {
							setShowNotifications(!showNotifications);
							setShowProfile(false);
							setHasUnread(false);
						}}
						aria-label="Notifications"
						aria-expanded={showNotifications}
					>
						<FiBell size={18} />
						{hasUnread && <span className="app-header-badge-dot" />}
					</button>

					{showNotifications && (
						<div className="app-header-popover app-header-notifications-popover">
							<div className="app-header-popover-header">
								<span className="popover-title">Notifications</span>
								<span className="popover-badge">3 new</span>
							</div>

							<div className="app-header-notifications-list">
								<div className="notification-item unread">
									<div className="notification-dot" />
									<div className="notification-content">
										<p className="notification-text">
											<strong>The Last Signal</strong> draft was auto-saved to cloud.
										</p>
										<span className="notification-time">2 mins ago</span>
									</div>
								</div>

								<div className="notification-item unread">
									<div className="notification-dot" />
									<div className="notification-content">
										<p className="notification-text">
											AI Assistant suggested 3 new plot variations for your story.
										</p>
										<span className="notification-time">1 hour ago</span>
									</div>
								</div>

								<div className="notification-item">
									<div className="notification-dot read" />
									<div className="notification-content">
										<p className="notification-text">
											New character <strong>Sarah</strong> dossier generated.
										</p>
										<span className="notification-time">Yesterday</span>
									</div>
								</div>
							</div>

							<div className="app-header-popover-footer">
								<button
									type="button"
									className="popover-action-btn"
									onClick={() => setShowNotifications(false)}
								>
									<FiCheckCircle size={14} />
									<span>Mark all as read</span>
								</button>
							</div>
						</div>
					)}
				</div>

				{/* Leopold Avatar matching screenshot */}
				<div className="app-header-popover-anchor" ref={profileRef}>
					<button
						type="button"
						className={`app-header-avatar-btn${showProfile ? " active" : ""}`}
						onClick={() => {
							setShowProfile(!showProfile);
							setShowNotifications(false);
						}}
						aria-label="User profile menu"
						aria-expanded={showProfile}
					>
						{/* User Avatar */}
						<img
							src={avatarUrl}
							alt={displayName}
							className="app-header-avatar-img"
						/>
					</button>

					{showProfile && (
						<div className="app-header-popover app-header-profile-popover">
							<div className="profile-popover-user">
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img
									src={avatarUrl}
									alt={displayName}
									className="profile-popover-avatar"
								/>
								<div className="profile-popover-info">
									<strong className="profile-popover-name">{displayName}</strong>
									<span className="profile-popover-plan">{displayPlan}</span>
								</div>
							</div>

							<div className="profile-popover-divider" />

							<nav className="profile-popover-links">
								<Link
									href="/settings"
									className="profile-popover-link"
									onClick={() => setShowProfile(false)}
								>
									<FiSettings size={15} />
									<span>Settings &amp; Preferences</span>
								</Link>

								<Link
									href="/movies"
									className="profile-popover-link"
									onClick={() => setShowProfile(false)}
								>
									<FiFilm size={15} />
									<span>My Movies</span>
								</Link>

								<Link
									href="/create"
									className="profile-popover-link"
									onClick={() => setShowProfile(false)}
								>
									<FiEdit3 size={15} />
									<span>Create Movie</span>
								</Link>

								<Link
									href="/ideas"
									className="profile-popover-link"
									onClick={() => setShowProfile(false)}
								>
									<FiZap size={15} />
									<span>Story Ideas</span>
								</Link>

								<div className="profile-popover-divider" />

								<button
									type="button"
									className="profile-popover-link logout"
									onClick={handleLogout}
									style={{
										width: "100%",
										textAlign: "left",
										background: "none",
										border: "none",
										cursor: "pointer",
										display: "flex",
										alignItems: "center",
										gap: "10px",
										padding: "8px 12px",
									}}
								>
									<FiLogOut size={15} />
									<span>Sign Out</span>
								</button>
							</nav>
						</div>
					)}
				</div>
			</div>
		</header>
	);
}

export function Header() {
	return (
		<Suspense
			fallback={
				<header className="app-top-header" role="banner">
					<div className="app-top-header-right">
						<div className="app-header-search">
							<FiSearch className="app-header-search-icon" size={17} />
							<input
								type="text"
								placeholder="Search anything..."
								disabled
								className="app-header-search-input"
							/>
						</div>
						<div className="app-header-icon-btn">
							<FiBell size={18} />
						</div>
						<div className="app-header-avatar-btn">
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img
								src="/images/leopold-hd.png"
								alt="Leopold"
								className="app-header-avatar-img"
							/>
						</div>
					</div>
				</header>
			}
		>
			<HeaderContent />
		</Suspense>
	);
}

