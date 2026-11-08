"use client";

import { useState, Suspense } from "react";
import { useMovies } from "../../hooks/useMovies";
import { WelcomeHeader } from "../../components/dashboard/WelcomeHeader";
import { StatsCard } from "../../components/dashboard/StatsCard";
import { CreateMovieCard } from "../../components/dashboard/CreateMovieCard";
import { RecentMovies } from "../../components/dashboard/RecentMovies";
import { Modal } from "../../components/ui/Modal";
import { FiFilm, FiClock, FiCheckCircle, FiTrendingUp, FiAlertCircle, FiRefreshCw } from "react-icons/fi";

function DashboardContent() {
	const { movies, stats, isLoading, error, fetchMovies, deleteMovie } = useMovies({
		autoFetch: true,
	});

	const [deleteModalId, setDeleteModalId] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState<boolean>(false);
	const [deleteError, setDeleteError] = useState<string | null>(null);

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

	const averageProgress =
		movies.length > 0
			? Math.round(
					movies.reduce(
						(acc, m) => acc + (m.progress ?? (m.status === "COMPLETED" ? 100 : 15)),
						0
					) / movies.length
				)
			: 0;

	return (
		<div className="movies-page-container">
			{/* Dynamic Welcome Header */}
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

			{/* Studio Metrics Grid */}
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
					gap: "16px",
					marginBottom: "28px",
				}}
			>
				<StatsCard
					title="Total Movies"
					value={isLoading ? "..." : stats.total}
					subtitle="Studio projects"
					icon={<FiFilm />}
					accentColor="#f59e0b"
				/>
				<StatsCard
					title="In Progress"
					value={isLoading ? "..." : stats.inProgress}
					subtitle="Active screenplays"
					icon={<FiClock />}
					accentColor="#3b82f6"
				/>
				<StatsCard
					title="Completed"
					value={isLoading ? "..." : stats.completed}
					subtitle="Finished drafts"
					icon={<FiCheckCircle />}
					accentColor="#10b981"
				/>
				<StatsCard
					title="Studio Progress"
					value={isLoading ? "..." : `${averageProgress}%`}
					subtitle="Average completion"
					icon={<FiTrendingUp />}
					accentColor="#8b5cf6"
				/>
			</div>

			{/* Create Movie Hero Banner */}
			<CreateMovieCard />

			{/* Recently Updated Projects */}
			<RecentMovies
				movies={stats.recentlyUpdated}
				isLoading={isLoading}
				onDelete={(id) => setDeleteModalId(id)}
			/>

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
					permanently erase all associated stories, acts, scenes, and screenplay drafts
					from the database.
				</p>
			</Modal>
		</div>
	);
}

export default function DashboardPage() {
	return (
		<Suspense
			fallback={
				<div style={{ padding: "40px", color: "#64748b" }}>Loading studio dashboard...</div>
			}
		>
			<DashboardContent />
		</Suspense>
	);
}
