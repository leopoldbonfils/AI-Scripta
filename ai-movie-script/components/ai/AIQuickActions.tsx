"use client";

import React from "react";
import { FiRefreshCw, FiZap, FiHeart, FiPlay, FiFeather } from "react-icons/fi";

export interface QuickActionItem {
	key: string;
	label: string;
	icon?: React.ReactNode;
	bgColor?: string;
	textColor?: string;
}

export interface AIQuickActionsProps {
	onAction: (actionKey: string) => void;
	disabled?: boolean;
	actions?: QuickActionItem[];
}

const defaultActions: QuickActionItem[] = [
	{
		key: "improve",
		label: "Improve scene",
		icon: <FiFeather size={13} />,
		bgColor: "#fef3c7",
		textColor: "#92400e",
	},
	{
		key: "rewrite",
		label: "Rewrite dialogue",
		icon: <FiRefreshCw size={13} />,
		bgColor: "#dbeafe",
		textColor: "#1e40af",
	},
	{
		key: "emotional",
		label: "Deepen emotion",
		icon: <FiHeart size={13} />,
		bgColor: "#d1fae5",
		textColor: "#065f46",
	},
	{
		key: "suspense",
		label: "Add suspense",
		icon: <FiZap size={13} />,
		bgColor: "#e0e7ff",
		textColor: "#3730a3",
	},
	{
		key: "continue",
		label: "Continue scene",
		icon: <FiPlay size={13} />,
		bgColor: "#f3e8ff",
		textColor: "#6b21a8",
	},
];

export function AIQuickActions({
	onAction,
	disabled = false,
	actions = defaultActions,
}: AIQuickActionsProps) {
	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				gap: "6px",
				width: "100%",
			}}
		>
			<span
				style={{
					fontSize: "11px",
					fontWeight: 600,
					textTransform: "uppercase",
					letterSpacing: "0.05em",
					color: "#94a3b8",
					marginBottom: "4px",
				}}
			>
				AI Quick Actions
			</span>
			{actions.map((act) => (
				<button
					key={act.key}
					type="button"
					onClick={() => onAction(act.key)}
					disabled={disabled}
					style={{
						display: "flex",
						alignItems: "center",
						gap: "10px",
						padding: "8px 12px",
						borderRadius: "8px",
						border: "1px solid #f1f5f9",
						backgroundColor: "#ffffff",
						color: "#334155",
						fontSize: "13px",
						fontWeight: 500,
						cursor: disabled ? "not-allowed" : "pointer",
						opacity: disabled ? 0.6 : 1,
						textAlign: "left",
						transition: "all 0.15s ease",
					}}
				>
					<span
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							width: "24px",
							height: "24px",
							borderRadius: "6px",
							backgroundColor: act.bgColor || "#f1f5f9",
							color: act.textColor || "#475569",
							flexShrink: 0,
						}}
					>
						{act.icon}
					</span>
					<span>{act.label}</span>
				</button>
			))}
		</div>
	);
}

