"use client";

/**
 * FilmForge AI — useCharacters Hook
 *
 * Manages character cast dossiers for a movie project with full backend synchronization.
 */

import { useState, useEffect, useCallback } from "react";
import { characterService } from "../services/characterService";
import { Character, CreateCharacterInput, UpdateCharacterInput } from "../types/character";

export function useCharacters(movieId?: string | null) {
	const [characters, setCharacters] = useState<Character[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	const fetchCharacters = useCallback(async () => {
		if (!movieId) {
			setCharacters([]);
			setIsLoading(false);
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			const res = await characterService.getCharacters(movieId);
			if (res && Array.isArray(res.items)) {
				setCharacters(res.items);
			} else if (Array.isArray(res)) {
				setCharacters(res as unknown as Character[]);
			} else {
				setCharacters([]);
			}
		} catch (err: unknown) {
			const msg =
				err instanceof Error
					? err.message
					: "Failed to load movie characters from server";
			setError(msg);
			setCharacters([]);
		} finally {
			setIsLoading(false);
		}
	}, [movieId]);

	useEffect(() => {
		fetchCharacters();
	}, [fetchCharacters]);

	const createCharacter = useCallback(
		async (data: CreateCharacterInput): Promise<Character> => {
			if (!movieId) throw new Error("Movie ID is required to create a character");
			try {
				const newChar = await characterService.createCharacter(movieId, data);
				setCharacters((prev) => [...prev, newChar]);
				return newChar;
			} catch (err: unknown) {
				const msg =
					err instanceof Error ? err.message : "Failed to create character";
				setError(msg);
				throw err;
			}
		},
		[movieId]
	);

	const updateCharacter = useCallback(
		async (
			characterId: string,
			data: UpdateCharacterInput
		): Promise<Character> => {
			try {
				const updated = await characterService.updateCharacter(characterId, data);
				setCharacters((prev) =>
					prev.map((c) => (c.id === characterId ? updated : c))
				);
				return updated;
			} catch (err: unknown) {
				const msg =
					err instanceof Error ? err.message : "Failed to update character";
				setError(msg);
				throw err;
			}
		},
		[]
	);

	const deleteCharacter = useCallback(async (characterId: string): Promise<void> => {
		try {
			await characterService.deleteCharacter(characterId);
			setCharacters((prev) => prev.filter((c) => c.id !== characterId));
		} catch (err: unknown) {
			const msg =
				err instanceof Error ? err.message : "Failed to delete character";
			setError(msg);
			throw err;
		}
	}, []);

	return {
		characters,
		isLoading,
		error,
		totalCount: characters.length,
		refetch: fetchCharacters,
		createCharacter,
		updateCharacter,
		deleteCharacter,
	};
}

