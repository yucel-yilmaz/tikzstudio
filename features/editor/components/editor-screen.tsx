"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	CheckCircle2,
	ChevronRight,
	Clock3,
	Download,
	FileCode2,
	FileImage,
	LayoutTemplate,
	LoaderCircle,
	PanelLeft,
	PanelLeftClose,
	PanelLeftOpen,
	Play,
	Save,
	Settings2,
	WandSparkles,
	XCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { TikzCodeEditor } from "@/features/editor/components/code-editor";
import { DesktopEditorLayout } from "@/features/editor/components/desktop-editor-layout";
import { PdfPreview } from "@/features/editor/components/pdf-preview";
import { useEditorStore } from "@/features/editor/store/use-editor-store";
import {
	compileProject,
	createFile,
	deleteFile,
	getCompileJob,
	getLatestCompileOutput,
	getProject,
	getProjectFiles,
	getSnippets,
	getTemplates,
	updateFile,
	updateProject,
} from "@/lib/client-api";
import { COMPILE_TERMINAL_STATUSES } from "@/lib/defaults";
import type { CompileJobDto, ProjectFileDto } from "@/lib/types";
import { cn, formatRelativeDate } from "@/lib/utils";

const terminalStatuses = new Set<string>(COMPILE_TERMINAL_STATUSES);

const saveStateMeta = {
	idle: { label: "Temiz", tone: "text-muted-foreground" },
	dirty: { label: "Kaydedilmemis", tone: "text-foreground" },
	saving: { label: "Kaydediliyor", tone: "text-muted-foreground" },
	saved: { label: "Kaydedildi", tone: "text-emerald-600" },
	error: { label: "Hata", tone: "text-destructive" },
} as const;

const panelMeta = {
	files: {
		title: "Dosyalar",
		description: "Projedeki kaynak dosyaları seç ve aç.",
		icon: FileCode2,
	},
	templates: {
		title: "Şablonlar",
		description: "Hazır başlangıç belgelerini aktif dosyaya ekle.",
		icon: LayoutTemplate,
	},
	snippets: {
		title: "Parçalar",
		description: "Sık kullanılan TikZ bloklarını hızlıca ekle.",
		icon: WandSparkles,
	},
	settings: {
		title: "Ayarlar",
		description: "Proje bilgisini ve görünürlük ayarlarını güncelle.",
		icon: Settings2,
	},
} as const;

function compileBadge(job: CompileJobDto | null) {
	if (!job) {
		return {
			label: "Hazir",
			className: "border-border bg-muted text-muted-foreground",
			icon: Clock3,
		};
	}

	switch (job.status) {
		case "SUCCESS":
			return {
				label: "Başarılı",
				className:
					"border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
				icon: CheckCircle2,
			};
		case "FAILED":
			return {
				label: "Başarısız",
				className: "border-destructive/20 bg-destructive/10 text-destructive",
				icon: XCircle,
			};
		case "TIMEOUT":
			return {
				label: "Zaman aşımı",
				className:
					"border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
				icon: Clock3,
			};
		case "RUNNING":
			return {
				label: "Derleniyor",
				className: "border-border bg-secondary text-secondary-foreground",
				icon: LoaderCircle,
			};
		case "PENDING":
			return {
				label: "Beklemede",
				className: "border-border bg-secondary text-secondary-foreground",
				icon: Clock3,
			};
		default:
			return {
				label: job.status,
				className: "border-border bg-muted text-muted-foreground",
				icon: Clock3,
			};
	}
}

