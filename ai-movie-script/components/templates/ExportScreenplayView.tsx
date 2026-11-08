"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { screenplayService } from "../../services/screenplayService";
import { triggerFileDownload } from "../../lib/download";
import { Screenplay, ScreenplayVersion } from "../../types/screenplay";
import { useCollaborators } from "../../hooks/useCollaborators";
import { Modal } from "../ui/Modal";
import { BsFiletypePdf, BsFiletypeDocx, BsFiletypeTxt } from "react-icons/bs";
import {
	FiDownload,
	FiCheckCircle,
	FiAlertCircle,
	FiShare2,
	FiUserPlus,
	FiTrash2,
	FiEye,
	FiFileText,
	FiArrowLeft,
	FiLock,
} from "react-icons/fi";

type ExportFormat = "PDF" | "DOCX" | "TXT";

interface ExportScreenplayViewProps {
	movieId?: string;
	movieTitle?: string;
	onBackToScreenplay?: () => void;
}

export function ExportScreenplayView({
	movieId,
	movieTitle = "Screenplay Project",
	onBackToScreenplay,
}: ExportScreenplayViewProps = {}) {
	const router = useRouter();

	const [screenplay, setScreenplay] = useState<Screenplay | null>(null);
	const [versions, setVersions] = useState<ScreenplayVersion[]>([]);
	const [selectedVersionId, setSelectedVersionId] = useState<string>("latest");
	const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("PDF");
	const [includeTitlePage, setIncludeTitlePage] = useState<boolean>(true);
	const [formatOption, setFormatOption] = useState("Standard Screenplay");

	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [downloading, setDownloading] = useState<boolean>(false);
	const [toastMsg, setToastMsg] = useState<string | null>(null);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);
	const [showPreview, setShowPreview] = useState<boolean>(false);

	// Collaborators Modal & Sharing
	const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
	const [inviteEmail, setInviteEmail] = useState<string>("");
	const [inviteRole, setInviteRole] = useState<"EDITOR" | "VIEWER">("EDITOR");
	const [isInviting, setIsInviting] = useState<boolean>(false);
	const [shareStatusMsg, setShareStatusMsg] = useState<string | null>(null);

	const {
		collaborators,
		isLoading: isCollaboratorsLoading,
		addCollaborator,
		removeCollaborator,
	} = useCollaborators(movieId);

	const showToast = (msg: string) => {
		setToastMsg(msg);
		setTimeout(() => setToastMsg(null), 3500);
	};

	// Fetch screenplay and versions for this movie
	const fetchExportData = useCallback(async () => {
		if (!movieId) {
			setIsLoading(false);
			return;
		}

		setIsLoading(true);
		setErrorMsg(null);

		try {
			const res = await screenplayService.getScreenplayForMovie(movieId);
			let activeDraft: Screenplay | null = null;
			if (Array.isArray(res) && res.length > 0) {
				activeDraft = res[0];
			} else if (res && !Array.isArray(res) && (res as Screenplay).id) {
				activeDraft = res as Screenplay;
			}

			setScreenplay(activeDraft);

			if (activeDraft?.id) {
				const verList = await screenplayService.getVersions(activeDraft.id);
				setVersions(verList || []);
			}
		} catch (err: unknown) {
			setErrorMsg(err instanceof Error ? err.message : "Failed to load screenplay for export");
		} finally {
			setIsLoading(false);
		}
	}, [movieId]);

	useEffect(() => {
		fetchExportData();
	}, [fetchExportData]);

	// Execute real binary export
	const handleDownload = async () => {
		if (!screenplay) {
			setErrorMsg("No screenplay found to export. Please write your script first.");
			return;
		}

		if (!screenplay.content || screenplay.content.trim().length === 0) {
			setErrorMsg("The screenplay is currently empty. Add content before exporting.");
			return;
		}

		setDownloading(true);
		setErrorMsg(null);

		const versionParam = selectedVersionId !== "latest" ? selectedVersionId : undefined;
		const options = {
			includeTitlePage,
			versionId: versionParam,
		};

		const safeBaseName = (screenplay.title || movieTitle)
			.trim()
			.replace(/[^a-zA-Z0-9_\-\s]/g, "")
			.replace(/\s+/g, "_")
			.substring(0, 45) || "Screenplay";

		try {
			let blob: Blob;
			let filename = "";

			if (selectedFormat === "PDF") {
				blob = await screenplayService.exportPdf(screenplay.id, options);
				filename = `${safeBaseName}_v${screenplay.version}.pdf`;
			} else if (selectedFormat === "DOCX") {
				blob = await screenplayService.exportDocx(screenplay.id, options);
				filename = `${safeBaseName}_v${screenplay.version}.docx`;
			} else {
				blob = await screenplayService.exportTxt(screenplay.id, options);
				filename = `${safeBaseName}_v${screenplay.version}.txt`;
			}

			triggerFileDownload(blob, filename);
			showToast(`Exported ${filename} successfully! ✓`);
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : "Export failed. Please check network.";
			setErrorMsg(msg);
			showToast(msg);
		} finally {
			setDownloading(false);
		}
	};

	// Invite Collaborator
	const handleInviteSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!inviteEmail.trim()) return;

		setIsInviting(true);
		setShareStatusMsg(null);
		try {
			await addCollaborator(inviteEmail.trim(), inviteRole);
			setInviteEmail("");
			setShareStatusMsg(`Invited ${inviteEmail} as ${inviteRole}!`);
			setTimeout(() => setShareStatusMsg(null), 3000);
		} catch (err: unknown) {
			setShareStatusMsg(err instanceof Error ? err.message : "Failed to invite collaborator");
		} finally {
			setIsInviting(false);
		}
	};

	const handleRemoveCollaborator = async (collaboratorId: string) => {
		try {
			await removeCollaborator(collaboratorId);
			showToast("Collaborator removed");
		} catch (err: unknown) {
			showToast(err instanceof Error ? err.message : "Failed to remove collaborator");
		}
	};

	if (isLoading) {
		return (
			<div style={{ padding: "80px 0", textAlign: "center", color: "#64748b" }}>
				<div
					style={{
						display: "inline-block",
						width: "32px",
						height: "32px",
						border: "3px solid #e2e8f0",
						borderTopColor: "#f59e0b",
						borderRadius: "50%",
						animation: "spin 1s linear infinite",
					}}
				/>
				<p style={{ marginTop: "16px", fontSize: "14px" }}>Loading export workspace and draft data...</p>
			</div>
		);
	}

	return (
		<div className="export-exact-page-container">
			{/* Error Alert */}
			{errorMsg && (
				<div
					style={{
						padding: "12px 18px",
						borderRadius: "10px",
						background: "#fef2f2",
						border: "1px solid #fecaca",
						color: "#991b1b",
						marginBottom: "20px",
						fontSize: "13.5px",
						display: "flex",
						alignItems: "center",
						gap: "8px",
					}}
				>
					<FiAlertCircle size={16} />
					<span>{errorMsg}</span>
				</div>
			)}

			{/* Main Grid: Left Controls, Right Clapper Artwork */}
			<div className="export-exact-layout">
				{/* Left Side: Header, Cards, Options, Actions */}
				<div className="export-exact-left">
					<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
						<div>
							<h1 className="export-exact-title">Export Your Screenplay</h1>
							<p className="export-exact-subtitle">
								Download professional screenplay formats for <strong>{movieTitle}</strong>.
							</p>
						</div>

						{/* Project Sharing Button */}
						{movieId && (
							<button
								type="button"
								onClick={() => setIsShareModalOpen(true)}
								style={{
									display: "inline-flex",
									alignItems: "center",
									gap: "6px",
									padding: "8px 16px",
									borderRadius: "20px",
									background: "#f8fafc",
									border: "1px solid #cbd5e1",
									color: "#0f172a",
									fontSize: "13px",
									fontWeight: "600",
									cursor: "pointer",
								}}
							>
								<FiShare2 size={14} color="#f59e0b" />
								<span>Share Project ({collaborators.length})</span>
							</button>
						)}
					</div>

					{/* 3 Format Cards */}
					<div className="export-exact-cards-row">
						{/* PDF */}
						<div
							className={`export-exact-card${selectedFormat === "PDF" ? " selected" : ""}`}
							onClick={() => setSelectedFormat("PDF")}
						>
							<div className="export-doc-icon-wrapper">
								<BsFiletypePdf size={38} color="#ef4444" />
							</div>
							<strong className="export-exact-card-title">PDF</strong>
							<span className="export-exact-card-desc">Industry Standard (Courier 12pt)</span>
						</div>

						{/* DOCX */}
						<div
							className={`export-exact-card${selectedFormat === "DOCX" ? " selected" : ""}`}
							onClick={() => setSelectedFormat("DOCX")}
						>
							<div className="export-doc-icon-wrapper">
								<BsFiletypeDocx size={38} color="#2563eb" />
							</div>
							<strong className="export-exact-card-title">DOCX</strong>
							<span className="export-exact-card-desc">Microsoft Word format</span>
						</div>

						{/* TXT */}
						<div
							className={`export-exact-card${selectedFormat === "TXT" ? " selected" : ""}`}
							onClick={() => setSelectedFormat("TXT")}
						>
							<div className="export-doc-icon-wrapper">
								<BsFiletypeTxt size={38} color="#64748b" />
							</div>
							<strong className="export-exact-card-title">TXT</strong>
							<span className="export-exact-card-desc">Fountain plain text</span>
						</div>
					</div>

					{/* Version & Options Configuration */}
					<div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
						{/* Version Selector */}
						{versions.length > 0 && (
							<div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
								<span style={{ fontSize: "13.5px", fontWeight: "600", color: "#334155", minWidth: "90px" }}>
									Version:
								</span>
								<select
									value={selectedVersionId}
									onChange={(e) => setSelectedVersionId(e.target.value)}
									style={{
										padding: "8px 12px",
										borderRadius: "8px",
										border: "1px solid #cbd5e1",
										fontSize: "13.5px",
										color: "#0f172a",
										background: "#ffffff",
										outline: "none",
										cursor: "pointer",
										flex: 1,
									}}
								>
									<option value="latest">
										Latest Active Draft (v{screenplay?.version || 1})
									</option>
									{versions.map((ver) => (
										<option key={ver.id} value={ver.id}>
											v{ver.versionNumber} — {ver.changeSummary || "Snapshot"} ({new Date(ver.createdAt).toLocaleDateString()})
										</option>
									))}
								</select>
							</div>
						)}

						{/* Title Page Option */}
						<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
							<input
								type="checkbox"
								id="includeTitlePageCheckbox"
								checked={includeTitlePage}
								onChange={(e) => setIncludeTitlePage(e.target.checked)}
								style={{ width: "16px", height: "16px", accentColor: "#f59e0b", cursor: "pointer" }}
							/>
							<label
								htmlFor="includeTitlePageCheckbox"
								style={{ fontSize: "13.5px", color: "#334155", fontWeight: "500", cursor: "pointer" }}
							>
								Include Title Page with metadata, author credits, and draft date
							</label>
						</div>

						{/* Format Style Selector */}
						<div className="export-exact-format-inline-row">
							<span className="export-exact-format-label">Style:</span>
							<div className="export-exact-select-box">
								<select
									value={formatOption}
									onChange={(e) => setFormatOption(e.target.value)}
									className="export-exact-select-field"
								>
									<option value="Standard Screenplay">Standard Screenplay</option>
									<option value="Shooting Script">Shooting Script</option>
									<option value="Treatment">Treatment</option>
									<option value="Dialogue Sides">Dialogue Sides</option>
								</select>
								<span className="export-exact-select-caret">▾</span>
							</div>
						</div>
					</div>

					{/* Action Buttons Row */}
					<div className="export-exact-actions-row">
						<button
							type="button"
							className="export-exact-btn-download"
							onClick={handleDownload}
							disabled={downloading || !screenplay}
						>
							<FiDownload size={15} />
							<span>
								{downloading
									? `Generating ${selectedFormat}...`
									: `Download ${selectedFormat}`}
							</span>
						</button>

						<button
							type="button"
							className="export-exact-btn-save"
							onClick={() => setShowPreview(!showPreview)}
						>
							<FiEye size={14} style={{ marginRight: "6px" }} />
							<span>{showPreview ? "Hide Preview" : "Preview Manuscript"}</span>
						</button>

						<Link
							href="/movies"
							style={{
								display: "inline-flex",
								alignItems: "center",
								padding: "10px 18px",
								borderRadius: "20px",
								background: "#f1f5f9",
								color: "#475569",
								fontSize: "13px",
								fontWeight: "600",
								textDecoration: "none",
							}}
						>
							Return to My Movies
						</Link>
					</div>

					{/* Expandable Preview Pane */}
					{showPreview && screenplay && (
						<div
							style={{
								marginTop: "24px",
								padding: "20px",
								background: "#ffffff",
								border: "1px solid #cbd5e1",
								borderRadius: "12px",
								maxHeight: "320px",
								overflowY: "auto",
							}}
						>
							<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", borderBottom: "1px solid #f1f5f9", paddingBottom: "8px" }}>
								<span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>
									Manuscript Preview ({screenplay.wordCount || 0} words, ~{screenplay.pageCount || 1} pages)
								</span>
								<span style={{ fontSize: "11.5px", color: "#94a3b8" }}>
									Courier 12pt Standard
								</span>
							</div>
							<pre
								style={{
									margin: 0,
									fontFamily: "Courier, 'Courier New', monospace",
									fontSize: "13px",
									lineHeight: "1.5",
									color: "#0f172a",
									whiteSpace: "pre-wrap",
									wordBreak: "break-word",
								}}
							>
								{screenplay.content || "(No text in screenplay yet)"}
							</pre>
						</div>
					)}
				</div>

				{/* Right Side: Clapperboard Artwork */}
				<div className="export-exact-right">
					<div className="export-exact-artwork-wrap">
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src="/images/export-clapper-exact.jpg"
							alt="Film clapperboard with download badge"
							className="export-exact-artwork-img"
						/>
					</div>
				</div>
			</div>

			{/* Toast Notification */}
			{toastMsg && (
				<div className="studio-toast">
					<span className="studio-toast-icon">✓</span>
					<span>{toastMsg}</span>
				</div>
			)}

			{/* Sharing / Collaboration Modal */}
			<Modal
				isOpen={isShareModalOpen}
				title="Share Movie Project &amp; Cast"
				onClose={() => setIsShareModalOpen(false)}
			>
				<div>
					<div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", color: "#64748b", fontSize: "13.5px" }}>
						<FiLock size={15} color="#d97706" />
						<span>
							Private Project. Invite collaborators by registered email to co-write or review.
						</span>
					</div>

					{/* Invite Form */}
					<form onSubmit={handleInviteSubmit} style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
						<input
							type="email"
							placeholder="collaborator@filmforge.ai"
							value={inviteEmail}
							onChange={(e) => setInviteEmail(e.target.value)}
							required
							style={{
								flex: 2,
								padding: "8px 12px",
								borderRadius: "8px",
								border: "1px solid #cbd5e1",
								fontSize: "13.5px",
								outline: "none",
							}}
						/>
						<select
							value={inviteRole}
							onChange={(e) => setInviteRole(e.target.value as "EDITOR" | "VIEWER")}
							style={{
								flex: 1,
								padding: "8px 10px",
								borderRadius: "8px",
								border: "1px solid #cbd5e1",
								fontSize: "13px",
								background: "#ffffff",
								outline: "none",
								cursor: "pointer",
							}}
						>
							<option value="EDITOR">Editor (Write)</option>
							<option value="VIEWER">Viewer (Read &amp; Export)</option>
						</select>
						<button
							type="submit"
							disabled={isInviting}
							style={{
								padding: "8px 16px",
								borderRadius: "8px",
								background: "#0f172a",
								color: "#ffffff",
								border: "none",
								fontSize: "13px",
								fontWeight: "600",
								cursor: isInviting ? "not-allowed" : "pointer",
								display: "flex",
								alignItems: "center",
								gap: "6px",
							}}
						>
							<FiUserPlus size={14} />
							<span>{isInviting ? "Inviting..." : "Invite"}</span>
						</button>
					</form>

					{shareStatusMsg && (
						<p style={{ fontSize: "13px", color: "#059669", margin: "-10px 0 16px", fontWeight: "500" }}>
							{shareStatusMsg}
						</p>
					)}

					{/* Collaborators List */}
					<div style={{ marginTop: "16px" }}>
						<span style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", color: "#64748b" }}>
							Project Team
						</span>
						<div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "8px", maxHeight: "200px", overflowY: "auto" }}>
							{collaborators.length === 0 ? (
								<p style={{ fontSize: "13px", color: "#94a3b8", fontStyle: "italic", margin: "4px 0" }}>
									No additional collaborators invited yet.
								</p>
							) : (
								collaborators.map((c) => (
									<div
										key={c.id}
										style={{
											display: "flex",
											alignItems: "center",
											justifyContent: "space-between",
											padding: "8px 12px",
											background: "#f8fafc",
											border: "1px solid #e2e8f0",
											borderRadius: "8px",
										}}
									>
										<div>
											<strong style={{ fontSize: "13.5px", color: "#0f172a" }}>
												{c.user?.name || c.user?.email || "Collaborator"}
											</strong>
											<span style={{ marginLeft: "8px", fontSize: "11.5px", padding: "2px 6px", borderRadius: "4px", background: c.role === "EDITOR" ? "#dbeafe" : "#f1f5f9", color: c.role === "EDITOR" ? "#1e40af" : "#475569" }}>
												{c.role}
											</span>
										</div>

										<button
											type="button"
											onClick={() => handleRemoveCollaborator(c.id)}
											title="Remove collaborator"
											style={{
												background: "transparent",
												border: "none",
												color: "#dc2626",
												cursor: "pointer",
												padding: "4px",
											}}
										>
											<FiTrash2 size={14} />
										</button>
									</div>
								))
							)}
						</div>
					</div>

					<div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
						<button
							type="button"
							onClick={() => setIsShareModalOpen(false)}
							style={{
								padding: "8px 18px",
								background: "#f1f5f9",
								border: "1px solid #cbd5e1",
								borderRadius: "8px",
								fontSize: "13px",
								fontWeight: "600",
								color: "#475569",
								cursor: "pointer",
							}}
						>
							Close
						</button>
					</div>
				</div>
			</Modal>
		</div>
	);
}
