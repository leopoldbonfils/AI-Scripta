"use client";

import React, { useState } from "react";
import { StoryBibleEntity } from "../../types/storyBible";
import { EvidenceBadge } from "./EvidenceBadge";
import { Modal } from "../ui/Modal";
import { FiBox, FiEdit2, FiPlus } from "react-icons/fi";

export interface EntitiesMemorySectionProps {
	entities: StoryBibleEntity[];
	onCreateEntity: (data: Record<string, any>, reason?: string) => Promise<any>;
	onUpdateEntity: (id: string, data: Record<string, any>, reason?: string) => Promise<any>;
	isSaving: boolean;
}

export function EntitiesMemorySection({
	entities,
	onCreateEntity,
	onUpdateEntity,
	isSaving,
}: EntitiesMemorySectionProps) {
	const [categoryFilter, setCategoryFilter] = useState("ALL");
	const [search, setSearch] = useState("");
	const [editing, setEditing] = useState<StoryBibleEntity | null>(null);
	const [isCreateOpen, setIsCreateOpen] = useState(false);

	const [form, setForm] = useState({
		name: "",
		category: "EVIDENCE",
		description: "",
		currentOwner: "",
		currentLocation: "",
		condition: "INTACT",
		changeReason: "",
	});

	const filtered = entities.filter((e) => {
		const matchesCat = categoryFilter === "ALL" || e.category === categoryFilter;
		const matchesSearch =
			!search.trim() ||
			`${e.name} ${e.description || ""} ${e.currentOwner || ""}`
				.toLowerCase()
				.includes(search.toLowerCase());
		return matchesCat && matchesSearch;
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const { changeReason, ...payload } = form;
		if (editing) {
			await onUpdateEntity(editing.id, payload, changeReason || `Updated ${form.name}`);
			setEditing(null);
		} else {
			await onCreateEntity(payload, changeReason || `Added ${form.name}`);
			setIsCreateOpen(false);
		}
	};

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
			<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
				<div>
					<h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
						<FiBox size={17} color="#d97706" /> Important Objects & Entities ({entities.length})
					</h3>
					<p style={{ margin: "2px 0 0", fontSize: "12.5px", color: "#64748b" }}>
						Tracks weapons, documents, evidence, vehicles, belongings, organizations, ownership transfers, and physical condition.
					</p>
				</div>
				<button
					type="button"
					onClick={() => {
						setForm({ name: "", category: "EVIDENCE", description: "", currentOwner: "", currentLocation: "", condition: "INTACT", changeReason: "" });
						setIsCreateOpen(true);
					}}
					style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 14px", fontSize: "12.5px", fontWeight: 600, borderRadius: "6px", border: "none", backgroundColor: "#d97706", color: "#fff", cursor: "pointer" }}
				>
					<FiPlus size={14} /> Add Entity / Object
				</button>
			</div>

			<div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
				<input
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					placeholder="Filter by name, owner..."
					style={{ flex: 1, minWidth: "200px", padding: "8px 12px", fontSize: "13px", border: "1px solid #cbd5e1", borderRadius: "6px" }}
				/>
				<select
					value={categoryFilter}
					onChange={(e) => setCategoryFilter(e.target.value)}
					style={{ padding: "8px 12px", fontSize: "13px", border: "1px solid #cbd5e1", borderRadius: "6px", backgroundColor: "#fff" }}
				>
					<option value="ALL">All Categories</option>
					<option value="EVIDENCE">Evidence</option>
					<option value="DOCUMENT">Document</option>
					<option value="WEAPON">Weapon</option>
					<option value="VEHICLE">Vehicle</option>
					<option value="BELONGING">Personal Belonging</option>
					<option value="ORGANIZATION">Organization</option>
					<option value="TECHNOLOGY">Technology</option>
					<option value="OTHER">Other</option>
				</select>
			</div>

			{filtered.length === 0 ? (
				<div style={{ padding: "30px", textAlign: "center", color: "#64748b", background: "#f8fafc", borderRadius: "8px", border: "1px dashed #cbd5e1" }}>
					No tracked objects or entities found (Stories without explicit physical props remain cleanly empty).
				</div>
			) : (
				<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
					{filtered.map((ent) => (
						<div key={ent.id} style={{ padding: "16px", backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "8px" }}>
							<div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
								<div>
									<strong style={{ fontSize: "15px", color: "#0f172a" }}>{ent.name}</strong>
									<div style={{ display: "flex", gap: "6px", marginTop: "4px", alignItems: "center" }}>
										<span style={{ fontSize: "10.5px", fontWeight: 700, padding: "2px 6px", borderRadius: "4px", backgroundColor: "#f1f5f9", color: "#334155" }}>{ent.category}</span>
										<span style={{ fontSize: "10.5px", fontWeight: 700, padding: "2px 6px", borderRadius: "4px", backgroundColor: ent.condition === "DESTROYED" || ent.condition === "LOST" ? "#fef2f2" : "#ecfdf5", color: ent.condition === "DESTROYED" || ent.condition === "LOST" ? "#b91c1c" : "#047857" }}>{ent.condition}</span>
									</div>
								</div>
								<div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
									<EvidenceBadge level={ent.evidenceLevel} evidence={ent.sourceEvidence} />
									<button
										type="button"
										onClick={() => {
											setForm({
												name: ent.name,
												category: ent.category,
												description: ent.description || "",
												currentOwner: ent.currentOwner || "",
												currentLocation: ent.currentLocation || "",
												condition: ent.condition,
												changeReason: "",
											});
											setEditing(ent);
										}}
										style={{ padding: "4px 7px", border: "1px solid #cbd5e1", borderRadius: "5px", backgroundColor: "#f8fafc", cursor: "pointer" }}
									>
										<FiEdit2 size={12} />
									</button>
								</div>
							</div>

							{ent.description && <p style={{ margin: 0, fontSize: "12.5px", color: "#334155" }}>{ent.description}</p>}

							<div style={{ padding: "8px 10px", backgroundColor: "#f8fafc", borderRadius: "6px", fontSize: "12px", color: "#475569", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
								<div><strong>Owner:</strong> {ent.currentOwner || "Unassigned"}</div>
								<div><strong>Location:</strong> {ent.currentLocation || "Unknown"}</div>
							</div>

							{ent.transferHistory && ent.transferHistory.length > 0 && (
								<div style={{ fontSize: "12px", color: "#475569" }}>
									<strong>Custody Transfers:</strong>
									<ul style={{ margin: "4px 0 0", paddingLeft: "16px" }}>
										{ent.transferHistory.map((t, i) => (
											<li key={i}>{t.from || "?"} → {t.to || "?"} ({t.sceneRef || "Event"}): {t.description}</li>
										))}
									</ul>
								</div>
							)}
						</div>
					))}
				</div>
			)}

			<Modal
				isOpen={Boolean(editing) || isCreateOpen}
				onClose={() => { setEditing(null); setIsCreateOpen(false); }}
				title={editing ? `Edit Entity: ${editing.name}` : "Add Narrative Object / Entity"}
			>
				<form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
					<div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "8px" }}>
						<div>
							<label style={{ fontSize: "12px", fontWeight: 600 }}>Name</label>
							<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required style={{ width: "100%", padding: "7px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
						</div>
						<div>
							<label style={{ fontSize: "12px", fontWeight: 600 }}>Category</label>
							<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={{ width: "100%", padding: "7px", border: "1px solid #cbd5e1", borderRadius: "6px" }}>
								<option value="EVIDENCE">EVIDENCE</option>
								<option value="DOCUMENT">DOCUMENT</option>
								<option value="WEAPON">WEAPON</option>
								<option value="VEHICLE">VEHICLE</option>
								<option value="BELONGING">BELONGING</option>
								<option value="ORGANIZATION">ORGANIZATION</option>
								<option value="TECHNOLOGY">TECHNOLOGY</option>
								<option value="OTHER">OTHER</option>
							</select>
						</div>
					</div>
					<div>
						<label style={{ fontSize: "12px", fontWeight: 600 }}>Description</label>
						<textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ width: "100%", padding: "7px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
					</div>
					<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
						<div>
							<label style={{ fontSize: "12px", fontWeight: 600 }}>Current Owner</label>
							<input value={form.currentOwner} onChange={(e) => setForm({ ...form, currentOwner: e.target.value })} style={{ width: "100%", padding: "7px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
						</div>
						<div>
							<label style={{ fontSize: "12px", fontWeight: 600 }}>Current Location</label>
							<input value={form.currentLocation} onChange={(e) => setForm({ ...form, currentLocation: e.target.value })} style={{ width: "100%", padding: "7px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
						</div>
						<div>
							<label style={{ fontSize: "12px", fontWeight: 600 }}>Condition</label>
							<select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} style={{ width: "100%", padding: "7px", border: "1px solid #cbd5e1", borderRadius: "6px" }}>
								<option value="INTACT">INTACT</option>
								<option value="DAMAGED">DAMAGED</option>
								<option value="DESTROYED">DESTROYED</option>
								<option value="LOST">LOST</option>
								<option value="CONFISCATED">CONFISCATED</option>
							</select>
						</div>
					</div>
					<div>
						<label style={{ fontSize: "12px", fontWeight: 600 }}>Audit Reason</label>
						<input value={form.changeReason} onChange={(e) => setForm({ ...form, changeReason: e.target.value })} style={{ width: "100%", padding: "7px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
					</div>
					<div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
						<button type="button" onClick={() => { setEditing(null); setIsCreateOpen(false); }} style={{ padding: "8px 14px", border: "1px solid #cbd5e1", borderRadius: "6px" }}>Cancel</button>
						<button type="submit" disabled={isSaving} style={{ padding: "8px 16px", border: "none", borderRadius: "6px", background: "#d97706", color: "#fff", fontWeight: 600 }}>{isSaving ? "Saving..." : "Save Entity"}</button>
					</div>
				</form>
			</Modal>
		</div>
	);
}

