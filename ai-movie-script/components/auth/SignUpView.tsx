"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function UserIcon() {
	return (
		<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
			<circle cx="12" cy="7" r="4" />
		</svg>
	);
}

function MailIcon() {
	return (
		<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<rect x="2" y="4" width="20" height="16" rx="2" />
			<path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
		</svg>
	);
}

function LockIcon() {
	return (
		<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
			<path d="M7 11V7a5 5 0 0 1 10 0v4" />
		</svg>
	);
}

function UserPlusIcon() {
	return (
		<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
			<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
			<circle cx="9" cy="7" r="4" />
			<line x1="19" y1="8" x2="19" y2="14" />
			<line x1="22" y1="11" x2="16" y2="11" />
		</svg>
	);
}

function GoogleIcon() {
	return (
		<svg width="18" height="18" viewBox="0 0 24 24">
			<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
			<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
			<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
			<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
		</svg>
	);
}

function MicrosoftIcon() {
	return (
		<svg width="18" height="18" viewBox="0 0 23 23">
			<path fill="#f35325" d="M1 1h10v10H1z" />
			<path fill="#81bc06" d="M12 1h10v10H12z" />
			<path fill="#05a6f0" d="M1 12h10v10H1z" />
			<path fill="#ffba08" d="M12 12h10v10H12z" />
		</svg>
	);
}

export function SignUpView() {
	const router = useRouter();
	const [fullName, setFullName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setTimeout(() => {
			router.push("/movies");
		}, 500);
	};

	return (
		<div className="signup-page-wrapper">
			<div className="signup-overlay-container">
				{/* Only the white sign up card */}
				<div className="signup-card">
					<h1 className="signup-card-title">Create Your Account</h1>
					<p className="signup-card-subtitle">Start your journey with FilmForge AI</p>

					<form onSubmit={handleSubmit} className="signup-form">
						{/* Full Name */}
						<div className="signup-field-group">
							<div className="signup-field-icon">
								<UserIcon />
							</div>
							<div className="signup-field-content">
								<label className="signup-field-label" htmlFor="fullName">
									Full Name
								</label>
								<input
									id="fullName"
									type="text"
									required
									value={fullName}
									onChange={(e) => setFullName(e.target.value)}
									placeholder="Enter your full name"
									className="signup-input"
								/>
							</div>
						</div>

						{/* Email Address */}
						<div className="signup-field-group">
							<div className="signup-field-icon">
								<MailIcon />
							</div>
							<div className="signup-field-content">
								<label className="signup-field-label" htmlFor="emailAddress">
									Email Address
								</label>
								<input
									id="emailAddress"
									type="email"
									required
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder="Enter your email address"
									className="signup-input"
								/>
							</div>
						</div>

						{/* Password */}
						<div className="signup-field-group">
							<div className="signup-field-icon">
								<LockIcon />
							</div>
							<div className="signup-field-content">
								<label className="signup-field-label" htmlFor="password">
									Password
								</label>
								<input
									id="password"
									type="password"
									required
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder="Create a password (min. 8 characters, with uppercase, lowercase and number)"
									className="signup-input"
								/>
							</div>
						</div>

						{/* Confirm Password */}
						<div className="signup-field-group">
							<div className="signup-field-icon">
								<LockIcon />
							</div>
							<div className="signup-field-content">
								<label className="signup-field-label" htmlFor="confirmPassword">
									Confirm Password
								</label>
								<input
									id="confirmPassword"
									type="password"
									required
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									placeholder="Confirm your password"
									className="signup-input"
								/>
							</div>
						</div>

						{/* Sign Up Button */}
						<button type="submit" disabled={loading} className="signup-submit-btn">
							<UserPlusIcon />
							<span>{loading ? "Creating Account..." : "Sign Up"}</span>
						</button>

						{/* Divider */}
						<div className="signup-divider">
							<span>or</span>
						</div>

						{/* Continue with Google */}
						<button
							type="button"
							onClick={() => router.push("/movies")}
							className="signup-social-btn"
						>
							<GoogleIcon />
							<span>Continue with Google</span>
						</button>

						{/* Continue with Microsoft */}
						<button
							type="button"
							onClick={() => router.push("/movies")}
							className="signup-social-btn"
						>
							<MicrosoftIcon />
							<span>Continue with Microsoft</span>
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
