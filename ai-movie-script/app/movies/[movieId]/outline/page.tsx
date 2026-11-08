"use client";

import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useMovie } from "../../../../hooks/useMovie";
import { MovieHeader } from "../../../../components/movie/MovieHeader";
import { StoryOutlineView } from "../../../../components/templates/StoryOutlineView";
import { FiAlertCircle, FiFilm, FiArrowLeft, FiLock } from "react-icons/fi";

export default function MovieOutlinePage() {
	const router = useRouter();
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
				<div
					style={{
						height: "400px",
						background: "#f8fafc",
						borderRadius: "14px",
						border: "1px solid #e2e8f0",
						animation: "pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
					}}
				/>
			</div>
		);
	}

	if (isNotFound) {
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
				<h2 style={{ fontSize: "20px", fontWeight: "700", color: "#0f172a", margin: "0 0 8px" }}>
					Movie Project Not Found
				</h2>
				<p style={{ color: "#64748b", fontSize: "14px", marginBottom: "20px" }}>
					The project ID was not found in your database.
				</p>
				<Link href="/movies" style={{ color: "#d97706", fontWeight: "600" }}>
					← Return to My Movies
				</Link>
			</div>
		);
	}

	if (isUnauthorized) {
		return (
			<div
				style={{
					maxWidth: "600px",
					margin: "80px auto",
					textAlign: "center",
					padding: "48px 24px",
					background: "#ffffff",
					borderRadius: "16px",
					border: "1px solid #fee2e2",
				}}
			>
				<h2 style={{ fontSize: "20px", fontWeight: "700", color: "#dc2626", margin: "0 0 8px" }}>
					Access Denied
				</h2>
				<p style={{ color: "#64748b", fontSize: "14px", marginBottom: "20px" }}>
					You do not have permission to view this project.
				</p>
				<Link href="/movies" style={{ color: "#d97706", fontWeight: "600" }}>
					← Return to My Movies
				</Link>
			</div>
		);
	}

	if (error || !movie) {
		return (
			<div style={{ padding: "40px", textAlign: "center", color: "#991b1b" }}>
				Failed to load movie outline. <Link href="/movies">Go to movies</Link>
			</div>
		);
	}

	return (
		<div>
			<MovieHeader
				movie={movie}
				activeTab="outline"
				onUpdate={updateMovie}
				onDelete={deleteMovie}
			/>
			<div style={{ padding: "0 36px 56px", maxWidth: "1220px", margin: "0 auto" }}>
				<StoryOutlineView
					movieId={movie.id}
					onOpenScreenplay={(sceneId?: string) =>
						router.push(`/movies/${movieId}/screenplay${sceneId ? `?sceneId=${sceneId}` : ""}`)
					}
					onImproveStory={() => router.push(`/movies/${movieId}/screenplay`)}
				/>
			</div>
		</div>
	);
}
