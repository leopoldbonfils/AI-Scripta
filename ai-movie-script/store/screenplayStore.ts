/**
 * FilmForge AI — Screenplay Store
 *
 * Lightweight, reactive store for the active screenplay, parsed elements,
 * autosave status, and version history snapshots.
 */

import { Screenplay, ScreenplayVersion } from "../types/screenplay";

export type SaveStatus = "saved" | "saving" | "unsaved" | "error";
export type ScreenplayStoreListener = () => void;

class ScreenplayStore {
	private screenplay: Screenplay | null = null;
	private versions: ScreenplayVersion[] = [];
	private saveStatus: SaveStatus = "saved";
	private error: string | null = null;
	private listeners: Set<ScreenplayStoreListener> = new Set();

	public getScreenplay(): Screenplay | null {
		return this.screenplay;
	}

	public getVersions(): ScreenplayVersion[] {
		return this.versions;
	}

	public getSaveStatus(): SaveStatus {
		return this.saveStatus;
	}

	public getError(): string | null {
		return this.error;
	}

	public setScreenplay(screenplay: Screenplay | null): void {
		this.screenplay = screenplay;
		this.saveStatus = "saved";
		this.error = null;
		this.notify();
	}

	public updateContent(content: string): void {
		if (this.screenplay) {
			this.screenplay = {
				...this.screenplay,
				content,
			};
			this.saveStatus = "unsaved";
			this.notify();
		}
	}

	public setSaveStatus(status: SaveStatus, error?: string | null): void {
		this.saveStatus = status;
		if (error !== undefined) {
			this.error = error;
		}
		this.notify();
	}

	public setVersions(versions: ScreenplayVersion[]): void {
		this.versions = versions;
		this.notify();
	}

	public addVersion(version: ScreenplayVersion): void {
		this.versions = [version, ...this.versions.filter((v) => v.id !== version.id)];
		this.notify();
	}

	public clear(): void {
		this.screenplay = null;
		this.versions = [];
		this.saveStatus = "saved";
		this.error = null;
		this.notify();
	}

	public subscribe(listener: ScreenplayStoreListener): () => void {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	}

	private notify(): void {
		for (const listener of this.listeners) {
			try {
				listener();
			} catch (err) {
				console.error("Error in ScreenplayStore listener:", err);
			}
		}
	}
}

export const screenplayStore = new ScreenplayStore();

