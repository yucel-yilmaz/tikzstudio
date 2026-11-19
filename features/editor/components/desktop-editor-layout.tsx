"use client";

import { useQuery } from "@tanstack/react-query";
import {
	Download,
	FileCode2,
	FileImage,
	LayoutTemplate,
	type LucideIcon,
	PanelLeftClose,
	PanelLeftOpen,
	ScanLine,
	Settings2,
	TerminalSquare,
	WandSparkles,
} from "lucide-react";
import { useRef, useState } from "react";

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
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	TikzCodeEditor,
	type TikzCodeEditorHandle,
} from "@/features/editor/components/code-editor";
import { Img2LatexDialog } from "@/features/editor/components/dialogs/img2latex-dialog";
import { FileTreePanel } from "@/features/editor/components/panels/file-tree-panel";
import { ProjectSettingsPanel } from "@/features/editor/components/panels/project-settings-panel";
import { SnippetsPanel } from "@/features/editor/components/panels/snippets-panel";
import { TemplatesPanel } from "@/features/editor/components/panels/templates-panel";
import { PdfPreview } from "@/features/editor/components/pdf-preview";
import { getCompileHistory } from "@/lib/client-api";
import type { CompileDiagnostic } from "@/lib/compile-log";
import type {
	CompileJobDto,
	ProjectDetail,
	ProjectFileDto,
	SnippetDto,
} from "@/lib/types";
import { cn, formatRelativeDate } from "@/lib/utils";

type SidebarTab = "files" | "templates" | "snippets" | "settings";

type SaveMeta = { label: string; tone: string };

type CompileMeta = { label: string; className: string; icon: LucideIcon };

type PanelMeta = Record<
	SidebarTab,
	{ title: string; description: string; icon: LucideIcon }
>;

function summarizeCompileLog(log: string | null) {
	if (!log) return ["No compile output yet."];
	const lines = log.split(/\r?\n/).map((l) => l.trim());
	const important = lines.filter((line) =>
		/^(error|fatal|!|l\.\d|warning:|Output written|Compilation timed out|Page count)/i.test(
			line,
		),
	);
	return important.length > 0 ? important.slice(0, 8) : lines.slice(0, 4);
}

