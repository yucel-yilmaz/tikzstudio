"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useEditorStore } from "@/features/editor/store/use-editor-store";
import {
	createFile,
	deleteFile,
	updateFile,
	uploadFile,
} from "@/lib/client-api";
import { useT } from "@/lib/i18n/client";
import type { ProjectFileDto } from "@/lib/types";

export function useProjectFiles(projectId: string) {
	const t = useT();
	const queryClient = useQueryClient();
	const setActiveFile = useEditorStore((s) => s.setActiveFile);

	const createFileMutation = useMutation({
		mutationFn: (path: string) => createFile(projectId, { path, content: "" }),
		onSuccess: (file) => {
			queryClient.setQueryData<{ files: ProjectFileDto[] }>(
				["project-files", projectId],
				(current) =>
					current ? { files: [...current.files, file] } : { files: [file] },
			);
			setActiveFile(file.id);
			toast.success(t("fileTree.created", { path: file.path }));
		},
		onError: (error) => {
			toast.error(
				error instanceof Error ? error.message : t("fileTree.createFailed"),
			);
		},
	});

	const deleteFileMutation = useMutation({
		mutationFn: (fileId: string) => deleteFile(projectId, fileId),
		onSuccess: (_, fileId) => {
			queryClient.setQueryData<{ files: ProjectFileDto[] }>(
				["project-files", projectId],
				(current) =>
					current
						? { files: current.files.filter((f) => f.id !== fileId) }
						: current,
			);
			const remaining =
				queryClient.getQueryData<{ files: ProjectFileDto[] }>([
					"project-files",
					projectId,
				])?.files ?? [];
			const activeFileId = useEditorStore.getState().activeFileId;
			if (activeFileId === fileId) {
				setActiveFile(remaining[0]?.id ?? null);
			}
			toast.success(t("fileTree.deleted"));
		},
		onError: (error) => {
			toast.error(
				error instanceof Error ? error.message : t("fileTree.deleteFailed"),
			);
		},
	});

	const renameFileMutation = useMutation({
		mutationFn: ({ fileId, path }: { fileId: string; path: string }) =>
			updateFile(projectId, fileId, { path }),
		onSuccess: (file) => {
			queryClient.setQueryData<{ files: ProjectFileDto[] }>(
				["project-files", projectId],
				(current) =>
					current
						? {
								files: current.files.map((f) => (f.id === file.id ? file : f)),
							}
						: current,
			);
			toast.success(t("fileTree.renamed", { path: file.path }));
		},
		onError: (error) => {
			toast.error(
				error instanceof Error ? error.message : t("fileTree.renameFailed"),
			);
		},
	});

	const setMainFileMutation = useMutation({
		mutationFn: (fileId: string) =>
			updateFile(projectId, fileId, { isMain: true }),
		onSuccess: (file) => {
			queryClient.setQueryData<{ files: ProjectFileDto[] }>(
				["project-files", projectId],
				(current) =>
					current
						? {
								files: current.files.map((f) => ({
									...f,
									isMain: f.id === file.id,
								})),
							}
						: current,
			);
			toast.success(t("fileTree.mainSet", { path: file.path }));
		},
		onError: (error) => {
			toast.error(
				error instanceof Error ? error.message : t("fileTree.mainSetFailed"),
			);
		},
	});

	const uploadFileMutation = useMutation({
		mutationFn: (file: File) => uploadFile(projectId, file),
		onSuccess: (file) => {
			queryClient.setQueryData<{ files: ProjectFileDto[] }>(
				["project-files", projectId],
				(current) =>
					current ? { files: [...current.files, file] } : { files: [file] },
			);
			setActiveFile(file.id);
			toast.success(t("fileTree.uploaded", { path: file.path }));
		},
		onError: (error) => {
			toast.error(
				error instanceof Error ? error.message : t("fileTree.uploadFailed"),
			);
		},
	});

	return {
		createFile: async (path: string): Promise<void> => {
			await createFileMutation.mutateAsync(path);
		},
		deleteFile: async (id: string): Promise<void> => {
			await deleteFileMutation.mutateAsync(id);
		},
		renameFile: async (id: string, path: string): Promise<void> => {
			await renameFileMutation.mutateAsync({ fileId: id, path });
		},
		setMainFile: async (id: string): Promise<void> => {
			await setMainFileMutation.mutateAsync(id);
		},
		uploadFile: (file: File) => uploadFileMutation.mutate(file),
	};
}
