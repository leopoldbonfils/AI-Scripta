"use client";

import { useState } from "react";
import Link from "next/link";
import { useCharacters } from "../../hooks/useCharacters";
import { useAI } from "../../hooks/useAI";
import { Character, CreateCharacterInput } from "../../types/character";
import { Modal } from "../ui/Modal";
import {
	FiEdit,
	FiTrash2,
	FiPlus,
	FiSparkles,
	FiAlertCircle,
	FiCheckCircle,
	FiUsers,
	FiArrowRight,
} from "react-icons/fi";

interface CharacterWorkspaceProps {
	movieId: string;
	movieTitle?: string;
}

const roleStyles: Record<string, { color: string; bg: string; text: string }> = {
	Protagonist: { color: "#d97706", bg: "#fef3c7", text: "#92400e" },
	"Main Character": { color: "#d97706", bg: "#fef3c7", text: "#92400e" },
	Antagonist: { color: "#dc2626", bg: "#fee2e2", text: "#991b1b" },
	Supporting: { color: "#2563eb", bg: "#dbeafe", text: "#1e40af" },
	Mentor: { color: "#7c3aed", bg: "#f3e8ff", text: "#6b21a8" },
	Friend: { color: "#059669", bg: "#d1fae5", text: "#065f46" },
	Ally: { color: "#059669", bg: "#d1fae5", text: "#065f46" },
	Other: { color: "#475569", bg: "#f1f5f9", text: "#334155" },
};

function getRoleStyle(role?: string | null) {
	if (!role) return roleStyles.Supporting;
	return roleStyles[role] || roleStyles.Other;
}

const defaultAvatarList = [
	"/images/char-eric.jpg",
	"/images/char-sarah.jpg",
	"/images/char-david.jpg",
	"/images/leopold-hd.png",
];

