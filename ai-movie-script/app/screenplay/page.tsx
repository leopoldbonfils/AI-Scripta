"use client";

import { useRouter } from "next/navigation";
import { ScreenplayEditorView } from "../../components/templates/ScreenplayEditorView";

export default function ScreenplayPage() {
	const router = useRouter();

	return (
		<div style={{ padding: "28px 36px 56px", maxWidth: "1220px", margin: "0 auto" }}>
			<ScreenplayEditorView
				onGoToExport={() => router.push("/export")}
				onBackToOutline={() => router.push("/templates")}
			/>
		</div>
	);
}
