import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "../components/layout/Sidebar";

export const metadata: Metadata = {
	title: "FilmForge AI",
	description: "A cinematic workspace for developing your next screenplay.",
};

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en">
			<body><Sidebar /><main className="app-main">{children}</main></body>
		</html>
	);
}