export function EditorScreen({ projectId }: { projectId: string }) {
	const queryClient = useQueryClient();
	const [compileJobId, setCompileJobId] = useState<string | null>(null);

	const {
		activeFileId,
		sidebarTab,
		projectPanelOpen,
		previewZoom,
		buffers,
		saveState,
		initialize,
		setActiveFile,
		setSidebarTab,
		setProjectPanelOpen,
		toggleProjectPanel,
		updateBuffer,
		insertIntoActive,
		setPreviewZoom,
		setSaveState,
		markSaved,
	} = useEditorStore();

	const projectQuery = useQuery({
		queryKey: ["project", projectId],
		queryFn: () => getProject(projectId),
	});

	const filesQuery = useQuery({
		queryKey: ["project-files", projectId],
		queryFn: () => getProjectFiles(projectId),
	});

	const templatesQuery = useQuery({
		queryKey: ["templates"],
		queryFn: () => getTemplates(),
	});

	const snippetsQuery = useQuery({
		queryKey: ["snippets"],
		queryFn: () => getSnippets(),
	});

	const compileQuery = useQuery({
		queryKey: ["compile-job", compileJobId],
		queryFn: () => {
			if (!compileJobId) {
				throw new Error("Compile job id is required.");
			}

			return getCompileJob(compileJobId);
		},
		enabled: Boolean(compileJobId),
		refetchInterval: (query) => {
			const job = query.state.data;
			if (!job || !compileJobId) {
				return 1000;
			}

			return terminalStatuses.has(job.status) ? false : 1000;
		},
	});

	const latestCompileQuery = useQuery({
		queryKey: ["latest-compile-output", projectId],
		queryFn: () => getLatestCompileOutput(projectId),
		enabled: !compileJobId,
	});

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
								files: current.files.map((candidate) =>
									candidate.id === file.id ? file : candidate,
								),
							}
						: current,
			);
			markSaved(file.id, file.content);
		},
		onError: () => setSaveState("error"),
	});

	const compileMutation = useMutation({
		mutationFn: () =>
			compileProject(projectId, { mainFileId: activeFileId ?? undefined }),
		onSuccess: (job) => {
			setCompileJobId(job.id);
			queryClient.setQueryData(["latest-compile-output", projectId], {
				compileJob: job,
			});
		},
	});

	const settingsMutation = useMutation({
		mutationFn: (payload: {
			title: string;
			description: string;
			isPublic: boolean;
		}) => updateProject(projectId, payload),
		onSuccess: (project) => {
			queryClient.setQueryData(["project", projectId], project);
		},
	});

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
						? { files: current.files.filter((file) => file.id !== fileId) }
						: current,
			);
			if (activeFileId === fileId) {
				const remaining =
					filesQuery.data?.files.filter((file) => file.id !== fileId) ?? [];
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
								files: current.files.map((candidate) =>
									candidate.id === file.id ? file : candidate,
								),
							}
						: current,
			);
			toast.success(`"${file.path}" olarak yeniden adlandırıldı`);
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
								files: current.files.map((candidate) => ({
									...candidate,
									isMain: candidate.id === file.id,
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

	useEffect(() => {
		if (filesQuery.data?.files) {
			initialize(filesQuery.data.files);
		}
	}, [filesQuery.data?.files, initialize]);

	const activeFile = useMemo(
		() =>
			filesQuery.data?.files.find((file) => file.id === activeFileId) ??
			filesQuery.data?.files[0] ??
			null,
		[activeFileId, filesQuery.data?.files],
	);

	const activeValue = activeFile
		? (buffers[activeFile.id] ?? activeFile.content)
		: "";
	const isDirty = Boolean(activeFile && activeValue !== activeFile.content);

	useEffect(() => {
		if (!activeFile || !isDirty) {
			return;
		}

		const timeout = window.setTimeout(() => {
			saveMutation.mutate({
				fileId: activeFile.id,
				content: activeValue,
			});
		}, 900);

		return () => window.clearTimeout(timeout);
	}, [activeFile, activeValue, isDirty, saveMutation]);

	const currentCompile =
		compileQuery.data ??
		compileMutation.data ??
		latestCompileQuery.data?.compileJob ??
		null;
	const saveMeta = saveStateMeta[saveState];
	const compileMeta = compileBadge(currentCompile);
	const CompileIcon = compileMeta.icon;
	const activePanelMeta = panelMeta[sidebarTab];

	return (
		<div className="min-h-screen bg-background lg:h-screen lg:overflow-hidden">
			<div className="mx-auto flex max-w-450 flex-col gap-4 p-4 lg:h-full lg:overflow-hidden lg:p-6">
				<Card className="border-border/70 shadow-none lg:shrink-0">
					<CardHeader className="gap-3 py-4">
						<div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
							<div className="min-w-0 space-y-1">
								<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
									<Link
										href="/dashboard"
										className="transition-colors hover:text-foreground"
									>
										Dashboard
									</Link>
									<ChevronRight className="size-3" />
									<span>Editör</span>
								</div>
								<div className="flex items-center gap-3">
									<CardTitle className="truncate text-xl font-semibold">
										{projectQuery.data?.title ?? "Proje yukleniyor..."}
									</CardTitle>
									<Badge variant="secondary" className="gap-1.5 shrink-0">
										<PanelLeft className="size-3" />
										{activeFile?.path ?? "main.tex"}
									</Badge>
									{activeFile ? (
										<span className="hidden text-xs text-muted-foreground xl:inline">
											{formatRelativeDate(activeFile.updatedAt)}
										</span>
									) : null}
								</div>
							</div>

							<CardAction className="flex flex-wrap items-center gap-2">
								<Badge
									variant="outline"
									className={cn("gap-1.5", saveMeta.tone)}
								>
									<Save className="size-3" />
									{saveMeta.label}
								</Badge>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={toggleProjectPanel}
									className="hidden lg:inline-flex"
									aria-label={projectPanelOpen ? "Paneli kapat" : "Paneli ac"}
								>
									{projectPanelOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
								</Button>
								<Button asChild variant="outline" size="sm">
									<Link href="/dashboard">Panele dön</Link>
								</Button>
								<Button
									variant="outline"
									size="sm"
									disabled={!activeFile || saveMutation.isPending}
									onClick={() =>
										activeFile &&
										saveMutation.mutate({
											fileId: activeFile.id,
											content: activeValue,
										})
									}
								>
									<Save />
									Kaydet
								</Button>
								<Button
									size="sm"
									className="shadow-sm"
									disabled={
										compileMutation.isPending ||
										saveMutation.isPending ||
										!activeFile
									}
									onClick={() => compileMutation.mutate()}
								>
									<Play />
									{compileMutation.isPending ? "Başlatılıyor" : "Derle"}
								</Button>
							</CardAction>
						</div>
					</CardHeader>
				</Card>

				<DesktopEditorLayout
					activeFile={activeFile}
					activeFileId={activeFileId}
					activePanelMeta={activePanelMeta}
					activeValue={activeValue}
					compileMeta={compileMeta}
					currentCompile={currentCompile}
					files={filesQuery.data?.files ?? []}
					insertIntoActive={insertIntoActive}
					previewZoom={previewZoom}
					project={projectQuery.data}
					projectPanelOpen={projectPanelOpen}
					saveMeta={saveMeta}
					sidebarTab={sidebarTab}
					snippets={snippetsQuery.data?.snippets ?? []}
					templates={templatesQuery.data?.templates ?? []}
					onSetActiveFile={setActiveFile}
					onSetProjectPanelOpen={setProjectPanelOpen}
					onSetSidebarTab={setSidebarTab}
					onSetPreviewZoom={setPreviewZoom}
					onToggleProjectPanel={toggleProjectPanel}
					onUpdateBuffer={updateBuffer}
					onSubmitSettings={async (payload) => {
						await settingsMutation.mutateAsync(payload);
					}}
					onCreateFile={async (path) => {
						await createFileMutation.mutateAsync(path);
					}}
					onDeleteFile={async (fileId) => {
						await deleteFileMutation.mutateAsync(fileId);
					}}
					onRenameFile={async (fileId, path) => {
						await renameFileMutation.mutateAsync({ fileId, path });
					}}
					onSetMainFile={async (fileId) => {
						await setMainFileMutation.mutateAsync(fileId);
					}}
				/>

				<div className="space-y-4 lg:hidden">
					<Card>
						<CardHeader>
							<CardTitle className="text-base">Kod Editörü</CardTitle>
							<CardDescription>
								{activeFile?.path ?? "Aktif dosya seçilmedi"}
							</CardDescription>
						</CardHeader>
						<CardContent className="p-0">
							<div className="h-110 overflow-hidden border-t">
								<TikzCodeEditor
									value={activeValue}
									onChange={(value) => {
										if (activeFile) {
											updateBuffer(activeFile.id, value);
										}
									}}
								/>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="text-base">Proje Paneli</CardTitle>
							<CardDescription>
								Dosyalar, şablonlar ve parçalar.
							</CardDescription>
						</CardHeader>
						<CardContent className="px-0">
							<Tabs
								value={sidebarTab}
								onValueChange={(value) =>
									setSidebarTab(value as typeof sidebarTab)
								}
							>
								<div className="mb-2 px-4">
									<TabsList
										variant="line"
										className="grid h-auto w-full grid-cols-4 gap-1 rounded-xl bg-muted/40 p-1"
									>
										<TabsTrigger
											value="files"
											className="min-h-9 rounded-lg data-active:bg-background data-active:shadow-sm"
										>
											Dosyalar
										</TabsTrigger>
										<TabsTrigger
											value="templates"
											className="min-h-9 rounded-lg data-active:bg-background data-active:shadow-sm"
										>
											Şablonlar
										</TabsTrigger>
										<TabsTrigger
											value="snippets"
											className="min-h-9 rounded-lg data-active:bg-background data-active:shadow-sm"
										>
											Parçalar
										</TabsTrigger>
										<TabsTrigger
											value="settings"
											className="min-h-9 rounded-lg data-active:bg-background data-active:shadow-sm"
										>
											Ayarlar
										</TabsTrigger>
									</TabsList>
								</div>
								<TabsContent value="files" className="px-4">
									<div className="space-y-2">
										{filesQuery.data?.files.map((file) => (
											<button
												type="button"
												key={file.id}
												onClick={() => setActiveFile(file.id)}
												className={cn(
													"w-full rounded-lg border px-3 py-3 text-left",
													activeFileId === file.id
														? "border-primary/20 bg-muted"
														: "border-transparent bg-muted/30",
												)}
											>
												<div className="text-sm font-medium">{file.path}</div>
												<div className="mt-1 text-xs text-muted-foreground">
													{formatRelativeDate(file.updatedAt)}
												</div>
											</button>
										))}
									</div>
								</TabsContent>
								<TabsContent value="templates" className="px-4">
									<div className="space-y-2">
										{templatesQuery.data?.templates.map((template) => (
											<button
												type="button"
												key={template.id}
												onClick={() => insertIntoActive(template.content)}
												className="w-full rounded-lg border border-transparent bg-muted/30 px-3 py-3 text-left"
											>
												<div className="text-sm font-medium">
													{template.title}
												</div>
												<div className="mt-1 text-xs text-muted-foreground">
													{template.category}
												</div>
											</button>
										))}
									</div>
								</TabsContent>
								<TabsContent value="snippets" className="px-4">
									<div className="space-y-2">
										{snippetsQuery.data?.snippets.map((snippet) => (
											<button
												type="button"
												key={snippet.id}
												onClick={() => insertIntoActive(snippet.content)}
												className="w-full rounded-lg border border-transparent bg-muted/30 px-3 py-3 text-left"
											>
												<div className="flex items-center justify-between gap-3">
													<div className="text-sm font-medium">
														{snippet.title}
													</div>
													<Badge variant="outline">{snippet.trigger}</Badge>
												</div>
											</button>
										))}
									</div>
								</TabsContent>
								<TabsContent value="settings" className="px-4">
									<form
										key={projectQuery.data?.id ?? "project-settings-mobile"}
										action={async (formData) => {
											await settingsMutation.mutateAsync({
												title: String(formData.get("title") ?? ""),
												description: String(formData.get("description") ?? ""),
												isPublic: formData.get("isPublic") === "on",
											});
										}}
										className="space-y-4"
									>
										<Input
											name="title"
											defaultValue={projectQuery.data?.title ?? ""}
											placeholder="Proje adi"
										/>
										<Textarea
											name="description"
											defaultValue={projectQuery.data?.description ?? ""}
											placeholder="Aciklama"
										/>
										<div className="flex items-center justify-between rounded-lg border p-3">
											<div>
												<div className="text-sm font-medium">
													Herkese açık okuma modu
												</div>
												<div className="text-xs text-muted-foreground">
													Paylaşım için işaretle
												</div>
											</div>
											<Switch
												name="isPublic"
												defaultChecked={projectQuery.data?.isPublic}
											/>
										</div>
										<Button type="submit" size="sm" className="w-full">
											Ayarları kaydet
										</Button>
									</form>
								</TabsContent>
							</Tabs>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="text-base">Çıktı Paneli</CardTitle>
							<CardDescription>
								Derleme Sonuçları ve PDF Önizleme
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<Badge variant="outline" className={compileMeta.className}>
								<CompileIcon
									className={cn(
										"size-4",
										currentCompile?.status === "RUNNING" && "animate-spin",
									)}
								/>
								{compileMeta.label}
							</Badge>
							{currentCompile?.outputUrl || currentCompile?.svgOutputUrl ? (
								<div className="grid grid-cols-2 gap-2">
									{currentCompile.outputUrl ? (
										<Button asChild variant="outline" size="sm">
											<a href={`${currentCompile.outputUrl}?download=1`}>
												<Download />
												PDF indir
											</a>
										</Button>
									) : null}
									{currentCompile.svgOutputUrl ? (
										<Button asChild variant="outline" size="sm">
											<a href={`${currentCompile.svgOutputUrl}&download=1`}>
												<FileImage />
												SVG indir
											</a>
										</Button>
									) : null}
								</div>
							) : null}
							<PdfPreview
								src={currentCompile?.outputUrl ?? null}
								zoom={previewZoom}
								onZoomChange={setPreviewZoom}
							/>
							<Separator />
							<ScrollArea className="h-52 rounded-xl border">
								<pre className="p-3 font-mono text-xs leading-6 text-muted-foreground">
									{currentCompile?.log ?? "Derleme çıktısı burada görünecek."}
								</pre>
							</ScrollArea>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
