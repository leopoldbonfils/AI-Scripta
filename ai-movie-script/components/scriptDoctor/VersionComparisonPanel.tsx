"use client";

import React, { useState } from "react";
import { VersionComparisonResult, VersionRecordSummary } from "../../types/scriptDoctor";
import { FiClock, FiGitCommit, FiRotateCcw } from "react-icons/fi";

interface VersionComparisonPanelProps {
	versions: VersionRecordSummary[];
	currentVersion: number;
	comparison: VersionComparisonResult | null;
	isBusy: boolean;
	onCompare: (fromVersionId: string, toVersionId?: string) => Promise<unknown>;
	onRestore: (versionId: string) => Promise<unknown>;
}

export function VersionComparisonPanel({
	versions,
	currentVersion,
	comparison,
	isBusy,
	onCompare,
	onRestore,
}: VersionComparisonPanelProps) {
	const [fromId, setFromId] = useState(versions[1]?.id || versions[0]?.id || "");
	const [toId, setToId] = useState("CURRENT");

	if (versions.length === 0) {
		return (
			<div style={{ padding: "28px", backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", textAlign: "center", color: "#64748b", fontSize: "13px" }}>
				No immutable version snapshots recorded yet. Accepting a Script Doctor proposal or saving a version snapshot creates permanent traceable history here.
			</div>
		);
	}

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
			<div style={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "18px" }}>
				<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "14px" }}>
					<h3 style={{ margin: 0, fontSize: "15.5px", fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
						<FiClock color="#d97706" /> Immutable Screenplay Versions ({versions.length} · Current Live Draft v{currentVersion})
					</h3>

					<div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center", fontSize: "12px" }}>
						<select
							value={fromId}
							onChange={(e) => setFromId(e.target.value)}
							style={{ padding: "6px 8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
						>
							{versions.map((v) => (
								<option key={v.id} value={v.id}>
									v{v.versionNumber} — {v.changeOrigin || "WRITER"}
								</option>
							))}
						</select>
						<span>vs</span>
						<select
							value={toId}
							onChange={(e) => setToId(e.target.value)}
							style={{ padding: "6px 8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
						>
							<option value="CURRENT">Current Live Draft (v{currentVersion})</option>
							{versions.map((v) => (
								<option key={v.id} value={v.id}>
									v{v.versionNumber}
								</option>
							))}
						</select>
						<button
							type="button"
							disabled={isBusy || !fromId}
							onClick={() => void onCompare(fromId, toId)}
							style={{ padding: "6px 12px", borderRadius: "6px", border: "none", backgroundColor: "#0f172a", color: "#fff", fontWeight: 700, cursor: "pointer" }}
						>
							Compare Diff
						</button>
					</div>
				</div>

				<div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "260px", overflowY: "auto" }}>
					{versions.map((v) => (
						<div
							key={v.id}
							style={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								flexWrap: "wrap",
								gap: "8px",
								padding: "10px 12px",
								borderRadius: "8px",
								border: "1px solid #e2e8f0",
								backgroundColor: "#f8fafc",
								fontSize: "12.5px",
							}}
						>
							<div>
								<div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
									<FiGitCommit color="#d97706" />
									<strong>Version #{v.versionNumber}</strong>
									<span
										style={{
											fontSize: "10.5px",
											fontWeight: 700,
											padding: "2px 6px",
											borderRadius: "4px",
											backgroundColor: v.changeOrigin?.startsWith("AI") ? "#fef3c7" : "#dbeafe",
											color: v.changeOrigin?.startsWith("AI") ? "#92400e" : "#1e40af",
										}}
									>
										{v.changeOrigin || "WRITER"}
										{v.operationType ? ` · ${v.operationType}` : ""}
									</span>
									<span style={{ color: "#64748b", fontSize: "11.5px" }}>
										{v.wordCount} words · {new Date(v.createdAt).toLocaleString()}
									</span>
								</div>
								<div style={{ color: "#475569", marginTop: "2px" }}>
									{v.changeSummary || "Saved snapshot"}
								</div>
							</div>

							<button
								type="button"
								disabled={isBusy}
								onClick={() => void onRestore(v.id)}
								style={{
									display: "inline-flex",
									alignItems: "center",
									gap: "4px",
									padding: "6px 10px",
									borderRadius: "6px",
									border: "1px solid #cbd5e1",
									backgroundColor: "#ffffff",
									fontSize: "11.5px",
									fontWeight: 600,
									cursor: "pointer",
								}}
							>
								<FiRotateCcw size={12} /> Restore Safely
							</button>
						</div>
					))}
				</div>
			</div>

			{comparison && (
				<div style={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "18px" }}>
					<div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", marginBottom: "8px" }}>
						Comparison: v{comparison.fromVersion.versionNumber} → {comparison.toLabel} (+
						{comparison.diff.stats.addedLines} / -{comparison.diff.stats.removedLines} lines)
					</div>
					<div style={{ border: "1px solid #cbd5e1", borderRadius: "8px", maxHeight: "360px", overflow: "auto", fontFamily: "'Courier New', Courier, monospace", fontSize: "12px" }}>
						{comparison.diff.sideBySideRows.map((row, i) => (
							<div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: "1px solid #f1f5f9" }}>
								<div style={{ padding: "2px 8px", borderRight: "1px solid #e2e8f0", backgroundColor: row.rowType === "REMOVED" || row.rowType === "MODIFIED" ? "#fef2f2" : "#fff", whiteSpace: "pre-wrap" }}>
									{row.leftText}
								</div>
								<div style={{ padding: "2px 8px", backgroundColor: row.rowType === "ADDED" || row.rowType === "MODIFIED" ? "#f0fdf4" : "#fff", whiteSpace: "pre-wrap" }}>
									{row.rightText}
								</div>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}

