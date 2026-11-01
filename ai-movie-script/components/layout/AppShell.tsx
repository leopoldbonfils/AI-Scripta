"use client";

import { Sidebar } from "./Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
	return (
		<div className="app-layout">
			<Sidebar />
			<main className="app-main">{children}</main>
		</div>
	);
}
