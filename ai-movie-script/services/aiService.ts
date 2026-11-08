/**
 * FilmForge AI — AI Generation & Pipeline Service
 */

import { api } from "../lib/api";
import { API_ENDPOINTS } from "../lib/constants";
import {
	AIGeneration,
	AIQuota,
	GenerateIdeaInput,
	GenerateStoryInput,
	GenerateCharactersInput,
	GenerateOutlineInput,
	GenerateSceneInput,
	ImproveSceneInput,
	ApplyGenerationInput,
	ListGenerationsParams,
} from "../types/ai";
import { PaginationMeta } from "../types/api";

export interface PaginatedGenerationsResponse {
	items: AIGeneration[];
	meta: PaginationMeta;
}

export class AIService {
	/**
	 * Retrieve user AI token consumption and daily quota status
	 */
	public async getQuota(): Promise<AIQuota> {
		return api.get<AIQuota>(API_ENDPOINTS.AI.QUOTA);
	}

	/**
	 * Generate movie idea / concept proposal
	 */
	public async generateIdea(
		input: GenerateIdeaInput
	): Promise<AIGeneration> {
		if (input.movieId) {
			return api.post<AIGeneration>(
				API_ENDPOINTS.AI.MOVIE_GENERATE_IDEA(input.movieId),
				input
			);
		}
		return api.post<AIGeneration>(API_ENDPOINTS.AI.GENERATE_IDEA, input);
	}

	/**
	 * Generate story synopsis, themes, and arcs for a movie
	 */
	public async generateStory(
		movieId: string,
		input?: GenerateStoryInput
	): Promise<AIGeneration> {
		return api.post<AIGeneration>(
			API_ENDPOINTS.AI.GENERATE_STORY(movieId),
			input || {}
		);
	}

	/**
	 * Generate character cast profiles for a movie
	 */
	public async generateCharacters(
		movieId: string,
		input?: GenerateCharactersInput
	): Promise<AIGeneration> {
		return api.post<AIGeneration>(
			API_ENDPOINTS.AI.GENERATE_CHARACTERS(movieId),
			input || {}
		);
	}

	/**
	 * Generate structured 3-act beat outline for a movie
	 */
	public async generateOutline(
		movieId: string,
		input?: GenerateOutlineInput
	): Promise<AIGeneration> {
		return api.post<AIGeneration>(
			API_ENDPOINTS.AI.GENERATE_OUTLINE(movieId),
			input || {}
		);
	}

	/**
	 * Draft screenplay scenes with dialogue and action
	 */
	public async generateScene(
		movieId: string,
		input: GenerateSceneInput
	): Promise<AIGeneration> {
		return api.post<AIGeneration>(
			API_ENDPOINTS.AI.GENERATE_SCENE(movieId),
			input
		);
	}

	/**
	 * Refine or rewrite an existing scene (dialogue, emotion, pacing, subtext)
	 */
	public async improveScene(
		movieId: string,
		input: ImproveSceneInput
	): Promise<AIGeneration> {
		return api.post<AIGeneration>(
			API_ENDPOINTS.AI.IMPROVE_SCENE(movieId),
			input
		);
	}

	/**
	 * Human-in-the-loop: Apply generated proposal to the database models
	 */
	public async applyGeneration(
		generationId: string,
		input?: ApplyGenerationInput
	): Promise<{ success: boolean; message: string }> {
		return api.post<{ success: boolean; message: string }>(
			API_ENDPOINTS.AI.APPLY(generationId),
			input || {}
		);
	}

	/**
	 * Human-in-the-loop: Reject generated proposal
	 */
	public async rejectGeneration(
		generationId: string
	): Promise<{ success: boolean; message: string }> {
		return api.post<{ success: boolean; message: string }>(
			API_ENDPOINTS.AI.REJECT(generationId)
		);
	}

	/**
	 * Human-in-the-loop: Retry generation with adjusted criteria
	 */
	public async retryGeneration(generationId: string): Promise<AIGeneration> {
		return api.post<AIGeneration>(API_ENDPOINTS.AI.RETRY(generationId));
	}

	/**
	 * List historical AI generation logs with token and cost metrics
	 */
	public async listGenerations(
		params?: ListGenerationsParams
	): Promise<PaginatedGenerationsResponse> {
		return api.get<PaginatedGenerationsResponse>(API_ENDPOINTS.AI.LIST, {
			params: params as Record<string, string | number | boolean | undefined | null>,
		});
	}
}

export const aiService = new AIService();

