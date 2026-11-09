"use client";

import React, { useState } from "react";
import { FiUser, FiSparkles, FiCheck, FiCopy } from "react-icons/fi";

export interface AIMessageProps {
	role: "user" | "assistant" | "system";
	content: string;
	timestamp?: string;
	onApply?: () => void;
	canApply?: boolean;
}

export function AIMessage({
	role,
	content,
	timestamp,
	onApply,
	canApply = false,
}: AIMessageProps) {
	const [copied, setCopied] = useState(false);
	const isAI = role === "assistant";
	const isUser = role === "user";

	const handleCopy = () => {
		if (typeof navigator !== "undefined" && navigator.clipboard) {
			navigator.clipboard.writeText(content);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	};

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				gap: "4px",
				alignItems: isUser ? "flex-end" : "flex-start",
				margin: "8px 0",
			}}
		>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: "6px",
					fontSize: "11px",
					color: "#94a3b8",
					fontWeight: 500,
					padding: "0 4px",
				}}
			>
				{isAI ? (
					<>
						<FiSparkles size={12} color="#d97706" />
						<span>FilmForge AI</span>
					</>
				) : (
					<>
						<FiUser size={12} />
						<span>You</span>
					</>
				)}
				{timestamp && <span>• {timestamp}</span>}
			</div>

			<div
				style={{
					maxWidth: "85%",
					padding: "10px 14px",
					borderRadius: isUser ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
					backgroundColor: isUser ? "#d97706" : "#f8fafc",
					color: isUser ? "#ffffff" : "#1e293b",
					border: isUser ? "none" : "1px solid #e2e8f0",
					fontSize: "13px",
					lineHeight: "1.5",
					whiteSpace: "pre-wrap",
					wordBreak: "break-word",
				}}
			>
				{content}
			</div>

			{isAI && (
				<div style={{ display: "flex", gap: "8px", marginTop: "2px", padding: "0 4px" }}>
					<button
						type="button"
						onClick={handleCopy}
						style={{
							background: "none",
							border: "none",
							color: "#94a3b8",
							fontSize: "11.5px",
							cursor: "pointer",
							display: "flex",
							alignItems: "center",
							gap: "4px",
							padding: "2px 4px",
						}}
					>
						{copied ? <FiCheck size={12} color="#059669" /> : <FiCopy size={12} />}
						<span>{copied ? "Copied" : "Copy"}</span>
					</button>

					{canApply && onApply && (
						<button
							type="button"
							onClick={onApply}
							style={{
								background: "none",
								border: "none",
								color: "#d97706",
								fontWeight: 600,
								fontSize: "11.5px",
								cursor: "pointer",
								padding: "2px 4px",
							}}
						>
							Insert into Screenplay
						</button>
					)}
				</div>
			)}
		</div>
	);
}

