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
	Share2,
	WandSparkles,
	XCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { LocaleSwitcher } from "@/components/locale-switcher";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { TikzCodeEditor } from "@/features/editor/components/code-editor";
import { DesktopEditorLayout } from "@/features/editor/components/desktop-editor-layout";
import {
	SaveAsTemplateForm,
	type SaveAsTemplatePayload,
} from "@/features/editor/components/panels/save-as-template-form";
import { PdfPreview } from "@/features/editor/components/pdf-preview";
import { useAutoSave } from "@/features/editor/hooks/use-auto-save";
import { useCompile } from "@/features/editor/hooks/use-compile";
import { useProjectFiles } from "@/features/editor/hooks/use-project-files";
import {
	defaultActiveFile,
	useEditorStore,
} from "@/features/editor/store/use-editor-store";
import { HelpMenu } from "@/features/help/components/help-menu";
import { ExportProjectButton } from "@/features/projects/components/export-project-button";
import {
	getProject,
	getProjectFiles,
	getSnippets,
	getTemplates,
	saveProjectAsTemplate,
	updateFile,
	updateProject,
} from "@/lib/client-api";
import { diagnosticsForFile, parseCompileLog } from "@/lib/compile-log";
import { useI18n } from "@/lib/i18n/client";
import type { Translator } from "@/lib/i18n/translate";
import type { CompileJobDto } from "@/lib/types";
import { cn } from "@/lib/utils";

function saveStateMeta(t: Translator) {
	return {
		idle: { label: t("editor.saveIdle"), tone: "text-muted-foreground" },
		dirty: { label: t("editor.saveDirty"), tone: "text-foreground" },
		saving: { label: t("editor.saveSaving"), tone: "text-muted-foreground" },
		saved: { label: t("editor.saveSaved"), tone: "text-emerald-600" },
		error: { label: t("editor.saveError"), tone: "text-destructive" },
	} as const;
}

function panelMeta(t: Translator) {
	return {
		files: {
			title: t("editor.panelFiles"),
			description: t("editor.panelFilesDescription"),
			icon: FileCode2,
		},
		templates: {
			title: t("editor.panelTemplates"),
			description: t("editor.panelTemplatesDescription"),
			icon: LayoutTemplate,
		},
		snippets: {
			title: t("editor.panelSnippets"),
			description: t("editor.panelSnippetsDescription"),
			icon: WandSparkles,
		},
		settings: {
			title: t("editor.panelSettings"),
			description: t("editor.panelSettingsDescription"),
			icon: Settings2,
		},
	} as const;
}

