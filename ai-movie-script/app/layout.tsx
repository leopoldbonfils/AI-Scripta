import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "../components/layout/AppShell";

export const metadata: Metadata = {
	title: "FilmForge AI - Your Idea. Your Story. Your Movie.",
	description: "Turn a simple idea into characters, scenes, and a complete screenplay with the help of AI.",
};

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en">
			<body>
				<AppShell>{children}</AppShell>
			</body>
		</html>
	);
}
