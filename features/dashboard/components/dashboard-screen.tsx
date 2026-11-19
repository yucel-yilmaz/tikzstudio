"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	FileCode2,
	LogOut,
	Plus,
	Search,
	Sparkles,
	Trash2,
	UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDeferredValue, useMemo, useState } from "react";
import { LocaleSwitcher } from "@/components/locale-switcher";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import {
	NativeSelect,
	NativeSelectOption,
} from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { HelpMenu } from "@/features/help/components/help-menu";
import { ImportProjectButton } from "@/features/projects/components/import-project-button";
import { TemplateThumbnail } from "@/features/templates/components/template-thumbnail";
import {
	createProject,
	deleteProject,
	getProjects,
	getTemplates,
} from "@/lib/client-api";
import { DEFAULT_TEMPLATE_PREVIEW_URL } from "@/lib/defaults";
import { useI18n } from "@/lib/i18n/client";
import { compareStrings } from "@/lib/i18n/format";

export function DashboardScreen({ userName }: { userName: string }) {
	const { t, rich, locale, formatDateTime } = useI18n();
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

	const [projectToDelete, setProjectToDelete] = useState<{
		id: string;
		title: string;
	} | null>(null);
	const deleteMutation = useMutation({
		mutationFn: deleteProject,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["projects"] });
			setProjectToDelete(null);
		},
	});

	const groupedTemplates = useMemo(
		() => templatesQuery.data?.templates ?? [],
		[templatesQuery.data],
	);
	const [templateCategory, setTemplateCategory] = useState<string | null>(null);
	const templateCategories = useMemo(
		() =>
			Array.from(
				new Set(groupedTemplates.map((template) => template.category)),
			).sort((a, b) => compareStrings(locale, a, b)),
		[groupedTemplates, locale],
	);
	const visibleTemplates = useMemo(
		() =>
			templateCategory === null
				? groupedTemplates
				: groupedTemplates.filter(
						(template) => template.category === templateCategory,
					),
		[groupedTemplates, templateCategory],
	);
	const projectCount = projectsQuery.data?.projects.length ?? 0;

	return (
		<div className="mx-auto flex min-h-screen w-full max-w-375 flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
			<Card className="overflow-hidden border-white/60 bg-[linear-gradient(160deg,rgba(255,250,242,0.96),rgba(244,239,231,0.94))]">
				<CardContent className="flex flex-col gap-5 p-6 lg:flex-row lg:items-start lg:justify-between lg:p-8">
					<div className="space-y-4">
						<div className="flex flex-wrap items-center gap-2">
							<Badge variant="outline" className="normal-case tracking-normal">
								{t("dashboard.badge")}
							</Badge>
							<Badge
								variant="secondary"
								className="normal-case tracking-normal"
							>
								{t("dashboard.projectCount", { count: projectCount })}
							</Badge>
						</div>
						<div className="space-y-2">
							<h1 className="text-4xl font-semibold tracking-tight">
								{t("dashboard.greeting", { name: userName })}
							</h1>
							<p className="max-w-3xl text-sm leading-6 text-(--ink-1) lg:text-base">
								{t("dashboard.intro")}
							</p>
						</div>
						<div className="grid gap-3 sm:grid-cols-3">
							<div className="rounded-3xl border border-(--line) bg-white/70 px-4 py-4">
								<p className="text-xs uppercase tracking-[0.14em] text-(--ink-1)">
									{t("dashboard.statProjects")}
								</p>
								<p className="mt-2 text-2xl font-semibold">{projectCount}</p>
							</div>
							<div className="rounded-3xl border border-(--line) bg-white/70 px-4 py-4">
								<p className="text-xs uppercase tracking-[0.14em] text-(--ink-1)">
									{t("dashboard.statTemplates")}
								</p>
								<p className="mt-2 text-2xl font-semibold">
									{groupedTemplates.length}
								</p>
							</div>
							<div className="rounded-3xl border border-(--line) bg-white/70 px-4 py-4">
								<p className="text-xs uppercase tracking-[0.14em] text-(--ink-1)">
									{t("dashboard.statWorkflow")}
								</p>
								<p className="mt-2 text-base font-semibold">
									{t("dashboard.statWorkflowValue")}
								</p>
							</div>
						</div>
					</div>

					<div className="flex flex-wrap items-center gap-3 lg:justify-end">
						<Button onClick={() => setShowModal(true)} data-tour="new-project">
							<Plus size={16} />
							{t("dashboard.newProject")}
						</Button>
						<ImportProjectButton />
						<HelpMenu page="dashboard" />
						<Button asChild variant="outline">
							<Link href="/account">
								<UserRound size={16} />
								{t("dashboard.myAccount")}
							</Link>
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
								{t("dashboard.signOut")}
							</Button>
						</form>
						<LocaleSwitcher />
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="pb-4">
					<CardTitle>{t("dashboard.projectsTitle")}</CardTitle>
					<CardDescription>
						{t("dashboard.projectsDescription")}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-5">
					<label className="relative block">
						<Search
							className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-(--ink-1)"
							size={16}
						/>
						<Input
							value={search}
							onChange={(event) => setSearch(event.target.value)}
							placeholder={t("dashboard.searchPlaceholder")}
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
								<Card key={project.id} className="border-(--line) bg-white/78">
									<CardContent className="flex h-full flex-col gap-5 p-5">
										<div className="flex items-start justify-between gap-4">
											<div className="space-y-2">
												<div className="inline-flex items-center gap-2 text-foreground">
													<FileCode2 size={16} />
													<h2 className="text-xl font-semibold">
														{project.title}
													</h2>
												</div>
												<p className="line-clamp-3 text-sm leading-6 text-(--ink-1)">
													{project.description || t("dashboard.noDescription")}
												</p>
											</div>
											<Button
												variant="ghost"
												size="icon"
												onClick={() =>
													setProjectToDelete({
														id: project.id,
														title: project.title,
													})
												}
												aria-label={t("dashboard.deleteProject")}
												className="text-(--danger)"
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
													{formatDateTime(project.updatedAt)}
												</Badge>
											</div>
											<Button asChild variant="secondary">
												<Link href={`/projects/${project.id}/editor`}>
													{t("dashboard.openInEditor")}
												</Link>
											</Button>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					) : (
						<div className="rounded-[30px] border border-dashed border-(--line) bg-white/65 px-6 py-14 text-center">
							<div className="mx-auto max-w-md space-y-3">
								<Badge
									variant="outline"
									className="normal-case tracking-normal"
								>
									{t("dashboard.emptyBadge")}
								</Badge>
								<h2 className="text-2xl font-semibold">
									{t("dashboard.emptyTitle")}
								</h2>
								<p className="text-sm leading-6 text-(--ink-1)">
									{t("dashboard.emptyBody")}
								</p>
								<Button onClick={() => setShowModal(true)} className="mt-2">
									<Sparkles size={16} />
									{t("dashboard.createFirst")}
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
										{t("dashboard.newProject")}
									</Badge>
									<CardTitle className="text-2xl">
										{t("dashboard.modalTitle")}
									</CardTitle>
									<CardDescription>
										{t("dashboard.modalDescription")}
									</CardDescription>
								</div>
								<Button variant="ghost" onClick={() => setShowModal(false)}>
									{t("common.close")}
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
										<span className="text-sm font-medium">
											{t("common.title")}
										</span>
										<Input
											value={title}
											onChange={(event) => setTitle(event.target.value)}
											required
											placeholder={t("dashboard.titlePlaceholder")}
										/>
									</label>

									<label className="block space-y-2">
										<span className="text-sm font-medium">
											{t("common.description")}
										</span>
										<Textarea
											value={description}
											onChange={(event) => setDescription(event.target.value)}
											rows={4}
											placeholder={t("dashboard.descriptionPlaceholder")}
										/>
									</label>
								</div>

								<div className="space-y-3">
									<div>
										<p className="text-sm font-medium">
											{t("dashboard.starterTemplate")}
										</p>
										<p className="mt-1 text-sm text-(--ink-1)">
											{t("dashboard.starterTemplateHint")}
										</p>
									</div>

									<div className="flex items-center gap-2">
										<label
											htmlFor="template-category"
											className="text-sm text-(--ink-1)"
										>
											{t("common.category")}
										</label>
										<NativeSelect
											id="template-category"
											value={templateCategory ?? ""}
											onChange={(event) =>
												setTemplateCategory(event.target.value || null)
											}
										>
											<NativeSelectOption value="">
												{t("common.allWithCount", {
													count: groupedTemplates.length,
												})}
											</NativeSelectOption>
											{templateCategories.map((category) => (
												<NativeSelectOption key={category} value={category}>
													{t("common.optionWithCount", {
														label: category,
														count: groupedTemplates.filter(
															(template) => template.category === category,
														).length,
													})}
												</NativeSelectOption>
											))}
										</NativeSelect>
									</div>

									<div className="grid max-h-[45vh] gap-3 overflow-y-auto pr-1 sm:grid-cols-2 md:grid-cols-3">
										{templateCategory === null ? (
											<button
												type="button"
												onClick={() => setTemplateId(undefined)}
												className={`flex flex-col gap-2 rounded-[22px] border p-2.5 text-left transition ${templateId ? "border-(--line) bg-white/75" : "border-[rgba(200,85,61,0.32)] bg-[rgba(200,85,61,0.10)]"}`}
											>
												<TemplateThumbnail
													src={DEFAULT_TEMPLATE_PREVIEW_URL}
													title={t("dashboard.defaultTemplate")}
												/>
												<div className="px-1">
													<div className="text-sm font-medium">
														{t("dashboard.defaultTemplate")}
													</div>
													<p className="text-xs text-(--ink-1)">
														{t("dashboard.defaultTemplateHint")}
													</p>
												</div>
											</button>
										) : null}

										{visibleTemplates.map((template) => (
											<button
												key={template.id}
												type="button"
												onClick={() => setTemplateId(template.id)}
												className={`flex flex-col gap-2 rounded-[22px] border p-2.5 text-left transition ${templateId === template.id ? "border-[rgba(200,85,61,0.32)] bg-[rgba(200,85,61,0.10)]" : "border-(--line) bg-white/75"}`}
											>
												<TemplateThumbnail
													src={template.previewUrl}
													title={template.title}
												/>
												<div className="px-1">
													<div className="line-clamp-2 text-sm font-medium">
														{template.title}
													</div>
													<p className="text-xs text-(--ink-1)">
														{template.category}
													</p>
												</div>
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
										{t("common.cancel")}
									</Button>
									<Button
										type="submit"
										disabled={createMutation.isPending || !title.trim()}
									>
										{createMutation.isPending
											? t("dashboard.creating")
											: t("dashboard.createProject")}
									</Button>
								</div>
							</form>
						</CardContent>
					</Card>
				</div>
			) : null}

			<AlertDialog
				open={projectToDelete !== null}
				onOpenChange={(open) => {
					if (!open) setProjectToDelete(null);
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{t("dashboard.deleteTitle")}</AlertDialogTitle>
						<AlertDialogDescription>
							{rich("dashboard.deleteBody", {
								title: projectToDelete?.title ?? "",
								b: (chunks) => <strong>{chunks}</strong>,
							})}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>{t("common.dismiss")}</AlertDialogCancel>
						<AlertDialogAction
							variant="destructive"
							disabled={deleteMutation.isPending}
							onClick={(event) => {
								// Keep the dialog open until the request finishes.
								event.preventDefault();
								if (projectToDelete) deleteMutation.mutate(projectToDelete.id);
							}}
						>
							{deleteMutation.isPending
								? t("common.deleting")
								: t("dashboard.deleteProject")}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
