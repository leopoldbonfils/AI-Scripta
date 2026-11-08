"use client";

import { useState } from "react";
import Link from "next/link";
import { useMovies } from "../../hooks/useMovies";
import { CharacterWorkspace } from "../../components/characters/CharacterWorkspace";
import { FiFilm, FiPlus } from "react-icons/fi";

export default function CharactersRootPage() {
	const { movies, isLoading } = useMovies({ autoFetch: true });
	const [selectedMovieId, setSelectedMovieId] = useState<string | null>(null);

	const activeMovie =
		movies.find((m) => m.id === selectedMovieId) || movies[0] || null;

	if (isLoading) {
		return (
			<div style={{ maxWidth: "1220px", margin: "40px auto", padding: "0 24px", color: "#64748b" }}>
				<div style={{ height: "48px", background: "#f1f5f9", borderRadius: "10px", marginBottom: "20px" }} />
				<div style={{ height: "350px", background: "#f8fafc", borderRadius: "14px", border: "1px solid #e2e8f0" }} />
			</div>
		);
	}

	if (movies.length === 0) {
		return (
			<div
				style={{
					maxWidth: "600px",
					margin: "80px auto",
					textAlign: "center",
					padding: "48px 24px",
					background: "#ffffff",
					borderRadius: "16px",
					border: "1px solid #e2e8f0",
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
					<FiFilm size={24} />
				</div>
				<h2 style={{ fontSize: "20px", fontWeight: "700", color: "#0f172a", margin: "0 0 8px" }}>
					No Movie Project Selected
				</h2>
				<p style={{ color: "#64748b", fontSize: "14px", marginBottom: "24px", lineHeight: "1.6" }}>
					Characters belong to a specific movie project. Create a movie or open an existing project to build your cast.
				</p>
				<Link
					href="/create"
					style={{
						display: "inline-flex",
						alignItems: "center",
						gap: "8px",
						background: "#f59e0b",
						color: "#ffffff",
						padding: "10px 22px",
						borderRadius: "20px",
						fontWeight: "600",
						textDecoration: "none",
					}}
				>
					<FiPlus size={16} />
					<span>Create New Movie</span>
				</Link>
			</div>
		);
	}

	return (
		<div style={{ maxWidth: "1220px", margin: "0 auto", padding: "24px 24px 60px" }}>
			{/* Project Selector bar if multiple movies */}
			{movies.length > 1 && (
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: "12px",
						marginBottom: "20px",
						padding: "10px 16px",
						background: "#ffffff",
						borderRadius: "12px",
						border: "1px solid #e2e8f0",
					}}
				>
					<span style={{ fontSize: "13px", fontWeight: "600", color: "#64748b" }}>Active Movie:</span>
					<select
						value={activeMovie?.id || ""}
						onChange={(e) => setSelectedMovieId(e.target.value)}
						style={{
							padding: "6px 12px",
							borderRadius: "8px",
							border: "1px solid #cbd5e1",
							fontSize: "13.5px",
							fontWeight: "600",
							color: "#0f172a",
							background: "#f8fafc",
							outline: "none",
							cursor: "pointer",
						}}
					>
						{movies.map((m) => (
							<option key={m.id} value={m.id}>
								{m.title} ({m.genre || "Drama"})
							</option>
						))}
					</select>
				</div>
			)}

			{activeMovie && (
				<CharacterWorkspace movieId={activeMovie.id} movieTitle={activeMovie.title} />
			)}
		</div>
	);
}