export type DesktopEditorLayoutProps = {
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

	const [img2latexOpen, setImg2latexOpen] = useState(false);
	const [outputTab, setOutputTab] = useState<"preview" | "history">("preview");

	const historyQuery = useQuery({
		queryKey: ["compile-history", project?.id],
		queryFn: () => getCompileHistory(project?.id ?? ""),
		enabled: Boolean(project?.id) && outputTab === "history",
		refetchInterval: outputTab === "history" ? 5000 : false,
	});

	function handleInsert(content: string) {
		if (editorRef.current) {
			editorRef.current.insertAtCursor(content);
		} else {
			insertIntoActive(content);
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
					{/* Icon sidebar */}
					<aside className="order-1 flex min-h-0 flex-col items-center gap-3 border-r border-sidebar-border bg-sidebar px-2.5 py-4">
						<Button
							type="button"
							variant="ghost"
							size="icon"
							onClick={onToggleProjectPanel}
							aria-label={
								projectPanelOpen ? "Close project panel" : "Open project panel"
							}
						>
							{projectPanelOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
						</Button>
						<Separator className="h-px w-6 bg-sidebar-border" />
						{(
							[
								["files", FileCode2, "Files"],
								["templates", LayoutTemplate, "Templates"],
								["snippets", WandSparkles, "Snippets"],
								["settings", Settings2, "Settings"],
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

					{/* Editor + preview panels */}
					<ResizablePanelGroup
						orientation="horizontal"
						className="order-3 h-full min-h-0"
					>
						<ResizablePanel defaultSize={68} minSize={32}>
							<Card className="flex h-full min-h-0 flex-col rounded-none border-0 shadow-none">
								<CardHeader className="border-b">
									<div className="flex items-center justify-between gap-3">
										<div>
											<CardTitle className="text-base">Code Editor</CardTitle>
											<CardDescription>
												{activeFile
													? activeFile.path
													: "No active file selected"}
											</CardDescription>
										</div>
										<div className="flex items-center gap-2">
											<Button
												type="button"
												variant="ghost"
												size="icon-sm"
												title="Convert image to LaTeX"
												onClick={() => setImg2latexOpen(true)}
											>
												<ScanLine />
											</Button>
											<Badge variant="outline" className={saveMeta.tone}>
												{saveMeta.label}
											</Badge>
										</div>
									</div>
								</CardHeader>
								<CardContent className="min-h-0 flex-1 overflow-hidden p-0">
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
											<CardTitle className="text-base">Output Panel</CardTitle>
											<CardDescription>
												Compile status and PDF preview
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
													currentCompile?.status === "RUNNING" &&
														"animate-spin",
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
												Preview
											</TabsTrigger>
											<TabsTrigger value="history" className="text-xs">
												History
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
														Loading…
													</p>
												) : null}
												{!historyQuery.isLoading &&
												(historyQuery.data?.jobs.length ?? 0) === 0 ? (
													<p className="px-2 py-4 text-center text-xs text-muted-foreground">
														No compilations yet.
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
															{job.pngOutputUrl ? (
																<Button
																	asChild
																	variant="outline"
																	size="xs"
																	className="h-6 text-[10px]"
																>
																	<a href={`${job.pngOutputUrl}&download=1`}>
																		<FileImage className="size-3" />
																		PNG
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
														<span className="text-muted-foreground">
															Engine:
														</span>
														<code className="rounded bg-background px-1.5 py-0.5 font-mono font-medium">
															{currentCompile?.engine ?? "TECTONIC"}
														</code>
													</div>
													<span className="text-muted-foreground/40">•</span>
													<div className="flex items-center gap-1.5">
														<span className="text-muted-foreground">Last:</span>
														<span className="font-medium">
															{currentCompile?.finishedAt
																? formatRelativeDate(currentCompile.finishedAt)
																: "None yet"}
														</span>
													</div>
													{currentCompile?.outputUrl ? (
														<Button
															asChild
															variant="outline"
															size="xs"
															className="ml-auto"
														>
															<a
																href={`${currentCompile.outputUrl}?download=1`}
															>
																<Download />
																Download PDF
															</a>
														</Button>
													) : null}
													{currentCompile?.svgOutputUrl ? (
														<Button asChild variant="outline" size="xs">
															<a
																href={`${currentCompile.svgOutputUrl}&download=1`}
															>
																<FileImage />
																Download SVG
															</a>
														</Button>
													) : null}
													{currentCompile?.pngOutputUrl ? (
														<Button asChild variant="outline" size="xs">
															<a
																href={`${currentCompile.pngOutputUrl}&download=1`}
															>
																<FileImage />
																Download PNG
															</a>
														</Button>
													) : null}
												</div>

												<div className="flex h-72 min-h-72 flex-col">
													<PdfPreview
														src={currentCompile?.outputUrl ?? null}
														zoom={previewZoom}
														onZoomChange={onSetPreviewZoom}
													/>
												</div>
												<div className="flex h-48 min-h-48 min-w-0 flex-col overflow-hidden rounded-xl border bg-background">
													<div className="flex items-center gap-2 border-b px-3 py-2 text-sm font-medium">
														<TerminalSquare className="size-4" />
														Compile Log
													</div>
													<ScrollArea className="min-h-0 flex-1">
														<pre className="wrap-break-word whitespace-pre-wrap p-2 font-mono text-xs leading-5 text-muted-foreground">
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

					{/* Project panel */}
					{projectPanelOpen ? (
						<div className="order-2 flex min-h-0 flex-col border-r border-sidebar-border bg-sidebar shadow-sm">
							<div className="border-b border-sidebar-border p-4 pr-12">
								<CardTitle className="text-base">Project Panel</CardTitle>
								<CardDescription>
									Manage files, templates and project settings.
								</CardDescription>
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
											<FileTreePanel
												files={files}
												activeFileId={activeFileId}
												onSetActiveFile={onSetActiveFile}
												onCreateFile={onCreateFile}
												onDeleteFile={onDeleteFile}
												onRenameFile={onRenameFile}
												onSetMainFile={onSetMainFile}
												onUploadFile={onUploadFile}
											/>
										</TabsContent>

										<TabsContent
											value="templates"
											className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden"
										>
											<TemplatesPanel onInsert={handleInsert} />
										</TabsContent>

										<TabsContent
											value="snippets"
											className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden"
										>
											<SnippetsPanel
												snippets={snippets}
												onInsert={handleInsert}
											/>
										</TabsContent>

										<TabsContent
											value="settings"
											className="mt-0 min-h-0 flex-1"
										>
											<ProjectSettingsPanel
												project={project}
												onSubmit={onSubmitSettings}
											/>
										</TabsContent>
									</div>
								</div>
							</Tabs>
						</div>
					) : null}
				</div>
			</div>

			<Img2LatexDialog
				open={img2latexOpen}
				onOpenChange={setImg2latexOpen}
				onInsert={handleInsert}
			/>
		</>
	);
}
