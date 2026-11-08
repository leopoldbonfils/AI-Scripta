"use client";

import { ReactNode, useEffect } from "react";
import { FiX } from "react-icons/fi";

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	children: ReactNode;
	footer?: ReactNode;
	maxWidth?: string;
}

export function Modal({
	isOpen,
	onClose,
	title,
	children,
	footer,
	maxWidth = "480px",
}: ModalProps) {
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};

		if (isOpen) {
			document.body.style.overflow = "hidden";
			window.addEventListener("keydown", handleKeyDown);
		} else {
			document.body.style.overflow = "";
		}

		return () => {
			document.body.style.overflow = "";
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return (
		<div
			style={{
				position: "fixed",
				inset: 0,
				zIndex: 9999,
				backgroundColor: "rgba(15, 23, 42, 0.65)",
				backdropFilter: "blur(4px)",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				padding: "16px",
			}}
			onClick={onClose}
		>
			<div
				style={{
					background: "#ffffff",
					borderRadius: "16px",
					width: "100%",
					maxWidth,
					boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.25)",
					overflow: "hidden",
					display: "flex",
					flexDirection: "column",
					animation: "fadeIn 0.2s ease-out",
				}}
				onClick={(e) => e.stopPropagation()}
			>
				{/* Modal Header */}
				<div
					style={{
						padding: "18px 24px",
						borderBottom: "1px solid #f1f5f9",
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
					}}
				>
					<h3
						style={{
							margin: 0,
							fontSize: "16px",
							fontWeight: "700",
							color: "#0f172a",
						}}
					>
						{title}
					</h3>
					<button
						type="button"
						onClick={onClose}
						style={{
							background: "none",
							border: "none",
							cursor: "pointer",
							color: "#94a3b8",
							padding: "4px",
							borderRadius: "6px",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<FiX size={18} />
					</button>
				</div>

				{/* Modal Body */}
				<div style={{ padding: "20px 24px", color: "#334155", fontSize: "14px", lineHeight: "1.6" }}>
					{children}
				</div>

				{/* Modal Footer */}
				{footer && (
					<div
						style={{
							padding: "14px 24px",
							background: "#f8fafc",
							borderTop: "1px solid #f1f5f9",
							display: "flex",
							justifyContent: "flex-end",
							gap: "10px",
						}}
					>
						{footer}
					</div>
				)}
			</div>
		</div>
	);
}

