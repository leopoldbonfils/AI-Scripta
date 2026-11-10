"use client";

import React, { useState } from "react";
import { StoryBibleRelationship } from "../../types/storyBible";
import { EvidenceBadge } from "./EvidenceBadge";
import { Modal } from "../ui/Modal";
import { FiEdit2, FiPlus, FiShare2 } from "react-icons/fi";

export interface RelationshipsMemorySectionProps {
	relationships: StoryBibleRelationship[];
	onCreateRelationship: (data: Record<string, any>, reason?: string) => Promise<any>;
	onUpdateRelationship: (id: string, data: Record<string, any>, reason?: string) => Promise<any>;
	isSaving: boolean;
}

export function RelationshipsMemorySection({
	relationships,
	onCreateRelationship,
	onUpdateRelationship,
	isSaving,
}: RelationshipsMemorySectionProps) {
	const [search, setSearch] = useState("");
	const [editingRel, setEditingRel] = useState<StoryBibleRelationship | null>(null);
	const [isCreateOpen, setIsCreateOpen] = useState(false);

	const [form, setForm] = useState({
		characterAName: "",
		characterBName: "",
		relationshipType: "ALLIANCE",
		currentStatus: "ACTIVE",
		trustLevel: 5,
		tensionLevel: 5,
		powerDynamics: "",
		changeReason: "",
	});

	const filtered = relationships.filter(
		(r) =>
			!search.trim() ||
			`${r.characterAName} ${r.characterBName} ${r.relationshipType} ${r.currentStatus}`
				.toLowerCase()
				.includes(search.toLowerCase())
	);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const { changeReason, ...payload } = form;
		if (editingRel) {
			await onUpdateRelationship(editingRel.id, payload, changeReason || "Updated relationship memory");
			setEditingRel(null);
		} else {
			await onCreateRelationship(payload, changeReason || "Added relationship memory");
			setIsCreateOpen(false);
		}
	};

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
			<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
				<div>
					<h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
						<FiShare2 size={17} color="#d97706" /> Relationship Memory ({relationships.length})
					</h3>
					<p style={{ margin: "2px 0 0", fontSize: "12.5px", color: "#64748b" }}>
						Tracks connected Phase C dynamics, current status, trust & tension shifts, and relationship milestones.
					</p>
				</div>
				<div style={{ display: "flex", gap: "8px" }}>
					<input
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Filter by character..."
						style={{ padding: "7px 12px", fontSize: "13px", border: "1px solid #cbd5e1", borderRadius: "6px" }}
					/>
					<button
						type="button"
						onClick={() => {
							setForm({
								characterAName: "",
								characterBName: "",
								relationshipType: "ALLIANCE",
								currentStatus: "ACTIVE",
								trustLevel: 5,
								tensionLevel: 5,
								powerDynamics: "",
								changeReason: "",
							});
							setIsCreateOpen(true);
						}}
						style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 14px", fontSize: "12.5px", fontWeight: 600, borderRadius: "6px", border: "none", backgroundColor: "#d97706", color: "#fff", cursor: "pointer" }}
					>
						<FiPlus size={14} /> Add Relationship
					</button>
				</div>
			</div>

			{filtered.length === 0 ? (
				<div style={{ padding: "30px", textAlign: "center", color: "#64748b", background: "#f8fafc", borderRadius: "8px", border: "1px dashed #cbd5e1" }}>
					No relationships found.
				</div>
			) : (
				<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "16px" }}>
					{filtered.map((rel) => (
						<div key={rel.id} style={{ padding: "16px", backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "10px" }}>
							<div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
								<div>
									<strong style={{ fontSize: "14.5px", color: "#0f172a" }}>
										{rel.characterAName} ↔ {rel.characterBName}
									</strong>
									<div style={{ fontSize: "12px", color: "#d97706", fontWeight: 600, marginTop: "2px" }}>
										{rel.relationshipType} • Status: {rel.currentStatus}
									</div>
								</div>
								<div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
									<EvidenceBadge level={rel.evidenceLevel} evidence={rel.sourceEvidence} />
									<button
										type="button"
										onClick={() => {
											setForm({
												characterAName: rel.characterAName,
												characterBName: rel.characterBName,
												relationshipType: rel.relationshipType,
												currentStatus: rel.currentStatus,
												trustLevel: rel.trustLevel,
												tensionLevel: rel.tensionLevel,
												powerDynamics: rel.powerDynamics || "",
												changeReason: "",
											});
											setEditingRel(rel);
										}}
										style={{ padding: "4px 7px", border: "1px solid #cbd5e1", borderRadius: "5px", backgroundColor: "#f8fafc", cursor: "pointer" }}
									>
										<FiEdit2 size={12} />
									</button>
								</div>
							</div>

							<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "12px" }}>
								<div>
									<div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
										<span style={{ color: "#475569" }}>Trust</span>
										<strong>{rel.trustLevel}/10</strong>
									</div>
									<div style={{ height: "6px", backgroundColor: "#e2e8f0", borderRadius: "3px", overflow: "hidden" }}>
										<div style={{ width: `${rel.trustLevel * 10}%`, height: "100%", backgroundColor: "#059669" }} />
									</div>
								</div>
								<div>
									<div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
										<span style={{ color: "#475569" }}>Tension</span>
										<strong>{rel.tensionLevel}/10</strong>
									</div>
									<div style={{ height: "6px", backgroundColor: "#e2e8f0", borderRadius: "3px", overflow: "hidden" }}>
										<div style={{ width: `${rel.tensionLevel * 10}%`, height: "100%", backgroundColor: "#dc2626" }} />
									</div>
								</div>
							</div>

							{rel.powerDynamics && (
								<div style={{ fontSize: "12.5px", color: "#334155" }}>
									<strong>Power Dynamics:</strong> {rel.powerDynamics}
								</div>
							)}

							{rel.historyOfChanges && rel.historyOfChanges.length > 0 && (
								<div style={{ padding: "8px 10px", backgroundColor: "#f8fafc", borderRadius: "6px", fontSize: "12px", color: "#475569" }}>
									<strong>Shift History:</strong>
									<ul style={{ margin: "4px 0 0", paddingLeft: "16px" }}>
										{rel.historyOfChanges.map((h, i) => (
											<li key={i}>{h.event}: {h.change} {h.sceneRef ? `(${h.sceneRef})` : ""}</li>
										))}
									</ul>
								</div>
							)}
						</div>
					))}
				</div>
			)}

			<Modal
				isOpen={Boolean(editingRel) || isCreateOpen}
				onClose={() => { setEditingRel(null); setIsCreateOpen(false); }}
				title={editingRel ? "Edit Relationship Memory" : "Add Relationship"}
			>
				<form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
					<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
						<div>
							<label style={{ fontSize: "11.5px", fontWeight: 600 }}>Character A</label>
							<input value={form.characterAName} disabled={Boolean(editingRel)} onChange={(e) => setForm({ ...form, characterAName: e.target.value })} required style={{ width: "100%", padding: "7px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
						</div>
						<div>
							<label style={{ fontSize: "11.5px", fontWeight: 600 }}>Character B</label>
							<input value={form.characterBName} disabled={Boolean(editingRel)} onChange={(e) => setForm({ ...form, characterBName: e.target.value })} required style={{ width: "100%", padding: "7px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
						</div>
					</div>
					<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
						<div>
							<label style={{ fontSize: "11.5px", fontWeight: 600 }}>Type</label>
							<input value={form.relationshipType} onChange={(e) => setForm({ ...form, relationshipType: e.target.value })} style={{ width: "100%", padding: "7px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
						</div>
						<div>
							<label style={{ fontSize: "11.5px", fontWeight: 600 }}>Current Status</label>
							<input value={form.currentStatus} onChange={(e) => setForm({ ...form, currentStatus: e.target.value })} style={{ width: "100%", padding: "7px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
						</div>
					</div>
					<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
						<div>
							<label style={{ fontSize: "11.5px", fontWeight: 600 }}>Trust Level (1-10)</label>
							<input type="number" min={1} max={10} value={form.trustLevel} onChange={(e) => setForm({ ...form, trustLevel: Number(e.target.value) })} style={{ width: "100%", padding: "7px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
						</div>
						<div>
							<label style={{ fontSize: "11.5px", fontWeight: 600 }}>Tension Level (1-10)</label>
							<input type="number" min={1} max={10} value={form.tensionLevel} onChange={(e) => setForm({ ...form, tensionLevel: Number(e.target.value) })} style={{ width: "100%", padding: "7px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
						</div>
					</div>
					<div>
						<label style={{ fontSize: "11.5px", fontWeight: 600 }}>Power Dynamics</label>
						<input value={form.powerDynamics} onChange={(e) => setForm({ ...form, powerDynamics: e.target.value })} style={{ width: "100%", padding: "7px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
					</div>
					<div>
						<label style={{ fontSize: "11.5px", fontWeight: 600 }}>Audit Reason</label>
						<input value={form.changeReason} onChange={(e) => setForm({ ...form, changeReason: e.target.value })} style={{ width: "100%", padding: "7px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
					</div>
					<div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
						<button type="button" onClick={() => { setEditingRel(null); setIsCreateOpen(false); }} style={{ padding: "8px 14px", border: "1px solid #cbd5e1", borderRadius: "6px" }}>Cancel</button>
						<button type="submit" disabled={isSaving} style={{ padding: "8px 16px", border: "none", borderRadius: "6px", background: "#d97706", color: "#fff", fontWeight: 600 }}>{isSaving ? "Saving..." : "Save"}</button>
					</div>
				</form>
			</Modal>
		</div>
	);
}

