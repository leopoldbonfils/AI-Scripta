/**
 * FilmForge AI — Phase F: Professional Script Doctor Frontend Types
 */

export type ScriptDoctorOperation = "REWRITE" | "POLISH" | "DIALOGUE" | "CONTINUITY_FIX";

export type ScriptDoctorTargetScope =
	| "ENTIRE_SCREENPLAY"
	| "ACT"
	| "SCENE"
	| "SELECTION"
	| "DIALOGUE"
	| "ACTION"
	| "SECTION";

export type ScriptDoctorAnalysisScope =
	| "ENTIRE_SCREENPLAY"
	| "ACT"
	| "SCENE"
	| "CONTINUITY_ONLY";

export type ContinuityFindingIntentionality =
	| "CONFIRMED_CONTRADICTION"
	| "POSSIBLE_CONTRADICTION"
	| "INTENTIONAL_CHOICE"
	| "FALSE_POSITIVE"
	| "RESOLVED";

export type SuggestionStatus =
	| "PENDING"
	| "EDITED"
	| "ACCEPTED"
	| "PARTIALLY_ACCEPTED"
	| "REJECTED"
	| "DISMISSED"
	| "STALE"
	| "SUPERSEDED";

export interface AnalysisEvaluationDimension {
	summary: string;
	strengths: string[];
	weaknesses: string[];
	evidence: string[];
	recommendations: string[];
}

export interface ScreenplayEvaluationReport {
	overallAssessment: string;
	sourceFactsObserved: string[];
	strengths: string[];
	weaknesses: string[];
	criticalIssues: string[];
	improvementOpportunities: string[];
	recommendedPriorities: Array<{
		priority: "HIGH" | "MEDIUM" | "LOW";
		area: string;
		targetActNumber?: number | null;
		targetSceneNumber?: number | null;
		rationale: string;
		evidence: string;
	}>;
	dimensions: {
		storyAndPlot: AnalysisEvaluationDimension;
		characters: AnalysisEvaluationDimension;
		sceneQuality: AnalysisEvaluationDimension;
		dialogue: AnalysisEvaluationDimension;
		pacing: AnalysisEvaluationDimension;
		presentation: AnalysisEvaluationDimension;
	};
}

export interface ScriptDoctorContinuityFinding {
	id: string;
	severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
	category: string;
	description: string;
	evidenceFromScreenplay: string;
	affectedActNumber?: number | null;
	affectedSceneNumber?: number | null;
	relatedStoryBibleInfo?: string | null;
	whyItMatters: string;
	suggestedResolution: string;
	confidence: number;
	intentionality: ContinuityFindingIntentionality;
	resolutionNote?: string | null;
	source?: string;
}

export interface ContinuityImpactAssessment {
	affectsStoryBible: boolean;
	charactersAffected: string[];
	motivationsAffected: string[];
	relationshipsAffected: string[];
	timelineAffected: string[];
	locationsAffected: string[];
	eventsAffected: string[];
	otherScenesAffected: number[];
	summary: string;
}

export interface ProposedBibleUpdateItem {
	targetType: string;
	targetLabel: string;
	proposedAction: "CREATE" | "UPDATE";
	description: string;
	changeReason: string;
}

export interface DiffHunk {
	id: string;
	index: number;
	type: "UNCHANGED" | "ADDED" | "REMOVED" | "MODIFIED";
	originalStartLine: number;
	originalLineCount: number;
	proposedStartLine: number;
	proposedLineCount: number;
	originalLines: string[];
	proposedLines: string[];
	summary: string;
}

export interface SideBySideDiffRow {
	hunkId: string;
	hunkType: DiffHunk["type"];
	leftLineNumber: number | null;
	rightLineNumber: number | null;
	leftText: string;
	rightText: string;
	rowType: "UNCHANGED" | "ADDED" | "REMOVED" | "MODIFIED";
}

