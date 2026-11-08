/**
 * User & Authentication Domain Types
 */

export type UserRole = "USER" | "ADMIN";

export type SubscriptionTier = "FREE" | "PRO" | "STUDIO";

export interface User {
	id: string; // UUID
	name: string;
	email: string;
	avatar: string | null;
	role: UserRole;
	subscriptionTier: SubscriptionTier;
	createdAt: string;
	updatedAt?: string;
}

export interface AuthTokens {
	accessToken: string;
	refreshToken: string;
}

export interface AuthResponse {
	user: User;
	tokens: AuthTokens;
}

export interface RegisterInput {
	name: string;
	email: string;
	password: string;
}

export interface LoginInput {
	email: string;
	password: string;
}

export interface RefreshTokenInput {
	refreshToken: string;
}

