"use client";

import React, { useState, useEffect } from "react";
import {
	StoryIntelligenceResult,
	IntelligenceSection,
	SuggestionDecision,
} from "../../types/storyIntelligence";
import { IntelligenceOverview } from "./IntelligenceOverview";
import { CharacterIntelligenceView } from "./CharacterIntelligenceView";
import { MotivationsMatrixView } from "./MotivationsMatrixView";
import { RelationshipNetworkView } from "./RelationshipNetworkView";
import { CharacterArcsView } from "./CharacterArcsView";
import { StoryStructureView } from "./StoryStructureView";
import { NarrativeConsistencyView } from "./NarrativeConsistencyView";
import { SuggestionDecisionBar } from "./SuggestionDecisionBar";
import { ApplyDecisionsModal } from "./ApplyDecisionsModal";
import {
	FiBookOpen,
	FiUsers,
	FiZap,
	FiShare2,
	FiTrendingUp,
	FiLayers,
	FiCheckCircle,
	FiShield,
	FiCheckSquare,
	FiAlertCircle,
} from "react-icons/fi";

export interface StoryIntelligenceWorkspaceProps {
	intelligence: StoryIntelligenceResult;
	onRegenerateSection: (section: IntelligenceSection, characterName?: string, customInstructions?: string) => Promise<any>;
	onUpdateSuggestion: (suggestionId: string, status: SuggestionDecision, editedContent?: string) => Promise<any>;
	onApplyToProject?: (params: {
		applyToStory?: boolean;
		applyCharacters?: boolean;
		selectedCharacterIds?: string[];
	}) => Promise<any>;
	isRegenerating: boolean;
	isApplying?: boolean;
	applySuccessMessage?: string | null;
	error?: string | null;
	hasMovieContext?: boolean;
}

export type WorkspaceTab =
	| "overview"
	| "characters"
	| "motivations"
	| "relationships"
	| "arcs"
	| "structure"
	| "consistency"
	| "suggestions";

