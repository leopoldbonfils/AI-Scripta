/**
 * FilmForge AI — Story Service
 */

import { api } from "../lib/api";
import { API_ENDPOINTS } from "../lib/constants";
import { Story, UpsertStoryInput } from "../types/story";

export class StoryService {
	/**
	 * Retrieve story structure for a given movie
	 */
	public async getStory(movieId: string): Promise<Story> {
		return api.get<Story>(API_ENDPOINTS.MOVIES.STORY(movieId));
	}

	/**
	 * Upsert (create or update) story concept, logline, synopsis, and 3-act structure
	 */
	public async upsertStory(
		movieId: string,
		data: UpsertStoryInput
	): Promise<Story> {
		return api.put<Story>(API_ENDPOINTS.MOVIES.STORY(movieId), data);
	}
}

export const storyService = new StoryService();

