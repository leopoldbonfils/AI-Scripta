"use client";

import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	useCallback,
	useRef,
} from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { User, LoginInput, RegisterInput, AuthResponse } from "../../types/user";
import { authService } from "../../services/authService";
import { authTokens } from "../../lib/auth";

interface AuthContextType {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	login: (input: LoginInput) => Promise<AuthResponse>;
	register: (input: RegisterInput) => Promise<AuthResponse>;
	logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Routes that strictly require authentication
const PROTECTED_PREFIXES = [
	"/movies",
	"/dashboard",
	"/create",
	"/characters",
	"/screenplay",
	"/export",
	"/ideas",
	"/templates",
	"/settings",
];

// Auth routes (guests only)
const AUTH_ROUTES = ["/login", "/signup"];

function AuthProviderInner({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const [user, setUser] = useState<User | null>(() => authTokens.getCurrentUser());
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
		authTokens.isAuthenticated()
	);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const isMountedRef = useRef<boolean>(false);

	// Sync with in-memory AuthTokenManager
	useEffect(() => {
		isMountedRef.current = true;

		const unsubscribe = authTokens.subscribe((updatedUser, isAuth) => {
			if (isMountedRef.current) {
				setUser(updatedUser);
				setIsAuthenticated(isAuth);
			}
		});

		// Initial check: if there is an active access token, verify profile with backend
		const initAuth = async () => {
			if (authTokens.getAccessToken()) {
				try {
					const profile = await authService.getMe();
					if (isMountedRef.current) {
						setUser(profile);
						setIsAuthenticated(true);
					}
				} catch {
					if (isMountedRef.current) {
						setUser(null);
						setIsAuthenticated(false);
					}
				}
			} else {
				setUser(null);
				setIsAuthenticated(false);
			}

			if (isMountedRef.current) {
				setIsLoading(false);
			}
		};

		initAuth();

		return () => {
			isMountedRef.current = false;
			unsubscribe();
		};
	}, []);

	// Route Guarding Logic
	useEffect(() => {
		if (isLoading) return;

		const isProtected = PROTECTED_PREFIXES.some(
			(prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
		);

		const isAuthRoute = AUTH_ROUTES.some(
			(route) => pathname === route || pathname.startsWith(`${route}/`)
		);

		if (isProtected && !isAuthenticated) {
			// Save destination to redirect back after successful login
			const query = searchParams ? searchParams.toString() : "";
			const fullPath = query ? `${pathname}?${query}` : pathname;
			const redirectUrl = `/login?redirect=${encodeURIComponent(fullPath)}`;
			router.replace(redirectUrl);
		} else if (isAuthRoute && isAuthenticated) {
			// Prevent authenticated users from staying on /login or /signup
			const redirectParam = searchParams?.get("redirect");
			const destination = redirectParam && redirectParam.startsWith("/") ? redirectParam : "/movies";
			router.replace(destination);
		}
	}, [pathname, isAuthenticated, isLoading, router, searchParams]);

	const login = useCallback(async (input: LoginInput): Promise<AuthResponse> => {
		const response = await authService.login(input);
		setUser(response.user);
		setIsAuthenticated(true);
		return response;
	}, []);

	const register = useCallback(
		async (input: RegisterInput): Promise<AuthResponse> => {
			const response = await authService.register(input);
			setUser(response.user);
			setIsAuthenticated(true);
			return response;
		},
		[]
	);

	const logout = useCallback(async (): Promise<void> => {
		await authService.logout();
		setUser(null);
		setIsAuthenticated(false);
		router.replace("/login");
	}, [router]);

	const value: AuthContextType = {
		user,
		isAuthenticated,
		isLoading,
		login,
		register,
		logout,
	};

	return (
		<AuthContext.Provider value={value}>
			{children}
		</AuthContext.Provider>
	);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
	return (
		<React.Suspense fallback={null}>
			<AuthProviderInner>{children}</AuthProviderInner>
		</React.Suspense>
	);
}

export function useAuth(): AuthContextType {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
