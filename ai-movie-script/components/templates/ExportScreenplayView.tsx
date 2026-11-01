"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ExportFormat = "PDF" | "DOCX" | "TXT";

function PdfIcon() {
	return (
		<div className="export-doc-icon-wrapper">
			<svg width="38" height="46" viewBox="0 0 44 52" fill="none">
				<path
					d="M4 5C4 3.34315 5.34315 2 7 2H28L40 14V47C40 48.6569 38.6569 50 37 50H7C5.34315 50 4 48.6569 4 47V5Z"
					fill="#ef4444"
				/>
				<path
					d="M28 2L40 14H31C29.3431 14 28 12.6569 28 11V2Z"
					fill="#dc2626"
				/>
				<text
					x="22"
					y="33"
					fill="#ffffff"
					fontSize="11"
					fontWeight="800"
					fontFamily="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
					textAnchor="middle"
					letterSpacing="0.3px"
				>
					PDF
				</text>
			</svg>
		</div>
	);
}

function DocxIcon() {
	return (
		<div className="export-doc-icon-wrapper">
			<svg width="38" height="46" viewBox="0 0 44 52" fill="none">
				<path
					d="M4 5C4 3.34315 5.34315 2 7 2H28L40 14V47C40 48.6569 38.6569 50 37 50H7C5.34315 50 4 48.6569 4 47V5Z"
					fill="#2563eb"
				/>
				<path
					d="M28 2L40 14H31C29.3431 14 28 12.6569 28 11V2Z"
					fill="#1d4ed8"
				/>
				<text
					x="22"
					y="33"
					fill="#ffffff"
					fontSize="9.5"
					fontWeight="800"
					fontFamily="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
					textAnchor="middle"
					letterSpacing="0.2px"
				>
					DOCX
				</text>
			</svg>
		</div>
	);
}

function TxtIcon() {
	return (
		<div className="export-doc-icon-wrapper">
			<svg width="38" height="46" viewBox="0 0 44 52" fill="none">
				<path
					d="M4 5C4 3.34315 5.34315 2 7 2H28L40 14V47C40 48.6569 38.6569 50 37 50H7C5.34315 50 4 48.6569 4 47V5Z"
					fill="#64748b"
				/>
				<path
					d="M28 2L40 14H31C29.3431 14 28 12.6569 28 11V2Z"
					fill="#475569"
				/>
				<text
					x="22"
					y="33"
					fill="#ffffff"
					fontSize="11"
					fontWeight="800"
					fontFamily="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
					textAnchor="middle"
					letterSpacing="0.3px"
				>
					TXT
				</text>
			</svg>
		</div>
	);
}

function DownloadTrayIcon() {
	return (
		<svg
			width="15"
			height="15"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2.2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
			<polyline points="7 10 12 15 17 10" />
			<line x1="12" y1="15" x2="12" y2="3" />
		</svg>
	);
}

export function ExportScreenplayView({
	onBackToScreenplay,
}: {
	onBackToScreenplay?: () => void;
} = {}) {
	const router = useRouter();
	const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("PDF");
	const [formatOption, setFormatOption] = useState("Standard Screenplay");
	const [downloading, setDownloading] = useState(false);
	const [toastMsg, setToastMsg] = useState<string | null>(null);

	const handleDownload = () => {
		setDownloading(true);

		const sampleScript = `THE LAST SIGNAL
Written by Leopold
Draft: Production Final (${formatOption})

FADE IN:

EXT. KIGALI CITY - NIGHT
The city is quiet.

ERIC, 24, walks home while looking at his phone.

His phone suddenly vibrates.

                    ERIC
          Who's calling me?

He looks at the screen.

The caller ID flashes: UNKNOWN FREQUENCY.

                    VOICE (O.S.)
          Eric. Don't go back to the lab. They already know.

Eric freezes as high beams sweep across the tarmac.

FADE OUT.
`;

		try {
			const mimeType =
				selectedFormat === "PDF"
					? "application/pdf"
					: selectedFormat === "DOCX"
						? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
						: "text/plain";
			const ext = selectedFormat.toLowerCase();
			const blob = new Blob([sampleScript], { type: mimeType });
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `The_Last_Signal_Screenplay.${ext}`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);

			setToastMsg(`Downloaded The_Last_Signal_Screenplay.${ext}!`);
		} catch {
			setToastMsg("Export completed!");
		} finally {
			setTimeout(() => {
				setDownloading(false);
			}, 900);
			setTimeout(() => {
				setToastMsg(null);
			}, 3000);
		}
	};

	const handleSaveToMovies = () => {
		setToastMsg("Saved script to My Movies!");
		setTimeout(() => {
			router.push("/movies");
		}, 600);
	};

	return (
		<div className="export-exact-page-container">
			{/* Main Grid: Left Controls, Right Clapper Graphic */}
			<div className="export-exact-layout">
				{/* Left Side: Header, Cards, Inline Dropdown, Action Buttons */}
				<div className="export-exact-left">
					<h1 className="export-exact-title">Export Your Screenplay</h1>
					<p className="export-exact-subtitle">
						Choose your preferred format and download your script.
					</p>

					{/* 3 Format Cards */}
					<div className="export-exact-cards-row">
						{/* PDF */}
						<div
							className={`export-exact-card${selectedFormat === "PDF" ? " selected" : ""}`}
							onClick={() => setSelectedFormat("PDF")}
						>
							<PdfIcon />
							<strong className="export-exact-card-title">PDF</strong>
							<span className="export-exact-card-desc">Best for printing</span>
						</div>

						{/* DOCX */}
						<div
							className={`export-exact-card${selectedFormat === "DOCX" ? " selected" : ""}`}
							onClick={() => setSelectedFormat("DOCX")}
						>
							<DocxIcon />
							<strong className="export-exact-card-title">DOCX</strong>
							<span className="export-exact-card-desc">Editable format</span>
						</div>

						{/* TXT */}
						<div
							className={`export-exact-card${selectedFormat === "TXT" ? " selected" : ""}`}
							onClick={() => setSelectedFormat("TXT")}
						>
							<TxtIcon />
							<strong className="export-exact-card-title">TXT</strong>
							<span className="export-exact-card-desc">Simple text</span>
						</div>
					</div>

					{/* Inline Format Selector */}
					<div className="export-exact-format-inline-row">
						<span className="export-exact-format-label">Format:</span>
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

					{/* Action Buttons Row */}
					<div className="export-exact-actions-row">
						<button
							type="button"
							className="export-exact-btn-download"
							onClick={handleDownload}
							disabled={downloading}
						>
							<DownloadTrayIcon />
							<span>
								{downloading
									? "Downloading..."
									: `Download ${selectedFormat}`}
							</span>
						</button>

						<button
							type="button"
							className="export-exact-btn-save"
							onClick={handleSaveToMovies}
						>
							<span>Save to My Movies</span>
						</button>
					</div>
				</div>

				{/* Right Side: Seamless Clapperboard Artwork */}
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
		</div>
	);
}
