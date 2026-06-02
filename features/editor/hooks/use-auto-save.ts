"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useEditorStore } from "@/features/editor/store/use-editor-store";
import { updateFile } from "@/lib/client-api";
import type { ProjectFileDto } from "@/lib/types";

type UseAutoSaveOptions = {
	projectId: string;
	activeFile: ProjectFileDto | null;
	activeValue: string;
};

export function useAutoSave({
	projectId,
	activeFile,
	activeValue,
}: UseAutoSaveOptions) {
	const queryClient = useQueryClient();
	const { setSaveState, markSaved } = useEditorStore();

	const saveMutation = useMutation({
		mutationFn: ({ fileId, content }: { fileId: string; content: string }) =>
			updateFile(projectId, fileId, { content }),
		onMutate: () => setSaveState("saving"),
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
			markSaved(file.id, file.content);
		},
		onError: () => setSaveState("error"),
	});

	const isDirty = Boolean(activeFile && activeValue !== activeFile.content);

	useEffect(() => {
		if (!activeFile || !isDirty) return;

		const timeout = window.setTimeout(() => {
			saveMutation.mutate({
				fileId: activeFile.id,
				content: activeValue,
			});
		}, 900);

		return () => window.clearTimeout(timeout);
	}, [activeFile, activeValue, isDirty, saveMutation]);

	return {
		isSaving: saveMutation.isPending,
		saveNow: (fileId: string, content: string) =>
			saveMutation.mutate({ fileId, content }),
	};
}
