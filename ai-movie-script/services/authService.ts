/**
 * FilmForge AI — Authentication Service
 */

import { api } from "../lib/api";
import { API_ENDPOINTS } from "../lib/constants";
import { authTokens } from "../lib/auth";
import {
	User,
	AuthResponse,
	AuthTokens,
	RegisterInput,
	LoginInput,
} from "../types/user";

export class AuthService {
	/**
	 * Register a new user account
	 */
	public async register(input: RegisterInput): Promise<AuthResponse> {
		const response = await api.post<AuthResponse>(
			API_ENDPOINTS.AUTH.REGISTER,
			input,
			{ skipAuth: true }
		);

		if (response?.tokens && response?.user) {
			authTokens.setTokens(response.tokens);
			authTokens.setCurrentUser(response.user);
		}

		return response;
	}

	/**
	 * Log in with existing credentials
	 */
	public async login(input: LoginInput): Promise<AuthResponse> {
		const response = await api.post<AuthResponse>(
			API_ENDPOINTS.AUTH.LOGIN,
			input,
			{ skipAuth: true }
		);

		if (response?.tokens && response?.user) {
			authTokens.setTokens(response.tokens);
			authTokens.setCurrentUser(response.user);
		}

		return response;
	}

	/**
	 * Manually refresh tokens using the current in-memory refresh token
	 */
	public async refresh(): Promise<AuthTokens | null> {
		const currentRefresh = authTokens.getRefreshToken();
		if (!currentRefresh) {
			authTokens.clearTokens();
			return null;
		}

		try {
			const tokens = await api.post<AuthTokens>(
				API_ENDPOINTS.AUTH.REFRESH,
				{ refreshToken: currentRefresh },
				{ skipAuth: true }
			);

			if (tokens?.accessToken) {
				authTokens.setTokens(tokens);
				return tokens;
			}
			return null;
		} catch {
			authTokens.clearTokens();
			return null;
		}
	}

	/**
	 * Log out the current user session
	 */
	public async logout(): Promise<void> {
		const currentRefresh = authTokens.getRefreshToken();
		try {
			if (currentRefresh) {
				await api.post<null>(
					API_ENDPOINTS.AUTH.LOGOUT,
					{ refreshToken: currentRefresh },
					{ skipAuth: true }
				);
			}
		} finally {
			authTokens.clearTokens();
		}
	}

	/**
	 * Fetch currently authenticated user profile
	 */
	public async getMe(): Promise<User> {
		const user = await api.get<User>(API_ENDPOINTS.AUTH.ME);
		if (user) {
			authTokens.setCurrentUser(user);
		}
		return user;
	}

	/**
	 * Synchronous checks
	 */
	public isAuthenticated(): boolean {
		return authTokens.isAuthenticated();
	}

	public getCurrentUser(): User | null {
		return authTokens.getCurrentUser();
	}
}

export const authService = new AuthService();

