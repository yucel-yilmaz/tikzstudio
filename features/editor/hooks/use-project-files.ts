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
import type { ProjectFileDto } from "@/lib/types";

export function useProjectFiles(projectId: string) {
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
			toast.success(`"${file.path}" oluşturuldu`);
		},
		onError: (error) => {
			toast.error(
				error instanceof Error ? error.message : "Dosya oluşturulamadı.",
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
			toast.success("Dosya silindi");
		},
		onError: (error) => {
			toast.error(error instanceof Error ? error.message : "Dosya silinemedi.");
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
			toast.success(`Yeni ad: "${file.path}"`);
		},
		onError: (error) => {
			toast.error(
				error instanceof Error
					? error.message
					: "Dosya yeniden adlandırılamadı.",
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
			toast.success(`"${file.path}" ana dosya yapıldı`);
		},
		onError: (error) => {
			toast.error(
				error instanceof Error ? error.message : "Ana dosya değiştirilemedi.",
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
			toast.success(`"${file.path}" yüklendi`);
		},
		onError: (error) => {
			toast.error(
				error instanceof Error ? error.message : "Dosya yüklenemedi.",
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
