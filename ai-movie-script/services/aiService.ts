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
	ApplyGenerationResult,
	RejectGenerationResult,
	ListGenerationsParams,
} from "../types/ai";
import { PaginationMeta } from "../types/api";

export interface PaginatedGenerationsResponse {
	items: AIGeneration[];
	meta: PaginationMeta;
}

export class AIService {
	/**
	 * Normalizes backend responses ensuring both `generation` wrapper and direct object shapes
	 * correctly populate parsedOutput safely.
	 */
	private normalizeGeneration(raw: any): AIGeneration {
		if (!raw) {
			throw new Error("Invalid empty AI response received");
		}

		// Handle { generation: ..., parsedOutput: ... } or direct generation object
		const gen: AIGeneration = raw.generation ? { ...raw.generation } : { ...raw };

		// Attach parsedOutput from wrapper if provided
		if (raw.parsedOutput !== undefined && raw.parsedOutput !== null) {
			gen.parsedOutput = raw.parsedOutput;
		}

		// If parsedOutput is not yet attached, try parsing gen.output if it's JSON string
		if (gen.parsedOutput === undefined && typeof gen.output === "string") {
			const trimmed = gen.output.trim();
			if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
				try {
					gen.parsedOutput = JSON.parse(trimmed);
				} catch {
					gen.parsedOutput = null;
				}
			} else {
				gen.parsedOutput = null;
			}
		}

		return gen;
	}

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
		const endpoint = input.movieId
			? API_ENDPOINTS.AI.MOVIE_GENERATE_IDEA(input.movieId)
			: API_ENDPOINTS.AI.GENERATE_IDEA;
		const raw = await api.post<any>(endpoint, input);
		return this.normalizeGeneration(raw);
	}

	/**
	 * Generate story synopsis, themes, and arcs for a movie
	 */
	public async generateStory(
		movieId: string,
		input?: GenerateStoryInput
	): Promise<AIGeneration> {
		const raw = await api.post<any>(
			API_ENDPOINTS.AI.GENERATE_STORY(movieId),
			input || {}
		);
		return this.normalizeGeneration(raw);
	}

	/**
	 * Generate character cast profiles for a movie
	 */
	public async generateCharacters(
		movieId: string,
		input?: GenerateCharactersInput
	): Promise<AIGeneration> {
		const raw = await api.post<any>(
			API_ENDPOINTS.AI.GENERATE_CHARACTERS(movieId),
			input || {}
		);
		return this.normalizeGeneration(raw);
	}

	/**
	 * Generate structured 3-act beat outline for a movie
	 */
	public async generateOutline(
		movieId: string,
		input?: GenerateOutlineInput
	): Promise<AIGeneration> {
		const raw = await api.post<any>(
			API_ENDPOINTS.AI.GENERATE_OUTLINE(movieId),
			input || {}
		);
		return this.normalizeGeneration(raw);
	}

	/**
	 * Draft screenplay scenes with dialogue and action
	 */
	public async generateScene(
		movieId: string,
		input: GenerateSceneInput
	): Promise<AIGeneration> {
		const raw = await api.post<any>(
			API_ENDPOINTS.AI.GENERATE_SCENE(movieId),
			input
		);
		return this.normalizeGeneration(raw);
	}

	/**
	 * Refine or rewrite an existing scene (dialogue, emotion, pacing, subtext)
	 */
	public async improveScene(
		movieId: string,
		input: ImproveSceneInput
	): Promise<AIGeneration> {
		const raw = await api.post<any>(
			API_ENDPOINTS.AI.IMPROVE_SCENE(movieId),
			input
		);
		return this.normalizeGeneration(raw);
	}

	/**
	 * Human-in-the-loop: Apply generated proposal to the database models
	 */
	public async applyGeneration(
		generationId: string,
		input?: ApplyGenerationInput
	): Promise<ApplyGenerationResult> {
		return api.post<ApplyGenerationResult>(
			API_ENDPOINTS.AI.APPLY(generationId),
			input || {}
		);
	}

	/**
	 * Human-in-the-loop: Reject generated proposal
	 */
	public async rejectGeneration(
		generationId: string
	): Promise<RejectGenerationResult> {
		return api.post<RejectGenerationResult>(
			API_ENDPOINTS.AI.REJECT(generationId)
		);
	}

	/**
	 * Human-in-the-loop: Retry generation with adjusted criteria
	 */
	public async retryGeneration(generationId: string): Promise<AIGeneration> {
		const raw = await api.post<any>(API_ENDPOINTS.AI.RETRY(generationId));
		return this.normalizeGeneration(raw);
	}

	/**
	 * List historical AI generation logs with token and cost metrics
	 */
	public async listGenerations(
		params?: ListGenerationsParams
	): Promise<PaginatedGenerationsResponse> {
		const res = await api.get<PaginatedGenerationsResponse>(API_ENDPOINTS.AI.LIST, {
			params: params as Record<string, string | number | boolean | undefined | null>,
		});
		return {
			items: (res.items || []).map((item) => this.normalizeGeneration(item)),
			meta: res.meta,
		};
	}
}

export const aiService = new AIService();

