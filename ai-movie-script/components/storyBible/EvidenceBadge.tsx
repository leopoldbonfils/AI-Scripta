"use client";

import React from "react";
import { BibleEvidenceLevel } from "../../types/storyBible";

export function EvidenceBadge({
	level,
	evidence,
}: {
	level?: BibleEvidenceLevel | string | null;
	evidence?: string | null;
}) {
	const cfg =
		level === "SOURCE_FACT"
			? { bg: "#ecfdf5", border: "#a7f3d0", text: "#065f46", label: "Source Fact" }
			: level === "INFERENCE"
			? { bg: "#eff6ff", border: "#bfdbfe", text: "#1e40af", label: "Inference" }
			: { bg: "#faf5ff", border: "#e9d5ff", text: "#6b21a8", label: "Suggestion" };

	return (
		<span
			title={evidence || cfg.label}
			style={{
				display: "inline-flex",
				alignItems: "center",
				fontSize: "10.5px",
				fontWeight: 700,
				textTransform: "uppercase",
				padding: "2px 7px",
				borderRadius: "4px",
				backgroundColor: cfg.bg,
				border: `1px solid ${cfg.border}`,
				color: cfg.text,
				letterSpacing: "0.02em",
			}}
		>
			{cfg.label}
		</span>
	);
}

