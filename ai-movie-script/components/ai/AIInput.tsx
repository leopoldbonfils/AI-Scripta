"use client";

import React from "react";
import { FiSend, FiSparkles } from "react-icons/fi";

export interface AIInputProps {
	value: string;
	onChange: (value: string) => void;
	onSubmit: () => void;
	placeholder?: string;
	disabled?: boolean;
	isLoading?: boolean;
}

export function AIInput({
	value,
	onChange,
	onSubmit,
	placeholder = "Ask FilmForge AI to write, rewrite, or analyze...",
	disabled = false,
	isLoading = false,
}: AIInputProps) {
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!value.trim() || disabled || isLoading) return;
		onSubmit();
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSubmit(e);
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			style={{
				display: "flex",
				alignItems: "center",
				gap: "8px",
				backgroundColor: "#ffffff",
				border: "1px solid #e2e8f0",
				borderRadius: "24px",
				padding: "4px 6px 4px 14px",
				boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
				transition: "border-color 0.2s, box-shadow 0.2s",
			}}
		>
			<span style={{ color: "#d97706", display: "flex", alignItems: "center" }}>
				<FiSparkles size={16} />
			</span>

			<input
				type="text"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				onKeyDown={handleKeyDown}
				placeholder={isLoading ? "Generating..." : placeholder}
				disabled={disabled || isLoading}
				style={{
					flex: 1,
					border: "none",
					outline: "none",
					fontSize: "13.5px",
					color: "#0f172a",
					background: "transparent",
					padding: "8px 4px",
				}}
			/>

			<button
				type="submit"
				disabled={!value.trim() || disabled || isLoading}
				style={{
					border: "none",
					backgroundColor: value.trim() && !disabled && !isLoading ? "#d97706" : "#f1f5f9",
					color: value.trim() && !disabled && !isLoading ? "#ffffff" : "#94a3b8",
					borderRadius: "50%",
					width: "32px",
					height: "32px",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					cursor: value.trim() && !disabled && !isLoading ? "pointer" : "not-allowed",
					transition: "background-color 0.15s",
				}}
				title="Send prompt to AI"
			>
				<FiSend size={14} />
			</button>
		</form>
	);
}

