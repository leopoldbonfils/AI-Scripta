"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useMovie } from "../../../../hooks/useMovie";
import { MovieHeader } from "../../../../components/movie/MovieHeader";
import { ScreenplayGenerationWorkspace } from "../../../../components/screenplayGeneration/ScreenplayGenerationWorkspace";
import { AILoading } from "../../../../components/ai/AILoading";
import { FiAlertCircle } from "react-icons/fi";

export default function MovieScreenplayGeneratePage() {
	const params = useParams();
	const movieId = typeof params?.movieId === "string" ? params.movieId : "";
	const { movie, isLoading, error, updateMovie, deleteMovie } = useMovie(movieId);

	if (isLoading) {
		return (
			<div style={{ padding: "48px 36px", maxWidth: "1220px", margin: "0 auto" }}>
				<AILoading label="Loading movie project..." size="md" />
			</div>
		);
	}

	if (!movie) {
		return (
			<div style={{ maxWidth: "600px", margin: "80px auto", textAlign: "center", padding: "48px 24px" }}>
				<FiAlertCircle size={36} color="#dc2626" />
				<h2 style={{ fontSize: "20px", fontWeight: "700", marginTop: "12px" }}>Movie Not Found</h2>
				<p style={{ color: "#64748b", fontSize: "14px", marginBottom: "20px" }}>
					{error || "Could not load movie project."}
				</p>
				<Link href="/movies" style={{ color: "#d97706", fontWeight: 600 }}>
					Back to My Movies
				</Link>
			</div>
		);
	}

	return (
		<div style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
			<MovieHeader
				movie={movie}
				activeTab="generate"
				onUpdate={updateMovie}
				onDelete={deleteMovie}
			/>
			<div style={{ maxWidth: "1220px", margin: "0 auto", padding: "clamp(14px, 3vw, 24px) clamp(14px, 4vw, 36px) 60px" }}>
				<ScreenplayGenerationWorkspace movieId={movie.id} movieTitle={movie.title} />
			</div>
		</div>
	);
}

