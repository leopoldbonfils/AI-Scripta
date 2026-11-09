"use client";

import React, { useState, useEffect } from "react";
import { useStoryIntelligence } from "../../hooks/useStoryIntelligence";
import { analysisService } from "../../services/analysisService";
import { AnalysisListItem } from "../../types/analysis";
import { StoryFrameworkType } from "../../types/storyIntelligence";
import { StoryIntelligenceWorkspace } from "../../components/intelligence/StoryIntelligenceWorkspace";
import { AILoading } from "../../components/ai/AILoading";
import { FiCpu, FiBookOpen, FiClock, FiLayers, FiAlertCircle } from "react-icons/fi";

export default function StandaloneIntelligencePage() {
	const {
		intelligence,
		isLoading,
		isRegenerating,
		error,
		generateIntelligence,
		loadIntelligence,
		regenerateSection,
		updateSuggestionStatus,
		setIntelligence,
	} = useStoryIntelligence();

	const [analyses, setAnalyses] = useState<AnalysisListItem[]>([]);
	const [selectedAnalysisId, setSelectedAnalysisId] = useState<string>("");
	const [selectedFramework, setSelectedFramework] = useState<StoryFrameworkType | "AUTO">("AUTO");
	const [customDirectives, setCustomDirectives] = useState("");
	const [isLoadingAnalyses, setIsLoadingAnalyses] = useState(false);

	useEffect(() => {
		async function fetchAnalyses() {
			setIsLoadingAnalyses(true);
			try {
				const res = await analysisService.getAnalyses({ limit: 20 });
				setAnalyses(res.items);
				if (res.items.length > 0) {
					setSelectedAnalysisId(res.items[0].id);
				}
			} catch (err) {
				console.error("Failed to load creative analyses:", err);
			} finally {
				setIsLoadingAnalyses(false);
			}
		}
		fetchAnalyses();
	}, []);

	const handleGenerate = async () => {
		if (!selectedAnalysisId) return;
		try {
			await generateIntelligence({
				analysisId: selectedAnalysisId,
				preferredFramework: selectedFramework === "AUTO" ? undefined : selectedFramework,
				additionalInstructions: customDirectives.trim() || undefined,
			});
		} catch {
			// error state handled in hook
		}
	};

	return (
		<div style={{ maxWidth: "1140px", margin: "0 auto", padding: "28px 24px 60px" }}>
			{/* Page Header */}
			<div style={{ marginBottom: "24px" }}>
				<div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#d97706", marginBottom: "4px" }}>
					<FiCpu size={18} />
					<span style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
						Narrative Intelligence Studio (Phase C)
					</span>
				</div>
				<h1 style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
					Story & Character Intelligence
				</h1>
				<p style={{ color: "#64748b", fontSize: "14px", marginTop: "4px", maxWidth: "720px" }}>
					Transform your creative narrative analysis into a deep, connected storytelling system—exploring multi-dimensional character psychology, relationship tensions, character arcs, and causal story structure.
				</p>
			</div>

			{isLoading ? (
				<div style={{ padding: "80px 24px", background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0", textAlign: "center" }}>
					<AILoading
						label="FilmForge AI is analyzing character motivations, relationship networks, arcs, and structural causality..."
						size="lg"
					/>
				</div>
			) : intelligence ? (
				<div>
					<div style={{ marginBottom: "16px", display: "flex", justifyContent: "flex-end" }}>
						<button
							type="button"
							onClick={() => setIntelligence(null)}
							style={{
								padding: "6px 14px",
								fontSize: "12.5px",
								fontWeight: 600,
								border: "1px solid #cbd5e1",
								borderRadius: "6px",
								backgroundColor: "#ffffff",
								color: "#475569",
								cursor: "pointer",
							}}
						>
							← Choose Another Analysis
						</button>
					</div>

					<StoryIntelligenceWorkspace
						intelligence={intelligence}
						onRegenerateSection={regenerateSection}
						onUpdateSuggestion={updateSuggestionStatus}
						isRegenerating={isRegenerating}
						error={error}
						hasMovieContext={false}
					/>
				</div>
			) : (
				/* Selection & Launch Panel */
				<div
					style={{
						backgroundColor: "#ffffff",
						borderRadius: "12px",
						border: "1px solid #e2e8f0",
						padding: "28px",
						display: "flex",
						flexDirection: "column",
						gap: "24px",
					}}
				>
					<div>
						<h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", marginBottom: "6px" }}>
							1. Select Source Creative Analysis (Phase B)
						</h3>
						<p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 14px" }}>
							Choose an existing analysis to serve as the narrative foundation for deep character and story intelligence.
						</p>

						{isLoadingAnalyses ? (
							<div style={{ fontSize: "13px", color: "#64748b" }}>Loading previous analyses...</div>
						) : analyses.length > 0 ? (
							<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "12px" }}>
								{analyses.map((a) => {
									const isSelected = a.id === selectedAnalysisId;
									return (
										<div
											key={a.id}
											onClick={() => setSelectedAnalysisId(a.id)}
											style={{
												padding: "14px",
												borderRadius: "8px",
												border: isSelected ? "2px solid #d97706" : "1px solid #e2e8f0",
												backgroundColor: isSelected ? "#fffbeb" : "#ffffff",
												cursor: "pointer",
												transition: "all 0.15s ease",
											}}
										>
											<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
												<strong style={{ fontSize: "13.5px", color: "#0f172a" }}>{a.title}</strong>
												<span style={{ fontSize: "10.5px", fontWeight: 700, padding: "2px 6px", borderRadius: "4px", backgroundColor: "#f1f5f9", color: "#475569" }}>
													{a.inputType}
												</span>
											</div>
											<p style={{ margin: "6px 0 0", fontSize: "12px", color: "#64748b", lineHeight: "1.4" }}>
												{a.logline}
											</p>
										</div>
									);
								})}
							</div>
						) : (
							<div style={{ padding: "20px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", textAlign: "center", color: "#64748b", fontSize: "13px" }}>
								No Creative Analyses found. Visit the <a href="/analysis" style={{ color: "#d97706", fontWeight: 600 }}>Story Analysis Studio</a> to analyze a raw idea or script first.
							</div>
						)}
					</div>

					{/* 2. Preferred Story Framework */}
					<div>
						<h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", marginBottom: "6px" }}>
							2. Preferred Narrative Framework
						</h3>
						<p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 10px" }}>
							Select an architectural story model, or leave on Auto to let the dramaturg choose the most natural fit.
						</p>

						<div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
							{[
								{ id: "AUTO", label: "Auto Detect Best Fit" },
								{ id: "THREE_ACT", label: "Three-Act Classical" },
								{ id: "FIVE_ACT", label: "Five-Act Dramatic" },
								{ id: "HEROS_JOURNEY", label: "Hero's Journey" },
								{ id: "NONLINEAR", label: "Nonlinear / Memory" },
								{ id: "MYSTERY", label: "Investigative Mystery" },
								{ id: "TRAGEDY", label: "Tragic Downfall" },
								{ id: "CHARACTER_DRIVEN", label: "Character-Driven Arc" },
							].map((fw) => {
								const isSelected = selectedFramework === fw.id;
								return (
									<button
										key={fw.id}
										type="button"
										onClick={() => setSelectedFramework(fw.id as any)}
										style={{
											padding: "8px 14px",
											borderRadius: "6px",
											fontSize: "12.5px",
											fontWeight: isSelected ? 700 : 500,
											border: isSelected ? "1.5px solid #d97706" : "1px solid #cbd5e1",
											backgroundColor: isSelected ? "#fef3c7" : "#ffffff",
											color: isSelected ? "#92400e" : "#475569",
											cursor: "pointer",
										}}
									>
										{fw.label}
									</button>
								);
							})}
						</div>
					</div>

					{/* 3. Additional Author Instructions */}
					<div>
						<h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", marginBottom: "6px" }}>
							3. Custom Directives (Optional)
						</h3>
						<input
							type="text"
							value={customDirectives}
							onChange={(e) => setCustomDirectives(e.target.value)}
							placeholder="e.g. Focus on deep psychological tension between Eric and Sarah, or explore redemption arcs."
							style={{ width: "100%", padding: "10px 14px", fontSize: "13px", border: "1px solid #cbd5e1", borderRadius: "8px" }}
						/>
					</div>

					{error && (
						<div style={{ padding: "10px 14px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", color: "#b91c1c", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
							<FiAlertCircle size={16} />
							<span>{error}</span>
						</div>
					)}

					{/* Submit Button */}
					<div style={{ display: "flex", justifyContent: "flex-end" }}>
						<button
							type="button"
							onClick={handleGenerate}
							disabled={!selectedAnalysisId || isLoading}
							style={{
								padding: "12px 28px",
								fontSize: "14px",
								fontWeight: 700,
								borderRadius: "8px",
								border: "none",
								backgroundColor: !selectedAnalysisId || isLoading ? "#cbd5e1" : "#d97706",
								color: "#ffffff",
								cursor: !selectedAnalysisId || isLoading ? "not-allowed" : "pointer",
								display: "flex",
								alignItems: "center",
								gap: "8px",
							}}
						>
							<FiCpu size={16} />
							<span>Run Story & Character Intelligence</span>
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
