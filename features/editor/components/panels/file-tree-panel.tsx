"use client";

import {
	Check,
	FileCode2,
	FilePlus,
	MoreVertical,
	Pencil,
	Star,
	Trash2,
	Upload,
	X,
} from "lucide-react";
import { useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ProjectFileDto } from "@/lib/types";
import { cn, formatRelativeDate, normalizeProjectFilePath } from "@/lib/utils";

type FileTreePanelProps = {
	files: ProjectFileDto[];
	activeFileId: string | null;
	onSetActiveFile(id: string): void;
	onCreateFile(path: string): Promise<void>;
	onDeleteFile(id: string): Promise<void>;
	onRenameFile(id: string, path: string): Promise<void>;
	onSetMainFile(id: string): Promise<void>;
	onUploadFile(file: File): void;
};

export function FileTreePanel({
	files,
	activeFileId,
	onSetActiveFile,
	onCreateFile,
	onDeleteFile,
	onRenameFile,
	onSetMainFile,
	onUploadFile,
}: FileTreePanelProps) {
	const [isCreating, setIsCreating] = useState(false);
	const [newFilePath, setNewFilePath] = useState("");
	const [renamingFileId, setRenamingFileId] = useState<string | null>(null);
	const [renameValue, setRenameValue] = useState("");
	const fileInputRef = useRef<HTMLInputElement>(null);

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
		<ScrollArea className="h-full px-4 py-4">
			<div className="space-y-2">
				{isCreating ? (
					<div className="flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-2 py-1.5">
						<FilePlus className="size-4 shrink-0 text-primary" />
						<Input
							autoFocus
							value={newFilePath}
							placeholder="example.tex"
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
						normalizeProjectFilePath(newFilePath) !== newFilePath.trim() ? (
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
							New file
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
									onChange={(e) => setRenameValue(e.target.value)}
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
								className="min-w-0 flex-1 px-3 py-3 text-left"
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
										<Badge variant="secondary" className="shrink-0">
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
										aria-label="File operations"
									>
										<MoreVertical className="size-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem
										onSelect={() => startRename(file.id, file.path)}
									>
										<Pencil />
										Rename
									</DropdownMenuItem>
									{!file.isMain ? (
										<DropdownMenuItem
											onSelect={() => {
												void onSetMainFile(file.id);
											}}
										>
											<Star />
											Set as main
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
												!window.confirm(`Delete "${file.path}"?`)
											) {
												return;
											}
											void onDeleteFile(file.id);
										}}
									>
										<Trash2 />
										Delete
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					);
				})}
			</div>
		</ScrollArea>
	);
}
