/**
 * FilmForge AI — Creative Input Analysis Service (Phase B)
 */

import { api } from "../lib/api";
import { API_ENDPOINTS } from "../lib/constants";
import {
	AnalyzeInputRequest,
	CreativeAnalysisResult,
	AnalysisListItem,
	ListAnalysesParams,
	PaginatedAnalysesResponse,
} from "../types/analysis";

export class AnalysisService {
	/**
	 * Submits creative writing content for AI-powered narrative analysis
	 */
	public async analyzeInput(
		data: AnalyzeInputRequest
	): Promise<{ analysis: CreativeAnalysisResult; generationId: string }> {
		return api.post<{ analysis: CreativeAnalysisResult; generationId: string }>(
			API_ENDPOINTS.AI.ANALYZE_INPUT,
			data
		);
	}

	/**
	 * Retrieves paginated historical creative analyses for the user
	 */
	public async getAnalyses(
		params?: ListAnalysesParams
	): Promise<PaginatedAnalysesResponse> {
		return api.get<PaginatedAnalysesResponse>(API_ENDPOINTS.AI.ANALYSES, {
			params: params as Record<string, string | number | boolean | undefined | null>,
		});
	}

	/**
	 * Retrieves full analysis details by analysis ID
	 */
	public async getAnalysisById(analysisId: string): Promise<{
		id: string;
		userId: string;
		movieId: string | null;
		status: string;
		analysis: CreativeAnalysisResult;
		tokens: {
			prompt: number | null;
			completion: number | null;
			total: number | null;
			estimatedCost: number | null;
		};
		durationMs: number | null;
		createdAt: string;
	}> {
		return api.get(API_ENDPOINTS.AI.ANALYSIS_BY_ID(analysisId));
	}

	/**
	 * Retrieves creative analyses associated with a specific movie
	 */
	public async getMovieAnalyses(movieId: string): Promise<AnalysisListItem[]> {
		return api.get<AnalysisListItem[]>(API_ENDPOINTS.AI.MOVIE_ANALYSES(movieId));
	}

	/**
	 * Re-runs analysis on an existing record
	 */
	public async retryAnalysis(
		analysisId: string
	): Promise<{ analysis: CreativeAnalysisResult; generationId: string }> {
		return api.post<{ analysis: CreativeAnalysisResult; generationId: string }>(
			API_ENDPOINTS.AI.RETRY_ANALYSIS(analysisId)
		);
	}

	/**
	 * Associates a standalone analysis with an existing movie project
	 */
	public async linkMovie(
		analysisId: string,
		movieId: string
	): Promise<{ analysisId: string; movieId: string; message: string }> {
		return api.post<{ analysisId: string; movieId: string; message: string }>(
			API_ENDPOINTS.AI.LINK_MOVIE_ANALYSIS(analysisId),
			{ movieId }
		);
	}
}

export const analysisService = new AnalysisService();

