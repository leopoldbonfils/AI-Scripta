"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const movieItems = [
	{
		id: "TLS-0824",
		title: "The Last Signal",
		genre: "Sci-Fi · Thriller",
		progress: 78,
		image: "/images/movie-last-signal.jpg",
	},
	{
		id: "KGL-1102",
		title: "Kigali Nights",
		genre: "Drama",
		progress: 45,
		image: "/images/movie-kigali-nights.jpg",
	},
	{
		id: "SEC-9901",
		title: "The Hidden Truth",
		genre: "Mystery",
		progress: 20,
		image: "/images/movie-hidden-truth.jpg",
	},
];

function MyMoviesContent() {
	const searchParams = useSearchParams();
	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		const q = searchParams ? searchParams.get("search") || "" : "";
		setSearchQuery(q);
	}, [searchParams]);

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

	const filteredMovies = movieItems.filter(
		(movie) =>
			movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			movie.genre.toLowerCase().includes(searchQuery.toLowerCase())
	);

	return (
		<div className="movies-page-container">
			{/* Welcome Greeting */}
			<div className="movies-welcome-header">
				<h1 className="movies-header-title">
					Good morning, Leopold <span className="movies-wave">👋</span>
				</h1>
				<p className="movies-header-subtitle">
					What would you like to create today?
				</p>
			</div>

			{/* Create a New Movie Banner */}
			<section className="movies-hero-banner">
				<div className="movies-hero-bg">
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						src="/images/create-movie-banner.png"
						alt="Cinema reel and popcorn at sunset"
						className="movies-hero-bg-img"
					/>
					<div className="movies-hero-overlay" />
				</div>

				<div className="movies-hero-content">
					<h2 className="movies-hero-title">Create a New Movie</h2>
					<p className="movies-hero-desc">
						Start with an idea. FilmForge AI will help you build the rest.
					</p>
					<Link href="/create" className="movies-hero-btn">
						<span className="movies-hero-btn-plus">+</span>
						<span>Create Movie</span>
					</Link>
				</div>
			</section>

			{/* My Movies Section */}
			<section className="movies-section">
				<div className="movies-section-header">
					<div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
						<h2 className="movies-section-title">My Movies</h2>
						{searchQuery && (
							<span
								style={{
									fontSize: "13px",
									color: "#64748b",
									background: "#f1f5f9",
									padding: "3px 10px",
									borderRadius: "12px",
								}}
							>
								Filter: &quot;{searchQuery}&quot; ({filteredMovies.length} found)
							</span>
						)}
					</div>
					<Link href="/movies" className="movies-view-all">
						<span>View all</span>
						<span>→</span>
					</Link>
				</div>

				{filteredMovies.length === 0 ? (
					<div
						style={{
							textAlign: "center",
							padding: "60px 20px",
							background: "#f8fafc",
							borderRadius: "16px",
							border: "1px dashed #cbd5e1",
							marginTop: "16px",
						}}
					>
						<p style={{ color: "#64748b", fontSize: "15px", margin: "0 0 12px" }}>
							No movies found matching &quot;{searchQuery}&quot;.
						</p>
						<button
							type="button"
							onClick={() => {
								setSearchQuery("");
								const params = new URLSearchParams(window.location.search);
								params.delete("search");
								const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
								window.history.replaceState(null, "", newUrl);
								window.dispatchEvent(new Event("moviesSearchChanged"));
							}}
							style={{
								padding: "8px 18px",
								borderRadius: "20px",
								border: "1px solid #cbd5e1",
								background: "#ffffff",
								color: "#1e293b",
								fontSize: "13px",
								fontWeight: "550",
								cursor: "pointer",
							}}
						>
							Clear Search Filter
						</button>
					</div>
				) : (
					<div className="movies-cards-grid">
						{filteredMovies.map((movie) => (
							<article className="movies-card" key={movie.id}>
								<div className="movies-card-thumb">
									{/* eslint-disable-next-line @next/next/no-img-element */}
									<img
										src={movie.image}
										alt={movie.title}
										className="movies-card-img"
									/>
								</div>

								<div className="movies-card-body">
									<h3 className="movies-card-title">{movie.title}</h3>
									<p className="movies-card-genre">{movie.genre}</p>

									<div className="movies-card-progress-track">
										<div
											className="movies-card-progress-fill"
											style={{ width: `${movie.progress}%` }}
										/>
									</div>

									<div className="movies-card-footer">
										<span className="movies-card-pct">{movie.progress}%</span>
										<Link
											href={`/movies/${movie.id}`}
											className="movies-card-continue"
										>
											<span>Continue</span>
											<span>→</span>
										</Link>
									</div>
								</div>
							</article>
						))}
					</div>
				)}
			</section>
		</div>
	);
}

export default function MyMoviesPage() {
	return (
		<Suspense fallback={<div style={{ padding: "40px", color: "#64748b" }}>Loading movies...</div>}>
			<MyMoviesContent />
		</Suspense>
	);
}
