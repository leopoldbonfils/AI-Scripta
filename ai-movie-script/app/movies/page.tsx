"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useMovies } from "../../hooks/useMovies";
import { WelcomeHeader } from "../../components/dashboard/WelcomeHeader";
import { CreateMovieCard } from "../../components/dashboard/CreateMovieCard";
import { MovieCard } from "../../components/dashboard/MovieCard";
import { Modal } from "../../components/ui/Modal";
import { MovieStatus } from "../../types/movie";
import { FiAlertCircle, FiRefreshCw, FiSearch, FiFilm } from "react-icons/fi";
import Link from "next/link";

type StatusFilter = "ALL" | "IN_PROGRESS" | "COMPLETED" | "IDEA";

function MyMoviesContent() {
	const searchParams = useSearchParams();
	const { movies, stats, isLoading, error, fetchMovies, deleteMovie } = useMovies({
		autoFetch: true,
	});

	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
	const [deleteModalId, setDeleteModalId] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState<boolean>(false);
	const [deleteError, setDeleteError] = useState<string | null>(null);

	// Sync search from URL
	useEffect(() => {
		const q = searchParams ? searchParams.get("search") || "" : "";
		setSearchQuery(q);
	}, [searchParams]);

	// Listen to Header search change events
	useEffect(() => {
		const handleSearchChange = () => {
			const params = new URLSearchParams(window.location.search);
			setSearchQuery(params.get("search") || "");
		};

		window.addEventListener("moviesSearchChanged", handleSearchChange);
		window.addEventListener("popstate", handleSearchChange);
		return () => {
			window.removeEventListener("moviesSearchChanged", handleSearchChange);
			window.removeEventListener("popstate", handleSearchChange);
		};
	}, []);

	// Filter movies by search query and status tab
	const filteredMovies = useMemo(() => {
		return movies.filter((movie) => {
			// Search filter
			const query = searchQuery.trim().toLowerCase();
			const matchesSearch =
				!query ||
				movie.title.toLowerCase().includes(query) ||
				(movie.genre && movie.genre.toLowerCase().includes(query)) ||
				(movie.description && movie.description.toLowerCase().includes(query));

			// Status filter
			let matchesStatus = true;
			if (statusFilter === "COMPLETED") {
				matchesStatus = movie.status === "COMPLETED";
			} else if (statusFilter === "IN_PROGRESS") {
				matchesStatus = movie.status !== "COMPLETED" && movie.status !== "IDEA";
			} else if (statusFilter === "IDEA") {
				matchesStatus = movie.status === "IDEA";
			}

			return matchesSearch && matchesStatus;
		});
	}, [movies, searchQuery, statusFilter]);

	const movieToDelete = movies.find((m) => m.id === deleteModalId);

	const handleDeleteConfirm = async () => {
		if (!deleteModalId) return;
		setIsDeleting(true);
		setDeleteError(null);
		try {
			await deleteMovie(deleteModalId);
			setDeleteModalId(null);
		} catch (err: unknown) {
			setDeleteError(
				err instanceof Error ? err.message : "Failed to delete movie project."
			);
		} finally {
			setIsDeleting(false);
		}
	};

	const clearSearch = () => {
		setSearchQuery("");
		const params = new URLSearchParams(window.location.search);
		params.delete("search");
		const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
		window.history.replaceState(null, "", newUrl);
		window.dispatchEvent(new Event("moviesSearchChanged"));
	};

	return (
		<div className="movies-page-container">
			{/* Welcome Greeting */}
			<WelcomeHeader totalCount={stats.total} />

			{/* Server Error Alert Banner */}
			{error && (
				<div
					style={{
						background: "#fef2f2",
						border: "1px solid #fecaca",
						color: "#991b1b",
						padding: "14px 18px",
						borderRadius: "12px",
						marginBottom: "20px",
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
					}}
				>
					<div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
						<FiAlertCircle size={18} />
						<span style={{ fontSize: "14px" }}>{error}</span>
					</div>
					<button
						type="button"
						onClick={() => fetchMovies()}
						style={{
							background: "#ffffff",
							border: "1px solid #fca5a5",
							color: "#991b1b",
							padding: "6px 14px",
							borderRadius: "8px",
							cursor: "pointer",
							fontSize: "12px",
							fontWeight: "600",
							display: "flex",
							alignItems: "center",
							gap: "6px",
						}}
					>
						<FiRefreshCw size={13} />
						<span>Retry</span>
					</button>
				</div>
			)}

			{/* Create Movie Banner */}
			<CreateMovieCard />

			{/* My Movies Section */}
			<section className="movies-section" style={{ marginTop: "32px" }}>
				<div
					className="movies-section-header"
					style={{
						flexWrap: "wrap",
						gap: "14px",
						alignItems: "center",
						justifyContent: "space-between",
					}}
				>
					<div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
						<h2 className="movies-section-title">My Movies</h2>
						<span
							style={{
								fontSize: "12px",
								fontWeight: "600",
								color: "#64748b",
								background: "#f1f5f9",
								padding: "4px 10px",
								borderRadius: "12px",
							}}
						>
							{filteredMovies.length} project{filteredMovies.length === 1 ? "" : "s"}
						</span>
					</div>

					{/* Status Filter Tabs */}
					<div
						style={{
							display: "flex",
							background: "#f1f5f9",
							padding: "3px",
							borderRadius: "20px",
							gap: "2px",
						}}
					>
						{(
							[
								{ id: "ALL", label: "All" },
								{ id: "IN_PROGRESS", label: "In Progress" },
								{ id: "COMPLETED", label: "Completed" },
								{ id: "IDEA", label: "Ideas" },
							] as const
						).map((tab) => (
							<button
								key={tab.id}
								type="button"
								onClick={() => setStatusFilter(tab.id)}
								style={{
									border: "none",
									background: statusFilter === tab.id ? "#ffffff" : "transparent",
									color: statusFilter === tab.id ? "#0f172a" : "#64748b",
									padding: "5px 14px",
									borderRadius: "16px",
									fontSize: "12px",
									fontWeight: statusFilter === tab.id ? "600" : "500",
									cursor: "pointer",
									boxShadow:
										statusFilter === tab.id ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
									transition: "all 0.15s ease",
								}}
							>
								{tab.label}
							</button>
						))}
					</div>
				</div>

				{/* Active Filter Indicator */}
				{searchQuery && (
					<div
						style={{
							marginBottom: "16px",
							display: "flex",
							alignItems: "center",
							gap: "10px",
						}}
					>
						<span
							style={{
								fontSize: "13px",
								color: "#64748b",
								background: "#f8fafc",
								border: "1px solid #e2e8f0",
								padding: "4px 12px",
								borderRadius: "16px",
								display: "inline-flex",
								alignItems: "center",
								gap: "6px",
							}}
						>
							<FiSearch size={13} />
							<span>Search: &quot;{searchQuery}&quot;</span>
							<button
								type="button"
								onClick={clearSearch}
								style={{
									background: "none",
									border: "none",
									cursor: "pointer",
									color: "#94a3b8",
									padding: "0 2px",
									fontWeight: "bold",
								}}
							>
								✕
							</button>
						</span>
					</div>
				)}

				{/* Loading Skeleton */}
				{isLoading && movies.length === 0 ? (
					<div className="movies-cards-grid">
						{[1, 2, 3, 4, 5, 6].map((n) => (
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
				) : filteredMovies.length === 0 ? (
					/* Empty States */
					searchQuery || statusFilter !== "ALL" ? (
						<div
							style={{
								textAlign: "center",
								padding: "60px 20px",
								background: "#f8fafc",
								borderRadius: "16px",
								border: "1px dashed #cbd5e1",
							}}
						>
							<p style={{ color: "#64748b", fontSize: "15px", margin: "0 0 14px" }}>
								No movies found matching current filters.
							</p>
							<button
								type="button"
								onClick={() => {
									clearSearch();
									setStatusFilter("ALL");
								}}
								style={{
									padding: "8px 18px",
									borderRadius: "20px",
									border: "1px solid #cbd5e1",
									background: "#ffffff",
									color: "#1e293b",
									fontSize: "13px",
									fontWeight: "600",
									cursor: "pointer",
								}}
							>
								Reset All Filters
							</button>
						</div>
					) : (
						<div
							style={{
								textAlign: "center",
								padding: "64px 20px",
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
								Your Filmography is Empty
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
								Create your first movie project to begin outlining acts, developing character arcs, and writing screenplay scenes.
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
								<span>+ Create Movie</span>
							</Link>
						</div>
					)
				) : (
					/* Real Movies Grid */
					<div className="movies-cards-grid">
						{filteredMovies.map((movie) => (
							<MovieCard
								key={movie.id}
								movie={movie}
								onDelete={(id) => setDeleteModalId(id)}
								showDelete={true}
							/>
						))}
					</div>
				)}
			</section>

			{/* Delete Confirmation Modal */}
			<Modal
				isOpen={!!deleteModalId}
				onClose={() => {
					if (!isDeleting) setDeleteModalId(null);
				}}
				title="Delete Movie Project"
				footer={
					<>
						<button
							type="button"
							onClick={() => setDeleteModalId(null)}
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
							onClick={handleDeleteConfirm}
							disabled={isDeleting}
							style={{
								padding: "8px 16px",
								borderRadius: "8px",
								border: "none",
								background: "#ef4444",
								color: "#ffffff",
								fontWeight: "600",
								cursor: isDeleting ? "not-allowed" : "pointer",
								opacity: isDeleting ? 0.7 : 1,
							}}
						>
							{isDeleting ? "Deleting..." : "Delete Permanently"}
						</button>
					</>
				}
			>
				{deleteError && (
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
						{deleteError}
					</div>
				)}
				<p style={{ margin: 0 }}>
					Are you sure you want to delete{" "}
					<strong>{movieToDelete?.title || "this movie project"}</strong>? This will
					permanently delete all associated stories, scenes, acts, and screenplay drafts from
					the database.
				</p>
			</Modal>
		</div>
	);
}

export default function MyMoviesPage() {
	return (
		<Suspense
			fallback={
				<div style={{ padding: "40px", color: "#64748b" }}>Loading movies...</div>
			}
		>
			<MyMoviesContent />
		</Suspense>
	);
}