export function CharacterWorkspace({ movieId, movieTitle = "Movie Project" }: CharacterWorkspaceProps) {
	const { characters, isLoading, error, createCharacter, updateCharacter, deleteCharacter } =
		useCharacters(movieId);

	const { generateCharacters, isGenerating: isAIGenerating } = useAI(movieId);

	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
	const [charToDelete, setCharToDelete] = useState<Character | null>(null);

	// Form fields
	const [name, setName] = useState("");
	const [role, setRole] = useState("Protagonist");
	const [age, setAge] = useState("");
	const [bio, setBio] = useState("");
	const [personality, setPersonality] = useState("");
	const [goals, setGoals] = useState("");
	const [fears, setFears] = useState("");
	const [characterArc, setCharacterArc] = useState("");

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [toastMsg, setToastMsg] = useState<string | null>(null);
	const [actionError, setActionError] = useState<string | null>(null);

	const showToast = (msg: string) => {
		setToastMsg(msg);
		setTimeout(() => setToastMsg(null), 3000);
	};

	// Determine active selected character
	const activeCharacter =
		characters.find((c) => c.id === selectedId) || characters[0] || null;

	const handleOpenAddModal = () => {
		setEditingCharacter(null);
		setName("");
		setRole("Protagonist");
		setAge("");
		setBio("");
		setPersonality("");
		setGoals("");
		setFears("");
		setCharacterArc("");
		setActionError(null);
		setIsModalOpen(true);
	};

	const handleOpenEditModal = (char: Character) => {
		setEditingCharacter(char);
		setName(char.name || "");
		setRole(char.role || "Supporting");
		setAge(char.age || "");
		setBio(char.description || char.background || "");
		setPersonality(char.personality || "");
		setGoals(char.goals || "");
		setFears(char.fears || "");
		setCharacterArc(char.characterArc || "");
		setActionError(null);
		setIsModalOpen(true);
	};

	const handleSubmitForm = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim()) {
			setActionError("Character name is required.");
			return;
		}

		setIsSubmitting(true);
		setActionError(null);

		try {
			if (editingCharacter) {
				const updated = await updateCharacter(editingCharacter.id, {
					name: name.trim(),
					role: role.trim() || undefined,
					age: age.trim() || undefined,
					description: bio.trim() || undefined,
					background: bio.trim() || undefined,
					personality: personality.trim() || undefined,
					goals: goals.trim() || undefined,
					fears: fears.trim() || undefined,
					characterArc: characterArc.trim() || undefined,
				});
				showToast(`Updated character "${updated.name}"`);
			} else {
				const created = await createCharacter({
					name: name.trim(),
					role: role.trim() || undefined,
					age: age.trim() || undefined,
					description: bio.trim() || undefined,
					background: bio.trim() || undefined,
					personality: personality.trim() || undefined,
					goals: goals.trim() || undefined,
					fears: fears.trim() || undefined,
					characterArc: characterArc.trim() || undefined,
				});
				setSelectedId(created.id);
				showToast(`Added character "${created.name}"`);
			}
			setIsModalOpen(false);
		} catch (err: unknown) {
			setActionError(err instanceof Error ? err.message : "Failed to save character");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleConfirmDelete = async () => {
		if (!charToDelete) return;
		setIsDeleting(true);
		try {
			await deleteCharacter(charToDelete.id);
			if (selectedId === charToDelete.id) {
				setSelectedId(null);
			}
			showToast(`Deleted character "${charToDelete.name}"`);
			setCharToDelete(null);
		} catch (err: unknown) {
			setActionError(err instanceof Error ? err.message : "Failed to delete character");
		} finally {
			setIsDeleting(false);
		}
	};

	const handleAIGenerate = async () => {
		try {
			showToast("FilmForge AI is generating characters based on your movie premise...");
			const gen = await generateCharacters();
			if (gen && gen.output) {
				showToast("Generated new characters! Cast dossier updated.");
			}
		} catch (err: unknown) {
			showToast(err instanceof Error ? err.message : "Failed to generate characters");
		}
	};

	return (
		<div className="char-page-container">
			{/* Top Header */}
			<header className="char-header">
				<div className="char-header-left">
					<span className="char-header-eyebrow">Character Dossiers</span>
					<h1 className="char-header-title">Cast of Characters</h1>
					<p className="char-header-subtitle">
						Develop compelling characters with distinct motivations, fears, and dramatic arcs for {movieTitle}.
					</p>
				</div>

				<div className="char-header-actions">
					<button
						type="button"
						className="char-btn-add"
						onClick={handleOpenAddModal}
					>
						<FiPlus size={15} />
						<span>Add Character</span>
					</button>

					<button
						type="button"
						className="char-btn-generate"
						onClick={handleAIGenerate}
						disabled={isAIGenerating}
					>
						<span className="char-sparkle">✦</span>
						<span>{isAIGenerating ? "Generating..." : "Generate with AI"}</span>
					</button>
				</div>
			</header>

			{/* Toast */}
			{toastMsg && (
				<div
					style={{
						position: "fixed",
						bottom: "28px",
						right: "28px",
						background: "#0f172a",
						color: "#ffffff",
						padding: "12px 20px",
						borderRadius: "10px",
						boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
						display: "flex",
						alignItems: "center",
						gap: "8px",
						fontSize: "13.5px",
						fontWeight: "500",
						zIndex: 9999,
					}}
				>
					<FiCheckCircle color="#10b981" size={16} />
					<span>{toastMsg}</span>
				</div>
			)}

			{/* Loading State */}
			{isLoading && (
				<div style={{ padding: "48px 0", textAlign: "center", color: "#64748b" }}>
					<div
						style={{
							display: "inline-block",
							width: "28px",
							height: "28px",
							border: "3px solid #e2e8f0",
							borderTopColor: "#f59e0b",
							borderRadius: "50%",
							animation: "spin 1s linear infinite",
						}}
					/>
					<p style={{ marginTop: "12px", fontSize: "14px" }}>Loading character dossiers...</p>
				</div>
			)}

			{/* Error State */}
			{error && !isLoading && (
				<div
					style={{
						padding: "16px 20px",
						borderRadius: "10px",
						background: "#fef2f2",
						border: "1px solid #fecaca",
						color: "#991b1b",
						marginBottom: "24px",
						display: "flex",
						alignItems: "center",
						gap: "10px",
					}}
				>
					<FiAlertCircle size={18} />
					<span>{error}</span>
				</div>
			)}

			{/* Character Cards Grid */}
			{!isLoading && characters.length === 0 ? (
				<div
					style={{
						background: "#ffffff",
						border: "2px dashed #cbd5e1",
						borderRadius: "16px",
						padding: "48px 24px",
						textAlign: "center",
						marginBottom: "32px",
					}}
				>
					<div
						style={{
							width: "56px",
							height: "56px",
							borderRadius: "50%",
							background: "#fef3c7",
							color: "#d97706",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							margin: "0 auto 16px",
						}}
					>
						<FiUsers size={24} />
					</div>
					<h3 style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", margin: "0 0 8px" }}>
						No characters created yet
					</h3>
					<p style={{ color: "#64748b", fontSize: "14px", maxWidth: "420px", margin: "0 auto 20px" }}>
						Start casting your screenplay by manually adding a protagonist or letting FilmForge AI craft your ensemble.
					</p>
					<div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
						<button
							type="button"
							onClick={handleOpenAddModal}
							style={{
								padding: "9px 20px",
								background: "#0f172a",
								color: "#ffffff",
								borderRadius: "20px",
								border: "none",
								fontWeight: "600",
								fontSize: "13.5px",
								cursor: "pointer",
							}}
						>
							+ Add First Character
						</button>
						<button
							type="button"
							onClick={handleAIGenerate}
							disabled={isAIGenerating}
							style={{
								padding: "9px 20px",
								background: "#fef3c7",
								color: "#92400e",
								border: "1px solid #fde68a",
								borderRadius: "20px",
								fontWeight: "600",
								fontSize: "13.5px",
								cursor: "pointer",
							}}
						>
							✦ Generate Ensemble
						</button>
					</div>
				</div>
			) : (
				<section className="char-cards-grid">
					{characters.map((char, index) => {
						const isSelected = char.id === (activeCharacter?.id || characters[0]?.id);
						const style = getRoleStyle(char.role);
						const avatar = defaultAvatarList[index % defaultAvatarList.length];

						return (
							<article
								key={char.id}
								className={`char-card${isSelected ? " selected" : ""}`}
								onClick={() => setSelectedId(char.id)}
							>
								<div className="char-card-thumb">
									{/* eslint-disable-next-line @next/next/no-img-element */}
									<img
										src={avatar}
										alt={char.name}
										className="char-card-img"
									/>
								</div>

								<div className="char-card-body">
									<h3 className="char-card-name">{char.name}</h3>
									<span
										className="char-card-role"
										style={{ color: style.color }}
									>
										{char.role || "Supporting"}
									</span>
									<p className="char-card-oneliner">
										{char.personality || char.description || char.background || "No bio entered yet."}
									</p>
								</div>
							</article>
						);
					})}

					{/* Add More Card */}
					<button
						type="button"
						className="char-card-add-more"
						onClick={handleOpenAddModal}
					>
						<span className="char-add-plus">+</span>
						<span className="char-add-label">Add Character</span>
					</button>
				</section>
			)}

			{/* Selected Character Detail Card */}
			{activeCharacter && (
				<section className="char-detail-card">
					<div className="char-detail-left">
						<div className="char-detail-thumb">
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img
								src={
									defaultAvatarList[
										Math.abs(
											characters.findIndex((c) => c.id === activeCharacter.id)
										) % defaultAvatarList.length
									]
								}
								alt={activeCharacter.name}
								className="char-detail-img"
							/>
						</div>

						<div className="char-detail-info">
							<div className="char-detail-header-row">
								<h2 className="char-detail-name">{activeCharacter.name}</h2>
								<div className="char-detail-badges">
									<span
										className="char-badge role"
										style={{
											backgroundColor: getRoleStyle(activeCharacter.role).bg,
											color: getRoleStyle(activeCharacter.role).text,
										}}
									>
										{activeCharacter.role || "Supporting"}
									</span>
									{activeCharacter.age && (
										<span className="char-badge age">
											Age: {activeCharacter.age}
										</span>
									)}
								</div>
							</div>

							<p className="char-detail-desc">
								{activeCharacter.description ||
									activeCharacter.background ||
									"No detailed biography added for this character yet."}
							</p>

							{/* Key Traits & Psychology */}
							<div
								style={{
									display: "grid",
									gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
									gap: "12px",
									marginTop: "16px",
									paddingTop: "14px",
									borderTop: "1px solid #f1f5f9",
								}}
							>
								{activeCharacter.personality && (
									<div>
										<span style={{ fontSize: "11.5px", fontWeight: "700", textTransform: "uppercase", color: "#64748b" }}>
											Personality
										</span>
										<p style={{ fontSize: "13px", color: "#334155", margin: "2px 0 0" }}>
											{activeCharacter.personality}
										</p>
									</div>
								)}
								{activeCharacter.goals && (
									<div>
										<span style={{ fontSize: "11.5px", fontWeight: "700", textTransform: "uppercase", color: "#64748b" }}>
											Dramatic Goal
										</span>
										<p style={{ fontSize: "13px", color: "#334155", margin: "2px 0 0" }}>
											{activeCharacter.goals}
										</p>
									</div>
								)}
								{activeCharacter.fears && (
									<div>
										<span style={{ fontSize: "11.5px", fontWeight: "700", textTransform: "uppercase", color: "#64748b" }}>
											Deepest Fear
										</span>
										<p style={{ fontSize: "13px", color: "#334155", margin: "2px 0 0" }}>
											{activeCharacter.fears}
										</p>
									</div>
								)}
								{activeCharacter.characterArc && (
									<div>
										<span style={{ fontSize: "11.5px", fontWeight: "700", textTransform: "uppercase", color: "#64748b" }}>
											Character Arc
										</span>
										<p style={{ fontSize: "13px", color: "#334155", margin: "2px 0 0" }}>
											{activeCharacter.characterArc}
										</p>
									</div>
								)}
							</div>
						</div>
					</div>

					<div className="char-detail-actions" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
						<button
							type="button"
							className="char-btn-edit"
							onClick={() => handleOpenEditModal(activeCharacter)}
						>
							<FiEdit size={14} />
							<span>Edit</span>
						</button>
						<button
							type="button"
							onClick={() => setCharToDelete(activeCharacter)}
							style={{
								display: "inline-flex",
								alignItems: "center",
								gap: "6px",
								padding: "6px 12px",
								borderRadius: "6px",
								background: "transparent",
								border: "1px solid #fee2e2",
								color: "#dc2626",
								fontSize: "12.5px",
								fontWeight: "600",
								cursor: "pointer",
							}}
						>
							<FiTrash2 size={13} />
							<span>Delete</span>
						</button>
					</div>
				</section>
			)}

			{/* Navigation Footer */}
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					marginTop: "28px",
					paddingTop: "20px",
					borderTop: "1px solid #f1f5f9",
				}}
			>
				<Link
					href={`/movies/${movieId}/story`}
					style={{
						display: "inline-flex",
						alignItems: "center",
						gap: "6px",
						padding: "10px 20px",
						borderRadius: "20px",
						background: "#f8fafc",
						border: "1px solid #e2e8f0",
						color: "#475569",
						fontSize: "13.5px",
						fontWeight: "600",
						textDecoration: "none",
					}}
				>
					<span>←</span>
					<span>Back to Story</span>
				</Link>

				<Link
					href={`/movies/${movieId}/outline`}
					style={{
						display: "inline-flex",
						alignItems: "center",
						gap: "6px",
						padding: "10px 24px",
						borderRadius: "20px",
						background: "#f59e0b",
						color: "#111827",
						fontSize: "13.5px",
						fontWeight: "650",
						textDecoration: "none",
						boxShadow: "0 2px 10px rgba(245, 158, 11, 0.25)",
					}}
				>
					<span>Continue to Outline</span>
					<FiArrowRight size={14} />
				</Link>
			</div>

			{/* Add / Edit Character Modal */}
			{isModalOpen && (
				<div
					className="char-modal-backdrop"
					onClick={() => setIsModalOpen(false)}
				>
					<div
						className="char-modal-content"
						onClick={(e) => e.stopPropagation()}
						style={{ maxWidth: "560px" }}
					>
						<h3 className="char-modal-title">
							{editingCharacter ? `Edit Character: ${editingCharacter.name}` : "Create New Character"}
						</h3>

						{actionError && (
							<div
								style={{
									padding: "10px 14px",
									background: "#fef2f2",
									border: "1px solid #fecaca",
									color: "#dc2626",
									borderRadius: "8px",
									fontSize: "13px",
									marginBottom: "16px",
								}}
							>
								{actionError}
							</div>
						)}

						<form onSubmit={handleSubmitForm} className="char-modal-form">
							<div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px" }}>
								<div className="char-modal-field">
									<label className="char-modal-label">Character Name *</label>
									<input
										type="text"
										placeholder="e.g. Eric Rutaganda"
										value={name}
										onChange={(e) => setName(e.target.value)}
										className="char-modal-input"
										required
									/>
								</div>

								<div className="char-modal-field">
									<label className="char-modal-label">Age</label>
									<input
										type="text"
										placeholder="e.g. 24"
										value={age}
										onChange={(e) => setAge(e.target.value)}
										className="char-modal-input"
									/>
								</div>
							</div>

							<div className="char-modal-field">
								<label className="char-modal-label">Dramatic Role</label>
								<select
									value={role}
									onChange={(e) => setRole(e.target.value)}
									className="char-modal-select"
								>
									<option value="Protagonist">Protagonist</option>
									<option value="Antagonist">Antagonist</option>
									<option value="Supporting">Supporting</option>
									<option value="Mentor">Mentor</option>
									<option value="Friend">Friend</option>
									<option value="Other">Other</option>
								</select>
							</div>

							<div className="char-modal-field">
								<label className="char-modal-label">Biography &amp; Background</label>
								<textarea
									placeholder="Describe who this character is and where they come from..."
									value={bio}
									onChange={(e) => setBio(e.target.value)}
									className="char-modal-textarea"
									rows={3}
								/>
							</div>

							<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
								<div className="char-modal-field">
									<label className="char-modal-label">Personality / Traits</label>
									<input
										type="text"
										placeholder="e.g. Analytical, cautious"
										value={personality}
										onChange={(e) => setPersonality(e.target.value)}
										className="char-modal-input"
									/>
								</div>

								<div className="char-modal-field">
									<label className="char-modal-label">Dramatic Goal</label>
									<input
										type="text"
										placeholder="e.g. Expose the broadcast"
										value={goals}
										onChange={(e) => setGoals(e.target.value)}
										className="char-modal-input"
									/>
								</div>
							</div>

							<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
								<div className="char-modal-field">
									<label className="char-modal-label">Deepest Fear</label>
									<input
										type="text"
										placeholder="e.g. Failure, betrayal"
										value={fears}
										onChange={(e) => setFears(e.target.value)}
										className="char-modal-input"
									/>
								</div>

								<div className="char-modal-field">
									<label className="char-modal-label">Character Arc</label>
									<input
										type="text"
										placeholder="e.g. From passive to leader"
										value={characterArc}
										onChange={(e) => setCharacterArc(e.target.value)}
										className="char-modal-input"
									/>
								</div>
							</div>

							<div className="char-modal-actions">
								<button
									type="button"
									className="char-modal-btn-cancel"
									onClick={() => setIsModalOpen(false)}
									disabled={isSubmitting}
								>
									Cancel
								</button>
								<button
									type="submit"
									className="char-modal-btn-save"
									disabled={isSubmitting}
								>
									{isSubmitting ? "Saving..." : editingCharacter ? "Update Character" : "Save Character"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Delete Confirmation Modal */}
			<Modal
				isOpen={!!charToDelete}
				title="Delete Character"
				onClose={() => setCharToDelete(null)}
			>
				<p style={{ color: "#475569", fontSize: "14px", lineHeight: "1.6" }}>
					Are you sure you want to delete <strong>{charToDelete?.name}</strong> from your cast? This action removes their dossier and dialogue references.
				</p>
				<div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
					<button
						type="button"
						onClick={() => setCharToDelete(null)}
						style={{
							padding: "8px 16px",
							background: "#f1f5f9",
							border: "1px solid #cbd5e1",
							borderRadius: "8px",
							color: "#475569",
							fontWeight: "600",
							fontSize: "13px",
							cursor: "pointer",
						}}
					>
						Cancel
					</button>
					<button
						type="button"
						onClick={handleConfirmDelete}
						disabled={isDeleting}
						style={{
							padding: "8px 18px",
							background: "#dc2626",
							border: "none",
							borderRadius: "8px",
							color: "#ffffff",
							fontWeight: "600",
							fontSize: "13px",
							cursor: isDeleting ? "not-allowed" : "pointer",
						}}
					>
						{isDeleting ? "Deleting..." : "Delete Character"}
					</button>
				</div>
			</Modal>
		</div>
	);
}

