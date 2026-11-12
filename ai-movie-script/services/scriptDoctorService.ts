/**
 * FilmForge AI — Phase F: Professional Script Doctor API Service & Helpers
 */

import { api } from "../lib/api";
import { API_ENDPOINTS } from "../lib/constants";
import {
	ContinuityFindingIntentionality,
	ScriptDoctorAnalysis,
	ScriptDoctorAnalysisScope,
	ScriptDoctorContinuityFinding,
	ScriptDoctorDashboardData,
	ScriptDoctorOperation,
	ScriptDoctorSuggestion,
	ScriptDoctorTargetScope,
	VersionComparisonResult,
} from "../types/scriptDoctor";

export function filterContinuityFindings(
	findings: ScriptDoctorContinuityFinding[],
	filters: {
		severity?: string;
		category?: string;
		intentionality?: string;
	}
): ScriptDoctorContinuityFinding[] {
	return findings.filter((f) => {
		if (filters.severity && filters.severity !== "ALL" && f.severity !== filters.severity) {
			return false;
		}
		if (filters.category && filters.category !== "ALL" && f.category !== filters.category) {
			return false;
		}
		if (
			filters.intentionality &&
			filters.intentionality !== "ALL" &&
			f.intentionality !== filters.intentionality
		) {
			return false;
		}
		return true;
	});
}

export class ScriptDoctorService {
	public async getDashboard(
		movieId: string,
		screenplayId?: string
	): Promise<ScriptDoctorDashboardData> {
		return api.get<ScriptDoctorDashboardData>(
			API_ENDPOINTS.SCRIPT_DOCTOR.DASHBOARD(movieId),
			{ params: screenplayId ? { screenplayId } : undefined }
		);
	}

	public async listAnalyses(
		movieId: string,
		screenplayId?: string
	): Promise<ScriptDoctorAnalysis[]> {
		return api.get<ScriptDoctorAnalysis[]>(API_ENDPOINTS.SCRIPT_DOCTOR.ANALYSES(movieId), {
			params: screenplayId ? { screenplayId } : undefined,
		});
	}

	public async runAnalysis(
		movieId: string,
		payload: {
			screenplayId?: string;
			analysisScope?: ScriptDoctorAnalysisScope;
			targetActNumber?: number;
			targetSceneNumber?: number;
			includeStoryBible?: boolean;
			focusNotes?: string;
		}
	): Promise<ScriptDoctorAnalysis> {
		const endpoint =
			payload.analysisScope === "CONTINUITY_ONLY"
				? API_ENDPOINTS.SCRIPT_DOCTOR.CONTINUITY_CHECK(movieId)
				: API_ENDPOINTS.SCRIPT_DOCTOR.ANALYZE(movieId);
		return api.post<ScriptDoctorAnalysis>(endpoint, payload);
	}

	public async updateFindingStatus(
		movieId: string,
		analysisId: string,
		findingId: string,
		intentionality: ContinuityFindingIntentionality,
		resolutionNote?: string
	): Promise<ScriptDoctorAnalysis> {
		return api.patch<ScriptDoctorAnalysis>(
			API_ENDPOINTS.SCRIPT_DOCTOR.UPDATE_FINDING(movieId, analysisId, findingId),
			{ intentionality, resolutionNote }
		);
	}

	public async generateSuggestion(
		movieId: string,
		payload: {
			screenplayId?: string;
			analysisId?: string;
			operationType: ScriptDoctorOperation;
			targetScope: ScriptDoctorTargetScope;
			targetActNumber?: number;
			targetSceneNumber?: number;
			targetStartOffset?: number;
			targetEndOffset?: number;
			selectedText?: string;
			directions?: string;
			dialogueMode?: string;
			polishFocus?: string;
			findingId?: string;
		}
	): Promise<ScriptDoctorSuggestion> {
		return api.post<ScriptDoctorSuggestion>(
			API_ENDPOINTS.SCRIPT_DOCTOR.SUGGESTIONS(movieId),
			payload
		);
	}

