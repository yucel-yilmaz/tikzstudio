"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	Check,
	Download,
	FileCode2,
	FileImage,
	FilePlus,
	LayoutTemplate,
	type LucideIcon,
	MoreVertical,
	PanelLeftClose,
	PanelLeftOpen,
	Pencil,
	Plus,
	ScanLine,
	Search,
	Settings2,
	Star,
	TerminalSquare,
	Trash2,
	Upload,
	WandSparkles,
	X,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
	TikzCodeEditor,
	type TikzCodeEditorHandle,
} from "@/features/editor/components/code-editor";
import { PdfPreview } from "@/features/editor/components/pdf-preview";
import {
	createSnippet,
	createTemplate,
	deleteSnippet,
	deleteTemplate,
	getCompileHistory,
	img2latex,
} from "@/lib/client-api";
import type { CompileDiagnostic } from "@/lib/compile-log";
import type {
	CompileJobDto,
	CreateSnippetInput,
	CreateTemplateInput,
	ProjectDetail,
	ProjectFileDto,
	SnippetDto,
	TemplateDto,
} from "@/lib/types";
import { cn, formatRelativeDate, normalizeProjectFilePath } from "@/lib/utils";

type SidebarTab = "files" | "templates" | "snippets" | "settings";

type SaveMeta = {
	label: string;
	tone: string;
};

type CompileMeta = {
	label: string;
	className: string;
	icon: LucideIcon;
};

type PanelMeta = Record<
	SidebarTab,
	{
		title: string;
		description: string;
		icon: LucideIcon;
	}
>;

type DesktopEditorLayoutProps = {
	activeFile: ProjectFileDto | null;
	activeFileId: string | null;
	activePanelMeta: PanelMeta[SidebarTab];
	activeValue: string;
	compileMeta: CompileMeta;
	currentCompile: CompileJobDto | null;
	diagnostics: CompileDiagnostic[];
	files: ProjectFileDto[];
	insertIntoActive(content: string): void;
	previewZoom: number;
	project: ProjectDetail | undefined;
	projectPanelOpen: boolean;
	saveMeta: SaveMeta;
	sidebarTab: SidebarTab;
	snippets: SnippetDto[];
	templates: TemplateDto[];
	onSetActiveFile(fileId: string): void;
	onSetProjectPanelOpen(open: boolean): void;
	onSetSidebarTab(tab: SidebarTab): void;
	onSetPreviewZoom(zoom: number): void;
	onToggleProjectPanel(): void;
	onUpdateBuffer(fileId: string, content: string): void;
	onSubmitSettings(payload: {
		title: string;
		description: string;
		isPublic: boolean;
	}): Promise<void>;
	onCreateFile(path: string): Promise<void>;
	onDeleteFile(fileId: string): Promise<void>;
	onRenameFile(fileId: string, path: string): Promise<void>;
	onSetMainFile(fileId: string): Promise<void>;
	onUploadFile(file: File): void;
};

function summarizeCompileLog(log: string | null) {
	if (!log) {
		return ["Derleme çıktısı henüz yok."];
	}

	const importantLines = log
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter((line) =>
			/^(error|fatal|warning:|Output written|Compilation timed out|Page count)/i.test(
				line,
			),
		);

	return importantLines.length > 0
		? importantLines.slice(0, 5)
		: log.split(/\r?\n/).slice(0, 4);
}

