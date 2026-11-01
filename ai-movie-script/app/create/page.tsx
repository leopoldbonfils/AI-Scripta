"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const genres = [
	"Drama",
	"Comedy",
	"Action",
	"Romance",
	"Thriller",
	"Horror",
	"Sci-Fi",
	"Adventure",
];

const feelings = [
	"Emotional",
	"Funny",
	"Dark",
	"Inspirational",
	"Suspenseful",
	"Realistic",
];

export default function CreateMoviePage() {
	const router = useRouter();
	const [idea, setIdea] = useState("");
	const [selectedGenre, setSelectedGenre] = useState("Drama");
	const [selectedFeeling, setSelectedFeeling] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		// Navigate to movies workspace
		setTimeout(() => {
			router.push("/movies");
		}, 400);
	};

	return (
		<div className="create-container">
			<div className="create-inner">
				{/* Left Form Content */}
				<div className="create-form-column">
					<header className="create-header">
						<h1 className="create-title">Let&apos;s create your movie.</h1>
						<p className="create-subtitle">
							Don&apos;t worry about getting everything right. Start with your idea.
						</p>
					</header>

					<form onSubmit={handleSubmit} className="create-form">
						{/* Movie Idea Input */}
						<div className="create-field">
							<label htmlFor="movie-idea" className="create-label">
								What&apos;s your movie idea?
							</label>
							<div className="create-input-wrap">
								<input
									id="movie-idea"
									type="text"
									placeholder="Example: A young student discovers a mysterious message..."
									value={idea}
									onChange={(e) => setIdea(e.target.value)}
									className="create-input"
									required
								/>
							</div>
						</div>

						{/* Kind of movie (Genre) */}
						<div className="create-field">
							<label className="create-label">
								What kind of movie is it?
							</label>
							<div className="create-pills-row">
								{genres.map((genre) => {
									const isSelected = selectedGenre === genre;
									return (
										<button
											type="button"
											key={genre}
											className={`create-pill${isSelected ? " active" : ""}`}
											onClick={() => setSelectedGenre(genre)}
										>
											{genre}
										</button>
									);
								})}
							</div>
						</div>

						{/* Feeling / Mood */}
						<div className="create-field">
							<label className="create-label">
								What feeling should the movie have?
							</label>
							<div className="create-pills-row">
								{feelings.map((feeling) => {
									const isSelected = selectedFeeling === feeling;
									return (
										<button
											type="button"
											key={feeling}
											className={`create-pill${isSelected ? " active" : ""}`}
											onClick={() =>
												setSelectedFeeling(isSelected ? "" : feeling)
											}
										>
											{feeling}
										</button>
									);
								})}
							</div>
						</div>

						{/* Action Button */}
						<div className="create-actions">
							<button
								type="submit"
								className="create-submit-btn"
								disabled={isSubmitting}
							>
								<span>{isSubmitting ? "Generating..." : "Create My Story"}</span>
								<span className="create-btn-arrow">→</span>
							</button>
						</div>
					</form>
				</div>

				{/* Right Graphic Artwork */}
				<div className="create-artwork-column">
					<div className="create-artwork-blend" />
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						src="/images/create-idea-bulb.jpg"
						alt="Lightbulb on cinema film strip"
						className="create-artwork-img"
					/>
				</div>
			</div>
		</div>
	);
}
