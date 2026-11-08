"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useMovie } from "../../../../hooks/useMovie";
import { MovieHeader } from "../../../../components/movie/MovieHeader";
import { ExportScreenplayView } from "../../../../components/templates/ExportScreenplayView";

export default function MovieExportPage() {
	const params = useParams();
	const movieId = typeof params?.movieId === "string" ? params.movieId : "";

	const { movie, isLoading, error, isNotFound, isUnauthorized, updateMovie, deleteMovie } =
		useMovie(movieId);

	if (isLoading) {
		return (
			<div style={{ padding: "48px 36px", maxWidth: "1220px", margin: "0 auto" }}>
				<div
					style={{
						height: "70px",
						background: "#f1f5f9",
						borderRadius: "12px",
						marginBottom: "24px",
						animation: "pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
					}}
				/>
			</div>
		);
	}

	if (isNotFound || isUnauthorized || error || !movie) {
		return (
			<div style={{ maxWidth: "600px", margin: "80px auto", textAlign: "center", padding: "48px 24px" }}>
				<h2 style={{ fontSize: "20px", fontWeight: "700", color: "#0f172a" }}>Movie Not Found</h2>
				<p style={{ color: "#64748b", margin: "8px 0 20px" }}>The requested movie project could not be found or accessed.</p>
				<Link href="/movies" style={{ color: "#d97706", fontWeight: "600" }}>← Return to My Movies</Link>
			</div>
		);
	}

	return (
		<div>
			<MovieHeader
				movie={movie}
				activeTab="export"
				onUpdate={updateMovie}
				onDelete={deleteMovie}
			/>
			<ExportScreenplayView movieId={movie.id} movieTitle={movie.title} />
		</div>
	);
}
