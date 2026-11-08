"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useMovie } from "../../../hooks/useMovie";
import { MovieHeader } from "../../../components/movie/MovieHeader";
import { StudioWorkspace } from "../../../components/templates/StudioWorkspace";
import { FiAlertCircle, FiFilm, FiArrowLeft, FiLock } from "react-icons/fi";

export default function MoviePage() {
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
					boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
				}}
			>
				<div
					style={{
						width: "56px",
						height: "56px",
						borderRadius: "16px",
						background: "#fee2e2",
						color: "#dc2626",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						fontSize: "24px",
						margin: "0 auto 16px",
					}}
				>
					<FiFilm />
				</div>
				<h2 style={{ fontSize: "20px", fontWeight: "700", color: "#0f172a", margin: "0 0 8px" }}>
					Movie Project Not Found
				</h2>
				<p style={{ color: "#64748b", fontSize: "14px", lineHeight: "1.5", margin: "0 0 24px" }}>
					The movie project with ID <code style={{ color: "#0f172a" }}>{movieId}</code> does not exist or may have been deleted.
				</p>
				<Link
					href="/movies"
					style={{
						display: "inline-flex",
						alignItems: "center",
						gap: "8px",
						background: "#f59e0b",
						color: "#ffffff",
						padding: "10px 20px",
						borderRadius: "20px",
						fontWeight: "600",
						fontSize: "14px",
						textDecoration: "none",
					}}
				>
					<FiArrowLeft size={16} />
					<span>Back to My Movies</span>
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
					boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
				}}
			>
				<div
					style={{
						width: "56px",
						height: "56px",
						borderRadius: "16px",
						background: "#fee2e2",
						color: "#dc2626",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						fontSize: "24px",
						margin: "0 auto 16px",
					}}
				>
					<FiLock />
				</div>
				<h2 style={{ fontSize: "20px", fontWeight: "700", color: "#0f172a", margin: "0 0 8px" }}>
					Access Restricted
				</h2>
				<p style={{ color: "#64748b", fontSize: "14px", lineHeight: "1.5", margin: "0 0 24px" }}>
					You do not have permission to view or edit this movie project.
				</p>
				<Link
					href="/movies"
					style={{
						display: "inline-flex",
						alignItems: "center",
						gap: "8px",
						background: "#0f172a",
						color: "#ffffff",
						padding: "10px 20px",
						borderRadius: "20px",
						fontWeight: "600",
						fontSize: "14px",
						textDecoration: "none",
					}}
				>
					<FiArrowLeft size={16} />
					<span>Back to My Movies</span>
				</Link>
			</div>
		);
	}

	if (error || !movie) {
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
						borderRadius: "16px",
						background: "#fef3c7",
						color: "#d97706",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						fontSize: "24px",
						margin: "0 auto 16px",
					}}
				>
					<FiAlertCircle />
				</div>
				<h2 style={{ fontSize: "20px", fontWeight: "700", color: "#0f172a", margin: "0 0 8px" }}>
					Failed to Load Movie
				</h2>
				<p style={{ color: "#64748b", fontSize: "14px", lineHeight: "1.5", margin: "0 0 24px" }}>
					{error || "An unexpected error occurred while loading this movie project."}
				</p>
				<Link
					href="/movies"
					style={{
						display: "inline-flex",
						alignItems: "center",
						gap: "8px",
						background: "#f59e0b",
						color: "#ffffff",
						padding: "10px 20px",
						borderRadius: "20px",
						fontWeight: "600",
						fontSize: "14px",
						textDecoration: "none",
					}}
				>
					<FiArrowLeft size={16} />
					<span>Back to My Movies</span>
				</Link>
			</div>
		);
	}

	return (
		<div>
			<MovieHeader
				movie={movie}
				activeTab="screenplay"
				onUpdate={updateMovie}
				onDelete={deleteMovie}
			/>
			<div style={{ padding: "0 36px 48px", maxWidth: "1220px", margin: "0 auto" }}>
				<StudioWorkspace initialView="screenplay" />
			</div>
		</div>
	);
}