export interface DiffComputationResult {
	hasChanges: boolean;
	stats: {
		addedLines: number;
		removedLines: number;
		modifiedHunks: number;
		unchangedLines: number;
	};
	hunks: DiffHunk[];
	sideBySideRows: SideBySideDiffRow[];
	sceneMarkers: Array<{
		heading: string;
		sceneNumber: number;
		lineNumber: number;
	}>;
}

export interface ScriptDoctorAnalysis {
	id: string;
	movieId: string;
	screenplayId: string;
	analysisScope: ScriptDoctorAnalysisScope;
	targetActNumber?: number | null;
	targetSceneNumber?: number | null;
	targetLabel: string;
	baseScreenplayVersion: number;
	overallAssessment: string;
	evaluationJson: ScreenplayEvaluationReport;
	continuityFindingsJson: ScriptDoctorContinuityFinding[];
	isPartialAnalysis: boolean;
	chunksProcessed: number;
	totalChunks: number;
	failedChunkIndices: number[];
	promptTokens: number;
	completionTokens: number;
	totalTokens: number;
	estimatedCost: number;
	model?: string | null;
	createdAt: string;
}

export interface ScriptDoctorSuggestion {
	id: string;
	movieId: string;
	screenplayId: string;
	analysisId?: string | null;
	operationType: ScriptDoctorOperation;
	targetScope: ScriptDoctorTargetScope;
	targetActNumber?: number | null;
	targetSceneNumber?: number | null;
	targetLabel: string;
	targetStartOffset: number;
	targetEndOffset: number;
	originalText: string;
	proposedText: string;
	writerEditedText?: string | null;
	activeProposedText: string;
	acceptedText?: string | null;
	acceptedHunkIds?: string[] | null;
	changeSummary: string;
	technicalNotes: string[];
	creativeSuggestions: string[];
	continuityImpact: ContinuityImpactAssessment;
	proposedBibleUpdates: ProposedBibleUpdateItem[];
	directions?: string | null;
	baseScreenplayVersion: number;
	baseScreenplayContentHash: string;
	status: SuggestionStatus;
	rejectionReason?: string | null;
	appliedVersionId?: string | null;
	previousVersionId?: string | null;
	promptTokens: number;
	completionTokens: number;
	totalTokens: number;
	estimatedCost: number;
	model?: string | null;
	isStale: boolean;
	diff: DiffComputationResult;
	reviewedAt?: string | null;
	createdAt: string;
}

export interface ParsedSceneSpan {
	sceneNumber: number;
	actNumber: number;
	heading: string;
	startOffset: number;
	endOffset: number;
	text: string;
}

export interface VersionRecordSummary {
	id: string;
	screenplayId: string;
	versionNumber: number;
	title: string;
	content: string;
	pageCount: number;
	wordCount: number;
	changeSummary?: string | null;
	operationType?: string | null;
	suggestionId?: string | null;
	changeOrigin?: string | null;
	approvedByUserId?: string | null;
	createdAt: string;
}

export interface ScriptDoctorDashboardData {
	movie: {
		id: string;
		title: string;
		genre?: string | null;
		tone?: string | null;
		hasStoryBible: boolean;
	};
	screenplay: {
		id: string;
		title: string;
		content: string;
		version: number;
		wordCount: number;
		pageCount: number;
		isDraft: boolean;
		stats: {
			wordCount: number;
			pageCount: number;
			sceneCount: number;
			characterCount: number;
		};
		parsedScenes: ParsedSceneSpan[];
	};
	availableScreenplays: Array<{
		id: string;
		title: string;
		version: number;
		wordCount: number;
		pageCount: number;
		isDraft: boolean;
		updatedAt: string;
	}>;
	analyses: ScriptDoctorAnalysis[];
	suggestions: ScriptDoctorSuggestion[];
	versions: VersionRecordSummary[];
}

export interface VersionComparisonResult {
	fromVersion: {
		id: string;
		versionNumber: number;
		title: string;
		changeSummary?: string | null;
		operationType?: string | null;
		createdAt: string;
	};
	toLabel: string;
	diff: DiffComputationResult;
}

