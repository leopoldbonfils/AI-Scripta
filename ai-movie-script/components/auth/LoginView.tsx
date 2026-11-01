"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiMail, FiLock, FiLogIn } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { FaMicrosoft } from "react-icons/fa6";

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
				{/* Only the white sign in card */}
				<div className="signup-card">
					<h1 className="signup-card-title">Sign In to Your Account</h1>
					<p className="signup-card-subtitle">Welcome back to FilmForge AI</p>

					<form onSubmit={handleSubmit} className="signup-form">
						{/* Email Address */}
						<div className="signup-field-group">
							<div className="signup-field-icon">
								<FiMail size={18} />
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
								<FiLock size={18} />
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
									placeholder="Enter your password"
									className="signup-input"
								/>
							</div>
						</div>

						{/* Sign In Button */}
						<button type="submit" disabled={loading} className="signup-submit-btn">
							<FiLogIn size={18} />
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

						{/* Continue with Microsoft */}
						<button
							type="button"
							onClick={() => router.push("/movies")}
							className="signup-social-btn"
						>
							<FaMicrosoft size={16} color="#00a4ef" />
							<span>Continue with Microsoft</span>
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
