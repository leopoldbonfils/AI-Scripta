"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiMail, FiLock, FiLogIn } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";

export function LoginView() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
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
				{/* Glassmorphic Sign In Card */}
				<div className="signup-card">
					<h1 className="signup-card-title">Sign In to Your Account</h1>
					<p className="signup-card-subtitle">Welcome back to FilmForge AI</p>

					<form onSubmit={handleSubmit} className="signup-form">
						{/* Email Address */}
						<fieldset className="signup-field-group">
							<legend className="signup-field-label">
								Email Address
							</legend>
							<div className="signup-field-inner">
								<FiMail className="signup-field-icon" size={16} />
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
						</fieldset>

						{/* Password */}
						<fieldset className="signup-field-group">
							<legend className="signup-field-label">
								Password
							</legend>
							<div className="signup-field-inner">
								<FiLock className="signup-field-icon" size={16} />
								<input
									id="password"
									type="password"
									required
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder="Enter your password"
									className="signup-input"
								/>
							</div>
						</fieldset>

						{/* Sign In Button */}
						<button type="submit" disabled={loading} className="signup-submit-btn">
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
							onClick={() => router.push("/movies")}
							className="signup-social-btn"
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
