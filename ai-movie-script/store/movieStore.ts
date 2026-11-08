/**
 * FilmForge AI — Movie Store
 *
 * Lightweight, reactive in-memory store for movie projects and studio dashboard data.
 * Adheres to zero-dependency React state management via subscriber callbacks.
 */

import { Movie } from "../types/movie";
import { PaginationMeta } from "../types/api";

export interface DashboardStats {
	total: number;
	inProgress: number;
	completed: number;
	recentlyUpdated: Movie[];
}

export type MovieStoreListener = () => void;

class MovieStore {
	private movies: Movie[] = [];
	private activeMovie: Movie | null = null;
	private pagination: PaginationMeta | null = null;
	private isLoading: boolean = false;
	private error: string | null = null;
	private listeners: Set<MovieStoreListener> = new Set();

	public getMovies(): Movie[] {
		return this.movies;
	}

	public getActiveMovie(): Movie | null {
		return this.activeMovie;
	}

	public getPagination(): PaginationMeta | null {
		return this.pagination;
	}

	public getIsLoading(): boolean {
		return this.isLoading;
	}

	public getError(): string | null {
		return this.error;
	}

	public setMovies(movies: Movie[], pagination?: PaginationMeta): void {
		this.movies = movies;
		if (pagination !== undefined) {
			this.pagination = pagination;
		}
		this.error = null;
		this.notify();
	}

	public setActiveMovie(movie: Movie | null): void {
		this.activeMovie = movie;
		this.notify();
	}

	public addMovie(movie: Movie): void {
		// Prepend newly created movie to the list
		this.movies = [movie, ...this.movies.filter((m) => m.id !== movie.id)];
		if (this.pagination) {
			this.pagination = {
				...this.pagination,
				total: this.pagination.total + 1,
			};
		}
		this.notify();
	}

	public updateMovie(movieId: string, updated: Partial<Movie>): void {
		this.movies = this.movies.map((m) =>
			m.id === movieId ? { ...m, ...updated, updatedAt: new Date().toISOString() } : m
		);
		if (this.activeMovie && this.activeMovie.id === movieId) {
			this.activeMovie = { ...this.activeMovie, ...updated, updatedAt: new Date().toISOString() };
		}
		this.notify();
	}

	public removeMovie(movieId: string): void {
		this.movies = this.movies.filter((m) => m.id !== movieId);
		if (this.activeMovie && this.activeMovie.id === movieId) {
			this.activeMovie = null;
		}
		if (this.pagination && this.pagination.total > 0) {
			this.pagination = {
				...this.pagination,
				total: this.pagination.total - 1,
			};
		}
		this.notify();
	}

	public setLoading(loading: boolean): void {
		this.isLoading = loading;
		this.notify();
	}

	public setError(error: string | null): void {
		this.error = error;
		this.isLoading = false;
		this.notify();
	}

	public getDashboardStats(): DashboardStats {
		const total = this.pagination?.total ?? this.movies.length;
		const completed = this.movies.filter((m) => m.status === "COMPLETED").length;
		const inProgress = Math.max(0, total - completed);

		// Recently updated: sorted by updatedAt descending, max 5 items
		const recentlyUpdated = [...this.movies]
			.sort(
				(a, b) =>
					new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
			)
			.slice(0, 5);

		return {
			total,
			inProgress,
			completed,
			recentlyUpdated,
		};
	}

	public clear(): void {
		this.movies = [];
		this.activeMovie = null;
		this.pagination = null;
		this.isLoading = false;
		this.error = null;
		this.notify();
	}

	public subscribe(listener: MovieStoreListener): () => void {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	}

	private notify(): void {
		for (const listener of this.listeners) {
			try {
				listener();
			} catch (err) {
				console.error("Error in MovieStore listener:", err);
			}
		}
	}
}

export const movieStore = new MovieStore();

