"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Movie, UpdateMovieInput } from "../../types/movie";
import { Modal } from "../ui/Modal";
import {
	FiArrowLeft,
	FiEdit3,
	FiTrash2,
	FiClock,
	FiCheckCircle,
	FiFilm,
	FiLayers,
	FiUsers,
	FiFileText,
	FiDownload,
	FiCompass,
	FiCpu,
	FiBook,
	FiPlay,
} from "react-icons/fi";

interface MovieHeaderProps {
	movie: Movie;
	activeTab?: "outline" | "screenplay" | "export" | "story" | "characters" | "analysis" | "intelligence" | "story-bible" | "generate";
	onUpdate?: (data: UpdateMovieInput) => Promise<Movie>;
	onDelete?: () => Promise<void>;
}

export function MovieHeader({
	movie,
	activeTab = "screenplay",
	onUpdate,
	onDelete,
}: MovieHeaderProps) {
	const router = useRouter();
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [editTitle, setEditTitle] = useState(movie.title);
	const [editGenre, setEditGenre] = useState(movie.genre || "");
	const [editTone, setEditTone] = useState(movie.tone || "");
	const [editDescription, setEditDescription] = useState(movie.description || "");
	const [isSaving, setIsSaving] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [modalError, setModalError] = useState<string | null>(null);

	const handleSaveEdit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!editTitle.trim()) {
			setModalError("Movie title cannot be empty.");
			return;
		}

		if (!onUpdate) return;

		setIsSaving(true);
		setModalError(null);
		try {
			await onUpdate({
				title: editTitle.trim(),
				genre: editGenre.trim() || undefined,
				tone: editTone.trim() || undefined,
				description: editDescription.trim() || undefined,
			});
			setIsEditModalOpen(false);
		} catch (err: unknown) {
			setModalError(err instanceof Error ? err.message : "Failed to update movie details");
		} finally {
			setIsSaving(false);
		}
	};

	const handleDelete = async () => {
		if (!onDelete) return;
		setIsDeleting(true);
		setModalError(null);
		try {
			await onDelete();
			router.push("/movies");
		} catch (err: unknown) {
			setModalError(err instanceof Error ? err.message : "Failed to delete movie project");
			setIsDeleting(false);
		}
	};

	const progress = movie.progress ?? (movie.status === "COMPLETED" ? 100 : 25);

	const tabs = [
		{ id: "analysis", label: "Story Analysis", href: `/movies/${movie.id}/analysis`, icon: FiCompass },
		{ id: "intelligence", label: "Story Intelligence", href: `/movies/${movie.id}/intelligence`, icon: FiCpu },
		{ id: "story-bible", label: "Story Bible", href: `/movies/${movie.id}/story-bible`, icon: FiBook },
		{ id: "story", label: "Story Concept", href: `/movies/${movie.id}/story`, icon: FiFilm },
		{ id: "characters", label: "Characters", href: `/movies/${movie.id}/characters`, icon: FiUsers },
		{ id: "outline", label: "Story Outline", href: `/movies/${movie.id}/outline`, icon: FiLayers },
		{ id: "generate", label: "Generate Script", href: `/movies/${movie.id}/generate`, icon: FiPlay },
		{ id: "screenplay", label: "Screenplay Editor", href: `/movies/${movie.id}/screenplay`, icon: FiFileText },
		{ id: "export", label: "Export Script", href: `/movies/${movie.id}/export`, icon: FiDownload },
	] as const;

	return (
		<header
			style={{
				background: "#ffffff",
				borderBottom: "1px solid #e2e8f0",
				padding: "16px 36px 0",
				marginBottom: "20px",
			}}
		>
			{/* Top Bar: Back link, Title, Edit, Delete */}
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					flexWrap: "wrap",
					gap: "12px",
					marginBottom: "14px",
				}}
			>
				<div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
					<Link
						href="/movies"
						style={{
							display: "flex",
							alignItems: "center",
							gap: "6px",
							color: "#64748b",
							fontSize: "13px",
							fontWeight: "600",
							textDecoration: "none",
							padding: "6px 10px",
							borderRadius: "8px",
							background: "#f8fafc",
							border: "1px solid #e2e8f0",
						}}
					>
						<FiArrowLeft size={14} />
						<span>My Movies</span>
					</Link>

					<div>
						<h1
							style={{
								fontSize: "22px",
								fontWeight: "800",
								color: "#0f172a",
								margin: "0 0 2px",
								letterSpacing: "-0.02em",
							}}
						>
							{movie.title}
						</h1>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: "8px",
								fontSize: "12px",
								color: "#64748b",
							}}
						>
							{movie.genre && (
								<span
									style={{
										background: "#f1f5f9",
										color: "#334155",
										padding: "2px 8px",
										borderRadius: "10px",
										fontWeight: "600",
									}}
								>
									{movie.genre}
								</span>
							)}
							{movie.tone && (
								<span style={{ color: "#94a3b8" }}>• {movie.tone}</span>
							)}
							<span style={{ color: "#94a3b8" }}>• Status: {movie.status}</span>
						</div>
					</div>
				</div>

				{/* Header Actions */}
				<div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
					{/* Progress Pill */}
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: "8px",
							background: "#f8fafc",
							border: "1px solid #e2e8f0",
							padding: "6px 14px",
							borderRadius: "20px",
							fontSize: "12px",
							fontWeight: "600",
							color: "#0f172a",
						}}
					>
						<span>Progress: {progress}%</span>
						<div
							style={{
								width: "48px",
								height: "6px",
								background: "#e2e8f0",
								borderRadius: "3px",
								overflow: "hidden",
							}}
						>
							<div
								style={{
									width: `${progress}%`,
									height: "100%",
									background: "#f59e0b",
								}}
							/>
						</div>
					</div>

					{/* Edit Button */}
					<button
						type="button"
						onClick={() => setIsEditModalOpen(true)}
						style={{
							display: "flex",
							alignItems: "center",
							gap: "6px",
							padding: "7px 12px",
							borderRadius: "8px",
							background: "#ffffff",
							border: "1px solid #cbd5e1",
							color: "#334155",
							fontSize: "13px",
							fontWeight: "600",
							cursor: "pointer",
						}}
					>
						<FiEdit3 size={14} />
						<span>Edit</span>
					</button>

					{/* Delete Button */}
					<button
						type="button"
						onClick={() => setIsDeleteModalOpen(true)}
						style={{
							display: "flex",
							alignItems: "center",
							gap: "6px",
							padding: "7px 12px",
							borderRadius: "8px",
							background: "#ffffff",
							border: "1px solid #fecaca",
							color: "#dc2626",
							fontSize: "13px",
							fontWeight: "600",
							cursor: "pointer",
						}}
					>
						<FiTrash2 size={14} />
						<span>Delete</span>
					</button>
				</div>
			</div>

			{/* Sub Navigation Tabs */}
			<nav
				style={{
					display: "flex",
					gap: "24px",
					borderTop: "1px solid #f1f5f9",
					paddingTop: "2px",
				}}
			>
				{tabs.map((tab) => {
					const isActive = activeTab === tab.id;
					const Icon = tab.icon;
					return (
						<Link
							key={tab.id}
							href={tab.href}
							style={{
								display: "inline-flex",
								alignItems: "center",
								gap: "6px",
								padding: "10px 4px",
								fontSize: "13.5px",
								fontWeight: isActive ? "700" : "500",
								color: isActive ? "#d97706" : "#64748b",
								borderBottom: isActive ? "2px solid #d97706" : "2px solid transparent",
								textDecoration: "none",
								transition: "all 0.15s ease",
							}}
						>
							<Icon size={15} />
							<span>{tab.label}</span>
						</Link>
					);
				})}
			</nav>

			{/* Edit Movie Details Modal */}
			<Modal
				isOpen={isEditModalOpen}
				onClose={() => {
					if (!isSaving) setIsEditModalOpen(false);
				}}
				title="Edit Movie Project"
				footer={
					<>
						<button
							type="button"
							onClick={() => setIsEditModalOpen(false)}
							disabled={isSaving}
							style={{
								padding: "8px 16px",
								borderRadius: "8px",
								border: "1px solid #cbd5e1",
								background: "#ffffff",
								color: "#475569",
								fontWeight: "600",
								cursor: isSaving ? "not-allowed" : "pointer",
							}}
						>
							Cancel
						</button>
						<button
							type="button"
							onClick={handleSaveEdit}
							disabled={isSaving}
							style={{
								padding: "8px 16px",
								borderRadius: "8px",
								border: "none",
								background: "#f59e0b",
								color: "#ffffff",
								fontWeight: "600",
								cursor: isSaving ? "not-allowed" : "pointer",
							}}
						>
							{isSaving ? "Saving..." : "Save Changes"}
						</button>
					</>
				}
			>
				{modalError && (
					<div
						style={{
							background: "#fef2f2",
							color: "#b91c1c",
							padding: "10px",
							borderRadius: "8px",
							marginBottom: "12px",
							fontSize: "13px",
						}}
					>
						{modalError}
					</div>
				)}
				<form onSubmit={handleSaveEdit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
					<div>
						<label
							style={{
								display: "block",
								fontSize: "13px",
								fontWeight: "600",
								color: "#0f172a",
								marginBottom: "4px",
							}}
						>
							Title
						</label>
						<input
							type="text"
							value={editTitle}
							onChange={(e) => setEditTitle(e.target.value)}
							style={{
								width: "100%",
								padding: "9px 12px",
								border: "1px solid #cbd5e1",
								borderRadius: "8px",
								fontSize: "14px",
							}}
							required
						/>
					</div>

					<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
						<div>
							<label
								style={{
									display: "block",
									fontSize: "13px",
									fontWeight: "600",
									color: "#0f172a",
									marginBottom: "4px",
								}}
							>
								Genre
							</label>
							<input
								type="text"
								value={editGenre}
								onChange={(e) => setEditGenre(e.target.value)}
								placeholder="e.g. Sci-Fi, Drama"
								style={{
									width: "100%",
									padding: "9px 12px",
									border: "1px solid #cbd5e1",
									borderRadius: "8px",
									fontSize: "14px",
								}}
							/>
						</div>
						<div>
							<label
								style={{
									display: "block",
									fontSize: "13px",
									fontWeight: "600",
									color: "#0f172a",
									marginBottom: "4px",
								}}
							>
								Tone / Mood
							</label>
							<input
								type="text"
								value={editTone}
								onChange={(e) => setEditTone(e.target.value)}
								placeholder="e.g. Suspenseful"
								style={{
									width: "100%",
									padding: "9px 12px",
									border: "1px solid #cbd5e1",
									borderRadius: "8px",
									fontSize: "14px",
								}}
							/>
						</div>
					</div>

					<div>
						<label
							style={{
								display: "block",
								fontSize: "13px",
								fontWeight: "600",
								color: "#0f172a",
								marginBottom: "4px",
							}}
						>
							Description / Logline
						</label>
						<textarea
							rows={3}
							value={editDescription}
							onChange={(e) => setEditDescription(e.target.value)}
							style={{
								width: "100%",
								padding: "9px 12px",
								border: "1px solid #cbd5e1",
								borderRadius: "8px",
								fontSize: "14px",
								fontFamily: "inherit",
							}}
						/>
					</div>
				</form>
			</Modal>

			{/* Delete Confirmation Modal */}
			<Modal
				isOpen={isDeleteModalOpen}
				onClose={() => {
					if (!isDeleting) setIsDeleteModalOpen(false);
				}}
				title="Delete Movie Project"
				footer={
					<>
						<button
							type="button"
							onClick={() => setIsDeleteModalOpen(false)}
							disabled={isDeleting}
							style={{
								padding: "8px 16px",
								borderRadius: "8px",
								border: "1px solid #cbd5e1",
								background: "#ffffff",
								color: "#475569",
								fontWeight: "600",
								cursor: isDeleting ? "not-allowed" : "pointer",
							}}
						>
							Cancel
						</button>
						<button
							type="button"
							onClick={handleDelete}
							disabled={isDeleting}
							style={{
								padding: "8px 16px",
								borderRadius: "8px",
								border: "none",
								background: "#ef4444",
								color: "#ffffff",
								fontWeight: "600",
								cursor: isDeleting ? "not-allowed" : "pointer",
							}}
						>
							{isDeleting ? "Deleting..." : "Delete Permanently"}
						</button>
					</>
				}
			>
				{modalError && (
					<div
						style={{
							background: "#fef2f2",
							color: "#b91c1c",
							padding: "10px",
							borderRadius: "8px",
							marginBottom: "12px",
							fontSize: "13px",
						}}
					>
						{modalError}
					</div>
				)}
				<p style={{ margin: 0 }}>
					Are you sure you want to delete <strong>{movie.title}</strong>? All associated
					screenplays, story acts, and scenes will be removed permanently from the database.
				</p>
			</Modal>
		</header>
	);
}

