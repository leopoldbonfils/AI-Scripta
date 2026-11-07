"use client";

import { useState } from "react";
import { FiBell, FiUser, FiFileText, FiStar, FiCheck } from "react-icons/fi";

export default function SettingsPage() {
	const [name, setName] = useState("Leopold");
	const [email, setEmail] = useState("leopold@filmforge.ai");
	const [scriptFormat, setScriptFormat] = useState("Standard Screenplay (Industry standard)");
	const [fontFamily, setFontFamily] = useState("Courier Prime (Recommended)");
	const [autoSave, setAutoSave] = useState(true);
	const [sceneNumbers, setSceneNumbers] = useState(true);
	const [aiModel, setAiModel] = useState("FilmForge AI Ultra v2.5");
	const [storyTone, setStoryTone] = useState("Cinematic & Vivid");
	const [creativity, setCreativity] = useState("Balanced");
	const [saved, setSaved] = useState(false);

	const handleSave = (e: React.FormEvent) => {
		e.preventDefault();
		setSaved(true);
		setTimeout(() => setSaved(false), 2500);
	};

	return (
		<div className="settings-page-container">
			{/* Top Header */}
			<header className="settings-header">
				<div className="settings-header-left">
					<h1 className="settings-header-title">Settings</h1>
					<p className="settings-header-subtitle">
						Manage your profile, studio preferences, and AI writing configuration.
					</p>
				</div>
			</header>

			{/* Main Settings Form */}
			<form onSubmit={handleSave} className="settings-content">
				{/* Section 1: Profile & Account */}
				<div className="settings-card">
					<div className="settings-card-header">
						<div className="settings-icon-badge">
							<FiUser size={18} />
						</div>
						<div>
							<h2 className="settings-card-title">Profile &amp; Account</h2>
							<p className="settings-card-desc">Your personal info and subscription plan</p>
						</div>
					</div>

					<div className="settings-card-body">
						<div className="settings-profile-row">
							<div className="settings-avatar-wrap">
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img
									src="/images/leopold-hd.png"
									alt="Leopold"
									className="settings-large-avatar"
								/>
							</div>
							<div className="settings-profile-info">
								<div className="settings-plan-pill">
									<span className="settings-plan-star">✦</span>
									<span>Pro Plan · Active</span>
								</div>
								<p className="settings-avatar-hint">JPG, PNG or GIF up to 5MB</p>
							</div>
						</div>

						<div className="settings-grid-two">
							<div className="settings-field">
								<label className="settings-label" htmlFor="name">Full Name</label>
								<input
									id="name"
									type="text"
									className="settings-input"
									value={name}
									onChange={(e) => setName(e.target.value)}
								/>
							</div>

							<div className="settings-field">
								<label className="settings-label" htmlFor="email">Email Address</label>
								<input
									id="email"
									type="email"
									className="settings-input"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
								/>
							</div>
						</div>
					</div>
				</div>

				{/* Section 2: Screenplay & Studio Preferences */}
				<div className="settings-card">
					<div className="settings-card-header">
						<div className="settings-icon-badge">
							<FiFileText size={18} />
						</div>
						<div>
							<h2 className="settings-card-title">Screenplay &amp; Studio Preferences</h2>
							<p className="settings-card-desc">Industry standards and editor formatting</p>
						</div>
					</div>

					<div className="settings-card-body">
						<div className="settings-grid-two">
							<div className="settings-field">
								<label className="settings-label" htmlFor="format">Default Export Format</label>
								<select
									id="format"
									className="settings-select"
									value={scriptFormat}
									onChange={(e) => setScriptFormat(e.target.value)}
								>
									<option>Standard Screenplay (Industry standard)</option>
									<option>BBC Television Script</option>
									<option>Stage Play (Traditional)</option>
								</select>
							</div>

							<div className="settings-field">
								<label className="settings-label" htmlFor="font">Editor Font</label>
								<select
									id="font"
									className="settings-select"
									value={fontFamily}
									onChange={(e) => setFontFamily(e.target.value)}
								>
									<option>Courier Prime (Recommended)</option>
									<option>Courier Final Draft</option>
									<option>Courier New</option>
								</select>
							</div>
						</div>

						<div className="settings-toggle-list">
							<label className="settings-toggle-row">
								<div>
									<div className="settings-toggle-title">Auto-save screenplay scenes</div>
									<div className="settings-toggle-desc">Automatically save scene drafts as you type</div>
								</div>
								<input
									type="checkbox"
									className="settings-checkbox"
									checked={autoSave}
									onChange={(e) => setAutoSave(e.target.checked)}
								/>
							</label>

							<label className="settings-toggle-row">
								<div>
									<div className="settings-toggle-title">Show scene numbers</div>
									<div className="settings-toggle-desc">Display production scene numbers in outline and screenplay editor</div>
								</div>
								<input
									type="checkbox"
									className="settings-checkbox"
									checked={sceneNumbers}
									onChange={(e) => setSceneNumbers(e.target.checked)}
								/>
							</label>
						</div>
					</div>
				</div>

				{/* Section 3: AI Assistant Settings */}
				<div className="settings-card">
					<div className="settings-card-header">
						<div className="settings-icon-badge">
							<FiStar size={18} />
						</div>
						<div>
							<h2 className="settings-card-title">AI Writing Assistant</h2>
							<p className="settings-card-desc">Configure FilmForge AI generation and creative style</p>
						</div>
					</div>

					<div className="settings-card-body">
						<div className="settings-grid-two">
							<div className="settings-field">
								<label className="settings-label" htmlFor="aimodel">AI Engine Model</label>
								<select
									id="aimodel"
									className="settings-select"
									value={aiModel}
									onChange={(e) => setAiModel(e.target.value)}
								>
									<option>FilmForge AI Ultra v2.5 (Fast &amp; Accurate)</option>
									<option>FilmForge Screenplay Pro (Deep Character Nuance)</option>
								</select>
							</div>

							<div className="settings-field">
								<label className="settings-label" htmlFor="tone">Default Story Tone</label>
								<select
									id="tone"
									className="settings-select"
									value={storyTone}
									onChange={(e) => setStoryTone(e.target.value)}
								>
									<option>Cinematic &amp; Vivid</option>
									<option>Dark &amp; Thrilling</option>
									<option>Emotional &amp; Heartfelt</option>
									<option>Fast-Paced Action</option>
								</select>
							</div>
						</div>

						<div className="settings-field" style={{ marginTop: "16px" }}>
							<label className="settings-label">Creativity Level</label>
							<div className="settings-creativity-options">
								{["Precise", "Balanced", "Creative"].map((level) => (
									<button
										key={level}
										type="button"
										className={`settings-level-btn ${creativity === level ? "active" : ""}`}
										onClick={() => setCreativity(level)}
									>
										{level}
									</button>
								))}
							</div>
						</div>
					</div>
				</div>

				{/* Save Changes Action */}
				<div className="settings-actions">
					<button type="submit" className="settings-save-btn">
						{saved ? (
							<>
								<FiCheck size={16} />
								<span>Changes Saved!</span>
							</>
						) : (
							<span>Save Changes</span>
						)}
					</button>
				</div>
			</form>
		</div>
	);
}
