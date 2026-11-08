"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FiMail, FiLock, FiLogIn, FiAlertCircle } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "./AuthProvider";
import { extractErrorMessage } from "../../lib/utils";

function LoginViewContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { login } = useAuth();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const redirectUrl = searchParams ? searchParams.get("redirect") || "/movies" : "/movies";
	const destination = redirectUrl.startsWith("/") ? redirectUrl : "/movies";

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		const cleanEmail = email.trim();
		if (!cleanEmail) {
			setError("Please enter your email address.");
			return;
		}

		if (!password) {
			setError("Please enter your password.");
			return;
		}

		setLoading(true);

		try {
			await login({
				email: cleanEmail,
				password,
			});
			router.push(destination);
		} catch (err) {
			const msg = extractErrorMessage(err, "Failed to sign in. Please verify your credentials.");
			setError(msg);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="signup-page-wrapper">
			<div className="signup-overlay-container">
				{/* Glassmorphic Sign In Card */}
				<div className="signup-card">
					<h1 className="signup-card-title">Sign In to Your Account</h1>
					<p className="signup-card-subtitle">Welcome back to FilmForge AI</p>

					{error && (
						<div
							style={{
								background: "rgba(239, 68, 68, 0.16)",
								border: "1px solid rgba(239, 68, 68, 0.4)",
								color: "#fca5a5",
								padding: "9px 12px",
								borderRadius: "10px",
								fontSize: "12px",
								marginBottom: "14px",
								display: "flex",
								alignItems: "center",
								gap: "8px",
								lineHeight: "1.4",
							}}
							role="alert"
						>
							<FiAlertCircle size={16} style={{ flexShrink: 0 }} />
							<span>{error}</span>
						</div>
					)}

					<form onSubmit={handleSubmit} className="signup-form" noValidate>
						{/* Email Address */}
						<fieldset className="signup-field-group">
							<legend className="signup-field-label">Email Address</legend>
							<div className="signup-field-inner">
								<FiMail className="signup-field-icon" size={16} />
								<input
									id="emailAddress"
									type="email"
									required
									disabled={loading}
									value={email}
									onChange={(e) => {
										setEmail(e.target.value);
										if (error) setError(null);
									}}
									placeholder="Enter your email address"
									className="signup-input"
									autoComplete="email"
								/>
							</div>
						</fieldset>

						{/* Password */}
						<fieldset className="signup-field-group">
							<legend className="signup-field-label">Password</legend>
							<div className="signup-field-inner">
								<FiLock className="signup-field-icon" size={16} />
								<input
									id="password"
									type="password"
									required
									disabled={loading}
									value={password}
									onChange={(e) => {
										setPassword(e.target.value);
										if (error) setError(null);
									}}
									placeholder="Enter your password"
									className="signup-input"
									autoComplete="current-password"
								/>
							</div>
						</fieldset>

						{/* Sign In Button */}
						<button
							type="submit"
							disabled={loading}
							className="signup-submit-btn"
							style={{
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								gap: "8px",
							}}
						>
							<FiLogIn size={17} />
							<span>{loading ? "Signing In..." : "Sign In"}</span>
						</button>

						{/* Divider */}
						<div className="signup-divider">
							<span>or</span>
						</div>

						{/* Continue with Google */}
						<button
							type="button"
							disabled={loading}
							onClick={() => router.push(destination)}
							className="signup-social-btn"
							style={{
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								gap: "8px",
							}}
						>
							<FcGoogle size={18} />
							<span>Continue with Google</span>
						</button>

						{/* Don't have an account */}
						<div className="signup-footer-link">
							<span>Don&apos;t have an account? </span>
							<Link href="/signup" className="signup-signin-link">
								Sign Up
							</Link>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}

export function LoginView() {
	return (
		<Suspense fallback={null}>
			<LoginViewContent />
		</Suspense>
	);
}
