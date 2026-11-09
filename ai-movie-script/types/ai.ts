/**
 * AI Generation & Conversation Domain Types
 */

import { PaginationParams } from "./api";

export type GenerationStatus =
	| "PENDING"
	| "COMPLETED"
	| "FAILED"
	| "ACCEPTED"
	| "REJECTED";

export interface AIGeneration {
	id: string; // UUID
	userId: string;
	movieId: string | null;
	generationType: string;
	input: string;
	output: string | null;
	status: GenerationStatus;
	promptTokens: number | null;
	completionTokens: number | null;
	totalTokens: number | null;
	estimatedCost: number | null;
	durationMs: number | null;
	errorMessage: string | null;
	createdAt: string;
	parsedOutput?: any;
	appliedData?: any;
}

export interface AIConversation {
	id: string; // UUID
	userId: string;
	movieId: string | null;
	message: string;
	response: string;
	action: string | null;
	createdAt: string;
}

export interface GenerateIdeaInput {
	idea: string;
	movieId?: string;
	genre?: string;
	tone?: string;
	language?: string;
	targetAudience?: string;
	preferences?: string;
}

export interface GenerateStoryInput {
	theme?: string;
	setting?: string;
	preferences?: string;
}

export interface GenerateCharactersInput {
	count?: number;
	roles?: string[];
	specificRequirements?: string;
}

export interface GenerateOutlineInput {
	structure?: "THREE_ACT" | "FOUR_ACT" | "FIVE_ACT";
	preferences?: string;
}

export interface GenerateSceneInput {
	sceneId: string;
	instructions?: string;
}

export type SceneImprovementAction =
	| "REWRITE"
	| "IMPROVE_DIALOGUE"
	| "EXPAND"
	| "SHORTEN"
	| "IMPROVE_PACING"
	| "STRENGTHEN_EMOTION"
	| "CHARACTER_VOICE"
	| "FIX_CONTINUITY";

export interface ImproveSceneInput {
	sceneId?: string;
	sceneContent?: string;
	action: SceneImprovementAction;
	instructions?: string;
	targetCharacter?: string;
}

export interface ApplyGenerationInput {
	editedOutput?: unknown;
}

export interface ApplyGenerationResult {
	id: string;
	status: GenerationStatus;
	appliedData?: any;
}

export interface RejectGenerationResult {
	id: string;
	status: GenerationStatus;
}

export interface ListGenerationsParams extends PaginationParams {
	movieId?: string;
	generationType?: string;
	status?: GenerationStatus;
}

export interface AIQuota {
	totalLimit: number;
	usedToday: number;
	remainingToday: number;
	tier: string;
}

