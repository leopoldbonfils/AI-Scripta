"use client";

import Link from "next/link";

export function CreateMovieCard() {
	return (
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
	);
}

