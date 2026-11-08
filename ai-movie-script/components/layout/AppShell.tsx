"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { AuthProvider } from "../auth/AuthProvider";

export function AppShell({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const isAuth =
		pathname === "/signup" ||
		pathname === "/login" ||
		pathname === "/signin";

	return (
		<AuthProvider>
			{isAuth ? (
				<>{children}</>
			) : (
				<div className="app-layout">
					<Sidebar />
					<main className="app-main">
						{pathname !== "/" && pathname !== "/dashboard" && <Header />}
						{children}
					</main>
				</div>
			)}
		</AuthProvider>
	);
}
