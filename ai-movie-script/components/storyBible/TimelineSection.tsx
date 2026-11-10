"use client";

import React, { useState } from "react";
import { NarrativeTimelineEvent } from "../../types/storyBible";
import { EvidenceBadge } from "./EvidenceBadge";
import { Modal } from "../ui/Modal";
import { FiClock, FiPlus, FiEdit2 } from "react-icons/fi";

export interface TimelineSectionProps {
	events: NarrativeTimelineEvent[];
	onCreateEvent: (data: Record<string, any>, reason?: string) => Promise<any>;
	onUpdateEvent: (id: string, data: Record<string, any>, reason?: string) => Promise<any>;
	isSaving: boolean;
}

export function TimelineSection({
	events,
	onCreateEvent,
	onUpdateEvent,
	isSaving,
}: TimelineSectionProps) {
	const [orderMode, setOrderMode] = useState<"CHRONOLOGICAL" | "SCREENPLAY">("CHRONOLOGICAL");
	const [typeFilter, setTypeFilter] = useState("ALL");
	const [editing, setEditing] = useState<NarrativeTimelineEvent | null>(null);
	const [isCreateOpen, setIsCreateOpen] = useState(false);

	const [form, setForm] = useState({
		title: "",
		eventType: "PLOT_EVENT",
		chronologicalOrder: 1,
		screenplayOrder: "" as string | number,
		isFlashback: false,
		isParallel: false,
		timingCertainty: "EXPLICIT",
		narrativeTimeLabel: "",
		description: "",
		causalImpact: "",
		changeReason: "",
	});

	const sorted = [...events]
		.filter((e) => typeFilter === "ALL" || e.eventType === typeFilter)
		.sort((a, b) => {
			if (orderMode === "SCREENPLAY") {
				const aS = a.screenplayOrder ?? 9999;
				const bS = b.screenplayOrder ?? 9999;
				return aS - bS || a.chronologicalOrder - b.chronologicalOrder;
			}
			return a.chronologicalOrder - b.chronologicalOrder;
		});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const payload = {
			title: form.title.trim(),
			eventType: form.eventType,
			chronologicalOrder: Number(form.chronologicalOrder),
			screenplayOrder: form.screenplayOrder === "" ? null : Number(form.screenplayOrder),
			isFlashback: form.isFlashback,
			isParallel: form.isParallel,
			timingCertainty: form.timingCertainty,
			narrativeTimeLabel: form.narrativeTimeLabel.trim() || null,
			description: form.description.trim() || null,
			causalImpact: form.causalImpact.trim() || null,
		};
		if (editing) {
			await onUpdateEvent(editing.id, payload, form.changeReason || `Updated event: ${form.title}`);
			setEditing(null);
		} else {
			await onCreateEvent(payload, form.changeReason || `Added timeline event: ${form.title}`);
			setIsCreateOpen(false);
		}
	};

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
			<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
				<div>
					<h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
						<FiClock size={17} color="#d97706" /> Narrative Timeline ({events.length} Events)
					</h3>
					<p style={{ margin: "2px 0 0", fontSize: "12.5px", color: "#64748b" }}>
						Explicitly distinguishes in-story chronological time from screenplay scene sequence, flashbacks, parallel threads, and unknown dates.
					</p>
				</div>

				<div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
					<div style={{ display: "inline-flex", border: "1px solid #cbd5e1", borderRadius: "6px", overflow: "hidden" }}>
						<button
							type="button"
							onClick={() => setOrderMode("CHRONOLOGICAL")}
							style={{
								padding: "6px 12px",
								fontSize: "12px",
								fontWeight: 600,
								border: "none",
								backgroundColor: orderMode === "CHRONOLOGICAL" ? "#d97706" : "#ffffff",
								color: orderMode === "CHRONOLOGICAL" ? "#ffffff" : "#475569",
								cursor: "pointer",
							}}
						>
							In-Story Chronology
						</button>
						<button
							type="button"
							onClick={() => setOrderMode("SCREENPLAY")}
							style={{
								padding: "6px 12px",
								fontSize: "12px",
								fontWeight: 600,
								border: "none",
								backgroundColor: orderMode === "SCREENPLAY" ? "#d97706" : "#ffffff",
								color: orderMode === "SCREENPLAY" ? "#ffffff" : "#475569",
								cursor: "pointer",
							}}
						>
							Screenplay Order
						</button>
					</div>

					<select
						value={typeFilter}
						onChange={(e) => setTypeFilter(e.target.value)}
						style={{ padding: "6px 10px", fontSize: "12.5px", border: "1px solid #cbd5e1", borderRadius: "6px", backgroundColor: "#fff" }}
					>
						<option value="ALL">All Types</option>
						<option value="PLOT_EVENT">Plot Event</option>
						<option value="FLASHBACK">Flashback</option>
						<option value="BACKSTORY">Backstory</option>
						<option value="REVELATION">Revelation</option>
						<option value="DEATH">Death / Loss</option>
						<option value="RELATIONSHIP_SHIFT">Relationship Shift</option>
					</select>

					<button
						type="button"
						onClick={() => {
							setForm({
								title: "",
								eventType: "PLOT_EVENT",
								chronologicalOrder: events.length + 1,
								screenplayOrder: "",
								isFlashback: false,
								isParallel: false,
								timingCertainty: "EXPLICIT",
								narrativeTimeLabel: "",
								description: "",
								causalImpact: "",
								changeReason: "",
							});
							setIsCreateOpen(true);
						}}
						style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 12px", fontSize: "12px", fontWeight: 600, borderRadius: "6px", border: "none", backgroundColor: "#d97706", color: "#fff", cursor: "pointer" }}
					>
						<FiPlus size={13} /> Add Event
					</button>
				</div>
			</div>

			{sorted.length === 0 ? (
				<div style={{ padding: "30px", textAlign: "center", color: "#64748b", background: "#f8fafc", borderRadius: "8px", border: "1px dashed #cbd5e1" }}>
					No timeline events recorded yet.
				</div>
			) : (
				<div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
					{sorted.map((evt) => (
						<div key={evt.id} style={{ padding: "14px 16px", backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0", borderLeft: evt.isFlashback ? "4px solid #7c3aed" : "4px solid #d97706" }}>
							<div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px", flexWrap: "wrap" }}>
								<div>
									<div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
										<span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 7px", borderRadius: "4px", backgroundColor: "#fef3c7", color: "#92400e" }}>
											Story Chronology #{evt.chronologicalOrder}
										</span>
										{evt.screenplayOrder != null && (
											<span style={{ fontSize: "11px", fontWeight: 600, padding: "2px 7px", borderRadius: "4px", backgroundColor: "#f1f5f9", color: "#334155" }}>
												Screenplay Scene #{evt.screenplayOrder}
											</span>
										)}
										{evt.isFlashback && (
											<span style={{ fontSize: "10.5px", fontWeight: 700, padding: "2px 7px", borderRadius: "4px", backgroundColor: "#f3e8ff", color: "#6b21a8" }}>
												FLASHBACK
											</span>
										)}
										{evt.isParallel && (
											<span style={{ fontSize: "10.5px", fontWeight: 700, padding: "2px 7px", borderRadius: "4px", backgroundColor: "#e0f2fe", color: "#0369a1" }}>
												PARALLEL
											</span>
										)}
										<span style={{ fontSize: "10.5px", fontWeight: 600, color: "#64748b" }}>
											Timing: {evt.timingCertainty} {evt.narrativeTimeLabel ? `(${evt.narrativeTimeLabel})` : "(Unstamped)"}
										</span>
									</div>
									<h4 style={{ margin: "6px 0 2px", fontSize: "14.5px", fontWeight: 700, color: "#0f172a" }}>{evt.title}</h4>
								</div>

								<div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
									<EvidenceBadge level={evt.evidenceLevel} evidence={evt.sourceEvidence} />
									<button
										type="button"
										onClick={() => {
											setForm({
												title: evt.title,
												eventType: evt.eventType,
												chronologicalOrder: evt.chronologicalOrder,
												screenplayOrder: evt.screenplayOrder ?? "",
												isFlashback: evt.isFlashback,
												isParallel: evt.isParallel,
												timingCertainty: evt.timingCertainty,
												narrativeTimeLabel: evt.narrativeTimeLabel || "",
												description: evt.description || "",
												causalImpact: evt.causalImpact || "",
												changeReason: "",
											});
											setEditing(evt);
										}}
										style={{ padding: "4px 7px", border: "1px solid #cbd5e1", borderRadius: "5px", backgroundColor: "#f8fafc", cursor: "pointer" }}
									>
										<FiEdit2 size={12} />
									</button>
								</div>
							</div>

							{evt.description && <p style={{ margin: "6px 0", fontSize: "13px", color: "#334155", lineHeight: "1.5" }}>{evt.description}</p>}

							<div style={{ display: "flex", gap: "14px", flexWrap: "wrap", fontSize: "12px", color: "#475569", marginTop: "6px" }}>
								{evt.relatedCharacters?.length > 0 && <span><strong>Cast:</strong> {evt.relatedCharacters.join(", ")}</span>}
								{evt.relatedLocations?.length > 0 && <span><strong>Locations:</strong> {evt.relatedLocations.join(", ")}</span>}
								{evt.relatedObjects?.length > 0 && <span><strong>Objects:</strong> {evt.relatedObjects.join(", ")}</span>}
							</div>

							{evt.causalImpact && (
								<div style={{ marginTop: "8px", fontSize: "12px", color: "#065f46", backgroundColor: "#ecfdf5", padding: "6px 10px", borderRadius: "5px" }}>
									<strong>Causal Impact:</strong> {evt.causalImpact}
								</div>
							)}
						</div>
					))}
				</div>
			)}

			<Modal
				isOpen={Boolean(editing) || isCreateOpen}
				onClose={() => { setEditing(null); setIsCreateOpen(false); }}
				title={editing ? "Edit Timeline Event" : "Add Timeline Event"}
			>
				<form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
					<div>
						<label style={{ fontSize: "12px", fontWeight: 600 }}>Event Title</label>
						<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required style={{ width: "100%", padding: "7px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
					</div>
					<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
						<div>
							<label style={{ fontSize: "12px", fontWeight: 600 }}>Chronological Order</label>
							<input type="number" min={1} value={form.chronologicalOrder} onChange={(e) => setForm({ ...form, chronologicalOrder: Number(e.target.value) })} style={{ width: "100%", padding: "7px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
						</div>
						<div>
							<label style={{ fontSize: "12px", fontWeight: 600 }}>Screenplay Scene #</label>
							<input type="number" min={1} value={form.screenplayOrder} onChange={(e) => setForm({ ...form, screenplayOrder: e.target.value })} placeholder="Optional" style={{ width: "100%", padding: "7px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
						</div>
						<div>
							<label style={{ fontSize: "12px", fontWeight: 600 }}>Timing Certainty</label>
							<select value={form.timingCertainty} onChange={(e) => setForm({ ...form, timingCertainty: e.target.value })} style={{ width: "100%", padding: "7px", border: "1px solid #cbd5e1", borderRadius: "6px" }}>
								<option value="EXPLICIT">EXPLICIT</option>
								<option value="APPROXIMATE">APPROXIMATE</option>
								<option value="UNKNOWN">UNKNOWN</option>
								<option value="RETROACTIVE_REVEAL">RETROACTIVE_REVEAL</option>
							</select>
						</div>
					</div>
					<div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
						<label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px" }}>
							<input type="checkbox" checked={form.isFlashback} onChange={(e) => setForm({ ...form, isFlashback: e.target.checked })} /> Flashback
						</label>
						<label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px" }}>
							<input type="checkbox" checked={form.isParallel} onChange={(e) => setForm({ ...form, isParallel: e.target.checked })} /> Parallel Event
						</label>
					</div>
					<div>
						<label style={{ fontSize: "12px", fontWeight: 600 }}>Time Label (only if explicit)</label>
						<input value={form.narrativeTimeLabel} onChange={(e) => setForm({ ...form, narrativeTimeLabel: e.target.value })} placeholder="Leave blank if unestablished" style={{ width: "100%", padding: "7px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
					</div>
					<div>
						<label style={{ fontSize: "12px", fontWeight: 600 }}>Description</label>
						<textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ width: "100%", padding: "7px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
					</div>
					<div>
						<label style={{ fontSize: "12px", fontWeight: 600 }}>Causal Impact</label>
						<input value={form.causalImpact} onChange={(e) => setForm({ ...form, causalImpact: e.target.value })} style={{ width: "100%", padding: "7px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
					</div>
					<div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
						<button type="button" onClick={() => { setEditing(null); setIsCreateOpen(false); }} style={{ padding: "8px 14px", border: "1px solid #cbd5e1", borderRadius: "6px" }}>Cancel</button>
						<button type="submit" disabled={isSaving} style={{ padding: "8px 16px", border: "none", borderRadius: "6px", background: "#d97706", color: "#fff", fontWeight: 600 }}>{isSaving ? "Saving..." : "Save Event"}</button>
					</div>
				</form>
			</Modal>
		</div>
	);
}

