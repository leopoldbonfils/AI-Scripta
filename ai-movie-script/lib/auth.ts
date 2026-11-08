/**
 * Secure Token Storage & Session Manager
 *
 * SECURITY COMPLIANCE:
 * - Refresh tokens are strictly kept in-memory (never in localStorage).
 * - Access tokens are kept in-memory for active API authorization.
 * - Basic user profile can be preserved in session scope for UI rendering.
 */

import { User, AuthTokens } from "../types";
import { STORAGE_KEYS } from "./constants";

type AuthStateListener = (user: User | null, isAuthenticated: boolean) => void;

class AuthTokenManager {
	private accessToken: string | null = null;
	private refreshToken: string | null = null;
	private currentUser: User | null = null;
	private listeners: Set<AuthStateListener> = new Set();

	constructor() {
		// Initialize user profile from sessionStorage if available (in browser)
		if (typeof window !== "undefined") {
			try {
				const cached = sessionStorage.getItem(STORAGE_KEYS.USER_PROFILE);
				if (cached) {
					this.currentUser = JSON.parse(cached) as User;
				}
			} catch {
				// Ignore parse errors
			}
		}
	}

	public getAccessToken(): string | null {
		return this.accessToken;
	}

	public setAccessToken(token: string | null): void {
		this.accessToken = token;
		this.notifyListeners();
	}

	public getRefreshToken(): string | null {
		return this.refreshToken;
	}

	public setRefreshToken(token: string | null): void {
		// Strictly in-memory: Never written to localStorage or unencrypted persistent storage
		this.refreshToken = token;
	}

	public setTokens(tokens: AuthTokens): void {
		this.accessToken = tokens.accessToken;
		this.refreshToken = tokens.refreshToken;
		this.notifyListeners();
	}

	public getCurrentUser(): User | null {
		return this.currentUser;
	}

	public setCurrentUser(user: User | null): void {
		this.currentUser = user;
		if (typeof window !== "undefined") {
			try {
				if (user) {
					sessionStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(user));
				} else {
					sessionStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
				}
			} catch {
				// Ignore sessionStorage write errors
			}
		}
		this.notifyListeners();
	}

	public clearTokens(): void {
		this.accessToken = null;
		this.refreshToken = null;
		this.currentUser = null;
		if (typeof window !== "undefined") {
			try {
				sessionStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
			} catch {
				// Ignore
			}
		}
		this.notifyListeners();
	}

	public isAuthenticated(): boolean {
		return !!this.accessToken;
	}

	public subscribe(listener: AuthStateListener): () => void {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	}

	private notifyListeners(): void {
		const isAuth = this.isAuthenticated();
		for (const listener of this.listeners) {
			try {
				listener(this.currentUser, isAuth);
			} catch (err) {
				console.error("Error in auth state listener:", err);
			}
		}
	}
}

export const authTokens = new AuthTokenManager();

