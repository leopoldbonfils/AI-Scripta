"use client";

import React from "react";

export interface AILoadingProps {
	label?: string;
	size?: "sm" | "md" | "lg";
	fullscreen?: boolean;
}

export function AILoading({
	label = "FilmForge AI is generating narrative content...",
	size = "md",
	fullscreen = false,
}: AILoadingProps) {
	const spinnerSize = size === "sm" ? 18 : size === "lg" ? 36 : 24;

	const content = (
		<div
			role="status"
			aria-live="polite"
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				gap: "12px",
				padding: fullscreen ? "0" : "24px 16px",
				color: "#64748b",
			}}
		>
			<div
				style={{
					width: `${spinnerSize}px`,
					height: `${spinnerSize}px`,
					border: "3px solid #e2e8f0",
					borderTopColor: "#d97706",
					borderRadius: "50%",
					animation: "spin 1s linear infinite",
				}}
			/>
			{label && (
				<span
					style={{
						fontSize: size === "sm" ? "12px" : "13.5px",
						fontWeight: 500,
						color: "#475569",
					}}
				>
					{label}
				</span>
			)}
		</div>
	);

	if (fullscreen) {
		return (
			<div
				style={{
					position: "fixed",
					inset: 0,
					zIndex: 9998,
					backgroundColor: "rgba(15, 23, 42, 0.4)",
					backdropFilter: "blur(4px)",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<div
					style={{
						background: "#ffffff",
						borderRadius: "12px",
						padding: "24px 32px",
						boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
					}}
				>
					{content}
				</div>
			</div>
		);
	}

	return content;
}

