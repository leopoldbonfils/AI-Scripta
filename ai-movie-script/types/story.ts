/**
 * Story Domain Types
 */

export interface Story {
	id: string; // UUID
	movieId: string;
	logline: string | null;
	synopsis: string | null;
	theme: string | null;
	setting: string | null;
	beginning: string | null;
	middle: string | null;
	ending: string | null;
	fullStory: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface UpsertStoryInput {
	logline?: string;
	synopsis?: string;
	theme?: string;
	setting?: string;
	beginning?: string;
	middle?: string;
	ending?: string;
	fullStory?: string;
}

