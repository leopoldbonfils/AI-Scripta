"use client";

import React, { useState } from "react";
import { useAI } from "../../hooks/useAI";
import { AIInput } from "./AIInput";
import { AIQuickActions } from "./AIQuickActions";
import { AIMessage } from "./AIMessage";
import { AILoading } from "./AILoading";
import { FiX, FiSparkles } from "react-icons/fi";

export interface AIAssistantProps {
	movieId?: string;
	activeSceneId?: string;
	onApplyContent?: (content: string) => void;
	onClose?: () => void;
}

interface ChatHistoryItem {
	id: string;
	role: "user" | "assistant";
	content: string;
	timestamp: string;
}

export function AIAssistant({
	movieId,
	activeSceneId,
	onApplyContent,
	onClose,
}: AIAssistantProps) {
	const { generateScene, improveScene, isGenerating, quota } = useAI(movieId);
	const [input, setInput] = useState("");
	const [messages, setMessages] = useState<ChatHistoryItem[]>([
		{
			id: "welcome",
			role: "assistant",
			content:
				"Hello! I am your FilmForge narrative consultant. How can I assist with your screenplay or character dialogue today?",
			timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
		},
	]);

	const handleSend = async () => {
		if (!input.trim() || isGenerating) return;
		const userQuery = input.trim();
		const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

		const userMsg: ChatHistoryItem = {
			id: `user-${Date.now()}`,
			role: "user",
			content: userQuery,
			timestamp: time,
		};
		setMessages((prev) => [...prev, userMsg]);
		setInput("");

		try {
			let resultText = "";
			if (activeSceneId) {
				const gen = await generateScene({
					sceneId: activeSceneId,
					instructions: userQuery,
				});
				resultText = gen.output || "Completed scene generation.";
			} else {
				const gen = await improveScene({
					sceneContent: userQuery,
					action: "IMPROVE_DIALOGUE",
					instructions: userQuery,
				});
				resultText = gen.output || "Completed dialogue improvement.";
			}

			const aiMsg: ChatHistoryItem = {
				id: `ai-${Date.now()}`,
				role: "assistant",
				content: resultText,
				timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
			};
			setMessages((prev) => [...prev, aiMsg]);
		} catch (err: unknown) {
			const errorMsg: ChatHistoryItem = {
				id: `error-${Date.now()}`,
				role: "assistant",
				content: err instanceof Error ? err.message : "AI generation failed. Please try again.",
				timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
			};
			setMessages((prev) => [...prev, errorMsg]);
		}
	};

	const handleQuickAction = async (actionKey: string) => {
		if (isGenerating) return;
		const actionLabels: Record<string, string> = {
			improve: "Improve dramatic pacing and atmosphere",
			rewrite: "Rewrite dialogue with sharper subtext",
			emotional: "Deepen character emotional resonance",
			suspense: "Add tension and suspense",
			continue: "Continue scene naturally",
		};
		setInput(actionLabels[actionKey] || "Enhance screenplay scene");
	};

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				height: "100%",
				backgroundColor: "#ffffff",
				borderLeft: "1px solid #e2e8f0",
				width: "360px",
			}}
		>
			{/* Header */}
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					padding: "14px 16px",
					borderBottom: "1px solid #e2e8f0",
				}}
			>
				<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
					<span
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							width: "28px",
							height: "28px",
							borderRadius: "6px",
							backgroundColor: "#fef3c7",
							color: "#d97706",
						}}
					>
						<FiSparkles size={16} />
					</span>
					<div>
						<h3 style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#0f172a" }}>
							FilmForge AI
						</h3>
						{quota && (
							<span style={{ fontSize: "11px", color: "#64748b" }}>
								Quota: {quota.remainingToday}/{quota.totalLimit} remaining
							</span>
						)}
					</div>
				</div>

				{onClose && (
					<button
						type="button"
						onClick={onClose}
						style={{
							background: "none",
							border: "none",
							color: "#94a3b8",
							cursor: "pointer",
							padding: "4px",
						}}
					>
						<FiX size={18} />
					</button>
				)}
			</div>

			{/* Quick Actions Bar */}
			<div style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9" }}>
				<AIQuickActions onAction={handleQuickAction} disabled={isGenerating} />
			</div>

			{/* Message Feed */}
			<div
				style={{
					flex: 1,
					overflowY: "auto",
					padding: "16px",
				}}
			>
				{messages.map((m) => (
					<AIMessage
						key={m.id}
						role={m.role}
						content={m.content}
						timestamp={m.timestamp}
						canApply={!!onApplyContent}
						onApply={() => onApplyContent?.(m.content)}
					/>
				))}

				{isGenerating && (
					<AILoading size="sm" label="FilmForge AI is writing..." />
				)}
			</div>

			{/* Input Bar */}
			<div style={{ padding: "12px 16px", borderTop: "1px solid #e2e8f0" }}>
				<AIInput
					value={input}
					onChange={setInput}
					onSubmit={handleSend}
					isLoading={isGenerating}
				/>
			</div>
		</div>
	);
}

