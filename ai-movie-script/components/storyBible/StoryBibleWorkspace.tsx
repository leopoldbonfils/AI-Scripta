"use client";

import React, { useState } from "react";
import { StoryBibleTab, useStoryBible } from "../../hooks/useStoryBible";
import { StoryOverviewSection } from "./StoryOverviewSection";
import { CharactersMemorySection } from "./CharactersMemorySection";
import { RelationshipsMemorySection } from "./RelationshipsMemorySection";
import { LocationsMemorySection } from "./LocationsMemorySection";
import { EntitiesMemorySection } from "./EntitiesMemorySection";
import { TimelineSection } from "./TimelineSection";
import { SceneConnectionsSection } from "./SceneConnectionsSection";
import { ContinuityFindingsSection } from "./ContinuityFindingsSection";
import { MemoryHistorySection } from "./MemoryHistorySection";
import { AILoading } from "../ai/AILoading";
import {
	FiBook,
	FiUsers,
	FiShare2,
	FiMapPin,
	FiBox,
	FiClock,
	FiLink,
	FiAlertTriangle,
	FiArchive,
	FiRefreshCw,
	FiCheckCircle,
	FiAlertCircle,
	FiShield,
} from "react-icons/fi";

export interface StoryBibleWorkspaceProps {
	movieId: string;
	movieTitle?: string;
}

