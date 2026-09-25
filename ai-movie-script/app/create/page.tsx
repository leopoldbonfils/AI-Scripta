"use client";

import { useState } from "react";

const genres = ["Drama", "Sci-fi", "Thriller", "Adventure", "Comedy", "Action", "Romance", "Horror"];
const tones = ["Suspenseful", "Inspirational", "Emotional", "Dark", "Funny", "Realistic"];

export default function CreatePage() {
	const [genre, setGenre] = useState("Drama");
	const [tone, setTone] = useState("Suspenseful");
	const [format, setFormat] = useState("Short film");
	const [idea, setIdea] = useState("A young student discovers a mysterious signal in Kigali that leads him into an unexpected journey uncovering a forgotten city secret buried beneath old broadcast towers...");

	return (
		<div className="create-page">
			<header className="topbar"><div className="breadcrumb">FilmForge AI <span>/</span> Create movie</div><div className="topbar-actions"><span className="topbar-icon">♧</span><span className="topbar-avatar">BK</span></div></header>
			<main className="create-workspace">
				<section className="creation-progress"><div className="creation-progress-title"><strong><span>■</span> Step 1: The spark</strong><b>Phase 01 / 04</b></div><div className="creation-progress-line"><span /></div><div className="creation-steps"><b>1. Idea</b><span>2. Story</span><span>3. Characters</span><span>4. Screenplay</span></div></section>
				<header className="create-heading"><p className="eyebrow">▣ Production initializer · Zero friction</p><h1>Let&apos;s create your movie</h1><p>Don&apos;t worry about getting everything right on day one. Start with<br className="desktop-only" /> your simple premise—even just a stray thought or single sentence.<br className="desktop-only" /> FilmForge crafts the scenes around you.</p></header>
				<section className="form-panel idea-panel"><div className="form-panel-heading"><h2>What&apos;s your movie idea?</h2><button type="button" onClick={() => setIdea("A forgotten radio signal returns to a city that stopped listening.")}>✦ Need inspiration? Try an example idea</button></div><textarea value={idea} onChange={(event) => setIdea(event.target.value)} maxLength={171} /><div className="input-footer"><span>■ State input ready</span><span>{idea.length} chars</span></div></section>
				<section className="form-panel"><div className="form-panel-heading"><h2>What kind of movie is it?</h2><span>Select one or two</span></div><div className="choice-grid genre-grid">{genres.map((item) => <button className={genre === item ? "choice selected" : "choice"} key={item} onClick={() => setGenre(item)} type="button"><span>{item === genre ? "◉" : "◎"} {item}</span>{genre === item && <b>✓</b>}</button>)}</div></section>
				<section className="form-panel"><div className="form-panel-heading"><h2>What feeling should the movie have?</h2><span>Mood + resonance</span></div><div className="choice-grid tone-grid">{tones.map((item) => <button className={tone === item ? "choice selected" : "choice"} key={item} onClick={() => setTone(item)} type="button"><span>{item}</span>{tone === item && <b>✓</b>}</button>)}</div></section>
				<section className="form-panel"><div className="form-panel-heading"><h2>Format &amp; scale</h2><span>Runtime target</span></div><div className="format-grid"><button className={format === "Feature film" ? "format-card selected" : "format-card"} onClick={() => setFormat("Feature film")} type="button"><span className="format-icon">■</span><span><b>Feature film</b><small>90–120 min · 3 acts standard structure</small></span></button><button className={format === "Short film" ? "format-card selected" : "format-card"} onClick={() => setFormat("Short film")} type="button"><span className="format-icon">■</span><span><b>Short film <i>Recommended</i></b><small>15–30 min · Faster iteration &amp; quick export</small></span></button></div></section>
				<section className="pipeline-note"><span>✦</span><p><b>Transparent AI pipeline</b><small>Your idea is guided step-by-step with zero hidden complexity.</small></p><strong>1. Idea <i>→</i> 2. Structure <i>→</i> 3. Screenplay</strong></section>
				<button className="create-story-button" type="button">Create my story <span>→</span></button><p className="privacy-note">♙ You retain 100% rights to your story and scripts. Archival safe.</p>
			</main>
			<footer>FILMFORGE AI <span>— Archival screenplay &amp; cinematic production suite</span><small>© 2025 FilmForge AI Studio. All rights reserved.</small></footer>
		</div>
	);
}
