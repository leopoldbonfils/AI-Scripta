"use client";

import { useAuth } from "../auth/AuthProvider";

interface WelcomeHeaderProps {
	totalCount?: number;
}

export function WelcomeHeader({ totalCount = 0 }: WelcomeHeaderProps) {
	const { user } = useAuth();
	const firstName = user?.name ? user.name.split(" ")[0] : "Filmmaker";

	const getGreeting = () => {
		const hour = new Date().getHours();
		if (hour < 12) return "Good morning";
		if (hour < 18) return "Good afternoon";
		return "Good evening";
	};

	return (
		<div className="movies-welcome-header" style={{ marginBottom: "24px" }}>
			<h1 className="movies-header-title">
				{getGreeting()}, {firstName} <span className="movies-wave">👋</span>
			</h1>
			<p className="movies-header-subtitle">
				{totalCount > 0
					? `You have ${totalCount} active movie project${totalCount === 1 ? "" : "s"} in your studio.`
					: "Welcome to FilmForge AI. Start your first screenplay today."}
			</p>
		</div>
	);
}

