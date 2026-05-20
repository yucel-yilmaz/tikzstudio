"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
	CheckCircle2,
	Clock3,
	Code2,
	Download,
	FileCode2,
	GitFork,
	LoaderCircle,
	XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TikzCodeEditor } from "@/features/editor/components/code-editor";
import { PdfPreview } from "@/features/editor/components/pdf-preview";
import {
	ClientApiError,
	forkProject,
	getLatestCompileOutput,
	getPublicProject,
} from "@/lib/client-api";
import type { ProjectFileDto } from "@/lib/types";
import { formatRelativeDate } from "@/lib/utils";

function StatusBadge({ status }: { status: string | undefined }) {
	if (!status) {
		return (
			<Badge variant="outline" className="gap-1.5 text-muted-foreground">
				<Clock3 className="size-3" />
				Not compiled yet
			</Badge>
		);
	}

	if (status === "SUCCESS") {
		return (
			<Badge
				variant="outline"
				className="gap-1.5 border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
			>
				<CheckCircle2 className="size-3" />
				Success
			</Badge>
		);
	}

	if (status === "FAILED") {
		return (
			<Badge
				variant="outline"
				className="gap-1.5 border-destructive/20 bg-destructive/10 text-destructive"
			>
				<XCircle className="size-3" />
				Failed
			</Badge>
		);
	}

	return (
		<Badge variant="outline" className="gap-1.5 text-muted-foreground">
			<Clock3 className="size-3" />
			{status}
		</Badge>
	);
}

