/**
 * FilmForge AI — Phase C: Story & Character Intelligence API Service
 */

import { api } from "../lib/api";
import { API_ENDPOINTS } from "../lib/constants";
import {
	GenerateStoryIntelligenceRequest,
	RegenerateSectionRequest,
	UpdateSuggestionStatusRequest,
	ApplyIntelligenceDecisionRequest,
	ApplyIntelligenceDecisionResponse,
	StoryIntelligenceResult,
	StoryIntelligenceSuggestion,
} from "../types/storyIntelligence";

export class StoryIntelligenceService {
	/**
	 * Generates comprehensive Story & Character Intelligence
	 */
	public async generate(
		request: GenerateStoryIntelligenceRequest
	): Promise<{ intelligence: StoryIntelligenceResult; generationId: string }> {
		return api.post<{ intelligence: StoryIntelligenceResult; generationId: string }>(
			API_ENDPOINTS.AI.STORY_INTELLIGENCE,
			request
		);
	}

	/**
	 * Retrieves single Story Intelligence record by ID
	 */
	public async getById(id: string): Promise<StoryIntelligenceResult> {
		return api.get<StoryIntelligenceResult>(
			API_ENDPOINTS.AI.STORY_INTELLIGENCE_BY_ID(id)
		);
	}

	/**
	 * Retrieves all Story Intelligence records for a movie
	 */
	public async getByMovie(movieId: string): Promise<StoryIntelligenceResult[]> {
		return api.get<StoryIntelligenceResult[]>(
			API_ENDPOINTS.AI.MOVIE_STORY_INTELLIGENCE(movieId)
		);
	}

	/**
	 * Regenerates a specific intelligence section without affecting other areas
	 */
	public async regenerateSection(
		id: string,
		request: RegenerateSectionRequest
	): Promise<StoryIntelligenceResult> {
		return api.post<StoryIntelligenceResult>(
			API_ENDPOINTS.AI.REGENERATE_INTELLIGENCE_SECTION(id),
			request
		);
	}

	/**
	 * Updates a suggestion decision (Accept, Reject, Edit)
	 */
	public async updateSuggestionStatus(
		id: string,
		suggestionId: string,
		request: UpdateSuggestionStatusRequest
	): Promise<StoryIntelligenceSuggestion> {
		return api.patch<StoryIntelligenceSuggestion>(
			API_ENDPOINTS.AI.UPDATE_SUGGESTION_STATUS(id, suggestionId),
			request
		);
	}

	/**
	 * Explicitly applies approved decisions to project database entities
	 */
	public async applyToProject(
		id: string,
		request: ApplyIntelligenceDecisionRequest
	): Promise<ApplyIntelligenceDecisionResponse> {
		return api.post<ApplyIntelligenceDecisionResponse>(
			API_ENDPOINTS.AI.APPLY_INTELLIGENCE_TO_PROJECT(id),
			request
		);
	}
}

export const storyIntelligenceService = new StoryIntelligenceService();
