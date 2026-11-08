/**
 * Character Domain Types
 */

import { PaginationParams } from "./api";

export type CharacterRole =
	| "Protagonist"
	| "Antagonist"
	| "Supporting"
	| "Mentor"
	| "Friend"
	| "Other";

export interface Character {
	id: string; // UUID
	movieId: string;
	name: string;
	age: string | null;
	role: string | null;
	personality: string | null;
	background: string | null;
	goals: string | null;
	fears: string | null;
	characterArc: string | null;
	description: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface CreateCharacterInput {
	name: string;
	age?: string;
	role?: string;
	personality?: string;
	background?: string;
	goals?: string;
	fears?: string;
	characterArc?: string;
	description?: string;
}

export type UpdateCharacterInput = Partial<CreateCharacterInput>;

export interface CharacterQueryParams extends PaginationParams {
	search?: string;
	role?: string;
}

