"use client";

import React from "react";
import { AnalysisListItem } from "../../types/analysis";
import { FiX, FiLayers, FiCalendar, FiClock } from "react-icons/fi";

export interface AnalysisHistoryDrawerProps {
	isOpen: boolean;
	onClose: () => void;
	history: AnalysisListItem[];
	onSelectAnalysis: (analysisId: string) => void;
	activeAnalysisId?: string | null;
}

export function AnalysisHistoryDrawer({
	isOpen,
	onClose,
	history,
	onSelectAnalysis,
	activeAnalysisId,
}: AnalysisHistoryDrawerProps) {
	if (!isOpen) return null;

	return (
		<div
			style={{
				position: "fixed",
				inset: 0,
				zIndex: 9999,
				backgroundColor: "rgba(15, 23, 42, 0.45)",
				display: "flex",
				justifyContent: "flex-end",
			}}
			onClick={onClose}
		>
			<div
				style={{
					width: "380px",
					height: "100%",
					backgroundColor: "#ffffff",
					boxShadow: "-4px 0 24px rgba(0, 0, 0, 0.15)",
					display: "flex",
					flexDirection: "column",
				}}
				onClick={(e) => e.stopPropagation()}
			>
				{/* Top Bar */}
				<div
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						padding: "16px 20px",
						borderBottom: "1px solid #e2e8f0",
					}}
				>
					<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
						<FiLayers size={18} color="#d97706" />
						<h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
							Analysis History ({history.length})
						</h3>
					</div>
					<button
						type="button"
						onClick={onClose}
						style={{
							background: "none",
							border: "none",
							color: "#64748b",
							cursor: "pointer",
							padding: "4px",
						}}
					>
						<FiX size={18} />
					</button>
				</div>

				{/* List Feed */}
				<div
					style={{
						flex: 1,
						overflowY: "auto",
						padding: "14px 16px",
						display: "flex",
						flexDirection: "column",
						gap: "10px",
					}}
				>
					{history.length === 0 ? (
						<p style={{ color: "#94a3b8", fontSize: "13px", textAlign: "center", marginTop: "40px" }}>
							No analyses recorded yet.
						</p>
					) : (
						history.map((item) => {
							const isSelected = item.id === activeAnalysisId;
							return (
								<button
									key={item.id}
									type="button"
									onClick={() => {
										onSelectAnalysis(item.id);
										onClose();
									}}
									style={{
										textAlign: "left",
										padding: "12px",
										borderRadius: "8px",
										border: isSelected ? "1px solid #d97706" : "1px solid #e2e8f0",
										backgroundColor: isSelected ? "#fffbeb" : "#ffffff",
										cursor: "pointer",
										transition: "all 0.15s ease",
									}}
								>
									<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
										<span style={{ fontSize: "11px", fontWeight: 600, padding: "2px 6px", borderRadius: "4px", backgroundColor: "#f1f5f9", color: "#334155" }}>
											{item.detectedType.replace(/_/g, " ")}
										</span>
										<span style={{ fontSize: "11px", color: "#94a3b8" }}>
											{new Date(item.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
										</span>
									</div>
									<div style={{ fontWeight: 700, fontSize: "13.5px", color: "#0f172a", marginBottom: "4px" }}>
										{item.title || "Untitled Analysis"}
									</div>
									{item.logline && (
										<p style={{ margin: 0, fontSize: "12px", color: "#475569", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
											{item.logline}
										</p>
									)}
								</button>
							);
						})
					)}
				</div>
			</div>
		</div>
	);
}

