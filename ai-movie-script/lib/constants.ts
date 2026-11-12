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
		USAGE: "/ai/usage",
		STREAM_GENERATE: "/ai/stream/generate",
		ANALYZE_INPUT: "/ai/analyze-input",
		ANALYSES: "/ai/analyses",
		ANALYSIS_BY_ID: (id: string) => `/ai/analyses/${id}`,
		MOVIE_ANALYSES: (movieId: string) => `/ai/movies/${movieId}/analyses`,
		RETRY_ANALYSIS: (id: string) => `/ai/analyses/${id}/retry`,
		LINK_MOVIE_ANALYSIS: (id: string) => `/ai/analyses/${id}/link-movie`,
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
		// Phase C: Story & Character Intelligence
		STORY_INTELLIGENCE: "/ai/story-intelligence",
		STORY_INTELLIGENCE_BY_ID: (id: string) => `/ai/story-intelligence/${id}`,
		MOVIE_STORY_INTELLIGENCE: (movieId: string) =>
			`/ai/movies/${movieId}/story-intelligence`,
		REGENERATE_INTELLIGENCE_SECTION: (id: string) =>
			`/ai/story-intelligence/${id}/regenerate-section`,
		UPDATE_SUGGESTION_STATUS: (id: string, suggestionId: string) =>
			`/ai/story-intelligence/${id}/suggestions/${suggestionId}`,
		APPLY_INTELLIGENCE_TO_PROJECT: (id: string) =>
			`/ai/story-intelligence/${id}/apply-to-project`,
		LIST: "/ai/generations",
	},
	STORY_BIBLE: {
		GET: (movieId: string) => `/movies/${movieId}/story-bible`,
		BUILD: (movieId: string) => `/movies/${movieId}/story-bible/build`,
		IDENTITY: (movieId: string) => `/movies/${movieId}/story-bible/identity`,
		CREATE_ENTRY: (movieId: string) => `/movies/${movieId}/story-bible/entries`,
		UPDATE_ENTRY: (movieId: string, targetType: string, entryId: string) =>
			`/movies/${movieId}/story-bible/entries/${targetType}/${entryId}`,
		ANALYZE_CONTINUITY: (movieId: string) =>
			`/movies/${movieId}/story-bible/continuity/analyze`,
		UPDATE_FINDING: (movieId: string, findingId: string) =>
			`/movies/${movieId}/story-bible/continuity/${findingId}`,
		DETECT_CHANGES: (movieId: string) =>
			`/movies/${movieId}/story-bible/detect-changes`,
		REVIEW_PROPOSAL: (movieId: string, proposalId: string) =>
			`/movies/${movieId}/story-bible/proposals/${proposalId}`,
		BATCH_REVIEW_PROPOSALS: (movieId: string) =>
			`/movies/${movieId}/story-bible/proposals/review-batch`,
		HISTORY: (movieId: string) => `/movies/${movieId}/story-bible/history`,
		RESTORE_VERSION: (movieId: string, versionId: string) =>
			`/movies/${movieId}/story-bible/history/${versionId}/restore`,
		CONTEXT: (movieId: string) => `/movies/${movieId}/story-bible/context`,
	},
	SCREENPLAY_GENERATION: {
		READINESS: (movieId: string) => `/movies/${movieId}/screenplay-generation/readiness`,
		LATEST: (movieId: string) => `/movies/${movieId}/screenplay-generation/latest`,
		START: (movieId: string) => `/movies/${movieId}/screenplay-generation/start`,
		GET_JOB: (movieId: string, jobId: string) =>
			`/movies/${movieId}/screenplay-generation/jobs/${jobId}`,
		STREAM_JOB: (movieId: string, jobId: string) =>
			`/movies/${movieId}/screenplay-generation/jobs/${jobId}/stream`,
		UPDATE_ACT: (movieId: string, jobId: string, actId: string) =>
			`/movies/${movieId}/screenplay-generation/jobs/${jobId}/acts/${actId}`,
		APPROVE_ACTS: (movieId: string, jobId: string) =>
			`/movies/${movieId}/screenplay-generation/jobs/${jobId}/approve-acts`,
		UPDATE_SCENE: (movieId: string, jobId: string, sceneId: string) =>
			`/movies/${movieId}/screenplay-generation/jobs/${jobId}/scenes/${sceneId}`,
		APPROVE_SCENES: (movieId: string, jobId: string) =>
			`/movies/${movieId}/screenplay-generation/jobs/${jobId}/approve-scenes`,
		PAUSE: (movieId: string, jobId: string) =>
			`/movies/${movieId}/screenplay-generation/jobs/${jobId}/pause`,
		RESUME: (movieId: string, jobId: string) =>
			`/movies/${movieId}/screenplay-generation/jobs/${jobId}/resume`,
		CANCEL: (movieId: string, jobId: string) =>
			`/movies/${movieId}/screenplay-generation/jobs/${jobId}/cancel`,
		RETRY_SCENE: (movieId: string, jobId: string, sceneId: string) =>
			`/movies/${movieId}/screenplay-generation/jobs/${jobId}/scenes/${sceneId}/retry`,
		COMMIT: (movieId: string, jobId: string) =>
			`/movies/${movieId}/screenplay-generation/jobs/${jobId}/commit`,
	},
	SCRIPT_DOCTOR: {
		DASHBOARD: (movieId: string) => `/movies/${movieId}/script-doctor/dashboard`,
		ANALYSES: (movieId: string) => `/movies/${movieId}/script-doctor/analyses`,
		ANALYZE: (movieId: string) => `/movies/${movieId}/script-doctor/analyze`,
		CONTINUITY_CHECK: (movieId: string) => `/movies/${movieId}/script-doctor/continuity-check`,
		UPDATE_FINDING: (movieId: string, analysisId: string, findingId: string) =>
			`/movies/${movieId}/script-doctor/analyses/${analysisId}/findings/${findingId}`,
		SUGGESTIONS: (movieId: string) => `/movies/${movieId}/script-doctor/suggestions`,
		REWRITE: (movieId: string) => `/movies/${movieId}/script-doctor/rewrite`,
		POLISH: (movieId: string) => `/movies/${movieId}/script-doctor/polish`,
		DIALOGUE: (movieId: string) => `/movies/${movieId}/script-doctor/dialogue`,
		GET_SUGGESTION: (movieId: string, suggestionId: string) =>
			`/movies/${movieId}/script-doctor/suggestions/${suggestionId}`,
		EDIT_SUGGESTION: (movieId: string, suggestionId: string) =>
			`/movies/${movieId}/script-doctor/suggestions/${suggestionId}`,
		REGENERATE_SUGGESTION: (movieId: string, suggestionId: string) =>
			`/movies/${movieId}/script-doctor/suggestions/${suggestionId}/regenerate`,
		ACCEPT_SUGGESTION: (movieId: string, suggestionId: string) =>
			`/movies/${movieId}/script-doctor/suggestions/${suggestionId}/accept`,
		REJECT_SUGGESTION: (movieId: string, suggestionId: string) =>
			`/movies/${movieId}/script-doctor/suggestions/${suggestionId}/reject`,
		DISMISS_SUGGESTION: (movieId: string, suggestionId: string) =>
			`/movies/${movieId}/script-doctor/suggestions/${suggestionId}/dismiss`,
		COMPARE_VERSIONS: (movieId: string) => `/movies/${movieId}/script-doctor/versions/compare`,
	},
	HEALTH: "/health",
} as const;

