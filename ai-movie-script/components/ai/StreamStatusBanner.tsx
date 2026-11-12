"use client";

import React from "react";
import { FiActivity, FiAlertTriangle, FiRefreshCw, FiXCircle } from "react-icons/fi";

export type StreamConnectionState =
	| "IDLE"
	| "CONNECTING"
	| "STREAMING"
	| "POLLING"
	| "COMPLETED"
	| "INTERRUPTED"
	| "CANCELLED"
	| "ERROR";

interface StreamStatusBannerProps {
	state: StreamConnectionState;
	stageLabel?: string;
	streamPreviewText?: string;
	errorMessage?: string | null;
	onCancel?: () => void;
	onRetry?: () => void;
}

export function StreamStatusBanner({
	state,
	stageLabel,
	streamPreviewText,
	errorMessage,
	onCancel,
	onRetry,
}: StreamStatusBannerProps) {
	if (state === "IDLE") return null;

	const isLive = state === "CONNECTING" || state === "STREAMING" || state === "POLLING";
	const isInterrupted = state === "INTERRUPTED" || state === "ERROR";

	return (
		<div
			style={{
				borderRadius: "10px",
				border: isInterrupted ? "1px solid #fecaca" : isLive ? "1px solid #f59e0b" : "1px solid #cbd5e1",
				backgroundColor: isInterrupted ? "#fef2f2" : isLive ? "#fffbeb" : "#f8fafc",
				padding: "12px 14px",
				display: "flex",
				flexDirection: "column",
				gap: "8px",
			}}
		>
			<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
				<div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px", fontWeight: 700, color: isInterrupted ? "#991b1b" : "#0f172a" }}>
					{isInterrupted ? (
						<FiAlertTriangle color="#dc2626" />
					) : (
						<FiActivity color={isLive ? "#d97706" : "#15803d"} />
					)}
					<span>Connection: {state}</span>
					{stageLabel && <span style={{ fontWeight: 500, color: "#475569" }}>· {stageLabel}</span>}
				</div>

				<div style={{ display: "flex", gap: "8px" }}>
					{isLive && onCancel && (
						<button
							type="button"
							onClick={onCancel}
							style={{
								display: "inline-flex",
								alignItems: "center",
								gap: "4px",
								padding: "4px 10px",
								borderRadius: "6px",
								border: "1px solid #fecaca",
								backgroundColor: "#ffffff",
								color: "#b91c1c",
								fontSize: "11.5px",
								fontWeight: 700,
								cursor: "pointer",
							}}
						>
							<FiXCircle size={12} /> Cancel Stream
						</button>
					)}
					{isInterrupted && onRetry && (
						<button
							type="button"
							onClick={onRetry}
							style={{
								display: "inline-flex",
								alignItems: "center",
								gap: "4px",
								padding: "4px 10px",
								borderRadius: "6px",
								border: "none",
								backgroundColor: "#d97706",
								color: "#ffffff",
								fontSize: "11.5px",
								fontWeight: 700,
								cursor: "pointer",
							}}
						>
							<FiRefreshCw size={12} /> Retry Connection
						</button>
					)}
				</div>
			</div>

			{errorMessage && (
				<div style={{ fontSize: "12px", color: "#991b1b" }}>
					{errorMessage}
				</div>
			)}

			{streamPreviewText && (
				<pre
					style={{
						margin: 0,
						padding: "10px",
						borderRadius: "6px",
						backgroundColor: "#ffffff",
						border: "1px solid #e2e8f0",
						fontFamily: "'Courier New', Courier, monospace",
						fontSize: "12px",
						maxHeight: "160px",
						overflowY: "auto",
						whiteSpace: "pre-wrap",
						color: "#334155",
					}}
				>
					{streamPreviewText}
				</pre>
			)}
		</div>
	);
}

