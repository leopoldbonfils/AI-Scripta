"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const isAuth =
		pathname === "/signup" ||
		pathname === "/register" ||
		pathname === "/login" ||
		pathname === "/signin" ||
		pathname?.startsWith("/(auth)");

	if (isAuth) {
		return <>{children}</>;
	}

	return (
		<div className="app-layout">
			<Sidebar />
			<main className="app-main">{children}</main>
		</div>
	);
}
