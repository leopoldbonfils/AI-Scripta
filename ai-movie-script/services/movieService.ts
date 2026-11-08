/**
 * FilmForge AI — Movie Service
 */

import { api } from "../lib/api";
import { API_ENDPOINTS } from "../lib/constants";
import {
	Movie,
	CreateMovieInput,
	UpdateMovieInput,
	MovieQueryParams,
	MovieCollaborator,
	AddCollaboratorInput,
	UpdateCollaboratorInput,
} from "../types/movie";
import { PaginationMeta } from "../types/api";

export interface PaginatedMoviesResponse {
	items: Movie[];
	meta: PaginationMeta;
}

export class MovieService {
	/**
	 * List movie projects with optional filtering, search, and pagination
	 */
	public async getMovies(
		params?: MovieQueryParams
	): Promise<PaginatedMoviesResponse> {
		return api.get<PaginatedMoviesResponse>(API_ENDPOINTS.MOVIES.BASE, {
			params: params as Record<string, string | number | boolean | undefined | null>,
		});
	}

	/**
	 * Retrieve full details for a single movie project by its UUID
	 */
	public async getMovieById(movieId: string): Promise<Movie> {
		return api.get<Movie>(API_ENDPOINTS.MOVIES.BY_ID(movieId));
	}

	/**
	 * Create a new movie project
	 */
	public async createMovie(data: CreateMovieInput): Promise<Movie> {
		return api.post<Movie>(API_ENDPOINTS.MOVIES.BASE, data);
	}

	/**
	 * Update an existing movie project's metadata
	 */
	public async updateMovie(
		movieId: string,
		data: UpdateMovieInput
	): Promise<Movie> {
		return api.put<Movie>(API_ENDPOINTS.MOVIES.BY_ID(movieId), data);
	}

	/**
	 * Delete a movie project
	 */
	public async deleteMovie(movieId: string): Promise<void> {
		return api.delete<void>(API_ENDPOINTS.MOVIES.BY_ID(movieId));
	}

	/**
	 * Retrieve collaborators for a movie
	 */
	public async getCollaborators(
		movieId: string
	): Promise<MovieCollaborator[]> {
		return api.get<MovieCollaborator[]>(
			API_ENDPOINTS.MOVIES.COLLABORATORS(movieId)
		);
	}

	/**
	 * Add a collaborator to a movie
	 */
	public async addCollaborator(
		movieId: string,
		data: AddCollaboratorInput
	): Promise<MovieCollaborator> {
		return api.post<MovieCollaborator>(
			API_ENDPOINTS.MOVIES.COLLABORATORS(movieId),
			data
		);
	}

	/**
	 * Update collaborator permissions
	 */
	public async updateCollaborator(
		movieId: string,
		collaboratorId: string,
		data: UpdateCollaboratorInput
	): Promise<MovieCollaborator> {
		return api.patch<MovieCollaborator>(
			API_ENDPOINTS.MOVIES.COLLABORATOR_BY_ID(movieId, collaboratorId),
			data
		);
	}

	/**
	 * Remove a collaborator from a movie
	 */
	public async removeCollaborator(
		movieId: string,
		collaboratorId: string
	): Promise<void> {
		return api.delete<void>(
			API_ENDPOINTS.MOVIES.COLLABORATOR_BY_ID(movieId, collaboratorId)
		);
	}
}

export const movieService = new MovieService();

