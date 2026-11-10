/**
 * FilmForge AI — Phase D: Story Bible & Continuity API Service
 */

import { api } from "../lib/api";
import { API_ENDPOINTS } from "../lib/constants";
import {
	StoryBible,
	BuildStoryBibleRequest,
	ContinuityFinding,
	ContinuityCategory,
	ContinuityStatus,
	ContinuityClassification,
	MemoryUpdateProposal,
	StoryBibleVersion,
	NarrativeContextBundle,
} from "../types/storyBible";

export class StoryBibleService {
	public async getStoryBible(movieId: string): Promise<StoryBible | null> {
		return api.get<StoryBible | null>(API_ENDPOINTS.STORY_BIBLE.GET(movieId));
	}

	public async buildStoryBible(
		movieId: string,
		request: BuildStoryBibleRequest
	): Promise<StoryBible> {
		return api.post<StoryBible>(API_ENDPOINTS.STORY_BIBLE.BUILD(movieId), request);
	}

	public async updateIdentity(
		movieId: string,
		data: Record<string, any>
	): Promise<StoryBible> {
		return api.patch<StoryBible>(API_ENDPOINTS.STORY_BIBLE.IDENTITY(movieId), data);
	}

	public async createEntry(
		movieId: string,
		targetType: string,
		data: Record<string, any>,
		changeReason?: string
	): Promise<any> {
		return api.post<any>(API_ENDPOINTS.STORY_BIBLE.CREATE_ENTRY(movieId), {
			targetType,
			data,
			changeReason,
		});
	}

	public async updateEntry(
		movieId: string,
		targetType: string,
		entryId: string,
		data: Record<string, any>,
		changeReason?: string
	): Promise<any> {
		return api.patch<any>(
			API_ENDPOINTS.STORY_BIBLE.UPDATE_ENTRY(movieId, targetType, entryId),
			{ data, changeReason }
		);
	}

	public async analyzeContinuity(
		movieId: string,
		options?: { focusCategories?: ContinuityCategory[]; includeScreenplayText?: boolean }
	): Promise<ContinuityFinding[]> {
		return api.post<ContinuityFinding[]>(
			API_ENDPOINTS.STORY_BIBLE.ANALYZE_CONTINUITY(movieId),
			options || {}
		);
	}

	public async updateContinuityFinding(
		movieId: string,
		findingId: string,
		payload: {
			status: ContinuityStatus;
			resolutionNote?: string;
			classification?: ContinuityClassification;
		}
	): Promise<ContinuityFinding> {
		return api.patch<ContinuityFinding>(
			API_ENDPOINTS.STORY_BIBLE.UPDATE_FINDING(movieId, findingId),
			payload
		);
	}

	public async detectChanges(
		movieId: string,
		payload: {
			changeType: 'CHARACTER_EDIT' | 'STORY_EDIT' | 'SCENE_EDIT' | 'TIMELINE_EDIT' | 'MANUAL_CHECK';
			targetId?: string;
			summary: string;
			previousState?: Record<string, any>;
			newState?: Record<string, any>;
		}
	): Promise<{ proposalsCreated: number; warningsCreated: number; proposals: MemoryUpdateProposal[] }> {
		return api.post(API_ENDPOINTS.STORY_BIBLE.DETECT_CHANGES(movieId), payload);
	}

	public async reviewProposal(
		movieId: string,
		proposalId: string,
		payload: {
			status: 'ACCEPTED' | 'REJECTED';
			editedValue?: Record<string, any>;
			changeReason?: string;
		}
	): Promise<MemoryUpdateProposal> {
		return api.patch<MemoryUpdateProposal>(
			API_ENDPOINTS.STORY_BIBLE.REVIEW_PROPOSAL(movieId, proposalId),
			payload
		);
	}

	public async batchReviewProposals(
		movieId: string,
		payload: {
			proposalIds: string[];
			status: 'ACCEPTED' | 'REJECTED';
			changeReason?: string;
		}
	): Promise<{ reviewedCount: number; proposals: MemoryUpdateProposal[] }> {
		return api.post(API_ENDPOINTS.STORY_BIBLE.BATCH_REVIEW_PROPOSALS(movieId), payload);
	}

	public async getHistory(movieId: string): Promise<StoryBibleVersion[]> {
		return api.get<StoryBibleVersion[]>(API_ENDPOINTS.STORY_BIBLE.HISTORY(movieId));
	}

	public async restoreVersion(
		movieId: string,
		versionId: string,
		changeReason?: string
	): Promise<StoryBible> {
		return api.post<StoryBible>(
			API_ENDPOINTS.STORY_BIBLE.RESTORE_VERSION(movieId, versionId),
			{ changeReason }
		);
	}

	public async retrieveContext(
		movieId: string,
		params: {
			sceneId?: string;
			sceneNumber?: number;
			characterNames?: string[];
			locationName?: string;
			query?: string;
			maxTokens?: number;
		}
	): Promise<NarrativeContextBundle> {
		return api.post<NarrativeContextBundle>(
			API_ENDPOINTS.STORY_BIBLE.CONTEXT(movieId),
			params
		);
	}
}

export const storyBibleService = new StoryBibleService();