function compileBadge(job: CompileJobDto | null, t: Translator) {
	if (!job) {
		return {
			label: t("compileStatus.ready"),
			className: "border-border bg-muted text-muted-foreground",
			icon: Clock3,
		};
	}

	switch (job.status) {
		case "SUCCESS":
			return {
				label: t("compileStatus.success"),
				className:
					"border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
				icon: CheckCircle2,
			};
		case "FAILED":
			return {
				label: t("compileStatus.failed"),
				className: "border-destructive/20 bg-destructive/10 text-destructive",
				icon: XCircle,
			};
		case "TIMEOUT":
			return {
				label: t("compileStatus.timeout"),
				className:
					"border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
				icon: Clock3,
			};
		case "RUNNING":
			return {
				label: t("compileStatus.running"),
				className: "border-border bg-secondary text-secondary-foreground",
				icon: LoaderCircle,
			};
		case "PENDING":
			return {
				label: t("compileStatus.pending"),
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

type Engine =
	| "TECTONIC"
	| "PDFLATEX"
	| "XELATEX"
	| "LUALATEX"
	| "PDFLATEX_BIBER";

const ENGINES: readonly Engine[] = [
	"TECTONIC",
	"PDFLATEX",
	"XELATEX",
	"LUALATEX",
	"PDFLATEX_BIBER",
];

function toEngine(value: string | undefined): Engine | undefined {
	return ENGINES.find((engine) => engine === value);
}

export function EditorScreen({ projectId }: { projectId: string }) {
	const { t, formatDateTime } = useI18n();
	const queryClient = useQueryClient();

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

	// The engine is stored on the project: it starts from the project's saved
	// engine (or its template's) and every change is persisted.
	const [engineOverride, setEngineOverride] = useState<Engine | null>(null);
	const engine: Engine =
		engineOverride ?? toEngine(projectQuery.data?.engine) ?? "TECTONIC";
	function setEngine(next: Engine) {
		setEngineOverride(next);
		void updateProject(projectId, { engine: next })
			.then((project) => {
				queryClient.setQueryData(["project", projectId], project);
			})
			.catch(() => {
				toast.error(t("editor.engineSaveFailed"));
			});
	}

	const { compile, isCompiling, currentCompile } = useCompile(
		projectId,
		engine,
	);

	const fileOps = useProjectFiles(projectId);

	// Compiling and saving as a template both read the files stored on the
	// server, so persist every unsaved buffer first (auto-save only covers the
	// active file, and only ~1 s after typing stops).
	async function flushUnsavedFiles() {
		const dirtyFiles = (filesQuery.data?.files ?? []).filter(
			(file) =>
				!file.isBinary &&
				buffers[file.id] !== undefined &&
				buffers[file.id] !== file.content,
		);
		const saved = await Promise.all(
			dirtyFiles.map((file) =>
				updateFile(projectId, file.id, { content: buffers[file.id] }),
			),
		);
		for (const file of saved) markSaved(file.id, file.content);
		if (saved.length > 0) {
			await queryClient.invalidateQueries({
				queryKey: ["project-files", projectId],
			});
		}
	}

	// Switching files leaves the previous buffer outside auto-save's reach, so
	// save it right away instead of risking it being lost.
	function handleSetActiveFile(fileId: string) {
		void flushUnsavedFiles().catch(() => {
			toast.error(t("editor.saveChangesFailed"));
		});
		setActiveFile(fileId);
	}

	const hasUnsavedChanges = (filesQuery.data?.files ?? []).some(
		(file) =>
			!file.isBinary &&
			buffers[file.id] !== undefined &&
			buffers[file.id] !== file.content,
	);
	useEffect(() => {
		if (!hasUnsavedChanges) return;
		const warn = (event: BeforeUnloadEvent) => {
			event.preventDefault();
		};
		window.addEventListener("beforeunload", warn);
		return () => window.removeEventListener("beforeunload", warn);
	}, [hasUnsavedChanges]);

	const [preparingCompile, setPreparingCompile] = useState(false);
	async function handleCompile() {
		setPreparingCompile(true);
		try {
			await flushUnsavedFiles();
			compile();
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: t("editor.saveBeforeCompileFailed"),
			);
		} finally {
			setPreparingCompile(false);
		}
	}

	async function handleSaveAsTemplate(payload: SaveAsTemplatePayload) {
		try {
			await flushUnsavedFiles();

			const template = await saveProjectAsTemplate(projectId, {
				...payload,
				engine,
			});
			await queryClient.invalidateQueries({ queryKey: ["templates"] });
			toast.success(t("editor.templateSaved", { title: template.title }), {
				description: t("editor.templateSavedDescription"),
			});
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : t("editor.templateSaveFailed"),
			);
		}
	}

	useEffect(() => {
		if (filesQuery.data?.files) {
			initialize(filesQuery.data.files);
		}
	}, [filesQuery.data?.files, initialize]);

	const activeFile = useMemo(
		() =>
			filesQuery.data?.files.find((file) => file.id === activeFileId) ??
			defaultActiveFile(filesQuery.data?.files ?? []) ??
			null,
		[activeFileId, filesQuery.data?.files],
	);

	const activeValue = activeFile
		? (buffers[activeFile.id] ?? activeFile.content)
		: "";

	const { isSaving, saveNow } = useAutoSave({
		projectId,
		activeFile,
		activeValue,
	});

	const saveMeta = saveStateMeta(t)[saveState];
	const compileMeta = compileBadge(currentCompile, t);
	const CompileIcon = compileMeta.icon;
	const activePanelMeta = panelMeta(t)[sidebarTab];

	const allDiagnostics = useMemo(
		() => parseCompileLog(currentCompile?.log ?? null),
		[currentCompile?.log],
	);
	const activeFileDiagnostics = useMemo(
		() =>
			activeFile ? diagnosticsForFile(allDiagnostics, activeFile.path) : [],
		[allDiagnostics, activeFile],
	);

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
										{t("common.dashboard")}
									</Link>
									<ChevronRight className="size-3" />
									<span>{t("editor.breadcrumbEditor")}</span>
								</div>
								<div className="flex items-center gap-3">
									<CardTitle className="truncate text-xl font-semibold">
										{projectQuery.data?.title ?? t("editor.projectLoading")}
									</CardTitle>
									<Badge variant="secondary" className="shrink-0 gap-1.5">
										<PanelLeft className="size-3" />
										{activeFile?.path ?? "main.tex"}
									</Badge>
									{activeFile ? (
										<span className="hidden text-xs text-muted-foreground xl:inline">
											{formatDateTime(activeFile.updatedAt)}
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
									aria-label={
										projectPanelOpen
											? t("editor.closePanel")
											: t("editor.openPanel")
									}
								>
									{projectPanelOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
								</Button>
								{projectQuery.data?.isPublic ? (
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={() => {
											const url = `${window.location.origin}/p/${projectId}`;
											navigator.clipboard.writeText(url);
											toast.success(t("editor.shareLinkCopied"));
										}}
									>
										<Share2 />
										{t("editor.share")}
									</Button>
								) : null}
								<HelpMenu page="editor" size="sm" />
								<LocaleSwitcher />
								<Button asChild variant="outline" size="sm">
									<Link href="/dashboard">{t("common.backToDashboard")}</Link>
								</Button>
								<Button
									variant="outline"
									size="sm"
									disabled={!activeFile || isSaving}
									onClick={() =>
										activeFile && saveNow(activeFile.id, activeValue)
									}
								>
									<Save />
									{t("common.save")}
								</Button>
								<Select
									value={engine}
									onValueChange={(v) => setEngine(v as typeof engine)}
								>
									<SelectTrigger
										size="sm"
										className="w-36"
										data-tour="engine-select"
									>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="TECTONIC">Tectonic</SelectItem>
										<SelectItem value="PDFLATEX">pdfLaTeX</SelectItem>
										<SelectItem value="XELATEX">XeLaTeX</SelectItem>
										<SelectItem value="LUALATEX">LuaLaTeX</SelectItem>
										<SelectItem value="PDFLATEX_BIBER">
											pdfLaTeX + Biber
										</SelectItem>
									</SelectContent>
								</Select>
								<Button
									size="sm"
									className="shadow-sm"
									disabled={isCompiling || preparingCompile || !activeFile}
									onClick={handleCompile}
									data-tour="compile-button"
								>
									<Play />
									{isCompiling || preparingCompile
										? t("editor.starting")
										: t("editor.compile")}
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
					diagnostics={activeFileDiagnostics}
					files={filesQuery.data?.files ?? []}
					insertIntoActive={insertIntoActive}
					previewZoom={previewZoom}
					project={projectQuery.data}
					projectPanelOpen={projectPanelOpen}
					saveMeta={saveMeta}
					sidebarTab={sidebarTab}
					snippets={snippetsQuery.data?.snippets ?? []}
					onSetActiveFile={handleSetActiveFile}
					onSetProjectPanelOpen={setProjectPanelOpen}
					onSetSidebarTab={setSidebarTab}
					onSetPreviewZoom={setPreviewZoom}
					onToggleProjectPanel={toggleProjectPanel}
					onUpdateBuffer={updateBuffer}
					onSubmitSettings={async (payload) => {
						await settingsMutation.mutateAsync(payload);
					}}
					onSaveAsTemplate={handleSaveAsTemplate}
					onCreateFile={fileOps.createFile}
					onDeleteFile={fileOps.deleteFile}
					onRenameFile={fileOps.renameFile}
					onSetMainFile={fileOps.setMainFile}
					onUploadFile={fileOps.uploadFile}
				/>

				{/* Mobile layout */}
				<div className="space-y-4 lg:hidden">
					<Card data-tour="editor-pane">
						<CardHeader>
							<CardTitle className="text-base">
								{t("editor.codeEditor")}
							</CardTitle>
							<CardDescription>
								{activeFile?.path ?? t("editor.noActiveFile")}
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
									diagnostics={activeFileDiagnostics}
									snippets={snippetsQuery.data?.snippets ?? []}
								/>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="text-base">
								{t("editor.projectPanel")}
							</CardTitle>
							<CardDescription>
								{t("editor.projectPanelMobileDescription")}
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
										className="grid h-auto w-full grid-cols-4 gap-1 rounded-xl bg-muted/40 p-1 group-data-horizontal/tabs:h-auto"
										data-tour="sidebar-nav"
									>
										<TabsTrigger
											value="files"
											className="h-auto min-h-9 min-w-0 rounded-lg px-1 py-1.5 text-xs leading-tight whitespace-normal data-active:bg-background data-active:shadow-sm sm:text-sm"
										>
											{t("editor.panelFiles")}
										</TabsTrigger>
										<TabsTrigger
											value="templates"
											className="h-auto min-h-9 min-w-0 rounded-lg px-1 py-1.5 text-xs leading-tight whitespace-normal data-active:bg-background data-active:shadow-sm sm:text-sm"
										>
											{t("editor.panelTemplates")}
										</TabsTrigger>
										<TabsTrigger
											value="snippets"
											className="h-auto min-h-9 min-w-0 rounded-lg px-1 py-1.5 text-xs leading-tight whitespace-normal data-active:bg-background data-active:shadow-sm sm:text-sm"
										>
											{t("editor.panelSnippets")}
										</TabsTrigger>
										<TabsTrigger
											value="settings"
											className="h-auto min-h-9 min-w-0 rounded-lg px-1 py-1.5 text-xs leading-tight whitespace-normal data-active:bg-background data-active:shadow-sm sm:text-sm"
										>
											{t("editor.panelSettings")}
										</TabsTrigger>
									</TabsList>
								</div>
								<TabsContent value="files" className="px-4">
									<div className="space-y-2">
										{filesQuery.data?.files.map((file) => (
											<button
												type="button"
												key={file.id}
												onClick={() => handleSetActiveFile(file.id)}
												className={cn(
													"w-full rounded-lg border px-3 py-3 text-left",
													activeFileId === file.id
														? "border-primary/20 bg-muted"
														: "border-transparent bg-muted/30",
												)}
											>
												<div className="text-sm font-medium">{file.path}</div>
												<div className="mt-1 text-xs text-muted-foreground">
													{formatDateTime(file.updatedAt)}
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
												onClick={() => insertIntoActive(template.content ?? "")}
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
											placeholder={t("editor.projectName")}
										/>
										<Textarea
											name="description"
											defaultValue={projectQuery.data?.description ?? ""}
											placeholder={t("common.description")}
										/>
										<div className="flex items-center justify-between rounded-lg border p-3">
											<div>
												<div className="text-sm font-medium">
													{t("editor.publicReadOnly")}
												</div>
												<div className="text-xs text-muted-foreground">
													{t("editor.publicHintShort")}
												</div>
											</div>
											<Switch
												name="isPublic"
												defaultChecked={projectQuery.data?.isPublic}
											/>
										</div>
										<Button type="submit" size="sm" className="w-full">
											{t("editor.saveSettings")}
										</Button>
									</form>
									{projectQuery.data ? (
										<div className="mt-4">
											<ExportProjectButton projectId={projectQuery.data.id} />
										</div>
									) : null}
									<div className="mt-4">
										<SaveAsTemplateForm
											key={`template-mobile-${projectQuery.data?.id ?? "none"}`}
											defaultTitle={projectQuery.data?.title ?? ""}
											defaultDescription={projectQuery.data?.description}
											onSave={handleSaveAsTemplate}
										/>
									</div>
								</TabsContent>
							</Tabs>
						</CardContent>
					</Card>

					<Card data-tour="output-panel">
						<CardHeader>
							<CardTitle className="text-base">
								{t("editor.outputPanel")}
							</CardTitle>
							<CardDescription>
								{t("editor.outputPanelMobileDescription")}
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
							{currentCompile?.outputUrl ||
							currentCompile?.svgOutputUrl ||
							currentCompile?.pngOutputUrl ? (
								<div className="grid grid-cols-2 gap-2">
									{currentCompile.outputUrl ? (
										<Button asChild variant="outline" size="sm">
											<a href={`${currentCompile.outputUrl}?download=1`}>
												<Download />
												{t("editor.downloadPdf")}
											</a>
										</Button>
									) : null}
									{currentCompile.svgOutputUrl ? (
										<Button asChild variant="outline" size="sm">
											<a href={`${currentCompile.svgOutputUrl}&download=1`}>
												<FileImage />
												{t("editor.downloadSvg")}
											</a>
										</Button>
									) : null}
									{currentCompile.pngOutputUrl ? (
										<Button asChild variant="outline" size="sm">
											<a href={`${currentCompile.pngOutputUrl}&download=1`}>
												<FileImage />
												{t("editor.downloadPng")}
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
									{currentCompile?.log ?? t("editor.logPlaceholder")}
								</pre>
							</ScrollArea>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
