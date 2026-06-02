"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import {
	ClientApiError,
	compileProject,
	getCompileJob,
	getLatestCompileOutput,
} from "@/lib/client-api";
import { COMPILE_TERMINAL_STATUSES } from "@/lib/defaults";
import type { CompileJobDto } from "@/lib/types";

type LatexEngine =
	| "TECTONIC"
	| "PDFLATEX"
	| "XELATEX"
	| "LUALATEX"
	| "PDFLATEX_BIBER";

const terminalStatuses = new Set<string>(COMPILE_TERMINAL_STATUSES);

export function useCompile(
	projectId: string,
	activeFileId: string | null,
	engine: LatexEngine,
) {
	const queryClient = useQueryClient();
	const [compileJobId, setCompileJobId] = useState<string | null>(null);

	const compileQuery = useQuery({
		queryKey: ["compile-job", compileJobId],
		queryFn: () => {
			if (!compileJobId) throw new Error("Compile job id is required.");
			return getCompileJob(compileJobId);
		},
		enabled: Boolean(compileJobId),
		refetchInterval: (query) => {
			const job = query.state.data;
			if (!job || !compileJobId) return 1000;
			return terminalStatuses.has(job.status) ? false : 1000;
		},
	});

	const latestCompileQuery = useQuery({
		queryKey: ["latest-compile-output", projectId],
		queryFn: () => getLatestCompileOutput(projectId),
		enabled: !compileJobId,
	});

	const compileMutation = useMutation({
		mutationFn: () =>
			compileProject(projectId, {
				engine,
				mainFileId: activeFileId ?? undefined,
			}),
		onSuccess: (job) => {
			setCompileJobId(job.id);
			queryClient.setQueryData(["latest-compile-output", projectId], {
				compileJob: job,
			});
		},
		onError: (error) => {
			if (error instanceof ClientApiError && error.code === "RATE_LIMITED") {
				toast.error(error.message);
				return;
			}
			toast.error(
				error instanceof Error ? error.message : "Failed to start compilation.",
			);
		},
	});

	const currentCompile: CompileJobDto | null =
		compileQuery.data ??
		compileMutation.data ??
		latestCompileQuery.data?.compileJob ??
		null;

	return {
		compile: () => compileMutation.mutate(),
		isCompiling: compileMutation.isPending,
		currentCompile,
	};
}
