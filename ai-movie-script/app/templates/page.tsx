"use client";

import { useRouter } from "next/navigation";
import { StoryOutlineView } from "../../components/templates/StoryOutlineView";

export default function TemplatesPage() {
	const router = useRouter();

	return (
		<div style={{ padding: "28px 36px 56px", maxWidth: "1220px", margin: "0 auto" }}>
			<StoryOutlineView
				onOpenScreenplay={() => router.push("/screenplay")}
				onImproveStory={() => router.push("/screenplay")}
			/>
		</div>
	);
}
