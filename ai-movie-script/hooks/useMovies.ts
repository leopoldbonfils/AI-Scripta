"use client";

/**
 * FilmForge AI — useMovies Hook
 *
 * Provides reactive access to movie list, search/filtering, pagination,
 * creation, updating, and deletion with backend synchronization.
 */

import { useState, useEffect, useCallback, useTransition } from "react";
import { movieService } from "../services/movieService";
import { movieStore, DashboardStats } from "../store/movieStore";
import { Movie, MovieQueryParams, CreateMovieInput, UpdateMovieInput } from "../types/movie";
import { PaginationMeta } from "../types/api";

interface UseMoviesOptions {
	autoFetch?: boolean;
	initialParams?: MovieQueryParams;
}

export function useMovies(options: UseMoviesOptions = { autoFetch: true }) {
	const { autoFetch = true, initialParams } = options;

	const [movies, setMovies] = useState<Movie[]>(() => movieStore.getMovies());
	const [pagination, setPagination] = useState<PaginationMeta | null>(() =>
		movieStore.getPagination()
	);
	const [isLoading, setIsLoading] = useState<boolean>(() => movieStore.getIsLoading());
	const [error, setError] = useState<string | null>(() => movieStore.getError());
	const [stats, setStats] = useState<DashboardStats>(() => movieStore.getDashboardStats());
	const [, startTransition] = useTransition();

	// Sync local component state whenever movieStore updates
	useEffect(() => {
		const unsubscribe = movieStore.subscribe(() => {
			startTransition(() => {
				setMovies(movieStore.getMovies());
				setPagination(movieStore.getPagination());
				setIsLoading(movieStore.getIsLoading());
				setError(movieStore.getError());
				setStats(movieStore.getDashboardStats());
			});
		});

		return unsubscribe;
	}, []);

	// Fetch movies from backend API
	const fetchMovies = useCallback(
		async (params?: MovieQueryParams) => {
			movieStore.setLoading(true);
			try {
				const response = await movieService.getMovies(params || initialParams);
				// backend sendSuccess unwraps items and meta
				if (response && Array.isArray(response.items)) {
					movieStore.setMovies(response.items, response.meta);
				} else if (Array.isArray(response)) {
					movieStore.setMovies(response as unknown as Movie[]);
				}
				movieStore.setError(null);
			} catch (err: unknown) {
				const msg =
					err instanceof Error
						? err.message
						: "Failed to load movie projects from server";
				movieStore.setError(msg);
			} finally {
				movieStore.setLoading(false);
			}
		},
		[initialParams]
	);

	// Create movie
	const createMovie = useCallback(async (data: CreateMovieInput): Promise<Movie> => {
		movieStore.setLoading(true);
		try {
			const newMovie = await movieService.createMovie(data);
			movieStore.addMovie(newMovie);
			return newMovie;
		} catch (err: unknown) {
			const msg =
				err instanceof Error ? err.message : "Failed to create movie project";
			movieStore.setError(msg);
			throw err;
		} finally {
			movieStore.setLoading(false);
		}
	}, []);

	// Update movie
	const updateMovie = useCallback(
		async (movieId: string, data: UpdateMovieInput): Promise<Movie> => {
			try {
				const updated = await movieService.updateMovie(movieId, data);
				movieStore.updateMovie(movieId, updated);
				return updated;
			} catch (err: unknown) {
				const msg =
					err instanceof Error ? err.message : "Failed to update movie project";
				movieStore.setError(msg);
				throw err;
			}
		},
		[]
	);

	// Delete movie
	const deleteMovie = useCallback(async (movieId: string): Promise<void> => {
		try {
			await movieService.deleteMovie(movieId);
			movieStore.removeMovie(movieId);
		} catch (err: unknown) {
			const msg =
				err instanceof Error ? err.message : "Failed to delete movie project";
			movieStore.setError(msg);
			throw err;
		}
	}, []);

	// Auto-fetch if enabled and store is currently empty
	useEffect(() => {
		if (autoFetch) {
			fetchMovies(initialParams);
		}
	}, [autoFetch, fetchMovies, initialParams]);

	return {
		movies,
		pagination,
		isLoading,
		error,
		stats,
		fetchMovies,
		createMovie,
		updateMovie,
		deleteMovie,
	};
}