export function StoryBibleWorkspace({ movieId, movieTitle }: StoryBibleWorkspaceProps) {
	const {
		storyBible,
		activeTab,
		setActiveTab,
		isLoading,
		isBuilding,
		isAnalyzingContinuity,
		isSaving,
		error,
		toastMessage,
		buildStoryBible,
		updateIdentity,
		createEntry,
		updateEntry,
		analyzeContinuity,
		updateFindingStatus,
		reviewProposal,
		restoreVersion,
	} = useStoryBible(movieId);

	const [customSourceText, setCustomSourceText] = useState("");
	const [showBuildOptions, setShowBuildOptions] = useState(false);

	if (isLoading) {
		return (
			<div style={{ padding: "64px 24px", backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", textAlign: "center" }}>
				<AILoading label="Loading Persistent Story Bible & Narrative Memory..." size="md" />
			</div>
		);
	}

	if (isBuilding) {
		return (
			<div style={{ padding: "80px 24px", backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", textAlign: "center" }}>
				<AILoading label="Extracting Persistent Story Bible across characters, locations, objects, timeline, and scenes..." size="lg" />
			</div>
		);
	}

	if (!storyBible) {
		return (
			<div style={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "36px", display: "flex", flexDirection: "column", gap: "20px" }}>
				<div>
					<div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#d97706", marginBottom: "6px" }}>
						<FiBook size={20} />
						<span style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
							Phase D: Persistent Story Bible & Continuity
						</span>
					</div>
					<h2 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", margin: "4px 0" }}>
						Initialize Story Bible {movieTitle ? `for "${movieTitle}"` : ""}
					</h2>
					<p style={{ color: "#64748b", fontSize: "14px", margin: 0, maxWidth: "780px", lineHeight: "1.6" }}>
						Build your project&apos;s persistent Narrative Memory System from your existing Story, Characters, Scenes, Phase B Analysis, Phase C Intelligence, or paste additional source material below.
					</p>
				</div>

				<div>
					<label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
						Optional Long-Form Story or Script Source Text (Supports Multi-Chunk Extraction)
					</label>
					<textarea
						rows={5}
						value={customSourceText}
						onChange={(e) => setCustomSourceText(e.target.value)}
						placeholder="Optional: Paste full prose chapters, detailed bible notes, or screenplay scenes to augment your movie assets..."
						style={{ width: "100%", padding: "10px 14px", fontSize: "13px", border: "1px solid #cbd5e1", borderRadius: "8px", fontFamily: "inherit" }}
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
						onClick={() => buildStoryBible({ sourceText: customSourceText.trim() || undefined, mode: "INITIALIZE" })}
						style={{
							display: "flex",
							alignItems: "center",
							gap: "8px",
							padding: "12px 26px",
							fontSize: "14px",
							fontWeight: 700,
							borderRadius: "8px",
							border: "none",
							backgroundColor: "#d97706",
							color: "#ffffff",
							cursor: "pointer",
						}}
					>
						<FiBook size={16} />
						<span>Build Persistent Story Bible</span>
					</button>
				</div>
			</div>
		);
	}

	const pendingContinuityCount = storyBible.continuityFindings.filter((f) => f.status === "PENDING").length;
	const pendingProposalsCount = storyBible.proposals.filter((p) => p.status === "PENDING").length;

	const tabs: Array<{ id: StoryBibleTab; label: string; icon: any; count?: number; highlight?: boolean }> = [
		{ id: "overview", label: "Story Overview", icon: FiBook },
		{ id: "characters", label: "Characters", icon: FiUsers, count: storyBible.characters.length },
		{ id: "relationships", label: "Relationships", icon: FiShare2, count: storyBible.relationships.length },
		{ id: "locations", label: "Locations", icon: FiMapPin, count: storyBible.locations.length },
		{ id: "entities", label: "Objects & Entities", icon: FiBox, count: storyBible.entities.length },
		{ id: "timeline", label: "Timeline", icon: FiClock, count: storyBible.timelineEvents.length },
		{ id: "scenes", label: "Scene Connections", icon: FiLink, count: storyBible.sceneConnections.length },
		{ id: "continuity", label: "Continuity Findings", icon: FiAlertTriangle, count: pendingContinuityCount, highlight: pendingContinuityCount > 0 },
		{ id: "history", label: "Memory History", icon: FiArchive, count: pendingProposalsCount, highlight: pendingProposalsCount > 0 },
	];

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
			{/* Top Bar */}
			<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", backgroundColor: "#ffffff", padding: "16px 20px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
				<div>
					<div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
						<h2 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#0f172a" }}>
							Story Bible & Continuity Memory
						</h2>
						<span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", backgroundColor: "#ecfdf5", color: "#047857", border: "1px solid #a7f3d0" }}>
							Version #{storyBible.currentVersion}
						</span>
						{storyBible.isPartialAnalysis && (
							<span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", backgroundColor: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca" }}>
								Partial Analysis ({storyBible.chunksProcessed}/{storyBible.totalChunks} chunks)
							</span>
						)}
					</div>
					<p style={{ margin: "4px 0 0", fontSize: "12.5px", color: "#64748b" }}>
						{storyBible.characters.length} Characters • {storyBible.locations.length} Locations • {storyBible.entities.length} Objects • {storyBible.timelineEvents.length} Timeline Events • {storyBible.sceneConnections.length} Connected Scenes
					</p>
				</div>

				<div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
					<button
						type="button"
						onClick={() => analyzeContinuity()}
						disabled={isAnalyzingContinuity}
						style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", fontSize: "12.5px", fontWeight: 600, borderRadius: "6px", border: "1px solid #f59e0b", backgroundColor: "#fffbeb", color: "#92400e", cursor: "pointer" }}
					>
						<FiShield size={14} /> {isAnalyzingContinuity ? "Auditing..." : "Audit Continuity"}
					</button>
					<button
						type="button"
						onClick={() => setShowBuildOptions(!showBuildOptions)}
						style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", fontSize: "12.5px", fontWeight: 600, borderRadius: "6px", border: "1px solid #cbd5e1", backgroundColor: "#ffffff", color: "#334155", cursor: "pointer" }}
					>
						<FiRefreshCw size={13} /> Sync / Propose Updates
					</button>
				</div>
			</div>

			{/* Partial Analysis Notice */}
			{storyBible.isPartialAnalysis && (
				<div style={{ padding: "12px 16px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", color: "#991b1b", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
					<FiAlertCircle size={16} />
					<span>
						<strong>Incomplete Long-Content Analysis:</strong> Only {storyBible.chunksProcessed} of {storyBible.totalChunks} content chunks completed successfully. Re-sync to process remaining sections.
					</span>
				</div>
			)}

			{/* Re-Analyze / Propose Panel */}
			{showBuildOptions && (
				<div style={{ padding: "16px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "10px" }}>
					<div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
						Propose Updates from New Text or Re-Scan Existing Scenes (Non-Destructive)
					</div>
					<textarea
						rows={3}
						value={customSourceText}
						onChange={(e) => setCustomSourceText(e.target.value)}
						placeholder="Optional additional text / draft chapters to analyze..."
						style={{ width: "100%", padding: "8px 10px", fontSize: "12.5px", border: "1px solid #cbd5e1", borderRadius: "6px" }}
					/>
					<div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
						<button
							type="button"
							onClick={async () => {
								await buildStoryBible({ sourceText: customSourceText.trim() || undefined, mode: "MERGE_PROPOSALS" });
								setShowBuildOptions(false);
								setActiveTab("history");
							}}
							style={{ padding: "7px 14px", fontSize: "12.5px", fontWeight: 600, borderRadius: "6px", border: "none", backgroundColor: "#059669", color: "#fff", cursor: "pointer" }}
						>
							Detect & Propose Changes (Safe Merge)
						</button>
					</div>
				</div>
			)}

			{toastMessage && (
				<div style={{ padding: "10px 14px", backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: "8px", color: "#065f46", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
					<FiCheckCircle size={15} />
					<span>{toastMessage}</span>
				</div>
			)}

			{error && (
				<div style={{ padding: "10px 14px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", color: "#b91c1c", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
					<FiAlertCircle size={15} />
					<span>{error}</span>
				</div>
			)}

			{/* 9 Navigation Tabs */}
			<div style={{ display: "flex", gap: "4px", backgroundColor: "#ffffff", padding: "6px", borderRadius: "8px", border: "1px solid #e2e8f0", overflowX: "auto" }}>
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
								padding: "8px 12px",
								fontSize: "12.5px",
								fontWeight: isActive ? 700 : 500,
								backgroundColor: isActive ? "#fffbeb" : "transparent",
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
								<span style={{ fontSize: "10.5px", fontWeight: 700, padding: "1px 6px", borderRadius: "10px", backgroundColor: tab.highlight ? "#dc2626" : isActive ? "#fef3c7" : "#e2e8f0", color: tab.highlight ? "#ffffff" : isActive ? "#92400e" : "#475569" }}>
									{tab.count}
								</span>
							)}
						</button>
					);
				})}
			</div>

			{/* Tab Workspace Body */}
			<div style={{ backgroundColor: "#ffffff", borderRadius: "10px", border: "1px solid #e2e8f0", padding: "24px" }}>
				{activeTab === "overview" && (
					<StoryOverviewSection storyBible={storyBible} onUpdateIdentity={updateIdentity} isSaving={isSaving} />
				)}
				{activeTab === "characters" && (
					<CharactersMemorySection
						characters={storyBible.characters}
						onCreateCharacter={(d, r) => createEntry("CHARACTER", d, r)}
						onUpdateCharacter={(id, d, r) => updateEntry("CHARACTER", id, d, r)}
						isSaving={isSaving}
					/>
				)}
				{activeTab === "relationships" && (
					<RelationshipsMemorySection
						relationships={storyBible.relationships}
						onCreateRelationship={(d, r) => createEntry("RELATIONSHIP", d, r)}
						onUpdateRelationship={(id, d, r) => updateEntry("RELATIONSHIP", id, d, r)}
						isSaving={isSaving}
					/>
				)}
				{activeTab === "locations" && (
					<LocationsMemorySection
						locations={storyBible.locations}
						onCreateLocation={(d, r) => createEntry("LOCATION", d, r)}
						onUpdateLocation={(id, d, r) => updateEntry("LOCATION", id, d, r)}
						isSaving={isSaving}
					/>
				)}
				{activeTab === "entities" && (
					<EntitiesMemorySection
						entities={storyBible.entities}
						onCreateEntity={(d, r) => createEntry("ENTITY", d, r)}
						onUpdateEntity={(id, d, r) => updateEntry("ENTITY", id, d, r)}
						isSaving={isSaving}
					/>
				)}
				{activeTab === "timeline" && (
					<TimelineSection
						events={storyBible.timelineEvents}
						onCreateEvent={(d, r) => createEntry("TIMELINE_EVENT", d, r)}
						onUpdateEvent={(id, d, r) => updateEntry("TIMELINE_EVENT", id, d, r)}
						isSaving={isSaving}
					/>
				)}
				{activeTab === "scenes" && (
					<SceneConnectionsSection connections={storyBible.sceneConnections} />
				)}
				{activeTab === "continuity" && (
					<ContinuityFindingsSection
						findings={storyBible.continuityFindings}
						onAnalyze={() => analyzeContinuity()}
						onUpdateFinding={updateFindingStatus}
						isAnalyzing={isAnalyzingContinuity}
						isSaving={isSaving}
					/>
				)}
				{activeTab === "history" && (
					<MemoryHistorySection
						proposals={storyBible.proposals}
						versions={storyBible.versions}
						onReviewProposal={reviewProposal}
						onRestoreVersion={restoreVersion}
						isSaving={isSaving}
					/>
				)}
			</div>
		</div>
	);
}

