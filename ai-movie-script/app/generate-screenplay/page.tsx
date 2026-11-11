"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useMovies } from "../../hooks/useMovies";
import { ScreenplayGenerationWorkspace } from "../../components/screenplayGeneration/ScreenplayGenerationWorkspace";
import { AILoading } from "../../components/ai/AILoading";
import { FiFilm } from "react-icons/fi";
import { FaClapperboard } from "react-icons/fa6";

export default function StandaloneGenerateScreenplayPage() {
	const { movies, isLoading } = useMovies();
	const [selectedMovieId, setSelectedMovieId] = useState<string>("");

	const activeMovieId = selectedMovieId || (movies.length > 0 ? movies[0].id : "");
	const activeMovie = movies.find((m) => m.id === activeMovieId);

	return (
		<div style={{ maxWidth: "1220px", margin: "0 auto", padding: "28px 24px 60px" }}>
			<div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
				<div>
					<div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#d97706", marginBottom: "4px" }}>
						<FaClapperboard size={18} />
						<span style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
							Multi-Stage OpenAI Pipeline (Phase E)
						</span>
					</div>
					<h1 style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
						Complete Screenplay Generation
					</h1>
					<p style={{ color: "#64748b", fontSize: "14px", marginTop: "4px" }}>
						Generate structured Acts, Act-by-Act scenes, and a continuity-validated formatted movie screenplay with pause, resume, manual edit protection, and non-destructive editor saving.
					</p>
				</div>

				{movies.length > 0 && (
					<div>
						<label style={{ display: "block", fontSize: "11.5px", fontWeight: 700, color: "#475569", marginBottom: "4px" }}>
							Select Movie Project
						</label>
						<select
							value={activeMovieId}
							onChange={(e) => setSelectedMovieId(e.target.value)}
							style={{ padding: "8px 14px", fontSize: "13.5px", fontWeight: 600, borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: "#ffffff", color: "#0f172a" }}
						>
							{movies.map((m) => (
								<option key={m.id} value={m.id}>
									{m.title}
								</option>
							))}
						</select>
					</div>
				)}
			</div>

			{isLoading ? (
				<div style={{ padding: "60px 24px", backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
					<AILoading label="Loading your movie projects..." size="md" />
				</div>
			) : !activeMovieId ? (
				<div style={{ padding: "48px 24px", backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", textAlign: "center" }}>
					<FiFilm size={32} color="#94a3b8" />
					<h3 style={{ margin: "12px 0 6px", color: "#0f172a" }}>No Movie Projects Found</h3>
					<p style={{ color: "#64748b", fontSize: "13.5px", marginBottom: "16px" }}>
						Create a movie project first before generating a complete screenplay.
					</p>
					<Link
						href="/create"
						style={{ padding: "10px 20px", backgroundColor: "#d97706", color: "#fff", borderRadius: "8px", fontWeight: 600, textDecoration: "none", fontSize: "13px" }}
					>
						Create Movie Project
					</Link>
				</div>
			) : (
				<ScreenplayGenerationWorkspace movieId={activeMovieId} movieTitle={activeMovie?.title} />
			)}
		</div>
	);
}

