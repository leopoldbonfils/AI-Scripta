"use client";

import React, { useState } from "react";
import { StoryBibleLocation } from "../../types/storyBible";
import { EvidenceBadge } from "./EvidenceBadge";
import { Modal } from "../ui/Modal";
import { FiMapPin, FiEdit2, FiPlus } from "react-icons/fi";

export interface LocationsMemorySectionProps {
	locations: StoryBibleLocation[];
	onCreateLocation: (data: Record<string, any>, reason?: string) => Promise<any>;
	onUpdateLocation: (id: string, data: Record<string, any>, reason?: string) => Promise<any>;
	isSaving: boolean;
}

export function LocationsMemorySection({
	locations,
	onCreateLocation,
	onUpdateLocation,
	isSaving,
}: LocationsMemorySectionProps) {
	const [search, setSearch] = useState("");
	const [editing, setEditing] = useState<StoryBibleLocation | null>(null);
	const [isCreateOpen, setIsCreateOpen] = useState(false);

	const [form, setForm] = useState({
		name: "",
		geographicContext: "",
		description: "",
		changesOverTimeText: "",
		changeReason: "",
	});

	const filtered = locations.filter(
		(l) =>
			!search.trim() ||
			`${l.name} ${l.geographicContext || ""} ${l.description || ""}`
				.toLowerCase()
				.includes(search.toLowerCase())
	);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const payload = {
			name: form.name.trim(),
			geographicContext: form.geographicContext.trim() || null,
			description: form.description.trim() || null,
			changesOverTime: form.changesOverTimeText
				.split("\n")
				.map((s) => s.trim())
				.filter(Boolean),
		};
		if (editing) {
			await onUpdateLocation(editing.id, payload, form.changeReason || `Updated ${form.name}`);
			setEditing(null);
		} else {
			await onCreateLocation(payload, form.changeReason || `Added location ${form.name}`);
			setIsCreateOpen(false);
		}
	};

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
			<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
				<div>
					<h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
						<FiMapPin size={17} color="#d97706" /> Location Memory ({locations.length})
					</h3>
					<p style={{ margin: "2px 0 0", fontSize: "12.5px", color: "#64748b" }}>
						Canonical locations, geographic context, connected events, associated cast, and spatial state changes.
					</p>
				</div>
				<div style={{ display: "flex", gap: "8px" }}>
					<input
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Filter locations..."
						style={{ padding: "7px 12px", fontSize: "13px", border: "1px solid #cbd5e1", borderRadius: "6px" }}
					/>
					<button
						type="button"
						onClick={() => {
							setForm({ name: "", geographicContext: "", description: "", changesOverTimeText: "", changeReason: "" });
							setIsCreateOpen(true);
						}}
						style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 14px", fontSize: "12.5px", fontWeight: 600, borderRadius: "6px", border: "none", backgroundColor: "#d97706", color: "#fff", cursor: "pointer" }}
					>
						<FiPlus size={14} /> Add Location
					</button>
				</div>
			</div>

			{filtered.length === 0 ? (
				<div style={{ padding: "30px", textAlign: "center", color: "#64748b", background: "#f8fafc", borderRadius: "8px", border: "1px dashed #cbd5e1" }}>
					No location memory entries yet.
				</div>
			) : (
				<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
					{filtered.map((loc) => (
						<div key={loc.id} style={{ padding: "16px", backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "8px" }}>
							<div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
								<div>
									<strong style={{ fontSize: "15px", color: "#0f172a" }}>{loc.name}</strong>
									{loc.geographicContext && <div style={{ fontSize: "12px", color: "#64748b" }}>{loc.geographicContext}</div>}
								</div>
								<div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
									<EvidenceBadge level={loc.evidenceLevel} evidence={loc.sourceEvidence} />
									<button
										type="button"
										onClick={() => {
											setForm({
												name: loc.name,
												geographicContext: loc.geographicContext || "",
												description: loc.description || "",
												changesOverTimeText: (loc.changesOverTime || []).join("\n"),
												changeReason: "",
											});
											setEditing(loc);
										}}
										style={{ padding: "4px 7px", border: "1px solid #cbd5e1", borderRadius: "5px", backgroundColor: "#f8fafc", cursor: "pointer" }}
									>
										<FiEdit2 size={12} />
									</button>
								</div>
							</div>

							{loc.description && <p style={{ margin: 0, fontSize: "13px", color: "#334155", lineHeight: "1.5" }}>{loc.description}</p>}

							{loc.associatedCharacters && loc.associatedCharacters.length > 0 && (
								<div style={{ fontSize: "12px", color: "#475569" }}>
									<strong>Associated Cast:</strong> {loc.associatedCharacters.join(", ")}
								</div>
							)}

							{loc.importantEvents && loc.importantEvents.length > 0 && (
								<div style={{ fontSize: "12px", color: "#475569" }}>
									<strong>Key Events:</strong> {loc.importantEvents.join(" • ")}
								</div>
							)}

							{loc.changesOverTime && loc.changesOverTime.length > 0 && (
								<div style={{ padding: "8px 10px", backgroundColor: "#fffbeb", borderRadius: "6px", border: "1px solid #fde68a", fontSize: "12px", color: "#92400e" }}>
									<strong>State Changes:</strong> {loc.changesOverTime.join(" | ")}
								</div>
							)}
						</div>
					))}
				</div>
			)}

			<Modal
				isOpen={Boolean(editing) || isCreateOpen}
				onClose={() => { setEditing(null); setIsCreateOpen(false); }}
				title={editing ? `Edit Location: ${editing.name}` : "Add Story Location"}
			>
				<form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
					<div>
						<label style={{ fontSize: "12px", fontWeight: 600 }}>Location Name</label>
						<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required style={{ width: "100%", padding: "7px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
					</div>
					<div>
						<label style={{ fontSize: "12px", fontWeight: 600 }}>Geographic / World Context</label>
						<input value={form.geographicContext} onChange={(e) => setForm({ ...form, geographicContext: e.target.value })} style={{ width: "100%", padding: "7px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
					</div>
					<div>
						<label style={{ fontSize: "12px", fontWeight: 600 }}>Description</label>
						<textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ width: "100%", padding: "7px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
					</div>
					<div>
						<label style={{ fontSize: "12px", fontWeight: 600 }}>Changes Over Time (one per line)</label>
						<textarea rows={2} value={form.changesOverTimeText} onChange={(e) => setForm({ ...form, changesOverTimeText: e.target.value })} style={{ width: "100%", padding: "7px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
					</div>
					<div>
						<label style={{ fontSize: "12px", fontWeight: 600 }}>Audit Reason</label>
						<input value={form.changeReason} onChange={(e) => setForm({ ...form, changeReason: e.target.value })} style={{ width: "100%", padding: "7px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
					</div>
					<div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
						<button type="button" onClick={() => { setEditing(null); setIsCreateOpen(false); }} style={{ padding: "8px 14px", border: "1px solid #cbd5e1", borderRadius: "6px" }}>Cancel</button>
						<button type="submit" disabled={isSaving} style={{ padding: "8px 16px", border: "none", borderRadius: "6px", background: "#d97706", color: "#fff", fontWeight: 600 }}>{isSaving ? "Saving..." : "Save Location"}</button>
					</div>
				</form>
			</Modal>
		</div>
	);
}