export function ShareScreen({ projectId }: { projectId: string }) {
	const router = useRouter();
	const [activeFileId, setActiveFileId] = useState<string | null>(null);
	const [previewZoom, setPreviewZoom] = useState(1);

	const forkMutation = useMutation({
		mutationFn: () => forkProject(projectId),
		onSuccess: (project) => {
			router.push(`/projects/${project.id}/editor`);
		},
		onError: (error) => {
			if (error instanceof ClientApiError && error.status === 401) {
				router.push(`/signup?next=/p/${projectId}`);
			}
		},
	});

	const projectQuery = useQuery({
		queryKey: ["share-project", projectId],
		queryFn: () => getPublicProject(projectId),
	});

	const compileQuery = useQuery({
		queryKey: ["share-compile", projectId],
		queryFn: () => getLatestCompileOutput(projectId),
		enabled: Boolean(projectQuery.data),
	});

	const project = projectQuery.data;
	const files: ProjectFileDto[] = project?.files ?? [];
	const compile = compileQuery.data?.compileJob ?? null;

	const activeFile =
		files.find((f) => f.id === activeFileId) ??
		files.find((f) => f.isMain) ??
		files[0] ??
		null;

	if (projectQuery.isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="flex items-center gap-2 text-muted-foreground">
					<LoaderCircle className="size-4 animate-spin" />
					<span className="text-sm">Loading…</span>
				</div>
			</div>
		);
	}

	if (projectQuery.isError || !project) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="max-w-sm space-y-3 text-center">
					<p className="text-base font-medium">Project not found</p>
					<p className="text-sm text-muted-foreground">
						This project is not public or may have been deleted.
					</p>
					<Button asChild variant="outline" size="sm">
						<Link href="/">Back to home</Link>
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			<header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur-sm">
				<div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-4 px-4 py-3">
					<div className="flex min-w-0 items-center gap-3">
						<Link
							href="/"
							className="shrink-0 text-sm font-semibold tracking-tight text-foreground"
						>
							TikZ Studio
						</Link>
						<Separator orientation="vertical" className="h-4" />
						<p className="truncate text-sm text-muted-foreground">
							{project.title}
						</p>
					</div>
					<div className="flex items-center gap-2">
						<StatusBadge status={compile?.status} />
						{compile?.outputUrl ? (
							<Button asChild variant="outline" size="sm">
								<a href={`${compile.outputUrl}?download=1`}>
									<Download className="size-4" />
									Download PDF
								</a>
							</Button>
						) : null}
						{compile?.svgOutputUrl ? (
							<Button asChild variant="outline" size="sm">
								<a href={`${compile.svgOutputUrl}&download=1`}>
									<Download className="size-4" />
									Download SVG
								</a>
							</Button>
						) : null}
						<Button
							size="sm"
							disabled={forkMutation.isPending}
							onClick={() => forkMutation.mutate()}
						>
							{forkMutation.isPending ? (
								<LoaderCircle className="size-4 animate-spin" />
							) : (
								<GitFork className="size-4" />
							)}
							{forkMutation.isPending ? "Forking…" : "Fork"}
						</Button>
					</div>
				</div>
			</header>

			<main className="mx-auto max-w-screen-2xl px-4 py-6">
				<div className="mb-6 space-y-1">
					<h1 className="text-2xl font-semibold">{project.title}</h1>
					{project.description ? (
						<p className="text-sm text-muted-foreground">
							{project.description}
						</p>
					) : null}
					{compile?.finishedAt ? (
						<p className="text-xs text-muted-foreground">
							Last compiled: {formatRelativeDate(compile.finishedAt)}
						</p>
					) : null}
				</div>

				<div className="grid gap-6 lg:grid-cols-2">
					<Card className="flex min-h-0 flex-col shadow-none">
						<CardHeader className="border-b py-3">
							<div className="flex items-center justify-between gap-3">
								<div className="flex items-center gap-2">
									<Code2 className="size-4 text-muted-foreground" />
									<CardTitle className="text-sm font-medium">
										Source Code
									</CardTitle>
								</div>
								{files.length > 1 ? (
									<span className="text-xs text-muted-foreground">
										{files.length} {files.length === 1 ? "file" : "files"}
									</span>
								) : null}
							</div>
						</CardHeader>
						<CardContent className="min-h-0 flex-1 p-0">
							{files.length > 1 ? (
								<Tabs
									value={activeFile?.id ?? ""}
									onValueChange={setActiveFileId}
									className="flex h-full flex-col"
								>
									<div className="border-b px-3 pt-2">
										<TabsList variant="line" className="h-8 gap-1">
											{files.map((file) => (
												<TabsTrigger
													key={file.id}
													value={file.id}
													className="gap-1.5 text-xs"
												>
													<FileCode2 className="size-3" />
													{file.path}
													{file.isMain ? (
														<Badge
															variant="secondary"
															className="ml-1 text-[10px]"
														>
															Main
														</Badge>
													) : null}
												</TabsTrigger>
											))}
										</TabsList>
									</div>
									{files.map((file) => (
										<TabsContent
											key={file.id}
											value={file.id}
											className="mt-0 flex-1"
										>
											<div className="max-h-120 overflow-y-auto">
												<TikzCodeEditor
													value={file.content}
													onChange={() => {}}
													readOnly
													height="auto"
												/>
											</div>
										</TabsContent>
									))}
								</Tabs>
							) : (
								<div className="max-h-130 overflow-y-auto">
									<TikzCodeEditor
										value={activeFile?.content ?? ""}
										onChange={() => {}}
										readOnly
										height="auto"
									/>
								</div>
							)}
						</CardContent>
					</Card>

					<div className="flex flex-col gap-4">
						<Card className="shadow-none">
							<CardHeader className="border-b py-3">
								<div className="flex items-center justify-between gap-3">
									<CardTitle className="text-sm font-medium">
										PDF Preview
									</CardTitle>
									<StatusBadge status={compile?.status} />
								</div>
								{compile?.finishedAt ? (
									<CardDescription className="text-xs">
										{formatRelativeDate(compile.finishedAt)}
									</CardDescription>
								) : null}
							</CardHeader>
							<CardContent className="p-3">
								<div className="h-100">
									<PdfPreview
										src={compile?.outputUrl ?? null}
										zoom={previewZoom}
										onZoomChange={setPreviewZoom}
									/>
								</div>
							</CardContent>
						</Card>

						{compile?.log ? (
							<Card className="shadow-none">
								<CardHeader className="border-b py-3">
									<CardTitle className="text-sm font-medium">
										Compile Log
									</CardTitle>
								</CardHeader>
								<CardContent className="p-0">
									<ScrollArea className="h-36">
										<pre className="p-3 font-mono text-xs leading-5 text-muted-foreground">
											{compile.log}
										</pre>
									</ScrollArea>
								</CardContent>
							</Card>
						) : null}
					</div>
				</div>
			</main>
		</div>
	);
}
