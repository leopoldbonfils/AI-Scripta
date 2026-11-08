"use client";

/**
 * FilmForge AI — useMovie Hook
 *
 * Loads, manages, updates, and deletes an individual movie project by its UUID.
 * Handles loading, not-found (404), and forbidden (403) states.
 */

import { useState, useEffect, useCallback } from "react";
import { movieService } from "../services/movieService";
import { movieStore } from "../store/movieStore";
import { Movie, UpdateMovieInput } from "../types/movie";
import { ApiClientError } from "../lib/api";

export function useMovie(movieId?: string | null) {
	const [movie, setMovie] = useState<Movie | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [isNotFound, setIsNotFound] = useState<boolean>(false);
	const [isUnauthorized, setIsUnauthorized] = useState<boolean>(false);

	const fetchMovie = useCallback(async () => {
		if (!movieId) {
			setMovie(null);
			setIsLoading(false);
			return;
		}

		setIsLoading(true);
		setError(null);
		setIsNotFound(false);
		setIsUnauthorized(false);

		try {
			const data = await movieService.getMovieById(movieId);
			setMovie(data);
			movieStore.setActiveMovie(data);
		} catch (err: unknown) {
			if (err instanceof ApiClientError) {
				if (err.statusCode === 404) {
					setIsNotFound(true);
					setError("Movie project not found.");
				} else if (err.statusCode === 403) {
					setIsUnauthorized(true);
					setError("You do not have permission to access this movie project.");
				} else {
					setError(err.message);
				}
			} else {
				setError(
					err instanceof Error
						? err.message
						: "Failed to load movie project details."
				);
			}
			setMovie(null);
		} finally {
			setIsLoading(false);
		}
	}, [movieId]);

	useEffect(() => {
		fetchMovie();
	}, [fetchMovie]);

	const updateMovie = useCallback(
		async (data: UpdateMovieInput): Promise<Movie> => {
			if (!movieId) throw new Error("No active movie ID to update");
			setIsLoading(true);
			try {
				const updated = await movieService.updateMovie(movieId, data);
				setMovie(updated);
				movieStore.updateMovie(movieId, updated);
				return updated;
			} catch (err: unknown) {
				const msg =
					err instanceof Error ? err.message : "Failed to update movie details";
				setError(msg);
				throw err;
			} finally {
				setIsLoading(false);
			}
		},
		[movieId]
	);

	const deleteMovie = useCallback(async (): Promise<void> => {
		if (!movieId) throw new Error("No active movie ID to delete");
		try {
			await movieService.deleteMovie(movieId);
			movieStore.removeMovie(movieId);
			setMovie(null);
		} catch (err: unknown) {
			const msg =
				err instanceof Error ? err.message : "Failed to delete movie";
			setError(msg);
			throw err;
		}
	}, [movieId]);

	return {
		movie,
		isLoading,
		error,
		isNotFound,
		isUnauthorized,
		refetch: fetchMovie,
		updateMovie,
		deleteMovie,
	};
}

