/**
 * FilmForge AI — Creative Input Analysis Types (Phase B)
 */

import { PaginationParams, PaginationMeta } from "./api";

export type CreativeInputType =
	| "AUTO_DETECT"
	| "SHORT_IDEA"
	| "SHORT_SCRIPT"
	| "SYNOPSIS"
	| "LONG_STORY"
	| "NOVEL_CHAPTER"
	| "INCOMPLETE_SCREENPLAY"
	| "EXISTING_SCREENPLAY";

export type AnalysisStatus = "PENDING" | "COMPLETED" | "FAILED" | "PARTIAL";

export interface AnalysisGenre {
	primary: string;
	secondary: string[];
}

export interface AnalysisSetting {
	location: string;
	timePeriod?: string;
	description?: string;
}

export interface AnalysisCharacter {
	name: string;
	role: string;
	goals: string[];
	motivations: string[];
	conflicts: string[];
	relationships: string[];
}

export interface AnalysisMainConflict {
	centralProblem: string;
	antagonisticForces: string;
	internalConflict: string;
	externalConflict: string;
}

export interface AnalysisPlotStructure {
	structureType: string;
	beginning: string;
	development: string;
	turningPoints: string[];
	climax: string;
	resolution: string;
}

export interface AnalysisCharacterArc {
	character: string;
	startingState: string;
	shift: string;
	outcome: string;
}

export interface AnalysisProcessingMeta {
	chunksProcessed: number;
	totalChunks: number;
	isComplete: boolean;
	estimatedTokens?: number;
	durationMs?: number;
}

export interface CreativeAnalysisResult {
	analysisId: string;
	inputType: CreativeInputType;
	detectedType: CreativeInputType;
	hasFormatMismatch: boolean;
	mismatchExplanation: string | null;
	analysisStatus: AnalysisStatus;
	documentSummary: string;
	title: string;
	logline: string;
	storyConcept: string;
	centralTheme: string;
	secondaryThemes: string[];
	genre: AnalysisGenre;
	targetAudience?: string;
	suggestedFormat?: string;
	setting: AnalysisSetting[];
	characters: AnalysisCharacter[];
	mainConflict: AnalysisMainConflict;
	plotStructure: AnalysisPlotStructure;
	characterArcs: AnalysisCharacterArc[];
	strengths: string[];
	weaknesses: string[];
	continuityIssues: string[];
	developmentOpportunities: string[];
	missingInformation: string[];
	evidenceQuotes?: string[];
	processing: AnalysisProcessingMeta;
}

export interface AnalyzeInputRequest {
	content: string;
	inputType?: CreativeInputType;
	movieId?: string;
	context?: {
		genre?: string;
		targetAudience?: string;
		intendedFormat?: string;
		additionalInstructions?: string;
	};
}

export interface AnalysisListItem {
	id: string;
	userId?: string;
	movieId?: string | null;
	title: string;
	logline: string;
	inputType: CreativeInputType;
	detectedType: CreativeInputType;
	status: string;
	durationMs?: number;
	totalTokens?: number;
	createdAt: string;
	analysis?: CreativeAnalysisResult | null;
}

export interface ListAnalysesParams extends PaginationParams {
	movieId?: string;
	inputType?: CreativeInputType;
}

export interface PaginatedAnalysesResponse {
	items: AnalysisListItem[];
	meta: PaginationMeta;
}

