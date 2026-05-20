"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	FileCode2,
	LogOut,
	Plus,
	Search,
	Sparkles,
	Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDeferredValue, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	createProject,
	deleteProject,
	getProjects,
	getTemplates,
} from "@/lib/client-api";
import { formatRelativeDate } from "@/lib/utils";

export function DashboardScreen({ userName }: { userName: string }) {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [search, setSearch] = useState("");
	const [showModal, setShowModal] = useState(false);
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [templateId, setTemplateId] = useState<string | undefined>();
	const deferredSearch = useDeferredValue(search);

	const projectsQuery = useQuery({
		queryKey: ["projects", deferredSearch],
		queryFn: () => getProjects(deferredSearch),
	});

	const templatesQuery = useQuery({
		queryKey: ["templates"],
		queryFn: () => getTemplates(),
	});

	const createMutation = useMutation({
		mutationFn: createProject,
		onSuccess: (project) => {
			queryClient.invalidateQueries({ queryKey: ["projects"] });
			setShowModal(false);
			setTitle("");
			setDescription("");
			setTemplateId(undefined);
			router.push(`/projects/${project.id}/editor`);
		},
	});

	const deleteMutation = useMutation({
		mutationFn: deleteProject,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["projects"] });
		},
	});

	const groupedTemplates = useMemo(
		() => templatesQuery.data?.templates ?? [],
		[templatesQuery.data],
	);
	const projectCount = projectsQuery.data?.projects.length ?? 0;

	return (
		<div className="mx-auto flex min-h-screen w-full max-w-[1500px] flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
			<Card className="overflow-hidden border-white/60 bg-[linear-gradient(160deg,rgba(255,250,242,0.96),rgba(244,239,231,0.94))]">
				<CardContent className="flex flex-col gap-5 p-6 lg:flex-row lg:items-start lg:justify-between lg:p-8">
					<div className="space-y-4">
						<div className="flex flex-wrap items-center gap-2">
							<Badge variant="outline" className="normal-case tracking-normal">
								Dashboard
							</Badge>
							<Badge
								variant="secondary"
								className="normal-case tracking-normal"
							>
								{projectCount} {projectCount === 1 ? "project" : "projects"}
							</Badge>
						</div>
						<div className="space-y-2">
							<h1 className="text-4xl font-semibold tracking-tight">
								Hello, {userName}
							</h1>
							<p className="max-w-3xl text-sm leading-6 text-[var(--ink-1)] lg:text-base">
								Manage TikZ projects, start new documents and monitor your
								latest compile outputs in one place.
							</p>
						</div>
						<div className="grid gap-3 sm:grid-cols-3">
							<div className="rounded-3xl border border-[var(--line)] bg-white/70 px-4 py-4">
								<p className="text-xs uppercase tracking-[0.14em] text-[var(--ink-1)]">
									Projects
								</p>
								<p className="mt-2 text-2xl font-semibold">{projectCount}</p>
							</div>
							<div className="rounded-3xl border border-[var(--line)] bg-white/70 px-4 py-4">
								<p className="text-xs uppercase tracking-[0.14em] text-[var(--ink-1)]">
									Templates
								</p>
								<p className="mt-2 text-2xl font-semibold">
									{groupedTemplates.length}
								</p>
							</div>
							<div className="rounded-3xl border border-[var(--line)] bg-white/70 px-4 py-4">
								<p className="text-xs uppercase tracking-[0.14em] text-[var(--ink-1)]">
									Workflow
								</p>
								<p className="mt-2 text-base font-semibold">
									Editor + PDF + log
								</p>
							</div>
						</div>
					</div>

					<div className="flex flex-wrap items-center gap-3 lg:justify-end">
						<Button onClick={() => setShowModal(true)}>
							<Plus size={16} />
							New project
						</Button>
						<form
							action={async () => {
								await fetch("/api/auth/sign-out", { method: "POST" });
								router.push("/login");
								router.refresh();
							}}
						>
							<Button type="submit" variant="outline">
								<LogOut size={16} />
								Sign out
							</Button>
						</form>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="pb-4">
					<CardTitle>Projects</CardTitle>
					<CardDescription>
						Search, open, or remove unused projects.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-5">
					<label className="relative block">
						<Search
							className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--ink-1)]"
							size={16}
						/>
						<Input
							value={search}
							onChange={(event) => setSearch(event.target.value)}
							placeholder="Search by name or description"
							className="pl-11"
						/>
					</label>

					{projectsQuery.isLoading ? (
						<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
							{Array.from({ length: 6 }).map((_, index) => (
								<div
									key={index}
									className="h-52 animate-pulse rounded-[28px] bg-white/70"
								/>
							))}
						</div>
					) : projectsQuery.data?.projects.length ? (
						<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
							{projectsQuery.data.projects.map((project) => (
								<Card
									key={project.id}
									className="border-[var(--line)] bg-white/78"
								>
									<CardContent className="flex h-full flex-col gap-5 p-5">
										<div className="flex items-start justify-between gap-4">
											<div className="space-y-2">
												<div className="inline-flex items-center gap-2 text-[var(--ink-0)]">
													<FileCode2 size={16} />
													<h2 className="text-xl font-semibold">
														{project.title}
													</h2>
												</div>
												<p className="line-clamp-3 text-sm leading-6 text-[var(--ink-1)]">
													{project.description || "No description added."}
												</p>
											</div>
											<Button
												variant="ghost"
												size="icon"
												onClick={() => deleteMutation.mutate(project.id)}
												aria-label="Delete project"
												className="text-[var(--danger)]"
											>
												<Trash2 size={16} />
											</Button>
										</div>

										<div className="mt-auto flex items-center justify-between gap-3">
											<div className="space-y-1">
												<Badge
													variant="outline"
													className="normal-case tracking-normal"
												>
													{formatRelativeDate(project.updatedAt)}
												</Badge>
											</div>
											<Button asChild variant="secondary">
												<Link href={`/projects/${project.id}/editor`}>
													Open in editor
												</Link>
											</Button>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					) : (
						<div className="rounded-[30px] border border-dashed border-[var(--line)] bg-white/65 px-6 py-14 text-center">
							<div className="mx-auto max-w-md space-y-3">
								<Badge
									variant="outline"
									className="normal-case tracking-normal"
								>
									Empty workspace
								</Badge>
								<h2 className="text-2xl font-semibold">No projects yet</h2>
								<p className="text-sm leading-6 text-[var(--ink-1)]">
									Start your first TikZ diagram with the default document or a
									ready-made template.
								</p>
								<Button onClick={() => setShowModal(true)} className="mt-2">
									<Sparkles size={16} />
									Create your first project
								</Button>
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			{showModal ? (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(31,26,22,0.42)] p-4 backdrop-blur-[3px]">
					<Card className="max-h-[90vh] w-full max-w-3xl overflow-auto border-white/70">
						<CardHeader className="pb-3">
							<div className="flex items-start justify-between gap-4">
								<div className="space-y-2">
									<Badge
										variant="default"
										className="normal-case tracking-normal"
									>
										New project
									</Badge>
									<CardTitle className="text-2xl">
										Create a new TikZ workspace
									</CardTitle>
									<CardDescription>
										Add a title, write a short description and choose a starting
										template.
									</CardDescription>
								</div>
								<Button variant="ghost" onClick={() => setShowModal(false)}>
									Close
								</Button>
							</div>
						</CardHeader>

						<CardContent className="space-y-5">
							<form
								action={async () => {
									await createMutation.mutateAsync({
										title,
										description,
										templateId,
									});
								}}
								className="space-y-5"
							>
								<div className="grid gap-5 md:grid-cols-2">
									<label className="block space-y-2">
										<span className="text-sm font-medium">Title</span>
										<Input
											value={title}
											onChange={(event) => setTitle(event.target.value)}
											required
											placeholder="e.g. Flow diagram"
										/>
									</label>

									<label className="block space-y-2">
										<span className="text-sm font-medium">Description</span>
										<Textarea
											value={description}
											onChange={(event) => setDescription(event.target.value)}
											rows={4}
											placeholder="What will this project produce?"
										/>
									</label>
								</div>

								<div className="space-y-3">
									<div>
										<p className="text-sm font-medium">Starting template</p>
										<p className="mt-1 text-sm text-[var(--ink-1)]">
											Start blank or pick a ready example to jump into the
											editor.
										</p>
									</div>

									<div className="grid gap-3 md:grid-cols-2">
										<button
											type="button"
											onClick={() => setTemplateId(undefined)}
											className={`rounded-[26px] border px-4 py-4 text-left transition ${templateId ? "border-[var(--line)] bg-white/75" : "border-[rgba(200,85,61,0.32)] bg-[rgba(200,85,61,0.10)]"}`}
										>
											<div className="font-medium">Default TikZ</div>
											<p className="mt-1 text-sm text-[var(--ink-1)]">
												Clean start with Hello TikZ.
											</p>
										</button>

										{groupedTemplates.slice(0, 8).map((template) => (
											<button
												key={template.id}
												type="button"
												onClick={() => setTemplateId(template.id)}
												className={`rounded-[26px] border px-4 py-4 text-left transition ${templateId === template.id ? "border-[rgba(200,85,61,0.32)] bg-[rgba(200,85,61,0.10)]" : "border-[var(--line)] bg-white/75"}`}
											>
												<div className="font-medium">{template.title}</div>
												<p className="mt-1 text-sm text-[var(--ink-1)]">
													{template.category}
												</p>
											</button>
										))}
									</div>
								</div>

								<div className="flex justify-end gap-3">
									<Button
										type="button"
										variant="outline"
										onClick={() => setShowModal(false)}
									>
										Cancel
									</Button>
									<Button
										type="submit"
										disabled={createMutation.isPending || !title.trim()}
									>
										{createMutation.isPending ? "Creating…" : "Create project"}
									</Button>
								</div>
							</form>
						</CardContent>
					</Card>
				</div>
			) : null}
		</div>
	);
}
