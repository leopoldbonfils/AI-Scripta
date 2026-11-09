"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useMovie } from "../../../../hooks/useMovie";
import { MovieHeader } from "../../../../components/movie/MovieHeader";
import { useStoryIntelligence } from "../../../../hooks/useStoryIntelligence";
import { StoryIntelligenceWorkspace } from "../../../../components/intelligence/StoryIntelligenceWorkspace";
import { StoryFrameworkType } from "../../../../types/storyIntelligence";
import { AILoading } from "../../../../components/ai/AILoading";
import { FiAlertCircle, FiCpu, FiLayers, FiRefreshCw } from "react-icons/fi";

export default function MovieIntelligencePage() {
	const params = useParams();
	const movieId = typeof params?.movieId === "string" ? params.movieId : "";

	const { movie, isLoading: isMovieLoading, error: movieError, updateMovie, deleteMovie } =
		useMovie(movieId);

	const {
		intelligence,
		history,
		isLoading,
		isRegenerating,
		isApplying,
		applySuccessMessage,
		error,
		generateIntelligence,
		loadMovieHistory,
		regenerateSection,
		updateSuggestionStatus,
		applyToProject,
		setIntelligence,
	} = useStoryIntelligence(movieId);

	const [selectedFramework, setSelectedFramework] = useState<StoryFrameworkType | "AUTO">("AUTO");
	const [directives, setDirectives] = useState("");

	useEffect(() => {
		if (movieId) {
			loadMovieHistory(movieId);
		}
	}, [movieId, loadMovieHistory]);

	if (isMovieLoading) {
		return (
			<div style={{ padding: "48px 36px", maxWidth: "1220px", margin: "0 auto" }}>
				<AILoading label="Loading movie project..." size="md" />
			</div>
		);
	}

	if (!movie) {
		return (
			<div style={{ maxWidth: "600px", margin: "80px auto", textAlign: "center", padding: "48px 24px" }}>
				<FiAlertCircle size={36} color="#dc2626" />
				<h2 style={{ fontSize: "20px", fontWeight: "700", marginTop: "12px" }}>Movie Not Found</h2>
				<p style={{ color: "#64748b", fontSize: "14px", marginBottom: "20px" }}>{movieError || "Could not load movie project."}</p>
				<Link href="/movies" style={{ color: "#d97706", fontWeight: 600 }}>Back to My Movies</Link>
			</div>
		);
	}

	const handleGenerate = async () => {
		try {
			await generateIntelligence({
				movieId: movie.id,
				preferredFramework: selectedFramework === "AUTO" ? undefined : selectedFramework,
				additionalInstructions: directives.trim() || undefined,
			});
		} catch {
			// error handled in hook
		}
	};

	return (
		<div style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
			<MovieHeader
				movie={movie}
				activeTab="intelligence"
				onUpdate={updateMovie}
				onDelete={deleteMovie}
			/>

			<div style={{ maxWidth: "1220px", margin: "0 auto", padding: "32px 36px 60px" }}>
				{isLoading ? (
					<div style={{ padding: "80px 24px", background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0", textAlign: "center" }}>
						<AILoading
							label="FilmForge AI is analyzing connected character motivations, relationships, arcs, and dramatic structure..."
							size="lg"
						/>
					</div>
				) : intelligence ? (
					<div>
						{history.length > 1 && (
							<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
								<div style={{ fontSize: "12.5px", color: "#64748b" }}>
									Version History: {history.length} intelligence sessions saved
								</div>
								<button
									type="button"
									onClick={() => setIntelligence(null)}
									style={{
										padding: "6px 12px",
										fontSize: "12px",
										fontWeight: 600,
										borderRadius: "6px",
										border: "1px solid #cbd5e1",
										backgroundColor: "#ffffff",
										color: "#475569",
										cursor: "pointer",
									}}
								>
									+ Run Fresh Intelligence Session
								</button>
							</div>
						)}

						<StoryIntelligenceWorkspace
							intelligence={intelligence}
							onRegenerateSection={regenerateSection}
							onUpdateSuggestion={updateSuggestionStatus}
							onApplyToProject={applyToProject}
							isRegenerating={isRegenerating}
							isApplying={isApplying}
							applySuccessMessage={applySuccessMessage}
							error={error}
							hasMovieContext={true}
						/>
					</div>
				) : (
					/* Empty State / Initial Launch Screen */
					<div
						style={{
							backgroundColor: "#ffffff",
							borderRadius: "12px",
							border: "1px solid #e2e8f0",
							padding: "36px",
							display: "flex",
							flexDirection: "column",
							gap: "24px",
						}}
					>
						<div>
							<div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#d97706", marginBottom: "4px" }}>
								<FiCpu size={20} />
								<span style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
									Phase C: Story & Character Intelligence
								</span>
							</div>
							<h2 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", margin: "4px 0" }}>
								Synthesize Story & Character Architecture for &ldquo;{movie.title}&rdquo;
							</h2>
							<p style={{ color: "#64748b", fontSize: "14px", margin: 0, maxWidth: "780px", lineHeight: "1.6" }}>
								FilmForge AI will analyze the connected narrative system for this movie—uncovering character goals vs. needs, relationship power dynamics, transformation arcs, beat-by-beat structural progression, and consistency checks.
							</p>
						</div>

						{/* Framework Selection */}
						<div>
							<label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#334155", marginBottom: "8px" }}>
								Preferred Story Framework
							</label>
							<div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
								{[
									{ id: "AUTO", label: "Auto Detect Best Fit" },
									{ id: "THREE_ACT", label: "Three-Act Classical" },
									{ id: "FIVE_ACT", label: "Five-Act Dramatic" },
									{ id: "HEROS_JOURNEY", label: "Hero's Journey" },
									{ id: "NONLINEAR", label: "Nonlinear" },
									{ id: "MYSTERY", label: "Mystery / Investigative" },
									{ id: "TRAGEDY", label: "Tragic Downfall" },
									{ id: "CHARACTER_DRIVEN", label: "Character-Driven" },
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

						{/* Specific Directives */}
						<div>
							<label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
								Custom Directives (Optional)
							</label>
							<input
								type="text"
								value={directives}
								onChange={(e) => setDirectives(e.target.value)}
								placeholder="e.g. Focus on the emotional dilemma between the two leads, or explore a darker ending."
								style={{ width: "100%", padding: "10px 14px", fontSize: "13px", border: "1px solid #cbd5e1", borderRadius: "8px" }}
							/>
						</div>

						{error && (
							<div style={{ padding: "10px 14px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", color: "#b91c1c", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
								<FiAlertCircle size={16} />
								<span>{error}</span>
							</div>
						)}

						<div style={{ display: "flex", justifyContent: "flex-end" }}>
							<button
								type="button"
								onClick={handleGenerate}
								disabled={isLoading}
								style={{
									padding: "12px 28px",
									fontSize: "14px",
									fontWeight: 700,
									borderRadius: "8px",
									border: "none",
									backgroundColor: "#d97706",
									color: "#ffffff",
									cursor: "pointer",
									display: "flex",
									alignItems: "center",
									gap: "8px",
								}}
							>
								<FiCpu size={16} />
								<span>Start Story & Character Intelligence</span>
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
