"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiUser, FiMail, FiLock, FiUserPlus } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";

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
				{/* Glassmorphic Sign Up Card */}
				<div className="signup-card">
					<h1 className="signup-card-title">Create Your Account</h1>
					<p className="signup-card-subtitle">Start your journey with FilmForge AI</p>

					<form onSubmit={handleSubmit} className="signup-form">
						{/* Full Name */}
						<fieldset className="signup-field-group">
							<legend className="signup-field-label">
								Full Name
							</legend>
							<div className="signup-field-inner">
								<FiUser className="signup-field-icon" size={16} />
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
						</fieldset>

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

						{/* Confirm Password */}
						<fieldset className="signup-field-group">
							<legend className="signup-field-label">
								Confirm Password
							</legend>
							<div className="signup-field-inner">
								<FiLock className="signup-field-icon" size={16} />
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
						</fieldset>

						{/* Sign Up Button */}
						<button type="submit" disabled={loading} className="signup-submit-btn">
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
							onClick={() => router.push("/movies")}
							className="signup-social-btn"
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
