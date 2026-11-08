"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FiUser, FiMail, FiLock, FiUserPlus, FiAlertCircle } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "./AuthProvider";
import { extractErrorMessage } from "../../lib/utils";

function SignUpViewContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { register } = useAuth();

	const [fullName, setFullName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const redirectUrl = searchParams ? searchParams.get("redirect") || "/movies" : "/movies";
	const destination = redirectUrl.startsWith("/") ? redirectUrl : "/movies";

	const validateForm = (): string | null => {
		const cleanName = fullName.trim();
		const cleanEmail = email.trim();

		if (cleanName.length < 2) {
			return "Name must be at least 2 characters long.";
		}

		if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
			return "Please enter a valid email address.";
		}

		if (password.length < 8) {
			return "Password must be at least 8 characters long.";
		}

		if (!/[a-z]/.test(password)) {
			return "Password must contain at least one lowercase letter.";
		}

		if (!/[A-Z]/.test(password)) {
			return "Password must contain at least one uppercase letter.";
		}

		if (!/[0-9]/.test(password)) {
			return "Password must contain at least one number.";
		}

		if (password !== confirmPassword) {
			return "Passwords do not match.";
		}

		return null;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		const validationError = validateForm();
		if (validationError) {
			setError(validationError);
			return;
		}

		setLoading(true);

		try {
			await register({
				name: fullName.trim(),
				email: email.trim(),
				password,
			});
			router.push(destination);
		} catch (err) {
			const msg = extractErrorMessage(err, "Failed to create account. Please try again.");
			setError(msg);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="signup-page-wrapper">
			<div className="signup-overlay-container">
				{/* Glassmorphic Sign Up Card */}
				<div className="signup-card">
					<h1 className="signup-card-title">Create Your Account</h1>
					<p className="signup-card-subtitle">Start your journey with FilmForge AI</p>

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
						{/* Full Name */}
						<fieldset className="signup-field-group">
							<legend className="signup-field-label">Full Name</legend>
							<div className="signup-field-inner">
								<FiUser className="signup-field-icon" size={16} />
								<input
									id="fullName"
									type="text"
									required
									disabled={loading}
									value={fullName}
									onChange={(e) => {
										setFullName(e.target.value);
										if (error) setError(null);
									}}
									placeholder="Enter your full name"
									className="signup-input"
									autoComplete="name"
								/>
							</div>
						</fieldset>

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
									placeholder="Enter your password (min 8 chars, 1 uppercase, 1 number)"
									className="signup-input"
									autoComplete="new-password"
								/>
							</div>
						</fieldset>

						{/* Confirm Password */}
						<fieldset className="signup-field-group">
							<legend className="signup-field-label">Confirm Password</legend>
							<div className="signup-field-inner">
								<FiLock className="signup-field-icon" size={16} />
								<input
									id="confirmPassword"
									type="password"
									required
									disabled={loading}
									value={confirmPassword}
									onChange={(e) => {
										setConfirmPassword(e.target.value);
										if (error) setError(null);
									}}
									placeholder="Confirm your password"
									className="signup-input"
									autoComplete="new-password"
								/>
							</div>
						</fieldset>

						{/* Sign Up Button */}
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
							<FiUserPlus size={17} />
							<span>{loading ? "Creating Account..." : "Sign Up"}</span>
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

						{/* Already have an account */}
						<div className="signup-footer-link">
							<span>Already have an account? </span>
							<Link href="/login" className="signup-signin-link">
								Sign In
							</Link>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}

export function SignUpView() {
	return (
		<Suspense fallback={null}>
			<SignUpViewContent />
		</Suspense>
	);
}
