/**
 * FilmForge AI — Character Service
 */

import { api } from "../lib/api";
import { API_ENDPOINTS } from "../lib/constants";
import {
	Character,
	CreateCharacterInput,
	UpdateCharacterInput,
	CharacterQueryParams,
} from "../types/character";
import { PaginationMeta } from "../types/api";

export interface PaginatedCharactersResponse {
	items: Character[];
	meta: PaginationMeta;
}

export class CharacterService {
	/**
	 * List characters belonging to a specific movie
	 */
	public async getCharacters(
		movieId: string,
		params?: CharacterQueryParams
	): Promise<PaginatedCharactersResponse> {
		return api.get<PaginatedCharactersResponse>(
			API_ENDPOINTS.MOVIES.CHARACTERS(movieId),
			{
				params: params as Record<string, string | number | boolean | undefined | null>,
			}
		);
	}

	/**
	 * Retrieve a single character by ID
	 */
	public async getCharacterById(characterId: string): Promise<Character> {
		return api.get<Character>(API_ENDPOINTS.CHARACTERS.BY_ID(characterId));
	}

	/**
	 * Create a new character for a movie
	 */
	public async createCharacter(
		movieId: string,
		data: CreateCharacterInput
	): Promise<Character> {
		return api.post<Character>(
			API_ENDPOINTS.MOVIES.CHARACTERS(movieId),
			data
		);
	}

	/**
	 * Update an existing character
	 */
	public async updateCharacter(
		characterId: string,
		data: UpdateCharacterInput
	): Promise<Character> {
		return api.put<Character>(
			API_ENDPOINTS.CHARACTERS.BY_ID(characterId),
			data
		);
	}

	/**
	 * Delete a character
	 */
	public async deleteCharacter(characterId: string): Promise<void> {
		return api.delete<void>(API_ENDPOINTS.CHARACTERS.BY_ID(characterId));
	}
}

export const characterService = new CharacterService();

