"use client";

import { useState } from "react";
import Link from "next/link";
import { FiEdit } from "react-icons/fi";

const initialCharacters = [
	{
		id: "eric",
		name: "Eric",
		role: "Main Character",
		roleColor: "#d97706",
		roleBadgeBg: "#fef3c7",
		roleBadgeColor: "#92400e",
		age: "Age: 24",
		oneLiner: "A talented developer.",
		bio: "A curious and determined developer.",
		image: "/images/char-eric.jpg",
		detailImage: "/images/char-eric-detail.jpg",
	},
	{
		id: "sarah",
		name: "Sarah",
		role: "Supporting",
		roleColor: "#dc2626",
		roleBadgeBg: "#fee2e2",
		roleBadgeColor: "#991b1b",
		age: "Age: 27",
		oneLiner: "A brave journalist.",
		bio: "A fearless investigative journalist pursuing the network's secrets.",
		image: "/images/char-sarah.jpg",
		detailImage: "/images/char-sarah.jpg",
	},
	{
		id: "david",
		name: "David",
		role: "Antagonist",
		roleColor: "#dc2626",
		roleBadgeBg: "#fee2e2",
		roleBadgeColor: "#991b1b",
		age: "Age: 48",
		oneLiner: "A powerful rival.",
		bio: "A powerful executive and ruthless rival protecting his empire at any cost.",
		image: "/images/char-david.jpg",
		detailImage: "/images/char-david.jpg",
	},
];

