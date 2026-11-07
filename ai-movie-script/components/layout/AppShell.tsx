"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function AppShell({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const isAuth =
		pathname === "/signup" ||
		pathname === "/login" ||
		pathname === "/signin";

	if (isAuth) {
		return <>{children}</>;
	}

	// The header is shown everywhere except the dashboard (Home landing)
	const isDashboard = pathname === "/" || pathname === "/dashboard";

	return (
		<div className="app-layout">
			<Sidebar />
			<main className="app-main">
				{!isDashboard && <Header />}
				{children}
			</main>
		</div>
	);
}
