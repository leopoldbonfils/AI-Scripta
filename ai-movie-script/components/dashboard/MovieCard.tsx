"use client";

import Link from "next/link";
import { Movie } from "../../types/movie";
import { FiTrash2, FiClock, FiUsers, FiFilm } from "react-icons/fi";

interface MovieCardProps {
	movie: Movie;
	onDelete?: (movieId: string) => void;
	showDelete?: boolean;
}

export function MovieCard({ movie, onDelete, showDelete = false }: MovieCardProps) {
	const progress = movie.progress ?? (movie.status === "COMPLETED" ? 100 : 15);

	// Status badge colors
	const getStatusBadge = () => {
		switch (movie.status) {
			case "COMPLETED":
				return { label: "Completed", bg: "#dcfce7", text: "#166534" };
			case "SCRIPT":
				return { label: "Screenplay", bg: "#fef3c7", text: "#92400e" };
			case "OUTLINE":
				return { label: "Outline", bg: "#e0e7ff", text: "#3730a3" };
			case "STORY":
				return { label: "Story", bg: "#fae8ff", text: "#86198f" };
			case "IDEA":
			default:
				return { label: "Idea", bg: "#f1f5f9", text: "#475569" };
		}
	};

	const status = getStatusBadge();

	// Cover image fallback
	const fallbackGradients = [
		"linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
		"linear-gradient(135deg, #312e81 0%, #1e1b4b 100%)",
		"linear-gradient(135deg, #701a75 0%, #4a044e 100%)",
		"linear-gradient(135deg, #064e3b 0%, #022c22 100%)",
	];
	const gradientIndex = Math.abs(
		movie.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
	) % fallbackGradients.length;

	const formattedDate = movie.updatedAt
		? new Date(movie.updatedAt).toLocaleDateString(undefined, {
				month: "short",
				day: "numeric",
			})
		: "";

	return (
		<article className="movies-card" key={movie.id} style={{ position: "relative" }}>
			<div
				className="movies-card-thumb"
				style={{
					background: movie.coverImage ? undefined : fallbackGradients[gradientIndex],
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					position: "relative",
				}}
			>
				{movie.coverImage ? (
					// eslint-disable-next-line @next/next/no-img-element
					<img
						src={movie.coverImage}
						alt={movie.title}
						className="movies-card-img"
					/>
				) : (
					<div
						style={{
							textAlign: "center",
							color: "rgba(255, 255, 255, 0.8)",
							padding: "10px",
						}}
					>
						<FiFilm size={26} style={{ margin: "0 auto 4px", opacity: 0.7 }} />
						<div
							style={{
								fontSize: "11px",
								fontWeight: "600",
								letterSpacing: "0.5px",
								textTransform: "uppercase",
								opacity: 0.85,
							}}
						>
							{movie.genre || "Cinema"}
						</div>
					</div>
				)}

				{/* Status pill badge on top right */}
				<div
					style={{
						position: "absolute",
						top: "10px",
						right: "10px",
						background: status.bg,
						color: status.text,
						fontSize: "11px",
						fontWeight: "700",
						padding: "3px 8px",
						borderRadius: "20px",
						textTransform: "uppercase",
						letterSpacing: "0.4px",
						boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)",
					}}
				>
					{status.label}
				</div>
			</div>

			<div className="movies-card-body">
				<div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
					<h3 className="movies-card-title" title={movie.title}>
						{movie.title}
					</h3>
					{showDelete && onDelete && (
						<button
							type="button"
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								onDelete(movie.id);
							}}
							aria-label={`Delete ${movie.title}`}
							title="Delete Movie Project"
							style={{
								background: "none",
								border: "none",
								color: "#94a3b8",
								cursor: "pointer",
								padding: "4px",
								borderRadius: "6px",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								transition: "color 0.15s ease",
							}}
							onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
							onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
						>
							<FiTrash2 size={15} />
						</button>
					)}
				</div>

				<p className="movies-card-genre">
					{movie.genre || "Uncategorized"}
					{movie.tone ? ` · ${movie.tone}` : ""}
				</p>

				{/* Project counts if available */}
				{movie._count && (
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: "12px",
							fontSize: "11px",
							color: "#64748b",
							marginBottom: "10px",
						}}
					>
						<span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
							<FiUsers size={12} /> {movie._count.characters} chars
						</span>
						<span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
							<FiFilm size={12} /> {movie._count.scenes} scenes
						</span>
						{formattedDate && (
							<span
								style={{
									display: "flex",
									alignItems: "center",
									gap: "4px",
									marginLeft: "auto",
									color: "#94a3b8",
								}}
							>
								<FiClock size={11} /> {formattedDate}
							</span>
						)}
					</div>
				)}

				<div className="movies-card-progress-track">
					<div
						className="movies-card-progress-fill"
						style={{ width: `${Math.min(100, Math.max(5, progress))}%` }}
					/>
				</div>

				<div className="movies-card-footer">
					<span className="movies-card-pct">{progress}%</span>
					<Link href={`/movies/${movie.id}`} className="movies-card-continue">
						<span>Workspace</span>
						<span>→</span>
					</Link>
				</div>
			</div>
		</article>
	);
}

