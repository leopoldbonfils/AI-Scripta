"use client";

import React, { useState } from "react";
import { useCreativeAnalysis } from "../../hooks/useCreativeAnalysis";
import { CreativeInputEditor } from "../../components/analysis/CreativeInputEditor";
import { AnalysisResultsView } from "../../components/analysis/AnalysisResultsView";
import { AnalysisHistoryDrawer } from "../../components/analysis/AnalysisHistoryDrawer";
import { AssociateMovieModal } from "../../components/analysis/AssociateMovieModal";
import { AILoading } from "../../components/ai/AILoading";
import { FiCompass } from "react-icons/fi";

export default function AnalysisPage() {
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
		error,
		currentAnalysis,
		currentGenerationId,
		history,
		analyze,
		loadAnalysis,
		retry,
		linkToMovie,
		clearCurrent,
	} = useCreativeAnalysis();

	const [isHistoryOpen, setIsHistoryOpen] = useState(false);
	const [isAssociateModalOpen, setIsAssociateModalOpen] = useState(false);

	const handleSubmit = async () => {
		try {
			await analyze();
		} catch {
			// Error handled in hook
		}
	};

	return (
		<div style={{ maxWidth: "1140px", margin: "0 auto", padding: "28px 24px 60px" }}>
			{/* Page Header */}
			<div style={{ marginBottom: "24px" }}>
				<div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#d97706", marginBottom: "4px" }}>
					<FiCompass size={18} />
					<span style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
						Story Development Studio
					</span>
				</div>
				<h1 style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
					Creative Input Analysis
				</h1>
				<p style={{ color: "#64748b", fontSize: "14px", marginTop: "4px", maxWidth: "680px" }}>
					Submit any creative writing—a single idea, synopsis, short script, novel chapter, or screenplay. FilmForge AI will analyze its dramaturgical structure, character arcs, and themes without altering your original work.
				</p>
			</div>

			{/* Main Workspace: Editor or Results */}
			{isAnalyzing ? (
				<div style={{ padding: "80px 24px", background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0", textAlign: "center" }}>
					<AILoading
						label="FilmForge AI is analyzing your creative material, structural beats, and character arcs..."
						size="lg"
					/>
				</div>
			) : currentAnalysis ? (
				<AnalysisResultsView
					analysis={currentAnalysis}
					onRetry={retry}
					onNewAnalysis={clearCurrent}
					onAssociateMovie={() => setIsAssociateModalOpen(true)}
				/>
			) : (
				<CreativeInputEditor
					content={content}
					onContentChange={setContent}
					inputType={inputType}
					onInputTypeChange={setInputType}
					genre={genre}
					onGenreChange={setGenre}
					targetAudience={targetAudience}
					onTargetAudienceChange={setTargetAudience}
					intendedFormat={intendedFormat}
					onIntendedFormatChange={setIntendedFormat}
					additionalInstructions={additionalInstructions}
					onAdditionalInstructionsChange={setAdditionalInstructions}
					isAnalyzing={isAnalyzing}
					error={error}
					onSubmit={handleSubmit}
					onOpenHistory={() => setIsHistoryOpen(true)}
					historyCount={history.length}
				/>
			)}

			{/* History Drawer */}
			<AnalysisHistoryDrawer
				isOpen={isHistoryOpen}
				onClose={() => setIsHistoryOpen(false)}
				history={history}
				onSelectAnalysis={loadAnalysis}
				activeAnalysisId={currentGenerationId}
			/>

			{/* Associate with Movie Modal */}
			{currentAnalysis && (
				<AssociateMovieModal
					isOpen={isAssociateModalOpen}
					onClose={() => setIsAssociateModalOpen(false)}
					analysis={currentAnalysis}
					onLinkToMovie={linkToMovie}
				/>
			)}
		</div>
	);
}

