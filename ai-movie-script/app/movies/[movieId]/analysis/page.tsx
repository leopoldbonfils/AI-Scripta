"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useMovie } from "../../../../hooks/useMovie";
import { MovieHeader } from "../../../../components/movie/MovieHeader";
import { useCreativeAnalysis } from "../../../../hooks/useCreativeAnalysis";
import { CreativeInputEditor } from "../../../../components/analysis/CreativeInputEditor";
import { AnalysisResultsView } from "../../../../components/analysis/AnalysisResultsView";
import { AnalysisHistoryDrawer } from "../../../../components/analysis/AnalysisHistoryDrawer";
import { AILoading } from "../../../../components/ai/AILoading";
import { FiAlertCircle, FiArrowLeft } from "react-icons/fi";

export default function MovieAnalysisPage() {
	const params = useParams();
	const movieId = typeof params?.movieId === "string" ? params.movieId : "";

	const { movie, isLoading: isMovieLoading, error: movieError, updateMovie, deleteMovie } =
		useMovie(movieId);

	const {
		content,
		setContent,
		inputType,
		setInputType,
		genre,
		setGenre,
		targetAudience,
		setTargetAudience,
		intendedFormat,
		setIntendedFormat,
		additionalInstructions,
		setAdditionalInstructions,
		isAnalyzing,
		error: analysisError,
		currentAnalysis,
		currentGenerationId,
		history,
		analyze,
		loadAnalysis,
		retry,
		clearCurrent,
	} = useCreativeAnalysis(movieId);

	const [isHistoryOpen, setIsHistoryOpen] = useState(false);

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

	const handleSubmit = async () => {
		try {
			await analyze({
				movieId: movie.id,
				context: {
					genre: genre || movie.genre || undefined,
				},
			});
		} catch {
			// Handled in hook
		}
	};

	return (
		<div>
			<MovieHeader
				movie={movie}
				activeTab="story"
				onUpdate={updateMovie}
				onDelete={deleteMovie}
			/>

			<div style={{ padding: "0 36px 48px", maxWidth: "1220px", margin: "0 auto" }}>
				{isAnalyzing ? (
					<div style={{ padding: "80px 24px", background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0", textAlign: "center" }}>
						<AILoading
							label={`FilmForge AI is analyzing material for "${movie.title}"...`}
							size="lg"
						/>
					</div>
				) : currentAnalysis ? (
					<AnalysisResultsView
						analysis={currentAnalysis}
						onRetry={retry}
						onNewAnalysis={clearCurrent}
					/>
				) : (
					<CreativeInputEditor
						content={content || movie.originalIdea || ""}
						onContentChange={setContent}
						inputType={inputType}
						onInputTypeChange={setInputType}
						genre={genre || movie.genre || ""}
						onGenreChange={setGenre}
						targetAudience={targetAudience}
						onTargetAudienceChange={setTargetAudience}
						intendedFormat={intendedFormat || movie.targetLength || ""}
						onIntendedFormatChange={setIntendedFormat}
						additionalInstructions={additionalInstructions}
						onAdditionalInstructionsChange={setAdditionalInstructions}
						isAnalyzing={isAnalyzing}
						error={analysisError}
						onSubmit={handleSubmit}
						onOpenHistory={() => setIsHistoryOpen(true)}
						historyCount={history.length}
					/>
				)}

				<AnalysisHistoryDrawer
					isOpen={isHistoryOpen}
					onClose={() => setIsHistoryOpen(false)}
					history={history}
					onSelectAnalysis={loadAnalysis}
					activeAnalysisId={currentGenerationId}
				/>
			</div>
		</div>
	);
}

