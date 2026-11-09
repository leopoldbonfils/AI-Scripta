"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { StoryOutlineView } from "./StoryOutlineView";
import { ScreenplayEditorView } from "./ScreenplayEditorView";
import { ExportScreenplayView } from "./ExportScreenplayView";

export type StudioView = "outline" | "screenplay" | "export";

interface StudioWorkspaceProps {
	initialView?: StudioView;
	movieId?: string;
	movieTitle?: string;
}

function StudioWorkspaceInner({
	initialView = "outline",
	movieId,
	movieTitle,
}: StudioWorkspaceProps) {
	const searchParams = useSearchParams();

	const paramView = searchParams.get("view") as StudioView | null;
	const [activeView, setActiveView] = useState<StudioView>(
		paramView || initialView
	);

	useEffect(() => {
		if (
			paramView &&
			(paramView === "outline" ||
				paramView === "screenplay" ||
				paramView === "export")
		) {
			setActiveView(paramView);
		}
	}, [paramView]);

	const handleSwitchView = (view: StudioView) => {
		setActiveView(view);
		if (typeof window !== "undefined") {
			const params = new URLSearchParams(window.location.search);
			params.set("view", view);
			window.history.pushState(null, "", `?${params.toString()}`);
		}
	};

	return (
		<div className="studio-page-container">
			{/* Render Active View directly without top tab bar */}
			{activeView === "outline" && (
				<StoryOutlineView
					movieId={movieId}
					onOpenScreenplay={() => handleSwitchView("screenplay")}
					onImproveStory={() => handleSwitchView("screenplay")}
				/>
			)}

			{activeView === "screenplay" && (
				<ScreenplayEditorView
					movieId={movieId}
					movieTitle={movieTitle}
					onGoToExport={() => handleSwitchView("export")}
					onBackToOutline={() => handleSwitchView("outline")}
				/>
			)}

			{activeView === "export" && (
				<ExportScreenplayView
					movieId={movieId}
					movieTitle={movieTitle}
					onBackToScreenplay={() => handleSwitchView("screenplay")}
				/>
			)}
		</div>
	);
}

export function StudioWorkspace(props: StudioWorkspaceProps) {
	return (
		<Suspense fallback={<div style={{ padding: "40px", color: "#64748b" }}>Loading studio...</div>}>
			<StudioWorkspaceInner {...props} />
		</Suspense>
	);
}
