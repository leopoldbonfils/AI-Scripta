/**
 * Movie Domain Types
 */

import { PaginationParams } from "./api";
import { Story } from "./story";
import { Character } from "./character";
import { StoryAct, Scene, Screenplay } from "./screenplay";
import { User } from "./user";

export type MovieStatus = "IDEA" | "STORY" | "OUTLINE" | "SCRIPT" | "COMPLETED";

export type CollaboratorRole = "VIEWER" | "EDITOR" | "CO_WRITER";

export interface MovieCollaborator {
	id: string; // UUID
	movieId: string;
	userId: string;
	role: CollaboratorRole;
	createdAt: string;
	user?: User;
}

export interface MovieStats {
	charactersCount: number;
	scenesCount: number;
	actsCount: number;
	screenplaysCount: number;
}

export interface MovieCount {
	characters: number;
	scenes: number;
	acts: number;
	screenplays: number;
}

export interface Movie {
	id: string; // UUID
	userId: string;
	title: string;
	description: string | null;
	originalIdea: string | null;
	genre: string | null;
	tone: string | null;
	language: string;
	targetLength: string | null;
	status: MovieStatus;
	coverImage: string | null;
	createdAt: string;
	updatedAt: string;

	progress?: number;
	stats?: MovieStats;
	_count?: MovieCount;

	story?: Story | null;
	characters?: Character[];
	acts?: StoryAct[];
	scenes?: Scene[];
	screenplays?: Screenplay[];
	collaborators?: MovieCollaborator[];
}

export interface CreateMovieInput {
	title: string;
	description?: string;
	originalIdea?: string;
	genre?: string;
	tone?: string;
	language?: string;
	targetLength?: string;
	status?: MovieStatus;
	coverImage?: string;
}

export type UpdateMovieInput = Partial<CreateMovieInput>;

export interface MovieQueryParams extends PaginationParams {
	search?: string;
	genre?: string;
	tone?: string;
	status?: MovieStatus;
	sortBy?: "createdAt" | "updatedAt" | "title";
	sortOrder?: "asc" | "desc";
}

export interface AddCollaboratorInput {
	email: string;
	role?: CollaboratorRole;
}

export interface UpdateCollaboratorInput {
	role: CollaboratorRole;
}

