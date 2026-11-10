"use client";

import React, { useState } from "react";
import { StoryBible } from "../../types/storyBible";
import { EvidenceBadge } from "./EvidenceBadge";
import { Modal } from "../ui/Modal";
import { FiEdit2, FiBookOpen, FiGlobe, FiShield } from "react-icons/fi";

export interface StoryOverviewSectionProps {
	storyBible: StoryBible;
	onUpdateIdentity: (data: Record<string, any>) => Promise<any>;
	isSaving: boolean;
}

export function StoryOverviewSection({
	storyBible,
	onUpdateIdentity,
	isSaving,
}: StoryOverviewSectionProps) {
	const [isEditOpen, setIsEditOpen] = useState(false);
	const [title, setTitle] = useState(storyBible.title);
	const [premise, setPremise] = useState(storyBible.premise || "");
	const [logline, setLogline] = useState(storyBible.logline || "");
	const [synopsis, setSynopsis] = useState(storyBible.synopsis || "");
	const [genre, setGenre] = useState(storyBible.genre || "");
	const [themesText, setThemesText] = useState((storyBible.themes || []).join(", "));
	const [settingSummary, setSettingSummary] = useState(storyBible.settingSummary || "");
	const [historicalBackground, setHistoricalBackground] = useState(
		storyBible.historicalBackground || ""
	);
	const [changeReason, setChangeReason] = useState("");

	const openEditor = () => {
		setTitle(storyBible.title);
		setPremise(storyBible.premise || "");
		setLogline(storyBible.logline || "");
		setSynopsis(storyBible.synopsis || "");
		setGenre(storyBible.genre || "");
		setThemesText((storyBible.themes || []).join(", "));
		setSettingSummary(storyBible.settingSummary || "");
		setHistoricalBackground(storyBible.historicalBackground || "");
		setChangeReason("");
		setIsEditOpen(true);
	};

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault();
		await onUpdateIdentity({
			title: title.trim() || storyBible.title,
			premise: premise.trim() || null,
			logline: logline.trim() || null,
			synopsis: synopsis.trim() || null,
			genre: genre.trim() || null,
			themes: themesText
				.split(",")
				.map((t) => t.trim())
				.filter(Boolean),
			settingSummary: settingSummary.trim() || null,
			historicalBackground: historicalBackground.trim() || null,
			changeReason: changeReason.trim() || "Writer updated Story Identity",
		});
		setIsEditOpen(false);
	};

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
			<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
				<div>
					<h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
						<FiBookOpen size={17} color="#d97706" /> Story Identity & World Foundation
					</h3>
					<p style={{ margin: "2px 0 0", fontSize: "12.5px", color: "#64748b" }}>
						Core canonical identity, world rules, historical background, and verified story facts.
					</p>
				</div>
				<button
					type="button"
					onClick={openEditor}
					style={{
						display: "flex",
						alignItems: "center",
						gap: "6px",
						padding: "7px 14px",
						fontSize: "12.5px",
						fontWeight: 600,
						borderRadius: "6px",
						border: "1px solid #cbd5e1",
						backgroundColor: "#ffffff",
						color: "#334155",
						cursor: "pointer",
					}}
				>
					<FiEdit2 size={13} /> Edit Identity
				</button>
			</div>

			<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
				<div style={{ padding: "16px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
					<div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Title & Genre</div>
					<div style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", marginTop: "4px" }}>{storyBible.title}</div>
					<div style={{ fontSize: "13px", color: "#475569", marginTop: "2px" }}>Genre: {storyBible.genre || "Unspecified"}</div>
					{storyBible.themes && storyBible.themes.length > 0 && (
						<div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "10px" }}>
							{storyBible.themes.map((t, idx) => (
								<span key={idx} style={{ fontSize: "11.5px", padding: "2px 8px", backgroundColor: "#fef3c7", color: "#92400e", borderRadius: "10px", fontWeight: 600 }}>
									{t}
								</span>
							))}
						</div>
					)}
				</div>

				<div style={{ padding: "16px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
					<div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Logline & Premise</div>
					<p style={{ margin: "6px 0", fontSize: "13.5px", color: "#0f172a", lineHeight: "1.5" }}>
						{storyBible.logline || storyBible.premise || "No canonical premise recorded yet."}
					</p>
					{storyBible.premise && storyBible.logline && storyBible.premise !== storyBible.logline && (
						<p style={{ margin: "6px 0 0", fontSize: "12.5px", color: "#475569", lineHeight: "1.5" }}>
							<strong>Premise:</strong> {storyBible.premise}
						</p>
					)}
				</div>
			</div>

			<div style={{ padding: "16px", backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
				<div style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a", marginBottom: "6px" }}>Narrative Synopsis</div>
				<p style={{ margin: 0, fontSize: "13.5px", color: "#334155", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
					{storyBible.synopsis || "No synopsis set."}
				</p>

				<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "14px", marginTop: "16px", paddingTop: "14px", borderTop: "1px solid #f1f5f9" }}>
					<div>
						<div style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
							<FiGlobe size={13} color="#d97706" /> Setting Context
						</div>
						<p style={{ margin: 0, fontSize: "12.5px", color: "#475569", lineHeight: "1.5" }}>
							{storyBible.settingSummary || "Not defined yet."}
						</p>
					</div>
					<div>
						<div style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>Historical Background</div>
						<p style={{ margin: 0, fontSize: "12.5px", color: "#475569", lineHeight: "1.5" }}>
							{storyBible.historicalBackground || "None explicitly recorded."}
						</p>
					</div>
				</div>
			</div>

			<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
				<div style={{ padding: "16px", backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
					<div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
						<FiShield size={14} color="#059669" /> Established World Rules ({storyBible.worldRules?.length || 0})
					</div>
					{storyBible.worldRules && storyBible.worldRules.length > 0 ? (
						<div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
							{storyBible.worldRules.map((rule, idx) => (
								<div key={rule.id || idx} style={{ padding: "10px", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
									<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
										<span style={{ fontSize: "10.5px", fontWeight: 700, color: "#475569" }}>{rule.category}</span>
										<EvidenceBadge level={rule.evidenceLevel} evidence={rule.sourceEvidence} />
									</div>
									<div style={{ fontSize: "12.5px", color: "#1e293b", lineHeight: "1.45" }}>{rule.rule}</div>
								</div>
							))}
						</div>
					) : (
						<p style={{ fontSize: "12.5px", color: "#94a3b8", margin: 0 }}>No explicit world rules extracted yet.</p>
					)}
				</div>

				<div style={{ padding: "16px", backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
					<div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", marginBottom: "10px" }}>
						Important Narrative Facts ({storyBible.narrativeFacts?.length || 0})
					</div>
					{storyBible.narrativeFacts && storyBible.narrativeFacts.length > 0 ? (
						<div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
							{storyBible.narrativeFacts.map((fact, idx) => (
								<div key={fact.id || idx} style={{ padding: "10px", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
									<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
										<span style={{ fontSize: "10.5px", fontWeight: 700, color: "#475569" }}>{fact.category}</span>
										<EvidenceBadge level={fact.evidenceLevel} evidence={fact.sourceReference} />
									</div>
									<div style={{ fontSize: "12.5px", color: "#1e293b", lineHeight: "1.45" }}>{fact.fact}</div>
								</div>
							))}
						</div>
					) : (
						<p style={{ fontSize: "12.5px", color: "#94a3b8", margin: 0 }}>No discrete facts recorded yet.</p>
					)}
				</div>
			</div>

			<Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Story Bible Identity" maxWidth="600px">
				<form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
					<div>
						<label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>Story Title</label>
						<input value={title} onChange={(e) => setTitle(e.target.value)} required style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
					</div>
					<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
						<div>
							<label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>Genre</label>
							<input value={genre} onChange={(e) => setGenre(e.target.value)} style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
						</div>
						<div>
							<label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>Themes (comma-separated)</label>
							<input value={themesText} onChange={(e) => setThemesText(e.target.value)} style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
						</div>
					</div>
					<div>
						<label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>Logline</label>
						<input value={logline} onChange={(e) => setLogline(e.target.value)} style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
					</div>
					<div>
						<label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>Premise</label>
						<textarea rows={2} value={premise} onChange={(e) => setPremise(e.target.value)} style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
					</div>
					<div>
						<label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>Synopsis</label>
						<textarea rows={3} value={synopsis} onChange={(e) => setSynopsis(e.target.value)} style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
					</div>
					<div>
						<label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>Setting Summary</label>
						<input value={settingSummary} onChange={(e) => setSettingSummary(e.target.value)} style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
					</div>
					<div>
						<label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>Historical Background</label>
						<textarea rows={2} value={historicalBackground} onChange={(e) => setHistoricalBackground(e.target.value)} style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
					</div>
					<div>
						<label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>Audit Reason</label>
						<input value={changeReason} onChange={(e) => setChangeReason(e.target.value)} placeholder="Reason for update (stored in Memory History)" style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
					</div>
					<div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "8px" }}>
						<button type="button" onClick={() => setIsEditOpen(false)} style={{ padding: "8px 14px", border: "1px solid #cbd5e1", borderRadius: "6px", background: "#f8fafc" }}>
							Cancel
						</button>
						<button type="submit" disabled={isSaving} style={{ padding: "8px 16px", border: "none", borderRadius: "6px", background: "#d97706", color: "#fff", fontWeight: 600 }}>
							{isSaving ? "Saving..." : "Save Identity"}
						</button>
					</div>
				</form>
			</Modal>
		</div>
	);
}