export default function CharactersPage() {
	const [charactersList, setCharactersList] = useState(initialCharacters);
	const [selectedId, setSelectedId] = useState("eric");
	const [showAddModal, setShowAddModal] = useState(false);
	const [newCharName, setNewCharName] = useState("");
	const [newCharRole, setNewCharRole] = useState("Supporting");
	const [newCharBio, setNewCharBio] = useState("");

	const selectedCharacter =
		charactersList.find((c) => c.id === selectedId) || charactersList[0];

	const handleAddCharacter = (e: React.FormEvent) => {
		e.preventDefault();
		if (!newCharName.trim()) return;

		const newChar = {
			id: `char-${Date.now()}`,
			name: newCharName.trim(),
			role: newCharRole,
			roleColor: newCharRole === "Antagonist" ? "#dc2626" : "#2563eb",
			roleBadgeBg: newCharRole === "Antagonist" ? "#fee2e2" : "#dbeafe",
			roleBadgeColor: newCharRole === "Antagonist" ? "#991b1b" : "#1e40af",
			age: "Age: 25",
			oneLiner: newCharBio || "A newly added story character.",
			bio: newCharBio || "A newly created character ready for the screenplay.",
			image: "/images/leopold-hd.png",
			detailImage: "/images/leopold-hd.png",
		};

		setCharactersList([...charactersList, newChar]);
		setSelectedId(newChar.id);
		setNewCharName("");
		setNewCharBio("");
		setShowAddModal(false);
	};

	return (
		<div className="char-page-container">
			{/* Top Header */}
			<header className="char-header">
				<div className="char-header-left">
					<span className="char-header-eyebrow">Characters</span>
					<h1 className="char-header-title">Meet Your Characters</h1>
					<p className="char-header-subtitle">
						Every great movie starts with great characters.
					</p>
				</div>

				<div className="char-header-actions">
					<button
						type="button"
						className="char-btn-add"
						onClick={() => setShowAddModal(true)}
					>
						<span>+ Add Character</span>
					</button>

					<button
						type="button"
						className="char-btn-generate"
						onClick={() => {
							const aiChar = {
								id: `ai-${Date.now()}`,
								name: "Amina",
								role: "Ally",
								roleColor: "#059669",
								roleBadgeBg: "#d1fae5",
								roleBadgeColor: "#065f46",
								age: "Age: 26",
								oneLiner: "A covert frequency specialist.",
								bio: "An enigmatic telecom hacker with crucial decryption keys.",
								image: "/images/char-sarah.jpg",
								detailImage: "/images/char-sarah.jpg",
							};
							setCharactersList([...charactersList, aiChar]);
							setSelectedId(aiChar.id);
						}}
					>
						<span className="char-sparkle">✦</span>
						<span>Generate with AI</span>
					</button>
				</div>
			</header>

			{/* Character Cards Grid */}
			<section className="char-cards-grid">
				{charactersList.map((char) => {
					const isSelected = char.id === selectedId;
					return (
						<article
							key={char.id}
							className={`char-card${isSelected ? " selected" : ""}`}
							onClick={() => setSelectedId(char.id)}
						>
							<div className="char-card-thumb">
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img
									src={char.image}
									alt={char.name}
									className="char-card-img"
								/>
							</div>

							<div className="char-card-body">
								<h3 className="char-card-name">{char.name}</h3>
								<span
									className="char-card-role"
									style={{ color: char.roleColor }}
								>
									{char.role}
								</span>
								<p className="char-card-oneliner">{char.oneLiner}</p>
							</div>
						</article>
					);
				})}

				{/* Add More Card */}
				<button
					type="button"
					className="char-card-add-more"
					onClick={() => setShowAddModal(true)}
				>
					<span className="char-add-plus">+</span>
					<span className="char-add-label">Add More</span>
				</button>
			</section>

			{/* Selected Character Detail Card */}
			{selectedCharacter && (
				<section className="char-detail-card">
					<div className="char-detail-left">
						<div className="char-detail-thumb">
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img
								src={selectedCharacter.detailImage}
								alt={selectedCharacter.name}
								className="char-detail-img"
							/>
						</div>

						<div className="char-detail-info">
							<div className="char-detail-header-row">
								<h2 className="char-detail-name">{selectedCharacter.name}</h2>
								<div className="char-detail-badges">
									<span
										className="char-badge role"
										style={{
											backgroundColor: selectedCharacter.roleBadgeBg,
											color: selectedCharacter.roleBadgeColor,
										}}
									>
										{selectedCharacter.role}
									</span>
									<span className="char-badge age">
										{selectedCharacter.age}
									</span>
								</div>
							</div>

							<p className="char-detail-desc">{selectedCharacter.bio}</p>
						</div>
					</div>

					<div className="char-detail-actions">
						<button
							type="button"
							className="char-btn-edit"
							onClick={() => setShowAddModal(true)}
						>
							<FiEdit size={14} />
							<span>Edit</span>
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
					href="/ideas"
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
					<span>Back</span>
				</Link>

				<Link
					href="/templates"
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
					<span>→</span>
				</Link>
			</div>

			{/* Add / Edit Character Modal */}
			{showAddModal && (
				<div
					className="char-modal-backdrop"
					onClick={() => setShowAddModal(false)}
				>
					<div
						className="char-modal-content"
						onClick={(e) => e.stopPropagation()}
					>
						<h3 className="char-modal-title">Add / Edit Character</h3>

						<form onSubmit={handleAddCharacter} className="char-modal-form">
							<div className="char-modal-field">
								<label className="char-modal-label">Character Name</label>
								<input
									type="text"
									placeholder="e.g. Eric, Maya, Victor..."
									value={newCharName}
									onChange={(e) => setNewCharName(e.target.value)}
									className="char-modal-input"
									required
								/>
							</div>

							<div className="char-modal-field">
								<label className="char-modal-label">Role</label>
								<select
									value={newCharRole}
									onChange={(e) => setNewCharRole(e.target.value)}
									className="char-modal-select"
								>
									<option value="Main Character">Main Character</option>
									<option value="Supporting">Supporting</option>
									<option value="Antagonist">Antagonist</option>
									<option value="Mentor">Mentor</option>
									<option value="Ally">Ally</option>
								</select>
							</div>

							<div className="char-modal-field">
								<label className="char-modal-label">Description / Bio</label>
								<textarea
									placeholder="Describe the character's personality and motivation..."
									value={newCharBio}
									onChange={(e) => setNewCharBio(e.target.value)}
									className="char-modal-textarea"
									rows={3}
								/>
							</div>

							<div className="char-modal-actions">
								<button
									type="button"
									className="char-modal-btn-cancel"
									onClick={() => setShowAddModal(false)}
								>
									Cancel
								</button>
								<button type="submit" className="char-modal-btn-save">
									Save Character
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
