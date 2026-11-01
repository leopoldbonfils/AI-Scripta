"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BsFiletypePdf, BsFiletypeDocx, BsFiletypeTxt } from "react-icons/bs";
import { FiDownload } from "react-icons/fi";

type ExportFormat = "PDF" | "DOCX" | "TXT";

function PdfIcon() {
	return (
		<div className="export-doc-icon-wrapper">
			<BsFiletypePdf size={38} color="#ef4444" />
		</div>
	);
}

function DocxIcon() {
	return (
		<div className="export-doc-icon-wrapper">
			<BsFiletypeDocx size={38} color="#2563eb" />
		</div>
	);
}

function TxtIcon() {
	return (
		<div className="export-doc-icon-wrapper">
			<BsFiletypeTxt size={38} color="#64748b" />
		</div>
	);
}

function DownloadTrayIcon() {
	return <FiDownload size={15} />;
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
