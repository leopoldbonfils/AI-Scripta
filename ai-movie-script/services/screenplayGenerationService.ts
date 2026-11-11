/**
 * FilmForge AI — Phase E: Complete Screenplay Generation API Service
 */

import { api } from "../lib/api";
import { API_ENDPOINTS } from "../lib/constants";
import {
	GeneratedActItem,
	GeneratedSceneItem,
	LatestScreenplayGenerationResponse,
	PreGenerationReadinessReport,
	ScreenplayGenerationJob,
	ScreenplayJobStatus,
	StartScreenplayGenerationRequest,
} from "../types/screenplayGeneration";

export const ACTIVE_POLLING_STATUSES: ReadonlySet<ScreenplayJobStatus> = new Set([
	"QUEUED",
	"PREPARING",
	"GENERATING_ACTS",
	"GENERATING_SCENES",
	"GENERATING_SCREENPLAY",
	"VALIDATING_CONTINUITY",
	"ASSEMBLING",
]);

export function isJobActivelyPolling(status?: ScreenplayJobStatus | null): boolean {
	return Boolean(status && ACTIVE_POLLING_STATUSES.has(status));
}

export function formatJobStatusLabel(status: ScreenplayJobStatus): string {
	switch (status) {
		case "QUEUED":
			return "Queued";
		case "PREPARING":
			return "Preparing Memory";
		case "GENERATING_ACTS":
			return "Designing Act Architecture";
		case "AWAITING_ACT_APPROVAL":
			return "Awaiting Act Approval";
		case "GENERATING_SCENES":
			return "Building Act-by-Act Scenes";
		case "AWAITING_SCENE_APPROVAL":
			return "Awaiting Scene Approval";
		case "GENERATING_SCREENPLAY":
			return "Writing Formatted Screenplay";
		case "VALIDATING_CONTINUITY":
			return "Validating Story Continuity";
		case "ASSEMBLING":
			return "Assembling Draft";
		case "COMPLETED":
			return "Completed";
		case "PARTIALLY_COMPLETED":
			return "Partially Completed";
		case "PAUSED":
			return "Paused";
		case "FAILED":
			return "Failed";
		case "CANCELLED":
			return "Cancelled";
	}
}

export class ScreenplayGenerationService {
	public async getReadiness(movieId: string): Promise<PreGenerationReadinessReport> {
		return api.get<PreGenerationReadinessReport>(
			API_ENDPOINTS.SCREENPLAY_GENERATION.READINESS(movieId)
		);
	}

	public async getLatest(movieId: string): Promise<LatestScreenplayGenerationResponse> {
		return api.get<LatestScreenplayGenerationResponse>(
			API_ENDPOINTS.SCREENPLAY_GENERATION.LATEST(movieId)
		);
	}

	public async startJob(
		movieId: string,
		request: StartScreenplayGenerationRequest
	): Promise<{ job: ScreenplayGenerationJob; isDuplicate: boolean; reason?: string }> {
		return api.post(API_ENDPOINTS.SCREENPLAY_GENERATION.START(movieId), request);
	}

	public async getJob(movieId: string, jobId: string): Promise<ScreenplayGenerationJob> {
		return api.get<ScreenplayGenerationJob>(
			API_ENDPOINTS.SCREENPLAY_GENERATION.GET_JOB(movieId, jobId)
		);
	}

	public async updateAct(
		movieId: string,
		jobId: string,
		actId: string,
		data: Partial<GeneratedActItem>
	): Promise<GeneratedActItem> {
		return api.patch<GeneratedActItem>(
			API_ENDPOINTS.SCREENPLAY_GENERATION.UPDATE_ACT(movieId, jobId, actId),
			data
		);
	}

	public async approveActs(
		movieId: string,
		jobId: string,
		actIds?: string[]
	): Promise<ScreenplayGenerationJob> {
		return api.post<ScreenplayGenerationJob>(
			API_ENDPOINTS.SCREENPLAY_GENERATION.APPROVE_ACTS(movieId, jobId),
			actIds ? { actIds } : {}
		);
	}

	public async updateScene(
		movieId: string,
		jobId: string,
		sceneId: string,
		data: Partial<GeneratedSceneItem>
	): Promise<GeneratedSceneItem> {
		return api.patch<GeneratedSceneItem>(
			API_ENDPOINTS.SCREENPLAY_GENERATION.UPDATE_SCENE(movieId, jobId, sceneId),
			data
		);
	}

	public async approveScenes(
		movieId: string,
		jobId: string,
		sceneIds?: string[]
	): Promise<ScreenplayGenerationJob> {
		return api.post<ScreenplayGenerationJob>(
			API_ENDPOINTS.SCREENPLAY_GENERATION.APPROVE_SCENES(movieId, jobId),
			sceneIds ? { sceneIds } : {}
		);
	}

	public async pauseJob(movieId: string, jobId: string): Promise<ScreenplayGenerationJob> {
		return api.post<ScreenplayGenerationJob>(
			API_ENDPOINTS.SCREENPLAY_GENERATION.PAUSE(movieId, jobId),
			{}
		);
	}

	public async resumeJob(movieId: string, jobId: string): Promise<ScreenplayGenerationJob> {
		return api.post<ScreenplayGenerationJob>(
			API_ENDPOINTS.SCREENPLAY_GENERATION.RESUME(movieId, jobId),
			{}
		);
	}

	public async cancelJob(movieId: string, jobId: string): Promise<ScreenplayGenerationJob> {
		return api.post<ScreenplayGenerationJob>(
			API_ENDPOINTS.SCREENPLAY_GENERATION.CANCEL(movieId, jobId),
			{}
		);
	}

	public async retryScene(
		movieId: string,
		jobId: string,
		sceneId: string,
		options?: { confirmOverwriteEdited?: boolean; instructions?: string }
	): Promise<{ scene: GeneratedSceneItem; job: ScreenplayGenerationJob }> {
		return api.post(
			API_ENDPOINTS.SCREENPLAY_GENERATION.RETRY_SCENE(movieId, jobId, sceneId),
			options || {}
		);
	}

	public async commitToScreenplay(
		movieId: string,
		jobId: string,
		options?: {
			title?: string;
			targetScreenplayId?: string;
			syncOutlineActsAndScenes?: boolean;
		}
	): Promise<{
		screenplay: { id: string; title: string; version: number; wordCount: number; pageCount: number };
		syncedActs: number;
		syncedScenes: number;
		job: ScreenplayGenerationJob;
	}> {
		return api.post(API_ENDPOINTS.SCREENPLAY_GENERATION.COMMIT(movieId, jobId), options || {});
	}
}

export const screenplayGenerationService = new ScreenplayGenerationService();

