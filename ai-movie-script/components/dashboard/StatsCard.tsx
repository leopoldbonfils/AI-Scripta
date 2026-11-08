"use client";

import { ReactNode } from "react";

interface StatsCardProps {
	title: string;
	value: number | string;
	subtitle?: string;
	icon: ReactNode;
	accentColor?: string;
}

export function StatsCard({
	title,
	value,
	subtitle,
	icon,
	accentColor = "#f59e0b",
}: StatsCardProps) {
	return (
		<div
			style={{
				background: "#ffffff",
				border: "1px solid #e2e8f0",
				borderRadius: "14px",
				padding: "20px 22px",
				boxShadow: "0 2px 10px rgba(0, 0, 0, 0.03)",
				display: "flex",
				alignItems: "flex-start",
				justifyContent: "space-between",
				transition: "transform 0.2s ease, box-shadow 0.2s ease",
			}}
		>
			<div>
				<span
					style={{
						fontSize: "12px",
						fontWeight: "600",
						textTransform: "uppercase",
						letterSpacing: "0.5px",
						color: "#64748b",
						display: "block",
						marginBottom: "6px",
					}}
				>
					{title}
				</span>
				<div
					style={{
						fontSize: "28px",
						fontWeight: "800",
						color: "#0f172a",
						lineHeight: "1.2",
						letterSpacing: "-0.5px",
					}}
				>
					{value}
				</div>
				{subtitle && (
					<span
						style={{
							fontSize: "12px",
							color: "#94a3b8",
							marginTop: "6px",
							display: "block",
						}}
					>
						{subtitle}
					</span>
				)}
			</div>

			<div
				style={{
					width: "44px",
					height: "44px",
					borderRadius: "12px",
					background: `${accentColor}18`,
					color: accentColor,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					fontSize: "20px",
					flexShrink: 0,
				}}
			>
				{icon}
			</div>
		</div>
	);
}

