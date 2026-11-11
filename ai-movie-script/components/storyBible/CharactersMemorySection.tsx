"use client";

import React, { useState } from "react";
import { StoryBibleCharacter } from "../../types/storyBible";
import { EvidenceBadge } from "./EvidenceBadge";
import { Modal } from "../ui/Modal";
import { FiEdit2, FiPlus, FiUsers, FiSearch } from "react-icons/fi";

export interface CharactersMemorySectionProps {
	characters: StoryBibleCharacter[];
	onCreateCharacter: (data: Record<string, any>, reason?: string) => Promise<any>;
	onUpdateCharacter: (id: string, data: Record<string, any>, reason?: string) => Promise<any>;
	isSaving: boolean;
}

export function CharactersMemorySection({
	characters,
	onCreateCharacter,
	onUpdateCharacter,
	isSaving,
}: CharactersMemorySectionProps) {
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState("ALL");
	const [editingChar, setEditingChar] = useState<StoryBibleCharacter | null>(null);
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);

	const [form, setForm] = useState<Record<string, string>>({
		name: "",
		role: "SUPPORTING",
		age: "",
		status: "ALIVE",
		personality: "",
		physicalDescription: "",
		background: "",
		goals: "",
		motivations: "",
		fears: "",
		weaknesses: "",
		internalConflict: "",
		externalConflict: "",
		characterArc: "",
		firstAppearance: "",
		changeReason: "",
	});

	const filtered = characters.filter((c) => {
		const matchesSearch =
			!search.trim() ||
			`${c.name} ${c.role || ""} ${c.goals || ""} ${c.background || ""}`
				.toLowerCase()
				.includes(search.toLowerCase());
		const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
		return matchesSearch && matchesStatus;
	});

	const openEdit = (char: StoryBibleCharacter) => {
		setForm({
			name: char.name,
			role: char.role || "SUPPORTING",
			age: char.age || "",
			status: char.status || "ALIVE",
			personality: char.personality || "",
			physicalDescription: char.physicalDescription || "",
			background: char.background || "",
			goals: char.goals || "",
			motivations: char.motivations || "",
			fears: char.fears || "",
			weaknesses: char.weaknesses || "",
			internalConflict: char.internalConflict || "",
			externalConflict: char.externalConflict || "",
			characterArc: char.characterArc || "",
			firstAppearance: char.firstAppearance || "",
			changeReason: "",
		});
		setEditingChar(char);
	};

	const openCreate = () => {
		setForm({
			name: "",
			role: "SUPPORTING",
			age: "",
			status: "ALIVE",
			personality: "",
			physicalDescription: "",
			background: "",
			goals: "",
			motivations: "",
			fears: "",
			weaknesses: "",
			internalConflict: "",
			externalConflict: "",
			characterArc: "",
			firstAppearance: "",
			changeReason: "Writer added new character to Story Bible",
		});
		setIsCreateOpen(true);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setFormError(null);
		const { changeReason, ...payload } = form;
		try {
			if (editingChar) {
				await onUpdateCharacter(editingChar.id, payload, changeReason || `Updated ${form.name}`);
				setEditingChar(null);
			} else {
				await onCreateCharacter(payload, changeReason || `Added ${form.name}`);
				setIsCreateOpen(false);
			}
		} catch (err: unknown) {
			setFormError(err instanceof Error ? err.message : "Failed to save character memory");
		}
	};

	const statusColor = (status: string) => {
		if (status === "DEAD") return { bg: "#fef2f2", text: "#b91c1c", border: "#fecaca" };
		if (status === "MISSING" || status === "UNKNOWN")
			return { bg: "#fffbeb", text: "#b45309", border: "#fde68a" };
		if (status === "IMPRISONED" || status === "INJURED")
			return { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" };
		return { bg: "#ecfdf5", text: "#047857", border: "#a7f3d0" };
	};

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
			<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
				<div>
					<h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
						<FiUsers size={17} color="#d97706" /> Persistent Character Memory ({characters.length})
					</h3>
					<p style={{ margin: "2px 0 0", fontSize: "12.5px", color: "#64748b" }}>
						Tracks identity, physical description, status, goals, conflicts, key decisions, and narrative developments.
					</p>
				</div>
				<button
					type="button"
					onClick={openCreate}
					style={{
						display: "flex",
						alignItems: "center",
						gap: "6px",
						padding: "7px 14px",
						fontSize: "12.5px",
						fontWeight: 600,
						borderRadius: "6px",
						border: "none",
						backgroundColor: "#d97706",
						color: "#ffffff",
						cursor: "pointer",
					}}
				>
					<FiPlus size={14} /> Add Character
				</button>
			</div>

			<div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
				<div style={{ position: "relative", flex: 1, minWidth: "220px" }}>
					<FiSearch size={14} style={{ position: "absolute", left: "10px", top: "10px", color: "#94a3b8" }} />
					<input
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Filter characters by name, role, goal..."
						style={{ width: "100%", padding: "8px 12px 8px 32px", fontSize: "13px", border: "1px solid #cbd5e1", borderRadius: "6px" }}
					/>
				</div>
				<select
					value={statusFilter}
					onChange={(e) => setStatusFilter(e.target.value)}
					style={{ padding: "8px 12px", fontSize: "13px", border: "1px solid #cbd5e1", borderRadius: "6px", backgroundColor: "#fff" }}
				>
					<option value="ALL">All Statuses</option>
					<option value="ALIVE">Alive</option>
					<option value="DEAD">Dead</option>
					<option value="MISSING">Missing</option>
					<option value="IMPRISONED">Imprisoned</option>
					<option value="INJURED">Injured</option>
					<option value="UNKNOWN">Unknown</option>
				</select>
			</div>

			{filtered.length === 0 ? (
				<div style={{ padding: "32px", textAlign: "center", color: "#64748b", background: "#f8fafc", borderRadius: "8px", border: "1px dashed #cbd5e1" }}>
					No character memory entries match the current filter.
				</div>
			) : (
				<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: "16px" }}>
					{filtered.map((c) => {
						const st = statusColor(c.status);
						return (
							<div key={c.id} style={{ padding: "16px", backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "10px" }}>
								<div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
									<div>
										<div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
											<strong style={{ fontSize: "15.5px", color: "#0f172a" }}>{c.name}</strong>
											{c.age && <span style={{ fontSize: "12px", color: "#64748b" }}>• Age {c.age}</span>}
										</div>
										<div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
											{c.role || "Role unspecified"}{c.firstAppearance ? ` • First seen: ${c.firstAppearance}` : ""}
										</div>
									</div>

									<div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
										<span style={{ fontSize: "10.5px", fontWeight: 700, padding: "2px 8px", borderRadius: "10px", backgroundColor: st.bg, color: st.text, border: `1px solid ${st.border}` }}>
											{c.status}
										</span>
										<button
											type="button"
											onClick={() => openEdit(c)}
											title="Edit character memory"
											style={{ padding: "4px 7px", border: "1px solid #cbd5e1", borderRadius: "5px", backgroundColor: "#f8fafc", cursor: "pointer" }}
										>
											<FiEdit2 size={12} color="#334155" />
										</button>
									</div>
								</div>

								<div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
									<EvidenceBadge level={c.evidenceLevel} evidence={c.sourceEvidence} />
									{c.characterId && (
										<span style={{ fontSize: "10.5px", color: "#475569", backgroundColor: "#f1f5f9", padding: "2px 7px", borderRadius: "4px" }}>
											Linked to Project Cast
										</span>
									)}
								</div>

								{c.physicalDescription && (
									<div style={{ fontSize: "12.5px", color: "#334155" }}>
										<strong>Physical:</strong> {c.physicalDescription}
									</div>
								)}
								{c.background && (
									<div style={{ fontSize: "12.5px", color: "#475569", lineHeight: "1.45" }}>
										<strong>Background:</strong> {c.background}
									</div>
								)}

								<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", padding: "10px", backgroundColor: "#f8fafc", borderRadius: "6px", fontSize: "12px" }}>
									<div><strong>Goals:</strong> {c.goals || "—"}</div>
									<div><strong>Fears:</strong> {c.fears || "—"}</div>
									<div><strong>Internal Conflict:</strong> {c.internalConflict || "—"}</div>
									<div><strong>External Conflict:</strong> {c.externalConflict || "—"}</div>
								</div>

								{c.characterArc && (
									<div style={{ fontSize: "12px", color: "#334155" }}>
										<strong>Arc:</strong> {c.characterArc}
									</div>
								)}

								{c.importantDecisions && c.importantDecisions.length > 0 && (
									<div style={{ fontSize: "12px", color: "#334155" }}>
										<strong>Key Decisions:</strong> {c.importantDecisions.join(" • ")}
									</div>
								)}
							</div>
						);
					})}
				</div>
			)}

			<Modal
				isOpen={Boolean(editingChar) || isCreateOpen}
				onClose={() => {
					setFormError(null);
					setEditingChar(null);
					setIsCreateOpen(false);
				}}
				title={editingChar ? `Edit Character Memory: ${editingChar.name}` : "Add Character to Story Bible"}
				maxWidth="620px"
			>
				<form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
					{formError && (
						<div style={{ padding: "8px 12px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "6px", color: "#b91c1c", fontSize: "12.5px" }}>
							{formError}
						</div>
					)}
					<div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "8px" }}>
						<div>
							<label style={{ display: "block", fontSize: "11.5px", fontWeight: 600 }}>Name</label>
							<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required style={{ width: "100%", padding: "7px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
						</div>
						<div>
							<label style={{ display: "block", fontSize: "11.5px", fontWeight: 600 }}>Role</label>
							<input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} style={{ width: "100%", padding: "7px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
						</div>
						<div>
							<label style={{ display: "block", fontSize: "11.5px", fontWeight: 600 }}>Age</label>
							<input value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} style={{ width: "100%", padding: "7px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
						</div>
						<div>
							<label style={{ display: "block", fontSize: "11.5px", fontWeight: 600 }}>Status</label>
							<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={{ width: "100%", padding: "7px", border: "1px solid #cbd5e1", borderRadius: "6px" }}>
								<option value="ALIVE">ALIVE</option>
								<option value="DEAD">DEAD</option>
								<option value="MISSING">MISSING</option>
								<option value="IMPRISONED">IMPRISONED</option>
								<option value="INJURED">INJURED</option>
								<option value="UNKNOWN">UNKNOWN</option>
							</select>
						</div>
					</div>
					<div>
						<label style={{ display: "block", fontSize: "11.5px", fontWeight: 600 }}>Physical Description</label>
						<input value={form.physicalDescription} onChange={(e) => setForm({ ...form, physicalDescription: e.target.value })} style={{ width: "100%", padding: "7px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
					</div>
					<div>
						<label style={{ display: "block", fontSize: "11.5px", fontWeight: 600 }}>Background</label>
						<textarea rows={2} value={form.background} onChange={(e) => setForm({ ...form, background: e.target.value })} style={{ width: "100%", padding: "7px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
					</div>
					<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
						<div>
							<label style={{ display: "block", fontSize: "11.5px", fontWeight: 600 }}>Goals</label>
							<input value={form.goals} onChange={(e) => setForm({ ...form, goals: e.target.value })} style={{ width: "100%", padding: "7px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
						</div>
						<div>
							<label style={{ display: "block", fontSize: "11.5px", fontWeight: 600 }}>Fears</label>
							<input value={form.fears} onChange={(e) => setForm({ ...form, fears: e.target.value })} style={{ width: "100%", padding: "7px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
						</div>
					</div>
					<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
						<div>
							<label style={{ display: "block", fontSize: "11.5px", fontWeight: 600 }}>Internal Conflict</label>
							<input value={form.internalConflict} onChange={(e) => setForm({ ...form, internalConflict: e.target.value })} style={{ width: "100%", padding: "7px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
						</div>
						<div>
							<label style={{ display: "block", fontSize: "11.5px", fontWeight: 600 }}>Character Arc</label>
							<input value={form.characterArc} onChange={(e) => setForm({ ...form, characterArc: e.target.value })} style={{ width: "100%", padding: "7px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
						</div>
					</div>
					<div>
						<label style={{ display: "block", fontSize: "11.5px", fontWeight: 600 }}>Audit Reason</label>
						<input value={form.changeReason} onChange={(e) => setForm({ ...form, changeReason: e.target.value })} placeholder="Why are you changing this memory?" style={{ width: "100%", padding: "7px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
					</div>
					<div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "8px" }}>
						<button type="button" onClick={() => { setEditingChar(null); setIsCreateOpen(false); }} style={{ padding: "8px 14px", border: "1px solid #cbd5e1", borderRadius: "6px", background: "#f8fafc" }}>Cancel</button>
						<button type="submit" disabled={isSaving} style={{ padding: "8px 16px", border: "none", borderRadius: "6px", background: "#d97706", color: "#fff", fontWeight: 600 }}>
							{isSaving ? "Saving..." : "Save Character"}
						</button>
					</div>
				</form>
			</Modal>
		</div>
	);
}

