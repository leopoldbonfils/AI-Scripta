"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiUser, FiMail, FiLock, FiUserPlus } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { FaMicrosoft } from "react-icons/fa6";

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
								<FiUser size={18} />
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
									placeholder="Create a password (min. 8 characters, with uppercase, lowercase and number)"
									className="signup-input"
								/>
							</div>
						</div>

						{/* Confirm Password */}
						<div className="signup-field-group">
							<div className="signup-field-icon">
								<FiLock size={18} />
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
							<FiUserPlus size={18} />
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