	public async getSuggestion(
		movieId: string,
		suggestionId: string
	): Promise<ScriptDoctorSuggestion> {
		return api.get<ScriptDoctorSuggestion>(
			API_ENDPOINTS.SCRIPT_DOCTOR.GET_SUGGESTION(movieId, suggestionId)
		);
	}

	public async editSuggestion(
		movieId: string,
		suggestionId: string,
		editedText: string,
		changeSummary?: string
	): Promise<ScriptDoctorSuggestion> {
		return api.patch<ScriptDoctorSuggestion>(
			API_ENDPOINTS.SCRIPT_DOCTOR.EDIT_SUGGESTION(movieId, suggestionId),
			{ editedText, changeSummary }
		);
	}

	public async regenerateSuggestion(
		movieId: string,
		suggestionId: string,
		directions?: string
	): Promise<ScriptDoctorSuggestion> {
		return api.post<ScriptDoctorSuggestion>(
			API_ENDPOINTS.SCRIPT_DOCTOR.REGENERATE_SUGGESTION(movieId, suggestionId),
			directions ? { directions } : {}
		);
	}

	public async acceptSuggestion(
		movieId: string,
		suggestionId: string,
		options?: {
			acceptedHunkIds?: string[];
			editedText?: string;
			createBibleProposals?: boolean;
		}
	): Promise<{
		suggestion: ScriptDoctorSuggestion;
		screenplay: { id: string; content: string; version: number; wordCount: number; pageCount: number };
		appliedVersion: { id: string; versionNumber: number };
		pendingBibleProposalsCreated: number;
	}> {
		return api.post(
			API_ENDPOINTS.SCRIPT_DOCTOR.ACCEPT_SUGGESTION(movieId, suggestionId),
			options || {}
		);
	}

	public async rejectSuggestion(
		movieId: string,
		suggestionId: string,
		reason?: string
	): Promise<ScriptDoctorSuggestion> {
		return api.post<ScriptDoctorSuggestion>(
			API_ENDPOINTS.SCRIPT_DOCTOR.REJECT_SUGGESTION(movieId, suggestionId),
			reason ? { reason } : {}
		);
	}

	public async dismissSuggestion(
		movieId: string,
		suggestionId: string
	): Promise<ScriptDoctorSuggestion> {
		return api.post<ScriptDoctorSuggestion>(
			API_ENDPOINTS.SCRIPT_DOCTOR.DISMISS_SUGGESTION(movieId, suggestionId),
			{}
		);
	}

	public async compareVersions(
		movieId: string,
		screenplayId: string,
		fromVersionId: string,
		toVersionId?: string
	): Promise<VersionComparisonResult> {
		return api.get<VersionComparisonResult>(
			API_ENDPOINTS.SCRIPT_DOCTOR.COMPARE_VERSIONS(movieId),
			{
				params: {
					screenplayId,
					fromVersionId,
					...(toVersionId ? { toVersionId } : {}),
				},
			}
		);
	}
}

export const DEFAULT_DIFF_WINDOW_LIMIT = 250;

export function sliceDiffRowsForPreview<T>(
	rows: T[],
	showAll = false,
	limit = DEFAULT_DIFF_WINDOW_LIMIT
): {
	visibleRows: T[];
	isWindowed: boolean;
	totalRows: number;
	hiddenRows: number;
} {
	const totalRows = rows.length;
	if (showAll || totalRows <= limit) {
		return {
			visibleRows: rows,
			isWindowed: false,
			totalRows,
			hiddenRows: 0,
		};
	}
	return {
		visibleRows: rows.slice(0, limit),
		isWindowed: true,
		totalRows,
		hiddenRows: totalRows - limit,
	};
}

export const scriptDoctorService = new ScriptDoctorService();

