"use client";

import { useRouter, useParams } from "next/navigation";
import { ScreenplayEditorView } from "../../../../components/templates/ScreenplayEditorView";

export default function MovieScreenplayPage() {
	const router = useRouter();
	const params = useParams();
	const movieId = params?.movieId || "TLS-0824";

	return (
		<div style={{ padding: "28px 36px 56px", maxWidth: "1220px", margin: "0 auto" }}>
			<ScreenplayEditorView
				onGoToExport={() => router.push(`/movies/${movieId}/export`)}
				onBackToOutline={() => router.push(`/movies/${movieId}/outline`)}
			/>
		</div>
	);
}
