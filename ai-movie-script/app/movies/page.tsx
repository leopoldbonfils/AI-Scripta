"use client";

import Link from "next/link";
import { useState } from "react";

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

export default function MyMoviesPage() {
	const [searchQuery, setSearchQuery] = useState("");

	const filteredMovies = movieItems.filter(
		(movie) =>
			movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			movie.genre.toLowerCase().includes(searchQuery.toLowerCase())
	);

	return (
		<div className="movies-page-container">
			{/* Top Bar Header */}
			<header className="movies-header">
				<div className="movies-header-left">
					<h1 className="movies-header-title">
						Good morning, Leopold <span className="movies-wave">👋</span>
					</h1>
					<p className="movies-header-subtitle">
						What would you like to create today?
					</p>
				</div>

				<div className="movies-header-right">
					{/* Search input */}
					<div className="movies-search-box">
						<svg
							className="movies-search-icon"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<circle cx="11" cy="11" r="8" />
							<line x1="21" y1="21" x2="16.65" y2="16.65" />
						</svg>
						<input
							type="text"
							placeholder="Search anything..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="movies-search-input"
						/>
					</div>

					{/* Notification Bell */}
					<button
						type="button"
						className="movies-icon-btn"
						aria-label="Notifications"
					>
						<svg
							width="18"
							height="18"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
							<path d="M13.73 21a2 2 0 0 1-3.46 0" />
						</svg>
					</button>

					{/* User Avatar */}
					<div className="movies-header-avatar">
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src="/images/leopold-hd.png"
							alt="Leopold"
							className="movies-header-avatar-img"
						/>
					</div>
				</div>
			</header>

			{/* Create a New Movie Banner */}
			<section className="movies-hero-banner">
				<div className="movies-hero-bg">
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						src="/images/create-movie-banner.jpg"
						alt="Cinema reel and popcorn at sunset"
						className="movies-hero-bg-img"
					/>
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
					<h2 className="movies-section-title">My Movies</h2>
					<Link href="/movies" className="movies-view-all">
						<span>View all</span>
						<span>→</span>
					</Link>
				</div>

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
			</section>
		</div>
	);
}
