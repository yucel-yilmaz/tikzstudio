"use client";

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
	Settings2,
	Star,
	TerminalSquare,
	Trash2,
	WandSparkles,
	X,
} from "lucide-react";
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
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { TikzCodeEditor } from "@/features/editor/components/code-editor";
import { PdfPreview } from "@/features/editor/components/pdf-preview";
import type { CompileDiagnostic } from "@/lib/compile-log";
import type {
	CompileJobDto,
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
}: DesktopEditorLayoutProps) {
	const CompileIcon = compileMeta.icon;
	const logSummary = summarizeCompileLog(currentCompile?.log ?? null);
	const [isCreating, setIsCreating] = useState(false);
	const [newFilePath, setNewFilePath] = useState("");
	const [renamingFileId, setRenamingFileId] = useState<string | null>(null);
	const [renameValue, setRenameValue] = useState("");

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
									<Badge variant="outline" className={saveMeta.tone}>
										{saveMeta.label}
									</Badge>
								</div>
							</CardHeader>
							<CardContent className="flex-1 min-h-0 p-0">
								<div className="h-full bg-background">
									<TikzCodeEditor
										value={activeValue}
										onChange={(value) => {
											if (activeFile) {
												onUpdateBuffer(activeFile.id, value);
											}
										}}
										diagnostics={diagnostics}
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
							<CardHeader className="border-b">
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
							</CardHeader>
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
													<a href={`${currentCompile.svgOutputUrl}&download=1`}>
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
													<Button
														type="button"
														variant="outline"
														size="sm"
														className="w-full justify-start gap-2 border-dashed"
														onClick={() => setIsCreating(true)}
													>
														<FilePlus className="size-4" />
														Yeni dosya
													</Button>
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
										className="mt-0 min-h-0 flex-1"
									>
										<ScrollArea className="h-full px-4 py-4">
											<div className="space-y-2">
												{templates.map((template) => (
													<button
														key={template.id}
														type="button"
														onClick={() => insertIntoActive(template.content)}
														className="w-full rounded-lg border border-transparent px-3 py-3 text-left transition-colors hover:border-border hover:bg-muted/50"
													>
														<div className="space-y-1">
															<div className="text-sm font-medium">
																{template.title}
															</div>
															<p className="text-xs text-muted-foreground">
																{template.category}
															</p>
														</div>
													</button>
												))}
											</div>
										</ScrollArea>
									</TabsContent>

									<TabsContent value="snippets" className="mt-0 min-h-0 flex-1">
										<ScrollArea className="h-full px-4 py-4">
											<div className="space-y-2">
												{snippets.map((snippet) => (
													<button
														key={snippet.id}
														type="button"
														onClick={() => insertIntoActive(snippet.content)}
														className="w-full rounded-lg border border-transparent px-3 py-3 text-left transition-colors hover:border-border hover:bg-muted/50"
													>
														<div className="flex items-start justify-between gap-3">
															<div className="space-y-1">
																<div className="text-sm font-medium">
																	{snippet.title}
																</div>
																<p className="text-xs text-muted-foreground">
																	{snippet.category}
																</p>
															</div>
															<Badge variant="outline">{snippet.trigger}</Badge>
														</div>
													</button>
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
	);
}
