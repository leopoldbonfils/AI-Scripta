"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "../ui/Modal";
import { useMovies } from "../../hooks/useMovies";
import { CreativeAnalysisResult } from "../../types/analysis";
import { FiFilm, FiPlus, FiCheckCircle } from "react-icons/fi";

export interface AssociateMovieModalProps {
	isOpen: boolean;
	onClose: () => void;
	analysis: CreativeAnalysisResult;
	onLinkToMovie: (movieId: string) => Promise<void>;
}

export function AssociateMovieModal({
	isOpen,
	onClose,
	analysis,
	onLinkToMovie,
}: AssociateMovieModalProps) {
	const router = useRouter();
	const { movies, isLoading } = useMovies();
	const [selectedMovieId, setSelectedMovieId] = useState<string>("");
	const [isLinking, setIsLinking] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleLink = async () => {
		if (!selectedMovieId || isLinking) return;
		setIsLinking(true);
		setError(null);
		try {
			await onLinkToMovie(selectedMovieId);
			onClose();
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : "Failed to link analysis to movie");
		} finally {
			setIsLinking(false);
		}
	};

	const handleStartNewMovie = () => {
		onClose();
		const params = new URLSearchParams({
			title: analysis.title || "",
			idea: analysis.logline || analysis.storyConcept || "",
			genre: analysis.genre?.primary || "Drama",
		});
		router.push(`/create?${params.toString()}`);
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Associate Analysis with Movie Project"
			maxWidth="520px"
			footer={
				<div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", width: "100%" }}>
					<button
						type="button"
						onClick={onClose}
						disabled={isLinking}
						style={{
							padding: "8px 16px",
							borderRadius: "6px",
							border: "1px solid #cbd5e1",
							backgroundColor: "#f8fafc",
							color: "#475569",
							fontSize: "13px",
							fontWeight: 500,
							cursor: "pointer",
						}}
					>
						Cancel
					</button>
					<button
						type="button"
						onClick={handleLink}
						disabled={!selectedMovieId || isLinking}
						style={{
							padding: "8px 18px",
							borderRadius: "6px",
							backgroundColor: !selectedMovieId || isLinking ? "#cbd5e1" : "#d97706",
							color: "#ffffff",
							fontSize: "13px",
							fontWeight: 600,
							border: "none",
							cursor: !selectedMovieId || isLinking ? "not-allowed" : "pointer",
						}}
					>
						{isLinking ? "Linking..." : "Link to Selected Movie"}
					</button>
				</div>
			}
		>
			<div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
				<p style={{ fontSize: "13px", color: "#475569", margin: 0 }}>
					Connect this analysis to an existing project so it appears in the movie&apos;s analysis tab, or launch a new movie with these findings.
				</p>

				{/* Option 1: Existing movie dropdown */}
				<div>
					<label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
						Select Existing Project:
					</label>
					{isLoading ? (
						<p style={{ fontSize: "12px", color: "#94a3b8" }}>Loading your movies...</p>
					) : movies.length === 0 ? (
						<p style={{ fontSize: "12px", color: "#94a3b8" }}>No movie projects found.</p>
					) : (
						<select
							value={selectedMovieId}
							onChange={(e) => setSelectedMovieId(e.target.value)}
							style={{
								width: "100%",
								padding: "9px 12px",
								borderRadius: "6px",
								border: "1px solid #cbd5e1",
								fontSize: "13px",
								color: "#0f172a",
								backgroundColor: "#ffffff",
							}}
						>
							<option value="">-- Choose a project --</option>
							{movies.map((m) => (
								<option key={m.id} value={m.id}>
									{m.title} ({m.genre || "Drama"})
								</option>
							))}
						</select>
					)}
				</div>

				{/* Divider */}
				<div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "4px 0" }}>
					<hr style={{ flex: 1, border: "none", borderTop: "1px solid #e2e8f0" }} />
					<span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>OR</span>
					<hr style={{ flex: 1, border: "none", borderTop: "1px solid #e2e8f0" }} />
				</div>

				{/* Option 2: Create new movie */}
				<button
					type="button"
					onClick={handleStartNewMovie}
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						gap: "8px",
						padding: "10px 14px",
						borderRadius: "8px",
						border: "1px dashed #d97706",
						backgroundColor: "#fffbeb",
						color: "#92400e",
						fontSize: "13px",
						fontWeight: 600,
						cursor: "pointer",
					}}
				>
					<FiPlus size={16} />
					<span>Create New Movie from this Analysis</span>
				</button>

				{error && (
					<p style={{ margin: 0, fontSize: "12px", color: "#dc2626" }}>{error}</p>
				)}
			</div>
		</Modal>
	);
}

