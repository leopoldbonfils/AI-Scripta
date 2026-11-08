"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { movieService } from "../../services/movieService";
import { movieStore } from "../../store/movieStore";
import { FiAlertCircle, FiLoader } from "react-icons/fi";

const genres = [
	"Drama",
	"Comedy",
	"Action",
	"Romance",
	"Thriller",
	"Horror",
	"Sci-Fi",
	"Adventure",
	"Mystery",
];

const feelings = [
	"Emotional",
	"Funny",
	"Dark",
	"Inspirational",
	"Suspenseful",
	"Realistic",
];

const lengths = [
	{ label: "Feature Film", sub: "90–120 pages", val: "Feature Film (90-120 pages)" },
	{ label: "TV Pilot", sub: "45–60 pages", val: "TV Pilot (45-60 pages)" },
	{ label: "Short Film", sub: "15–30 pages", val: "Short Film (15-30 pages)" },
];

export default function CreateMoviePage() {
	const router = useRouter();
	const [title, setTitle] = useState("");
	const [idea, setIdea] = useState("");
	const [selectedGenre, setSelectedGenre] = useState("Drama");
	const [selectedFeeling, setSelectedFeeling] = useState("Suspenseful");
	const [selectedLength, setSelectedLength] = useState("Feature Film (90-120 pages)");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		// Validation
		if (!title.trim()) {
			setError("Please enter a title for your movie project.");
			return;
		}

		if (!idea.trim()) {
			setError("Please share your movie idea or logline.");
			return;
		}

		setIsSubmitting(true);

		try {
			const createdMovie = await movieService.createMovie({
				title: title.trim(),
				originalIdea: idea.trim(),
				description: idea.trim(),
				genre: selectedGenre,
				tone: selectedFeeling || undefined,
				targetLength: selectedLength,
				language: "en",
			});

			// Update in-memory store so dashboard and movies lists are instantly aware
			movieStore.addMovie(createdMovie);

			// Navigate directly to the newly created movie's workspace using its real UUID
			router.push(`/movies/${createdMovie.id}`);
		} catch (err: unknown) {
			const msg =
				err instanceof Error
					? err.message
					: "Failed to create movie project. Please check your network connection.";
			setError(msg);
			setIsSubmitting(false);
		}
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

					{error && (
						<div
							style={{
								background: "#fef2f2",
								border: "1px solid #fecaca",
								color: "#991b1b",
								padding: "12px 16px",
								borderRadius: "10px",
								marginBottom: "18px",
								display: "flex",
								alignItems: "center",
								gap: "10px",
								fontSize: "13.5px",
							}}
						>
							<FiAlertCircle size={17} style={{ flexShrink: 0 }} />
							<span>{error}</span>
						</div>
					)}

					<form onSubmit={handleSubmit} className="create-form">
						{/* Movie Title */}
						<div className="create-field">
							<label htmlFor="movie-title" className="create-label">
								Movie Title
							</label>
							<div className="create-input-wrap">
								<input
									id="movie-title"
									type="text"
									placeholder="Example: The Last Signal"
									value={title}
									onChange={(e) => setTitle(e.target.value)}
									className="create-input"
									required
									maxLength={255}
									disabled={isSubmitting}
								/>
							</div>
						</div>

						{/* Movie Idea Input */}
						<div className="create-field">
							<label htmlFor="movie-idea" className="create-label">
								What&apos;s your movie idea?
							</label>
							<div className="create-input-wrap">
								<textarea
									id="movie-idea"
									rows={3}
									placeholder="Example: A lone radio astronomer in the hills of Rwanda intercepts an encrypted transmission that predicts events moments before they happen..."
									value={idea}
									onChange={(e) => setIdea(e.target.value)}
									className="create-input"
									style={{ resize: "vertical", fontFamily: "inherit", minHeight: "84px" }}
									required
									disabled={isSubmitting}
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
											disabled={isSubmitting}
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
											disabled={isSubmitting}
										>
											{feeling}
										</button>
									);
								})}
							</div>
						</div>

						{/* Target Length */}
						<div className="create-field">
							<label className="create-label">
								Screenplay Format &amp; Target Length
							</label>
							<div className="create-pills-row">
								{lengths.map((len) => {
									const isSelected = selectedLength === len.val;
									return (
										<button
											type="button"
											key={len.val}
											className={`create-pill${isSelected ? " active" : ""}`}
											onClick={() => setSelectedLength(len.val)}
											disabled={isSubmitting}
											style={{
												display: "flex",
												flexDirection: "column",
												alignItems: "flex-start",
												padding: "8px 14px",
											}}
										>
											<span style={{ fontWeight: "600" }}>{len.label}</span>
											<span
												style={{
													fontSize: "11px",
													color: isSelected ? "#fef3c7" : "#64748b",
													marginTop: "2px",
												}}
											>
												{len.sub}
											</span>
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
								style={{
									display: "inline-flex",
									alignItems: "center",
									gap: "8px",
									cursor: isSubmitting ? "not-allowed" : "pointer",
								}}
							>
								{isSubmitting ? (
									<>
										<FiLoader className="spin" size={17} />
										<span>Creating Project in Studio...</span>
									</>
								) : (
									<>
										<span>Create My Story</span>
										<span className="create-btn-arrow">→</span>
									</>
								)}
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
