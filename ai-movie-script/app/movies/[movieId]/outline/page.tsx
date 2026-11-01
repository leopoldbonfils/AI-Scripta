"use client";

import { useRouter, useParams } from "next/navigation";
import { StoryOutlineView } from "../../../../components/templates/StoryOutlineView";

export default function MovieOutlinePage() {
	const router = useRouter();
	const params = useParams();
	const movieId = params?.movieId || "TLS-0824";

	return (
		<div style={{ padding: "28px 36px 56px", maxWidth: "1220px", margin: "0 auto" }}>
			<StoryOutlineView
				onOpenScreenplay={() => router.push(`/movies/${movieId}/screenplay`)}
				onImproveStory={() => router.push(`/movies/${movieId}/screenplay`)}
			/>
		</div>
	);
}
