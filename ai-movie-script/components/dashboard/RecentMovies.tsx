"use client";

import Link from "next/link";
import { Movie } from "../../types/movie";
import { MovieCard } from "./MovieCard";
import { FiPlus, FiFilm } from "react-icons/fi";

interface RecentMoviesProps {
	movies: Movie[];
	isLoading: boolean;
	onDelete?: (movieId: string) => void;
}

export function RecentMovies({ movies, isLoading, onDelete }: RecentMoviesProps) {
	if (isLoading) {
		return (
			<section className="movies-section" style={{ marginTop: "24px" }}>
				<div className="movies-section-header">
					<h2 className="movies-section-title">Recently Updated</h2>
				</div>
				<div className="movies-cards-grid">
					{[1, 2, 3].map((n) => (
						<div
							key={n}
							style={{
								background: "#f8fafc",
								borderRadius: "14px",
								border: "1px solid #e2e8f0",
								height: "240px",
								animation: "pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
							}}
						/>
					))}
				</div>
			</section>
		);
	}

	if (movies.length === 0) {
		return (
			<section className="movies-section" style={{ marginTop: "24px" }}>
				<div className="movies-section-header">
					<h2 className="movies-section-title">Your Studio Projects</h2>
				</div>
				<div
					style={{
						textAlign: "center",
						padding: "64px 24px",
						background: "#f8fafc",
						borderRadius: "16px",
						border: "1.5px dashed #cbd5e1",
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
							fontSize: "26px",
							margin: "0 auto 16px",
						}}
					>
						<FiFilm />
					</div>
					<h3
						style={{
							fontSize: "18px",
							fontWeight: "700",
							color: "#0f172a",
							margin: "0 0 8px",
						}}
					>
						No movie projects yet
					</h3>
					<p
						style={{
							fontSize: "14px",
							color: "#64748b",
							maxWidth: "420px",
							margin: "0 auto 20px",
							lineHeight: "1.5",
						}}
					>
						Transform your first cinematic idea into developed characters, structured acts, and complete screenplay drafts.
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
							borderRadius: "24px",
							fontWeight: "600",
							fontSize: "14px",
							boxShadow: "0 4px 14px rgba(245, 158, 11, 0.35)",
							textDecoration: "none",
						}}
					>
						<FiPlus size={16} />
						<span>Create Your First Movie</span>
					</Link>
				</div>
			</section>
		);
	}

	return (
		<section className="movies-section" style={{ marginTop: "24px" }}>
			<div className="movies-section-header">
				<h2 className="movies-section-title">Recently Updated</h2>
				<Link href="/movies" className="movies-view-all">
					<span>View all ({movies.length})</span>
					<span>→</span>
				</Link>
			</div>

			<div className="movies-cards-grid">
				{movies.slice(0, 6).map((movie) => (
					<MovieCard
						key={movie.id}
						movie={movie}
						onDelete={onDelete}
						showDelete={true}
					/>
				))}
			</div>
		</section>
	);
}

