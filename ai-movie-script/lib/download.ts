/**
 * FilmForge AI — Client-side File Download Utility
 *
 * Safely streams binary Blobs into browser download triggers with URL revocation.
 */

export function triggerFileDownload(blob: Blob, filename: string): void {
	if (typeof window === "undefined") return;

	const url = window.URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	link.style.display = "none";
	document.body.appendChild(link);

	try {
		link.click();
	} finally {
		document.body.removeChild(link);
		setTimeout(() => {
			window.URL.revokeObjectURL(url);
		}, 1000);
	}
}