export function DesktopEditorLayout({
	activeFile,
	activeFileId,
	activePanelMeta,
	activeValue,
	compileMeta,
	currentCompile,
	diagnostics,
	files,
	insertIntoActive,
	previewZoom,
	project,
	projectPanelOpen,
	saveMeta,
	sidebarTab,
	snippets,
	templates,
	onSetActiveFile,
	onSetProjectPanelOpen,
	onSetSidebarTab,
	onSetPreviewZoom,
	onToggleProjectPanel,
	onUpdateBuffer,
	onSubmitSettings,
	onCreateFile,
	onDeleteFile,
	onRenameFile,
	onSetMainFile,
	onUploadFile,
}: DesktopEditorLayoutProps) {
	const CompileIcon = compileMeta.icon;
	const logSummary = summarizeCompileLog(currentCompile?.log ?? null);
	const editorRef = useRef<TikzCodeEditorHandle>(null);

	function handleInsert(content: string) {
		if (editorRef.current) {
			editorRef.current.insertAtCursor(content);
		} else {
			insertIntoActive(content);
		}
	}

	const [img2latexOpen, setImg2latexOpen] = useState(false);
	const [img2latexFile, setImg2latexFile] = useState<File | null>(null);
	const [img2latexPreview, setImg2latexPreview] = useState<string | null>(null);
	const [img2latexResult, setImg2latexResult] = useState<string>("");
	const img2latexInputRef = useRef<HTMLInputElement>(null);

	const img2latexMutation = useMutation({
		mutationFn: (file: File) => img2latex(file),
		onSuccess: (data) => setImg2latexResult(data.latex),
	});

	function openImg2latex() {
		setImg2latexFile(null);
		setImg2latexPreview(null);
		setImg2latexResult("");
		setImg2latexOpen(true);
	}

	function handleImg2latexFile(file: File) {
		setImg2latexFile(file);
		setImg2latexResult("");
		const url = URL.createObjectURL(file);
		setImg2latexPreview(url);
	}

	function insertImg2latexResult() {
		if (img2latexResult) {
			insertIntoActive(img2latexResult);
		}
		setImg2latexOpen(false);
	}

	const [isCreating, setIsCreating] = useState(false);
	const [newFilePath, setNewFilePath] = useState("");
	const [renamingFileId, setRenamingFileId] = useState<string | null>(null);
	const [renameValue, setRenameValue] = useState("");
	const [templateSearch, setTemplateSearch] = useState("");
	const [templateCategory, setTemplateCategory] = useState<string | null>(null);
	const [outputTab, setOutputTab] = useState<"preview" | "history">("preview");
	const [isCreatingSnippet, setIsCreatingSnippet] = useState(false);
	const [snippetForm, setSnippetForm] = useState<CreateSnippetInput>({
		title: "",
		trigger: "",
		category: "",
		content: "",
	});

	const queryClient = useQueryClient();

	const createSnippetMutation = useMutation({
		mutationFn: (data: CreateSnippetInput) => createSnippet(data),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ["snippets"] });
			setIsCreatingSnippet(false);
			setSnippetForm({ title: "", trigger: "", category: "", content: "" });
		},
	});

	const deleteSnippetMutation = useMutation({
		mutationFn: (id: string) => deleteSnippet(id),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ["snippets"] });
		},
	});

	const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
	const [templateForm, setTemplateForm] = useState<CreateTemplateInput>({
		title: "",
		category: "",
		content: "",
	});

	const createTemplateMutation = useMutation({
		mutationFn: (data: CreateTemplateInput) => createTemplate(data),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ["templates"] });
			setIsCreatingTemplate(false);
			setTemplateForm({ title: "", category: "", content: "" });
		},
	});

	const deleteTemplateMutation = useMutation({
		mutationFn: (id: string) => deleteTemplate(id),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ["templates"] });
		},
	});

	const fileInputRef = useRef<HTMLInputElement>(null);

	const historyQuery = useQuery({
		queryKey: ["compile-history", project?.id],
		queryFn: () => getCompileHistory(project?.id ?? ""),
		enabled: Boolean(project?.id) && outputTab === "history",
		refetchInterval: outputTab === "history" ? 5000 : false,
	});

	const templateCategories = useMemo(() => {
		const set = new Set<string>();
		for (const t of templates) {
			if (t.category) set.add(t.category);
		}
		return Array.from(set).sort();
	}, [templates]);

	const filteredTemplates = useMemo(() => {
		const q = templateSearch.trim().toLowerCase();
		return templates.filter((t) => {
			if (templateCategory && t.category !== templateCategory) return false;
			if (!q) return true;
			return (
				t.title.toLowerCase().includes(q) ||
				(t.description?.toLowerCase().includes(q) ?? false) ||
				t.category.toLowerCase().includes(q)
			);
		});
	}, [templates, templateSearch, templateCategory]);

	async function submitNewFile() {
		const normalized = normalizeProjectFilePath(newFilePath);
		if (!normalized) return;
		try {
			await onCreateFile(normalized);
			setNewFilePath("");
			setIsCreating(false);
		} catch {
			// keep input open so user can correct
		}
	}

	function startRename(fileId: string, currentPath: string) {
		setRenamingFileId(fileId);
		setRenameValue(currentPath);
	}

	async function submitRename() {
		if (!renamingFileId) return;
		const normalized = normalizeProjectFilePath(renameValue);
		if (!normalized) {
			setRenamingFileId(null);
			return;
		}
		try {
			await onRenameFile(renamingFileId, normalized);
			setRenamingFileId(null);
		} catch {
			// keep input open
		}
	}

	return (
		<>
		<div className="hidden lg:flex lg:min-h-0 lg:flex-1">
			<div
				className={cn(
					"relative grid h-full min-h-0 w-full overflow-hidden rounded-xl border bg-sidebar text-sidebar-foreground transition-[grid-template-columns] duration-200 ease-linear",
					projectPanelOpen
						? "grid-cols-[4rem_23rem_minmax(0,1fr)]"
						: "grid-cols-[4rem_minmax(0,1fr)]",
				)}
			>
				<aside className="order-1 flex min-h-0 flex-col items-center gap-3 border-r border-sidebar-border bg-sidebar px-2.5 py-4">
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={onToggleProjectPanel}
						aria-label={
							projectPanelOpen ? "Proje panelini kapat" : "Proje panelini ac"
						}
					>
						{projectPanelOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
					</Button>
					<Separator className="bg-sidebar-border h-px w-6" />
					{(
						[
							["files", FileCode2, "Dosyalar"],
							["templates", LayoutTemplate, "Şablonlar"],
							["snippets", WandSparkles, "Parçalar"],
							["settings", Settings2, "Ayarlar"],
						] as const
					).map(([tab, Icon, label]) => {
						const isActive = sidebarTab === tab;
						return (
							<div key={tab} className="relative">
								{isActive ? (
									<span className="pointer-events-none absolute -left-2.5 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-primary" />
								) : null}
								<Button
									type="button"
									variant="ghost"
									size="icon"
									title={label}
									aria-label={label}
									onClick={() => {
										onSetSidebarTab(tab);
										onSetProjectPanelOpen(true);
									}}
									className={cn(
										"size-10 rounded-lg transition-all duration-150",
										isActive
											? "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
											: "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
									)}
								>
									<Icon />
								</Button>
							</div>
						);
					})}
				</aside>

				<ResizablePanelGroup
					orientation="horizontal"
					className="order-3 h-full min-h-0"
				>
					<ResizablePanel defaultSize={68} minSize={32}>
						<Card className="flex h-full min-h-0 flex-col rounded-none border-0 shadow-none">
							<CardHeader className="border-b">
								<div className="flex items-center justify-between gap-3">
									<div>
										<CardTitle className="text-base">Kod Editörü</CardTitle>
										<CardDescription>
											{activeFile ? activeFile.path : "Aktif dosya secilmedi"}
										</CardDescription>
									</div>
									<div className="flex items-center gap-2">
										<Button
											type="button"
											variant="ghost"
											size="icon-sm"
											title="Görüntüden LaTeX'e çevir"
											onClick={openImg2latex}
										>
											<ScanLine />
										</Button>
										<Badge variant="outline" className={saveMeta.tone}>
											{saveMeta.label}
										</Badge>
									</div>
								</div>
							</CardHeader>
							<CardContent className="flex-1 min-h-0 p-0 overflow-hidden">
								<div className="h-full overflow-auto bg-background">
									<TikzCodeEditor
										ref={editorRef}
										value={activeValue}
										onChange={(value) => {
											if (activeFile) {
												onUpdateBuffer(activeFile.id, value);
											}
										}}
										diagnostics={diagnostics}
										snippets={snippets}
									/>
								</div>
							</CardContent>
						</Card>
					</ResizablePanel>

					<ResizableHandle withHandle />

					<ResizablePanel
						defaultSize="320px"
						minSize="320px"
						maxSize="600px"
						className="min-w-80"
					>
						<Card className="flex h-full min-h-0 min-w-80 flex-col rounded-none border-0 shadow-none">
							<CardHeader className="gap-3 border-b">
								<div className="flex items-start justify-between gap-3">
									<div className="min-w-0">
										<CardTitle className="text-base">Çıktı Paneli</CardTitle>
										<CardDescription>
											Derleme durumu ve PDF önizleme
										</CardDescription>
									</div>
									<Badge
										variant="outline"
										className={cn(
											"shrink-0 gap-2 px-3 py-1.5 text-sm font-medium",
											compileMeta.className,
										)}
									>
										<CompileIcon
											className={cn(
												"size-4",
												currentCompile?.status === "RUNNING" && "animate-spin",
											)}
										/>
										{compileMeta.label}
									</Badge>
								</div>
								<Tabs
									value={outputTab}
									onValueChange={(v) =>
										setOutputTab(v as "preview" | "history")
									}
								>
									<TabsList variant="line" className="h-8 gap-1">
										<TabsTrigger value="preview" className="text-xs">
											Önizleme
										</TabsTrigger>
										<TabsTrigger value="history" className="text-xs">
											Geçmiş
										</TabsTrigger>
									</TabsList>
								</Tabs>
							</CardHeader>
							{outputTab === "history" ? (
								<CardContent className="min-h-0 flex-1 overflow-hidden p-0">
									<ScrollArea className="h-full">
										<div className="flex min-w-0 flex-col gap-2 p-3">
											{historyQuery.isLoading ? (
												<p className="px-2 py-4 text-center text-xs text-muted-foreground">
													Yükleniyor…
												</p>
											) : null}
											{!historyQuery.isLoading &&
											(historyQuery.data?.jobs.length ?? 0) === 0 ? (
												<p className="px-2 py-4 text-center text-xs text-muted-foreground">
													Henüz derleme yapılmadı.
												</p>
											) : null}
											{historyQuery.data?.jobs.map((job) => (
												<div
													key={job.id}
													className="space-y-1 rounded-lg border bg-background px-3 py-2 text-xs"
												>
													<div className="flex items-center justify-between gap-2">
														<Badge
															variant="outline"
															className={cn(
																"gap-1.5 px-2 py-0.5 text-[10px]",
																job.status === "SUCCESS" &&
																	"border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
																job.status === "FAILED" &&
																	"border-destructive/20 bg-destructive/10 text-destructive",
																job.status === "TIMEOUT" &&
																	"border-amber-200 bg-amber-50 text-amber-700",
															)}
														>
															{job.status}
														</Badge>
														<span className="text-muted-foreground">
															{formatRelativeDate(
																job.finishedAt ?? job.createdAt,
															)}
														</span>
													</div>
													<div className="flex flex-wrap items-center gap-1.5">
														<code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
															{job.engine}
														</code>
														{job.outputUrl ? (
															<Button
																asChild
																variant="outline"
																size="xs"
																className="h-6 text-[10px]"
															>
																<a href={`${job.outputUrl}?download=1`}>
																	<Download className="size-3" />
																	PDF
																</a>
															</Button>
														) : null}
														{job.svgOutputUrl ? (
															<Button
																asChild
																variant="outline"
																size="xs"
																className="h-6 text-[10px]"
															>
																<a href={`${job.svgOutputUrl}&download=1`}>
																	<FileImage className="size-3" />
																	SVG
																</a>
															</Button>
														) : null}
													</div>
												</div>
											))}
										</div>
									</ScrollArea>
								</CardContent>
							) : (
								<CardContent className="min-h-0 flex-1 overflow-hidden p-0">
									<ScrollArea className="h-full">
										<div className="flex min-w-0 flex-col gap-3 p-3">
											<div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-xs">
												<div className="flex items-center gap-1.5">
													<span className="text-muted-foreground">Motor:</span>
													<code className="rounded bg-background px-1.5 py-0.5 font-mono font-medium">
														{currentCompile?.engine ?? "TECTONIC"}
													</code>
												</div>
												<span className="text-muted-foreground/40">•</span>
												<div className="flex items-center gap-1.5">
													<span className="text-muted-foreground">Son:</span>
													<span className="font-medium">
														{currentCompile?.finishedAt
															? formatRelativeDate(currentCompile.finishedAt)
															: "Henüz yok"}
													</span>
												</div>
												{currentCompile?.outputUrl ? (
													<Button
														asChild
														variant="outline"
														size="xs"
														className="ml-auto"
													>
														<a href={`${currentCompile.outputUrl}?download=1`}>
															<Download />
															PDF indir
														</a>
													</Button>
												) : null}
												{currentCompile?.svgOutputUrl ? (
													<Button asChild variant="outline" size="xs">
														<a
															href={`${currentCompile.svgOutputUrl}&download=1`}
														>
															<FileImage />
															SVG indir
														</a>
													</Button>
												) : null}
											</div>

											<div className="h-72 min-h-72 flex flex-col">
												<PdfPreview
													src={currentCompile?.outputUrl ?? null}
													zoom={previewZoom}
													onZoomChange={onSetPreviewZoom}
												/>
											</div>
											<div className="flex h-48 min-h-48 min-w-0 flex-col overflow-hidden rounded-xl border bg-background">
												<div className="flex items-center gap-2 border-b px-3 py-2 text-sm font-medium">
													<TerminalSquare className="size-4" />
													Derleme Günlüğü
												</div>
												<ScrollArea className="min-h-0 flex-1">
													<pre className="whitespace-pre-wrap wrap-break-word p-2 font-mono text-xs leading-5 text-muted-foreground">
														{logSummary.join("\n")}
													</pre>
												</ScrollArea>
											</div>
										</div>
									</ScrollArea>
								</CardContent>
							)}
						</Card>
					</ResizablePanel>
				</ResizablePanelGroup>

				{projectPanelOpen ? (
					<div className="order-2 flex min-h-0 flex-col border-r border-sidebar-border bg-sidebar shadow-sm">
						<div className="border-b border-sidebar-border p-4 pr-12">
							<div className="flex items-start justify-between gap-3">
								<div>
									<CardTitle className="text-base">Proje Paneli</CardTitle>
									<CardDescription>
										Dosyalari, sablonlari ve proje ayarlarini yonet.
									</CardDescription>
								</div>
							</div>
						</div>

						<Tabs
							value={sidebarTab}
							onValueChange={(value) => onSetSidebarTab(value as SidebarTab)}
							orientation="vertical"
							className="min-h-0 flex-1 gap-0"
						>
							<div className="flex min-h-0 flex-1">
								<div className="flex min-h-0 flex-1 flex-col">
									<div className="border-b border-sidebar-border px-4 py-3">
										<div className="inline-flex items-center gap-2 text-sm font-medium">
											<activePanelMeta.icon className="size-4" />
											{activePanelMeta.title}
										</div>
										<p className="mt-1 text-xs text-muted-foreground">
											{activePanelMeta.description}
										</p>
									</div>

									<TabsContent value="files" className="mt-0 min-h-0 flex-1">
										<ScrollArea className="h-full px-4 py-4">
											<div className="space-y-2">
												{isCreating ? (
													<div className="flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-2 py-1.5">
														<FilePlus className="size-4 shrink-0 text-primary" />
														<Input
															autoFocus
															value={newFilePath}
															placeholder="ornek.tex"
															onChange={(e) => setNewFilePath(e.target.value)}
															onKeyDown={(e) => {
																if (e.key === "Enter") {
																	e.preventDefault();
																	void submitNewFile();
																} else if (e.key === "Escape") {
																	setIsCreating(false);
																	setNewFilePath("");
																}
															}}
															className="h-7 border-0 bg-transparent px-1 text-sm shadow-none focus-visible:ring-0"
														/>
														<Button
															type="button"
															size="icon-sm"
															variant="ghost"
															onClick={() => void submitNewFile()}
															aria-label="Olustur"
														>
															<Check className="size-4" />
														</Button>
														<Button
															type="button"
															size="icon-sm"
															variant="ghost"
															onClick={() => {
																setIsCreating(false);
																setNewFilePath("");
															}}
															aria-label="Iptal"
														>
															<X className="size-4" />
														</Button>
														{newFilePath.trim() &&
														normalizeProjectFilePath(newFilePath) !==
															newFilePath.trim() ? (
															<span className="ml-2 text-[11px] text-muted-foreground">
																→{" "}
																<code className="font-mono">
																	{normalizeProjectFilePath(newFilePath)}
																</code>
															</span>
														) : null}
													</div>
												) : (
													<div className="flex gap-1.5">
														<Button
															type="button"
															variant="outline"
															size="sm"
															className="flex-1 justify-start gap-2 border-dashed"
															onClick={() => setIsCreating(true)}
														>
															<FilePlus className="size-4" />
															Yeni dosya
														</Button>
														<Button
															type="button"
															variant="outline"
															size="sm"
															className="shrink-0 border-dashed px-2"
															onClick={() => fileInputRef.current?.click()}
															title="Dosya yükle"
														>
															<Upload className="size-4" />
														</Button>
														<input
															ref={fileInputRef}
															type="file"
															className="hidden"
															onChange={(e) => {
																const file = e.target.files?.[0];
																if (file) onUploadFile(file);
																e.target.value = "";
															}}
														/>
													</div>
												)}

												{files.map((file) => {
													const selected = activeFileId === file.id;
													const isRenaming = renamingFileId === file.id;

													if (isRenaming) {
														return (
															<div
																key={file.id}
																className="flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-2 py-1.5"
															>
																<FileCode2 className="size-4 shrink-0 text-primary" />
																<Input
																	autoFocus
																	value={renameValue}
																	onChange={(e) =>
																		setRenameValue(e.target.value)
																	}
																	onKeyDown={(e) => {
																		if (e.key === "Enter") {
																			e.preventDefault();
																			void submitRename();
																		} else if (e.key === "Escape") {
																			setRenamingFileId(null);
																		}
																	}}
																	className="h-7 border-0 bg-transparent px-1 text-sm shadow-none focus-visible:ring-0"
																/>
																<Button
																	type="button"
																	size="icon-sm"
																	variant="ghost"
																	onClick={() => void submitRename()}
																	aria-label="Kaydet"
																>
																	<Check className="size-4" />
																</Button>
																<Button
																	type="button"
																	size="icon-sm"
																	variant="ghost"
																	onClick={() => setRenamingFileId(null)}
																	aria-label="Iptal"
																>
																	<X className="size-4" />
																</Button>
															</div>
														);
													}

													return (
														<div
															key={file.id}
															className={cn(
																"group relative flex items-center gap-1 overflow-hidden rounded-lg border pr-1 transition-all duration-150",
																selected
																	? "border-primary/30 bg-primary/5 shadow-sm"
																	: "border-transparent hover:border-border hover:bg-muted/50",
															)}
														>
															{selected ? (
																<span className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-primary" />
															) : null}
															<button
																type="button"
																onClick={() => onSetActiveFile(file.id)}
																className="flex-1 min-w-0 px-3 py-3 text-left"
															>
																<div className="flex items-start justify-between gap-2">
																	<div className="min-w-0 space-y-1">
																		<div
																			className={cn(
																				"truncate text-sm",
																				selected
																					? "font-semibold text-foreground"
																					: "font-medium text-foreground/90",
																			)}
																		>
																			{file.path}
																		</div>
																		<p className="text-xs text-muted-foreground">
																			{formatRelativeDate(file.updatedAt)}
																		</p>
																	</div>
																	{file.isMain ? (
																		<Badge
																			variant="secondary"
																			className="shrink-0"
																		>
																			Ana
																		</Badge>
																	) : null}
																</div>
															</button>
															<DropdownMenu>
																<DropdownMenuTrigger asChild>
																	<Button
																		type="button"
																		size="icon-sm"
																		variant="ghost"
																		className="shrink-0 opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100"
																		aria-label="Dosya islemleri"
																	>
																		<MoreVertical className="size-4" />
																	</Button>
																</DropdownMenuTrigger>
																<DropdownMenuContent align="end">
																	<DropdownMenuItem
																		onSelect={() =>
																			startRename(file.id, file.path)
																		}
																	>
																		<Pencil />
																		Yeniden adlandir
																	</DropdownMenuItem>
																	{!file.isMain ? (
																		<DropdownMenuItem
																			onSelect={() => {
																				void onSetMainFile(file.id);
																			}}
																		>
																			<Star />
																			Ana dosya yap
																		</DropdownMenuItem>
																	) : null}
																	<DropdownMenuSeparator />
																	<DropdownMenuItem
																		variant="destructive"
																		disabled={file.isMain}
																		onSelect={() => {
																			if (file.isMain) return;
																			if (
																				typeof window !== "undefined" &&
																				!window.confirm(
																					`"${file.path}" dosyasi silinsin mi?`,
																				)
																			) {
																				return;
																			}
																			void onDeleteFile(file.id);
																		}}
																	>
																		<Trash2 />
																		Sil
																	</DropdownMenuItem>
																</DropdownMenuContent>
															</DropdownMenu>
														</div>
													);
												})}
											</div>
										</ScrollArea>
									</TabsContent>

									<TabsContent
										value="templates"
										className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden"
									>
										<div className="shrink-0 space-y-2 border-b border-sidebar-border px-4 py-3">
											<div className="flex gap-2">
												<div className="relative flex-1">
													<Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
													<Input
														value={templateSearch}
														onChange={(e) => setTemplateSearch(e.target.value)}
														placeholder="Şablon ara…"
														className="h-8 pl-8 text-sm"
													/>
												</div>
												<Button
													size="sm"
													variant="ghost"
													className="h-8 shrink-0 gap-1 px-2 text-xs"
													onClick={() => setIsCreatingTemplate((v) => !v)}
												>
													<Plus className="size-3" />
													Yeni
												</Button>
											</div>
											{templateCategories.length > 0 ? (
												<div className="flex flex-wrap gap-1">
													<button
														type="button"
														onClick={() => setTemplateCategory(null)}
														className={cn(
															"rounded-full border px-2.5 py-0.5 text-[11px] transition-colors",
															templateCategory === null
																? "border-primary/30 bg-primary/10 text-primary"
																: "border-border text-muted-foreground hover:bg-muted",
														)}
													>
														Tümü
													</button>
													{templateCategories.map((cat) => (
														<button
															key={cat}
															type="button"
															onClick={() => setTemplateCategory(cat)}
															className={cn(
																"rounded-full border px-2.5 py-0.5 text-[11px] transition-colors",
																templateCategory === cat
																	? "border-primary/30 bg-primary/10 text-primary"
																	: "border-border text-muted-foreground hover:bg-muted",
															)}
														>
															{cat}
														</button>
													))}
												</div>
											) : null}
										</div>

										<Dialog
											open={isCreatingTemplate}
											onOpenChange={(open) => {
												setIsCreatingTemplate(open);
												if (!open)
													setTemplateForm({
														title: "",
														category: "",
														content: "",
													});
											}}
										>
											<DialogContent className="flex max-h-[80vh] flex-col gap-0 p-0 sm:max-w-lg">
												<DialogHeader className="border-b px-4 py-3">
													<DialogTitle className="text-sm font-medium">
														Yeni Şablon
													</DialogTitle>
												</DialogHeader>
												<form
													className="flex min-h-0 flex-1 flex-col"
													onSubmit={(e) => {
														e.preventDefault();
														createTemplateMutation.mutate(templateForm);
													}}
												>
													<div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
														<Input
															placeholder="Başlık"
															value={templateForm.title}
															onChange={(e) =>
																setTemplateForm((f) => ({
																	...f,
																	title: e.target.value,
																}))
															}
															required
															autoFocus
														/>
														<Input
															placeholder="Kategori"
															value={templateForm.category}
															onChange={(e) =>
																setTemplateForm((f) => ({
																	...f,
																	category: e.target.value,
																}))
															}
														/>
														<Textarea
															placeholder="İçerik"
															className="min-h-60 flex-1 font-mono text-xs"
															value={templateForm.content}
															onChange={(e) =>
																setTemplateForm((f) => ({
																	...f,
																	content: e.target.value,
																}))
															}
															required
														/>
													</div>
													<div className="flex justify-end gap-2 border-t px-4 py-3">
														<Button
															type="button"
															variant="ghost"
															onClick={() => setIsCreatingTemplate(false)}
														>
															İptal
														</Button>
														<Button
															type="submit"
															disabled={createTemplateMutation.isPending}
														>
															Kaydet
														</Button>
													</div>
												</form>
											</DialogContent>
										</Dialog>

										<ScrollArea className="min-h-0 flex-1">
											<div className="grid grid-cols-1 gap-2 px-4 py-4 xl:grid-cols-2">
												{filteredTemplates.length === 0 ? (
													<p className="col-span-full text-center text-xs text-muted-foreground">
														Eşleşen şablon bulunamadı.
													</p>
												) : null}
												{filteredTemplates.map((template) => {
													const preview = template.content
														.split(/\r?\n/)
														.slice(0, 5)
														.join("\n");
													return (
														<div key={template.id} className="group relative">
															<button
																type="button"
																onClick={() => handleInsert(template.content)}
																className="w-full flex flex-col gap-2 rounded-lg border border-transparent bg-background/50 p-3 text-left transition-colors hover:border-border hover:bg-muted/40"
															>
																<div className="flex items-start justify-between gap-2">
																	<div className="min-w-0 space-y-0.5">
																		<div className="truncate text-sm font-medium">
																			{template.title}
																		</div>
																		{template.description ? (
																			<p className="line-clamp-1 text-[11px] text-muted-foreground">
																				{template.description}
																			</p>
																		) : null}
																	</div>
																	<Badge
																		variant="outline"
																		className="shrink-0 text-[10px]"
																	>
																		{template.category}
																	</Badge>
																</div>
																<pre className="overflow-hidden rounded-md bg-muted/60 px-2 py-1.5 font-mono text-[10px] leading-4 text-muted-foreground group-hover:text-foreground">
																	{preview}
																</pre>
															</button>
															{template.ownerId !== null && (
																<button
																	type="button"
																	className="absolute right-2 top-2 hidden rounded p-0.5 text-muted-foreground hover:text-destructive group-hover:flex"
																	onClick={() =>
																		deleteTemplateMutation.mutate(template.id)
																	}
																	aria-label="Sil"
																>
																	<Trash2 className="size-3" />
																</button>
															)}
														</div>
													);
												})}
											</div>
										</ScrollArea>
									</TabsContent>

									<TabsContent
										value="snippets"
										className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden"
									>
										<div className="flex items-center justify-between px-4 pt-3 pb-2">
											<span className="text-xs text-muted-foreground">
												{snippets.length} snippet
											</span>
											<Button
												size="sm"
												variant="ghost"
												className="h-7 gap-1 px-2 text-xs"
												onClick={() => setIsCreatingSnippet((v) => !v)}
											>
												<Plus className="size-3" />
												Yeni
											</Button>
										</div>

										<Dialog
											open={isCreatingSnippet}
											onOpenChange={(open) => {
												setIsCreatingSnippet(open);
												if (!open)
													setSnippetForm({
														title: "",
														trigger: "",
														category: "",
														content: "",
													});
											}}
										>
											<DialogContent className="flex max-h-[80vh] flex-col gap-0 p-0 sm:max-w-lg">
												<DialogHeader className="border-b px-4 py-3">
													<DialogTitle className="text-sm font-medium">
														Yeni Snippet
													</DialogTitle>
												</DialogHeader>
												<form
													className="flex min-h-0 flex-1 flex-col"
													onSubmit={(e) => {
														e.preventDefault();
														createSnippetMutation.mutate(snippetForm);
													}}
												>
													<div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
														<Input
															placeholder="Başlık"
															value={snippetForm.title}
															onChange={(e) =>
																setSnippetForm((f) => ({
																	...f,
																	title: e.target.value,
																}))
															}
															required
															autoFocus
														/>
														<div className="flex gap-2">
															<Input
																placeholder="\trigger"
																value={snippetForm.trigger}
																onChange={(e) =>
																	setSnippetForm((f) => ({
																		...f,
																		trigger: e.target.value,
																	}))
																}
																required
															/>
															<Input
																placeholder="Kategori"
																value={snippetForm.category}
																onChange={(e) =>
																	setSnippetForm((f) => ({
																		...f,
																		category: e.target.value,
																	}))
																}
															/>
														</div>
														<Textarea
															placeholder="İçerik"
															className="min-h-40 flex-1 font-mono text-xs"
															value={snippetForm.content}
															onChange={(e) =>
																setSnippetForm((f) => ({
																	...f,
																	content: e.target.value,
																}))
															}
															required
														/>
													</div>
													<div className="flex justify-end gap-2 border-t px-4 py-3">
														<Button
															type="button"
															variant="ghost"
															onClick={() => setIsCreatingSnippet(false)}
														>
															İptal
														</Button>
														<Button
															type="submit"
															disabled={createSnippetMutation.isPending}
														>
															Kaydet
														</Button>
													</div>
												</form>
											</DialogContent>
										</Dialog>

										<ScrollArea className="min-h-0 flex-1 px-4 pb-4">
											<div className="space-y-2">
												{snippets.map((snippet) => (
													<div key={snippet.id} className="group relative">
														<button
															type="button"
															onClick={() => handleInsert(snippet.content)}
															className="w-full rounded-lg border border-transparent px-3 py-3 text-left transition-colors hover:border-border hover:bg-muted/50"
														>
															<div className="flex items-start justify-between gap-3">
																<div className="min-w-0 space-y-1">
																	<div className="text-sm font-medium">
																		{snippet.title}
																	</div>
																	<p className="text-xs text-muted-foreground">
																		{snippet.category}
																	</p>
																</div>
																<Badge variant="outline" className="shrink-0">
																	\{snippet.trigger}
																</Badge>
															</div>
														</button>
														{snippet.ownerId !== null && (
															<button
																type="button"
																className="absolute right-2 top-2 hidden rounded p-0.5 text-muted-foreground hover:text-destructive group-hover:flex"
																onClick={() =>
																	deleteSnippetMutation.mutate(snippet.id)
																}
																aria-label="Sil"
															>
																<Trash2 className="size-3" />
															</button>
														)}
													</div>
												))}
											</div>
										</ScrollArea>
									</TabsContent>

									<TabsContent value="settings" className="mt-0 min-h-0 flex-1">
										<ScrollArea className="h-full px-4 py-4">
											<form
												key={project?.id ?? "project-settings-panel"}
												action={async (formData) => {
													await onSubmitSettings({
														title: String(formData.get("title") ?? ""),
														description: String(
															formData.get("description") ?? "",
														),
														isPublic: formData.get("isPublic") === "on",
													});
												}}
												className="space-y-4"
											>
												<div className="space-y-2">
													<label
														htmlFor="project-panel-title"
														className="text-sm font-medium"
													>
														Proje adi
													</label>
													<Input
														id="project-panel-title"
														name="title"
														defaultValue={project?.title ?? ""}
													/>
												</div>
												<div className="space-y-2">
													<label
														htmlFor="project-panel-description"
														className="text-sm font-medium"
													>
														Aciklama
													</label>
													<Textarea
														id="project-panel-description"
														name="description"
														rows={5}
														defaultValue={project?.description ?? ""}
													/>
												</div>
												<div className="flex items-start justify-between gap-4 rounded-lg border p-3">
													<div className="space-y-1">
														<div className="inline-flex items-center gap-2 text-sm font-medium">
															<Settings2 className="size-4" />
															Herkese acik okuma modu
														</div>
														<p className="text-xs text-muted-foreground">
															Paylasim icin isaretle. Yetki kontrolu
															sunucudadir.
														</p>
													</div>
													<Switch
														name="isPublic"
														defaultChecked={project?.isPublic}
													/>
												</div>
												<Button type="submit" size="sm" className="w-full">
													<Settings2 />
													Ayarlari kaydet
												</Button>
											</form>
										</ScrollArea>
									</TabsContent>
								</div>
							</div>
						</Tabs>
					</div>
				) : null}
			</div>
		</div>

		{/* Img2LaTeX dialog */}
		<Dialog open={img2latexOpen} onOpenChange={setImg2latexOpen}>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle>Görüntüden LaTeX'e Çevir</DialogTitle>
				</DialogHeader>

				<div className="flex flex-col gap-4">
					<div
						className={cn(
							"flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors hover:bg-muted/40",
							img2latexPreview ? "border-border" : "border-muted-foreground/30",
						)}
						onClick={() => img2latexInputRef.current?.click()}
						onDragOver={(e) => e.preventDefault()}
						onDrop={(e) => {
							e.preventDefault();
							const file = e.dataTransfer.files[0];
							if (file) handleImg2latexFile(file);
						}}
					>
						{img2latexPreview ? (
							// eslint-disable-next-line @next/next/no-img-element
							<img
								src={img2latexPreview}
								alt="Seçilen görüntü"
								className="max-h-48 max-w-full rounded object-contain"
							/>
						) : (
							<>
								<ScanLine className="size-8 text-muted-foreground" />
								<p className="text-sm text-muted-foreground">
									Görüntü sürükle ya da tıkla (PNG, JPEG, WebP — maks 4 MB)
								</p>
							</>
						)}
						<input
							ref={img2latexInputRef}
							type="file"
							accept="image/png,image/jpeg,image/webp"
							className="hidden"
							onChange={(e) => {
								const file = e.target.files?.[0];
								if (file) handleImg2latexFile(file);
							}}
						/>
					</div>

					<Button
						type="button"
						disabled={!img2latexFile || img2latexMutation.isPending}
						onClick={() =>
							img2latexFile && img2latexMutation.mutate(img2latexFile)
						}
					>
						{img2latexMutation.isPending ? "Dönüştürülüyor…" : "LaTeX'e Çevir"}
					</Button>

					{img2latexMutation.error ? (
						<p className="text-sm text-destructive">
							{img2latexMutation.error instanceof Error
								? img2latexMutation.error.message
								: "Dönüştürme başarısız."}
						</p>
					) : null}

					{img2latexResult ? (
						<div className="flex flex-col gap-2">
							<p className="text-xs font-medium text-muted-foreground">Sonuç</p>
							<Textarea
								value={img2latexResult}
								onChange={(e) => setImg2latexResult(e.target.value)}
								className="font-mono text-xs"
								rows={5}
							/>
							<Button type="button" onClick={insertImg2latexResult}>
								Editöre Ekle
							</Button>
						</div>
					) : null}
				</div>
			</DialogContent>
		</Dialog>
		</>
	);
}
