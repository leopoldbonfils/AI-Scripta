/**
 * Screenplay, Acts, Scenes, and Versioning Domain Types
 */

export interface StoryAct {
	id: string; // UUID
	movieId: string;
	actNumber: number;
	title: string;
	description: string | null;
	scenes?: Scene[];
}

export interface CreateActInput {
	actNumber: number;
	title: string;
	description?: string;
}

export type UpdateActInput = Partial<CreateActInput>;

export interface Scene {
	id: string; // UUID
	movieId: string;
	actId: string | null;
	act?: StoryAct | null;
	sceneNumber: number;
	title: string;
	location: string | null;
	timeOfDay: string | null;
	description: string | null;
	content: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface CreateSceneInput {
	actId?: string | null;
	sceneNumber?: number;
	title: string;
	location?: string;
	timeOfDay?: string;
	description?: string;
	content?: string;
}

export type UpdateSceneInput = Partial<CreateSceneInput>;

export interface ReorderScenesInput {
	sceneIds: string[];
}

export interface ScreenplayVersion {
	id: string; // UUID
	screenplayId: string;
	versionNumber: number;
	title: string;
	content: string;
	pageCount: number;
	wordCount: number;
	changeSummary: string | null;
	createdAt: string;
}

export interface Screenplay {
	id: string; // UUID
	movieId: string;
	title: string;
	content: string;
	pageCount: number;
	wordCount: number;
	version: number;
	isDraft: boolean;
	lastAutoSavedAt: string | null;
	createdAt: string;
	updatedAt: string;
	versions?: ScreenplayVersion[];
}

export interface CreateScreenplayInput {
	title: string;
	content?: string;
	isDraft?: boolean;
	importScenes?: boolean;
}

export interface UpdateScreenplayInput {
	title?: string;
	content?: string;
	isDraft?: boolean;
	lastAutoSavedAt?: string | Date;
	baseVersion?: number;
}

export interface CreateVersionInput {
	changeSummary?: string;
}

export interface SyncScenesInput {
	overwriteContent?: boolean;
}

export type ExportFormat = "pdf" | "docx" | "txt";

export interface ExportOptions {
	watermark?: string;
	includeTitlePage?: boolean;
	versionId?: string;
}

