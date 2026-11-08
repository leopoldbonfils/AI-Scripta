/**
 * Application Constants & API Endpoints
 */

export const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const STORAGE_KEYS = {
	ACCESS_TOKEN: "ff_access_token",
	// Note: Refresh tokens are NOT stored in localStorage per strict security rules.
	USER_PROFILE: "ff_user_profile",
} as const;

export const API_ENDPOINTS = {
	AUTH: {
		REGISTER: "/auth/register",
		LOGIN: "/auth/login",
		REFRESH: "/auth/refresh",
		LOGOUT: "/auth/logout",
		ME: "/auth/me",
	},
	MOVIES: {
		BASE: "/movies",
		BY_ID: (id: string) => `/movies/${id}`,
		STORY: (movieId: string) => `/movies/${movieId}/story`,
		CHARACTERS: (movieId: string) => `/movies/${movieId}/characters`,
		ACTS: (movieId: string) => `/movies/${movieId}/acts`,
		SCENES: (movieId: string) => `/movies/${movieId}/scenes`,
		REORDER_SCENES: (movieId: string) => `/movies/${movieId}/scenes/reorder`,
		SCREENPLAY: (movieId: string) => `/movies/${movieId}/screenplay`,
		COLLABORATORS: (movieId: string) => `/movies/${movieId}/collaborators`,
		COLLABORATOR_BY_ID: (movieId: string, id: string) =>
			`/movies/${movieId}/collaborators/${id}`,
	},
	CHARACTERS: {
		BY_ID: (id: string) => `/characters/${id}`,
	},
	ACTS: {
		BY_ID: (id: string) => `/acts/${id}`,
	},
	SCENES: {
		BY_ID: (id: string) => `/scenes/${id}`,
	},
	SCREENPLAYS: {
		BY_ID: (id: string) => `/screenplays/${id}`,
		SYNC_SCENES: (id: string) => `/screenplays/${id}/sync-scenes`,
		VERSIONS: (id: string) => `/screenplays/${id}/versions`,
		VERSION_BY_ID: (id: string, versionId: string) =>
			`/screenplays/${id}/versions/${versionId}`,
		RESTORE_VERSION: (id: string, versionId: string) =>
			`/screenplays/${id}/versions/${versionId}/restore`,
		EXPORT: (id: string, format: "pdf" | "docx" | "txt") =>
			`/screenplays/${id}/export/${format}`,
	},
	AI: {
		QUOTA: "/ai/quota",
		GENERATE_IDEA: "/ai/generate-idea",
		MOVIE_GENERATE_IDEA: (movieId: string) =>
			`/ai/movies/${movieId}/generate-idea`,
		GENERATE_STORY: (movieId: string) => `/ai/movies/${movieId}/generate-story`,
		GENERATE_CHARACTERS: (movieId: string) =>
			`/ai/movies/${movieId}/generate-characters`,
		GENERATE_OUTLINE: (movieId: string) =>
			`/ai/movies/${movieId}/generate-outline`,
		GENERATE_SCENE: (movieId: string) => `/ai/movies/${movieId}/generate-scene`,
		IMPROVE_SCENE: (movieId: string) => `/ai/movies/${movieId}/improve-scene`,
		APPLY: (id: string) => `/ai/generations/${id}/apply`,
		REJECT: (id: string) => `/ai/generations/${id}/reject`,
		RETRY: (id: string) => `/ai/generations/${id}/retry`,
		LIST: "/ai/generations",
	},
	HEALTH: "/health",
} as const;