export function StoryIntelligenceWorkspace({
	intelligence,
	onRegenerateSection,
	onUpdateSuggestion,
	onApplyToProject,
	isRegenerating,
	isApplying = false,
	applySuccessMessage,
	error,
	hasMovieContext = false,
}: StoryIntelligenceWorkspaceProps) {
	const [activeTab, setActiveTab] = useState<WorkspaceTab>("overview");
	const [selectedCharId, setSelectedCharId] = useState<string | null>(
		intelligence.characters.length > 0 ? intelligence.characters[0].id : null
	);
	const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

	useEffect(() => {
		if (!intelligence.characters || intelligence.characters.length === 0) {
			setSelectedCharId(null);
			return;
		}
		const stillExists = intelligence.characters.some((c) => c.id === selectedCharId);
		if (!stillExists) {
			setSelectedCharId(intelligence.characters[0].id);
		}
	}, [intelligence.intelligenceId, intelligence.characters, selectedCharId]);

	const pendingSuggestionsCount = intelligence.suggestions.filter(
		(s) => s.status === "PENDING"
	).length;

	const tabs: Array<{ id: WorkspaceTab; label: string; icon: any; count?: number }> = [
		{ id: "overview", label: "Story Overview", icon: FiBookOpen },
		{ id: "characters", label: "Characters", icon: FiUsers, count: intelligence.characters.length },
		{ id: "motivations", label: "Motivations", icon: FiZap, count: intelligence.motivations.length },
		{ id: "relationships", label: "Relationships", icon: FiShare2, count: intelligence.relationships.length },
		{ id: "arcs", label: "Character Arcs", icon: FiTrendingUp, count: intelligence.characterArcs.length },
		{ id: "structure", label: "Story Structure", icon: FiLayers, count: intelligence.storyStructure.beats.length },
		{ id: "consistency", label: "Narrative Audit", icon: FiCheckSquare, count: intelligence.consistencyChecks.length },
		{ id: "suggestions", label: "Proposals", icon: FiCheckCircle, count: pendingSuggestionsCount },
	];

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
			{/* Top Action Bar */}
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					backgroundColor: "#ffffff",
					padding: "16px 20px",
					borderRadius: "10px",
					border: "1px solid #e2e8f0",
				}}
			>
				<div>
					<div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
						<h2 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
							Story & Character Intelligence
						</h2>
						<span
							style={{
								fontSize: "11px",
								fontWeight: 700,
								textTransform: "uppercase",
								padding: "2px 8px",
								borderRadius: "4px",
								backgroundColor: "#fef3c7",
								color: "#92400e",
							}}
						>
							{intelligence.storyStructure.framework.replace(/_/g, " ")}
						</span>
					</div>
					<p style={{ margin: "4px 0 0", fontSize: "12.5px", color: "#64748b" }}>
						Connected Narrative System: {intelligence.characters.length} Characters • {intelligence.relationships.length} Relationships • {intelligence.storyStructure.beats.length} Structural Beats
					</p>
				</div>

				<div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
					{hasMovieContext && onApplyToProject && (
						<button
							type="button"
							onClick={() => setIsApplyModalOpen(true)}
							style={{
								display: "flex",
								alignItems: "center",
								gap: "6px",
								padding: "8px 16px",
								backgroundColor: "#059669",
								color: "#ffffff",
								fontSize: "13px",
								fontWeight: 600,
								border: "none",
								borderRadius: "6px",
								cursor: "pointer",
							}}
						>
							<FiShield size={14} />
							<span>Apply Approved to Movie</span>
						</button>
					)}
				</div>
			</div>

			{/* Success Message Banner */}
			{applySuccessMessage && (
				<div
					style={{
						padding: "10px 14px",
						backgroundColor: "#ecfdf5",
						border: "1px solid #a7f3d0",
						borderRadius: "8px",
						color: "#065f46",
						fontSize: "13px",
						display: "flex",
						alignItems: "center",
						gap: "8px",
					}}
				>
					<FiCheckCircle size={16} />
					<span>{applySuccessMessage}</span>
				</div>
			)}

			{/* Error Banner */}
			{error && (
				<div
					style={{
						padding: "10px 14px",
						backgroundColor: "#fef2f2",
						border: "1px solid #fecaca",
						borderRadius: "8px",
						color: "#b91c1c",
						fontSize: "13px",
						display: "flex",
						alignItems: "center",
						gap: "8px",
					}}
				>
					<FiAlertCircle size={16} />
					<span>{error}</span>
				</div>
			)}

			{/* Horizontal Navigation Tabs */}
			<div
				style={{
					display: "flex",
					gap: "4px",
					backgroundColor: "#ffffff",
					padding: "6px",
					borderRadius: "8px",
					border: "1px solid #e2e8f0",
					overflowX: "auto",
				}}
			>
				{tabs.map((tab) => {
					const isActive = activeTab === tab.id;
					const Icon = tab.icon;
					return (
						<button
							key={tab.id}
							type="button"
							onClick={() => setActiveTab(tab.id)}
							style={{
								display: "flex",
								alignItems: "center",
								gap: "6px",
								padding: "8px 14px",
								fontSize: "13px",
								fontWeight: isActive ? 700 : 500,
								backgroundColor: isActive ? "#f8fafc" : "transparent",
								color: isActive ? "#d97706" : "#64748b",
								border: "none",
								borderRadius: "6px",
								cursor: "pointer",
								whiteSpace: "nowrap",
							}}
						>
							<Icon size={14} />
							<span>{tab.label}</span>
							{tab.count !== undefined && tab.count > 0 && (
								<span
									style={{
										fontSize: "11px",
										fontWeight: 600,
										padding: "1px 6px",
										borderRadius: "10px",
										backgroundColor: isActive ? "#fef3c7" : "#e2e8f0",
										color: isActive ? "#92400e" : "#475569",
									}}
								>
									{tab.count}
								</span>
							)}
						</button>
					);
				})}
			</div>

			{/* Tab Body */}
			<div
				style={{
					backgroundColor: "#ffffff",
					borderRadius: "10px",
					border: "1px solid #e2e8f0",
					padding: "24px",
				}}
			>
				{activeTab === "overview" && (
					<IntelligenceOverview
						storyDevelopment={intelligence.storyDevelopment}
						onRegenerate={() => onRegenerateSection("STORY_EXPANSION")}
						isRegenerating={isRegenerating}
					/>
				)}

				{activeTab === "characters" && (
					<CharacterIntelligenceView
						characters={intelligence.characters}
						selectedCharacterId={selectedCharId}
						onSelectCharacter={setSelectedCharId}
						onRegenerate={(charName) => onRegenerateSection("CHARACTERS", charName)}
						isRegenerating={isRegenerating}
					/>
				)}

				{activeTab === "motivations" && (
					<MotivationsMatrixView
						motivations={intelligence.motivations}
						onRegenerate={() => onRegenerateSection("MOTIVATIONS")}
						isRegenerating={isRegenerating}
					/>
				)}

				{activeTab === "relationships" && (
					<RelationshipNetworkView
						relationships={intelligence.relationships}
						onRegenerate={() => onRegenerateSection("RELATIONSHIPS")}
						isRegenerating={isRegenerating}
					/>
				)}

				{activeTab === "arcs" && (
					<CharacterArcsView
						characterArcs={intelligence.characterArcs}
						onRegenerate={() => onRegenerateSection("ARCS")}
						isRegenerating={isRegenerating}
					/>
				)}

				{activeTab === "structure" && (
					<StoryStructureView
						storyStructure={intelligence.storyStructure}
						onRegenerate={() => onRegenerateSection("STRUCTURE")}
						isRegenerating={isRegenerating}
					/>
				)}

				{activeTab === "consistency" && (
					<NarrativeConsistencyView
						consistencyChecks={intelligence.consistencyChecks}
						onRegenerate={() => onRegenerateSection("CONSISTENCY")}
						isRegenerating={isRegenerating}
					/>
				)}

				{activeTab === "suggestions" && (
					<div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
						<div>
							<h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
								Actionable Narrative Proposals & Decisions
							</h3>
							<p style={{ fontSize: "12.5px", color: "#64748b", margin: "2px 0 0" }}>
								Review, edit, and approve individual development proposals before synchronizing with your project.
							</p>
						</div>

						{intelligence.suggestions && intelligence.suggestions.length > 0 ? (
							<div>
								{intelligence.suggestions.map((sug) => (
									<SuggestionDecisionBar
										key={sug.id}
										suggestion={sug}
										onDecision={onUpdateSuggestion}
									/>
								))}
							</div>
						) : (
							<div style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>
								No development proposals available.
							</div>
						)}
					</div>
				)}
			</div>

			{/* Apply Decisions Modal */}
			{hasMovieContext && onApplyToProject && (
				<ApplyDecisionsModal
					isOpen={isApplyModalOpen}
					onClose={() => setIsApplyModalOpen(false)}
					intelligence={intelligence}
					onApply={onApplyToProject}
					isApplying={isApplying}
				/>
			)}
		</div>
	);
}
