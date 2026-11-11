/**
 * FilmForge AI — Phase E: Complete Screenplay Generation Frontend Type Contracts
 */

export type ScreenplayJobMode = "APPROVAL_GATED" | "PROGRESSIVE_AUTO";

export type ScreenplayJobStatus =
	| "QUEUED"
	| "PREPARING"
	| "GENERATING_ACTS"
	| "AWAITING_ACT_APPROVAL"
	| "GENERATING_SCENES"
	| "AWAITING_SCENE_APPROVAL"
	| "GENERATING_SCREENPLAY"
	| "VALIDATING_CONTINUITY"
	| "ASSEMBLING"
	| "COMPLETED"
	| "PARTIALLY_COMPLETED"
	| "PAUSED"
	| "FAILED"
	| "CANCELLED";

export type NarrativeStructureType =
	| "AUTO"
	| "THREE_ACT"
	| "FIVE_ACT"
	| "HEROS_JOURNEY"
	| "NONLINEAR"
	| "EPISODIC"
	| "MYSTERY_INVESTIGATION"
	| "CHARACTER_DRIVEN";

export type OriginClassification = "AI_GENERATED" | "WRITER_EDITED" | "WRITER_APPROVED";

export interface PreGenerationReadinessReport {
	readyToGenerate: boolean;
	hasStoryFoundation: boolean;
	hasCharacters: boolean;
	hasStoryIntelligence: boolean;
	hasStoryBible: boolean;
	existingActsCount: number;
	existingScenesCount: number;
	existingScreenplaysCount: number;
	approvedFacts: string[];
	approvedDecisions: string[];
	aiSuggestions: string[];
	unresolvedContinuity: string[];
	missingInformation: string[];
	conflictingInformation: string[];
	assumptionsRequiringApproval: string[];
}

export interface ContinuityFindingItem {
	category: string;
	classification: string;
	severity: string;
	title: string;
	description: string;
	sceneNumber?: number;
}

export interface ContinuityValidationSummary {
	checkedAt: string;
	confirmedContradictionsCount: number;
	possibleInconsistenciesCount: number;
	intentionalMysteriesCount: number;
	pendingMemoryProposalsCount: number;
	findings: ContinuityFindingItem[];
}

export interface GeneratedActItem {
	id: string;
	jobId: string;
	linkedStoryActId?: string | null;
	actNumber: number;
	title: string;
	purpose: string;
	dramaticObjective: string;
	centralConflict: string;
	characterDevelopments: string[];
	turningPoints: string[];
	beginningCondition?: string | null;
	endingCondition?: string | null;
	continuityNotes: string[];
	estimatedSceneCount: number;
	status: string;
	originType: OriginClassification;
	isApproved: boolean;
	errorMessage?: string | null;
	retryCount: number;
}

export interface GeneratedSceneItem {
	id: string;
	jobId: string;
	generatedActId: string;
	linkedSceneId?: string | null;
	actNumber: number;
	sceneNumber: number;
	title: string;
	intExt: "INT." | "EXT." | "INT./EXT." | string;
	location: string;
	timeOfDay: string;
	charactersPresent: string[];
	scenePurpose: string;
	openingSituation?: string | null;
	actionsAndEvents: string[];
	centralConflict?: string | null;
	characterDecisions: string[];
	emotionalDevelopment?: string | null;
	consequences: string[];
	endingSituation?: string | null;
	continuityReferences: string[];
	setupPayoffNotes: string[];
	screenplayContent?: string | null;
	writerEditedContent?: string | null;
	status: "OUTLINE_READY" | "GENERATING" | "COMPLETED" | "FAILED" | string;
	originType: OriginClassification;
	isManuallyEdited: boolean;
	isApproved: boolean;
	promptTokens: number;
	completionTokens: number;
	errorMessage?: string | null;
	retryCount: number;
	lastSavedAt?: string | null;
}

export interface ScreenplayGenerationJob {
	id: string;
	movieId: string;
	userId: string;
	idempotencyKey?: string | null;
	mode: ScreenplayJobMode;
	status: ScreenplayJobStatus;
	requestedStructure: NarrativeStructureType;
	resolvedStructure?: string | null;
	targetSceneCount?: number | null;
	preferences?: string | null;
	toneOverride?: string | null;
	progressPercent: number;
	currentStage: string;
	currentActNumber?: number | null;
	currentSceneNumber?: number | null;
	totalActs: number;
	totalScenes: number;
	completedScenes: number;
	failedScenes: number;
	preGenerationReport?: PreGenerationReadinessReport | null;
	continuityValidation?: ContinuityValidationSummary | null;
	assembledScreenplayId?: string | null;
	assembledContent?: string | null;
	totalPromptTokens: number;
	totalCompletionTokens: number;
	totalTokens: number;
	estimatedCost: number;
	lastSavedAt?: string | null;
	lastError?: string | null;
	failedStage?: string | null;
	acts: GeneratedActItem[];
	scenes: GeneratedSceneItem[];
	stats?: {
		wordCount: number;
		pageCount: number;
		sceneCount: number;
		characterCount: number;
	};
	createdAt: string;
	completedAt?: string | null;
	updatedAt: string;
}

export interface ScreenplayJobHistorySummary {
	id: string;
	mode: ScreenplayJobMode;
	status: ScreenplayJobStatus;
	requestedStructure: string;
	resolvedStructure?: string | null;
	progressPercent: number;
	totalActs: number;
	totalScenes: number;
	completedScenes: number;
	failedScenes: number;
	assembledScreenplayId?: string | null;
	estimatedCost: number;
	totalTokens: number;
	createdAt: string;
	completedAt?: string | null;
}

export interface LatestScreenplayGenerationResponse {
	latestJob: ScreenplayGenerationJob | null;
	history: ScreenplayJobHistorySummary[];
}

export interface StartScreenplayGenerationRequest {
	mode?: ScreenplayJobMode;
	requestedStructure?: NarrativeStructureType;
	targetSceneCount?: number;
	preferences?: string;
	toneOverride?: string;
	idempotencyKey?: string;
	acknowledgeAssumptions?: boolean;
}

