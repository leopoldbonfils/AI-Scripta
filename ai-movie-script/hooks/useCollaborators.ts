"use client";

/**
 * FilmForge AI — useCollaborators Hook
 *
 * Manages project collaborators, permissions, and sharing with backend verification.
 */

import { useState, useEffect, useCallback } from "react";
import { movieService } from "../services/movieService";
import { MovieCollaborator, CollaboratorRole } from "../types/movie";

export function useCollaborators(movieId?: string | null) {
	const [collaborators, setCollaborators] = useState<MovieCollaborator[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	const fetchCollaborators = useCallback(async () => {
		if (!movieId) {
			setCollaborators([]);
			setIsLoading(false);
			return;
		}

		setIsLoading(true);
		setError(null);
		try {
			const res = await movieService.getCollaborators(movieId);
			setCollaborators(res || []);
		} catch (err: unknown) {
			const msg =
				err instanceof Error
					? err.message
					: "Failed to load project collaborators";
			setError(msg);
			setCollaborators([]);
		} finally {
			setIsLoading(false);
		}
	}, [movieId]);

	useEffect(() => {
		fetchCollaborators();
	}, [fetchCollaborators]);

	const addCollaborator = useCallback(
		async (email: string, role: CollaboratorRole = "EDITOR"): Promise<MovieCollaborator> => {
			if (!movieId) throw new Error("Movie ID is required to invite collaborator");
			try {
				const created = await movieService.addCollaborator(movieId, { email, role });
				setCollaborators((prev) => [...prev, created]);
				return created;
			} catch (err: unknown) {
				const msg =
					err instanceof Error ? err.message : "Failed to invite collaborator";
				setError(msg);
				throw err;
			}
		},
		[movieId]
	);

	const updateCollaborator = useCallback(
		async (collaboratorId: string, role: CollaboratorRole): Promise<MovieCollaborator> => {
			if (!movieId) throw new Error("Movie ID is required to update collaborator");
			try {
				const updated = await movieService.updateCollaborator(movieId, collaboratorId, { role });
				setCollaborators((prev) =>
					prev.map((c) => (c.id === collaboratorId ? updated : c))
				);
				return updated;
			} catch (err: unknown) {
				const msg =
					err instanceof Error ? err.message : "Failed to update collaborator role";
				setError(msg);
				throw err;
			}
		},
		[movieId]
	);

	const removeCollaborator = useCallback(
		async (collaboratorId: string): Promise<void> => {
			if (!movieId) throw new Error("Movie ID is required to remove collaborator");
			try {
				await movieService.removeCollaborator(movieId, collaboratorId);
				setCollaborators((prev) => prev.filter((c) => c.id !== collaboratorId));
			} catch (err: unknown) {
				const msg =
					err instanceof Error ? err.message : "Failed to remove collaborator";
				setError(msg);
				throw err;
			}
		},
		[movieId]
	);

	return {
		collaborators,
		isLoading,
		error,
		fetchCollaborators,
		addCollaborator,
		updateCollaborator,
		removeCollaborator,
	};
}

