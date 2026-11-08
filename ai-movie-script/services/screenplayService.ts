/**
 * FilmForge AI — Screenplay, Acts, Scenes, and Document Export Service
 */

import { api } from "../lib/api";
import { API_ENDPOINTS } from "../lib/constants";
import {
	Screenplay,
	CreateScreenplayInput,
	UpdateScreenplayInput,
	ScreenplayVersion,
	CreateVersionInput,
	SyncScenesInput,
	StoryAct,
	CreateActInput,
	UpdateActInput,
	Scene,
	CreateSceneInput,
	UpdateSceneInput,
	ExportOptions,
} from "../types/screenplay";

export class ScreenplayService {
	// --- Screenplay Operations ---

	/**
	 * Retrieve the active screenplay for a movie
	 */
	public async getScreenplayForMovie(movieId: string): Promise<Screenplay | Screenplay[]> {
		return api.get<Screenplay | Screenplay[]>(API_ENDPOINTS.MOVIES.SCREENPLAY(movieId));
	}

	/**
	 * Initialize or create a screenplay for a movie
	 */
	public async createScreenplay(
		movieId: string,
		data: CreateScreenplayInput
	): Promise<Screenplay> {
		return api.post<Screenplay>(API_ENDPOINTS.MOVIES.SCREENPLAY(movieId), data);
	}

	/**
	 * Get screenplay by ID
	 */
	public async getScreenplayById(screenplayId: string): Promise<Screenplay> {
		return api.get<Screenplay>(API_ENDPOINTS.SCREENPLAYS.BY_ID(screenplayId));
	}

	/**
	 * Update screenplay content, title, or trigger auto-save
	 */
	public async updateScreenplay(
		screenplayId: string,
		data: UpdateScreenplayInput
	): Promise<Screenplay> {
		return api.put<Screenplay>(
			API_ENDPOINTS.SCREENPLAYS.BY_ID(screenplayId),
			data
		);
	}

	/**
	 * Delete screenplay
	 */
	public async deleteScreenplay(screenplayId: string): Promise<void> {
		return api.delete<void>(API_ENDPOINTS.SCREENPLAYS.BY_ID(screenplayId));
	}

	/**
	 * Synchronize structured outline scenes into the screenplay text
	 */
	public async syncScenes(
		screenplayId: string,
		data?: SyncScenesInput
	): Promise<Screenplay> {
		return api.post<Screenplay>(
			API_ENDPOINTS.SCREENPLAYS.SYNC_SCENES(screenplayId),
			data || {}
		);
	}

	// --- Version Management ---

	/**
	 * Create an immutable version snapshot
	 */
	public async createVersion(
		screenplayId: string,
		data?: CreateVersionInput
	): Promise<ScreenplayVersion> {
		return api.post<ScreenplayVersion>(
			API_ENDPOINTS.SCREENPLAYS.VERSIONS(screenplayId),
			data || {}
		);
	}

	/**
	 * List all versions for a screenplay
	 */
	public async getVersions(
		screenplayId: string
	): Promise<ScreenplayVersion[]> {
		return api.get<ScreenplayVersion[]>(
			API_ENDPOINTS.SCREENPLAYS.VERSIONS(screenplayId)
		);
	}

	/**
	 * Get a specific version snapshot
	 */
	public async getVersionById(
		screenplayId: string,
		versionId: string
	): Promise<ScreenplayVersion> {
		return api.get<ScreenplayVersion>(
			API_ENDPOINTS.SCREENPLAYS.VERSION_BY_ID(screenplayId, versionId)
		);
	}

	/**
	 * Restore a historical version snapshot
	 */
	public async restoreVersion(
		screenplayId: string,
		versionId: string
	): Promise<Screenplay> {
		return api.post<Screenplay>(
			API_ENDPOINTS.SCREENPLAYS.RESTORE_VERSION(screenplayId, versionId)
		);
	}

	// --- Story Acts Operations ---

	public async getActs(movieId: string): Promise<StoryAct[]> {
		return api.get<StoryAct[]>(API_ENDPOINTS.MOVIES.ACTS(movieId));
	}

	public async createAct(
		movieId: string,
		data: CreateActInput
	): Promise<StoryAct> {
		return api.post<StoryAct>(API_ENDPOINTS.MOVIES.ACTS(movieId), data);
	}

	public async getActById(actId: string): Promise<StoryAct> {
		return api.get<StoryAct>(API_ENDPOINTS.ACTS.BY_ID(actId));
	}

	public async updateAct(
		actId: string,
		data: UpdateActInput
	): Promise<StoryAct> {
		return api.put<StoryAct>(API_ENDPOINTS.ACTS.BY_ID(actId), data);
	}

	public async deleteAct(actId: string): Promise<void> {
		return api.delete<void>(API_ENDPOINTS.ACTS.BY_ID(actId));
	}

	// --- Scenes Operations ---

	public async getScenes(movieId: string): Promise<Scene[]> {
		return api.get<Scene[]>(API_ENDPOINTS.MOVIES.SCENES(movieId));
	}

	public async createScene(
		movieId: string,
		data: CreateSceneInput
	): Promise<Scene> {
		return api.post<Scene>(API_ENDPOINTS.MOVIES.SCENES(movieId), data);
	}

	public async getSceneById(sceneId: string): Promise<Scene> {
		return api.get<Scene>(API_ENDPOINTS.SCENES.BY_ID(sceneId));
	}

	public async updateScene(
		sceneId: string,
		data: UpdateSceneInput
	): Promise<Scene> {
		return api.put<Scene>(API_ENDPOINTS.SCENES.BY_ID(sceneId), data);
	}

	public async deleteScene(sceneId: string): Promise<void> {
		return api.delete<void>(API_ENDPOINTS.SCENES.BY_ID(sceneId));
	}

	public async reorderScenes(
		movieId: string,
		sceneIds: string[]
	): Promise<Scene[]> {
		return api.patch<Scene[]>(
			API_ENDPOINTS.MOVIES.REORDER_SCENES(movieId),
			{ sceneIds }
		);
	}

	// --- Document Exports (Binary Streaming) ---

	public async exportPdf(
		screenplayId: string,
		options?: ExportOptions
	): Promise<Blob> {
		return api.downloadBlob(
			API_ENDPOINTS.SCREENPLAYS.EXPORT(screenplayId, "pdf"),
			options as Record<string, string | number | boolean | undefined | null>
		);
	}

	public async exportDocx(
		screenplayId: string,
		options?: ExportOptions
	): Promise<Blob> {
		return api.downloadBlob(
			API_ENDPOINTS.SCREENPLAYS.EXPORT(screenplayId, "docx"),
			options as Record<string, string | number | boolean | undefined | null>
		);
	}

	public async exportTxt(
		screenplayId: string,
		options?: ExportOptions
	): Promise<Blob> {
		return api.downloadBlob(
			API_ENDPOINTS.SCREENPLAYS.EXPORT(screenplayId, "txt"),
			options as Record<string, string | number | boolean | undefined | null>
		);
	}
}

export const screenplayService = new ScreenplayService();

