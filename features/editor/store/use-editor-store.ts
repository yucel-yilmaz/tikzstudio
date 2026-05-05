"use client";

import { create } from "zustand";

import type { ProjectFileDto } from "@/lib/types";

type SidebarTab = "files" | "templates" | "snippets" | "settings";
type SaveState = "idle" | "dirty" | "saving" | "saved" | "error";

type EditorState = {
  activeFileId: string | null;
  sidebarTab: SidebarTab;
  previewZoom: number;
  buffers: Record<string, string>;
  saveState: SaveState;
  initialize(files: ProjectFileDto[]): void;
  setActiveFile(fileId: string): void;
  setSidebarTab(tab: SidebarTab): void;
  updateBuffer(fileId: string, content: string): void;
  insertIntoActive(content: string): void;
  setPreviewZoom(nextZoom: number): void;
  setSaveState(state: SaveState): void;
  markSaved(fileId: string, content: string): void;
};

export const useEditorStore = create<EditorState>((set, get) => ({
  activeFileId: null,
  sidebarTab: "files",
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
        activeFileId: state.activeFileId ?? files[0]?.id ?? null,
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
