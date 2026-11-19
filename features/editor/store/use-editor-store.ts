"use client";

import { create } from "zustand";

import type { ProjectFileDto } from "@/lib/types";

type SidebarTab = "files" | "templates" | "snippets" | "settings";
type SaveState = "idle" | "dirty" | "saving" | "saved" | "error";

type EditorState = {
	activeFileId: string | null;
	sidebarTab: SidebarTab;
	projectPanelOpen: boolean;
	previewZoom: number;
	buffers: Record<string, string>;
	saveState: SaveState;
	initialize(files: ProjectFileDto[]): void;
	setActiveFile(fileId: string | null): void;
	setSidebarTab(tab: SidebarTab): void;
	setProjectPanelOpen(open: boolean): void;
	toggleProjectPanel(): void;
	updateBuffer(fileId: string, content: string): void;
	insertIntoActive(content: string): void;
	setPreviewZoom(nextZoom: number): void;
	setSaveState(state: SaveState): void;
	markSaved(fileId: string, content: string): void;
};

/**
 * The file a project opens with: its main file, otherwise the first text
 * file (never an image or other binary file), otherwise the first file.
 */
export function defaultActiveFile<
	T extends { isMain: boolean; isBinary: boolean },
>(files: T[]): T | undefined {
	return (
		files.find((file) => file.isMain) ??
		files.find((file) => !file.isBinary) ??
		files[0]
	);
}

export const useEditorStore = create<EditorState>((set, get) => ({
	activeFileId: null,
	sidebarTab: "files",
	projectPanelOpen: false,
	previewZoom: 1,
	buffers: {},
	saveState: "idle",
	initialize(files) {
		set((state) => {
			const nextBuffers = { ...state.buffers };
			for (const file of files) {
				if (!(file.id in nextBuffers)) {
					nextBuffers[file.id] = file.content;
				}
			}

			return {
				// Keep the open file only if it belongs to this project (the store
				// outlives a single editor page); otherwise open the main file.
				activeFileId: files.some((file) => file.id === state.activeFileId)
					? state.activeFileId
					: (defaultActiveFile(files)?.id ?? null),
				buffers: nextBuffers,
			};
		});
	},
	setActiveFile(fileId) {
		set({ activeFileId: fileId });
	},
	setSidebarTab(tab) {
		set({ sidebarTab: tab });
	},
	setProjectPanelOpen(projectPanelOpen) {
		set({ projectPanelOpen });
	},
	toggleProjectPanel() {
		set((state) => ({ projectPanelOpen: !state.projectPanelOpen }));
	},
	updateBuffer(fileId, content) {
		set((state) => ({
			buffers: { ...state.buffers, [fileId]: content },
			saveState: "dirty",
		}));
	},
	insertIntoActive(content) {
		const fileId = get().activeFileId;
		if (!fileId) {
			return;
		}

		set((state) => ({
			buffers: {
				...state.buffers,
				[fileId]: `${state.buffers[fileId] ?? ""}\n${content}`.trim(),
			},
			saveState: "dirty",
		}));
	},
	setPreviewZoom(nextZoom) {
		set({ previewZoom: nextZoom });
	},
	setSaveState(saveState) {
		set({ saveState });
	},
	markSaved(fileId, content) {
		set((state) => ({
			buffers: { ...state.buffers, [fileId]: content },
			saveState: "saved",
		}));
	},
}));
