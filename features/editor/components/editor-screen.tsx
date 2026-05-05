"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  ChevronRight,
  Clock3,
  Download,
  FileCode2,
  Globe2,
  LayoutTemplate,
  LoaderCircle,
  PanelLeft,
  Play,
  Save,
  Settings2,
  TerminalSquare,
  WandSparkles,
  XCircle,
} from "lucide-react";

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
  compileProject,
  getCompileJob,
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
import { TikzCodeEditor } from "@/features/editor/components/code-editor";
import { PdfPreview } from "@/features/editor/components/pdf-preview";
import { useEditorStore } from "@/features/editor/store/use-editor-store";

const terminalStatuses = new Set<string>(COMPILE_TERMINAL_STATUSES);

const saveStateMeta = {
  idle: { label: "Temiz", tone: "text-muted-foreground" },
  dirty: { label: "Kaydedilmemiş", tone: "text-foreground" },
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
    description: "Proje bilgisini ve görünürlük ayarını güncelle.",
    icon: Settings2,
  },
} as const;

function compileBadge(job: CompileJobDto | null) {
  if (!job) {
    return {
      label: "Hazır",
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
        label: "Sırada",
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
    previewZoom,
    buffers,
    saveState,
    initialize,
    setActiveFile,
    setSidebarTab,
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
    queryFn: () => getCompileJob(compileJobId!),
    enabled: Boolean(compileJobId),
    refetchInterval: (query) => {
      const job = query.state.data;
      if (!job || !compileJobId) {
        return 1000;
      }

      return terminalStatuses.has(job.status) ? false : 1000;
    },
  });

  const saveMutation = useMutation({
    mutationFn: ({ fileId, content }: { fileId: string; content: string }) =>
      updateFile(projectId, fileId, { content }),
    onMutate: () => setSaveState("saving"),
    onSuccess: (file) => {
      queryClient.setQueryData<{ files: ProjectFileDto[] }>(["project-files", projectId], (current) =>
        current
          ? {
              files: current.files.map((candidate) => (candidate.id === file.id ? file : candidate)),
            }
          : current,
      );
      markSaved(file.id, file.content);
    },
    onError: () => setSaveState("error"),
  });

  const compileMutation = useMutation({
    mutationFn: () => compileProject(projectId, { mainFileId: activeFileId ?? undefined }),
    onSuccess: (job) => {
      setCompileJobId(job.id);
    },
  });

  const settingsMutation = useMutation({
    mutationFn: (payload: { title: string; description: string; isPublic: boolean }) =>
      updateProject(projectId, payload),
    onSuccess: (project) => {
      queryClient.setQueryData(["project", projectId], project);
    },
  });

  useEffect(() => {
    if (filesQuery.data?.files) {
      initialize(filesQuery.data.files);
    }
  }, [filesQuery.data?.files, initialize]);

  const activeFile = useMemo(
    () => filesQuery.data?.files.find((file) => file.id === activeFileId) ?? filesQuery.data?.files[0] ?? null,
    [activeFileId, filesQuery.data?.files],
  );

  const activeValue = activeFile ? buffers[activeFile.id] ?? activeFile.content : "";
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

  const currentCompile = compileQuery.data ?? compileMutation.data ?? null;
  const saveMeta = saveStateMeta[saveState];
  const compileMeta = compileBadge(currentCompile);
  const CompileIcon = compileMeta.icon;
  const activePanelMeta = panelMeta[sidebarTab];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-450 flex-col gap-4 p-4 lg:p-6">
        <Card className="border-border/70 shadow-none">
          <CardHeader className="gap-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <Link href="/dashboard" className="transition-colors hover:text-foreground">
                    Dashboard
                  </Link>
                  <ChevronRight className="size-4" />
                  <span className="text-foreground">Editör</span>
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-2xl sm:text-3xl">
                    {projectQuery.data?.title ?? "Proje yükleniyor..."}
                  </CardTitle>
                  <CardDescription className="max-w-3xl">
                    {projectQuery.data?.description ||
                      "TikZ kaynak dosyalarını düzenle, güvenli biçimde derle ve PDF çıktısını aynı ekranda incele."}
                  </CardDescription>
                </div>
              </div>

              <CardAction className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={cn("gap-1.5", saveMeta.tone)}>
                  <Save className="size-3" />
                  {saveMeta.label}
                </Badge>
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
                  disabled={compileMutation.isPending || saveMutation.isPending || !activeFile}
                  onClick={() => compileMutation.mutate()}
                >
                  <Play />
                  {compileMutation.isPending ? "Başlatılıyor" : "Derle"}
                </Button>
              </CardAction>
            </div>
          </CardHeader>

          <CardContent className="flex flex-wrap items-center gap-2 pt-0 text-xs text-muted-foreground">
            <Badge variant="secondary" className="gap-1.5">
              <PanelLeft className="size-3" />
              {activeFile?.path ?? "main.tex"}
            </Badge>
            {activeFile ? (
              <Badge variant="outline">
                Son değişiklik {formatRelativeDate(activeFile.updatedAt)}
              </Badge>
            ) : null}
            {currentCompile?.finishedAt ? (
              <Badge variant="outline">
                Son derleme {formatRelativeDate(currentCompile.finishedAt)}
              </Badge>
            ) : null}
          </CardContent>
        </Card>

        <div className="hidden min-h-[calc(100vh-13rem)] lg:block">
          <ResizablePanelGroup
            orientation="horizontal"
            className="min-h-[calc(100vh-13rem)] rounded-xl border"
          >
            <ResizablePanel defaultSize={20} minSize={16}>
              <Card className="h-full rounded-none border-0 shadow-none">
                <CardHeader className="border-b">
                  <CardTitle className="text-base">Proje Paneli</CardTitle>
                  <CardDescription>
                    Dosyaları, şablonları ve proje ayarlarını yönet.
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex h-[calc(100%-5rem)] min-h-0 flex-col px-0 pb-0">
                  <Tabs
                    value={sidebarTab}
                    onValueChange={(value) => setSidebarTab(value as typeof sidebarTab)}
                    orientation="vertical"
                    className="h-full min-h-0 gap-0"
                  >
                    <div className="flex min-h-0 flex-1">
                      <div className="w-24 shrink-0 border-r bg-muted/20 p-2">
                        <TabsList
                          variant="line"
                          className="grid h-auto w-full grid-cols-1 gap-1 rounded-none bg-transparent p-0"
                        >
                          <TabsTrigger
                            value="files"
                            className="h-16 flex-col justify-center rounded-lg px-2 text-[11px] data-active:bg-background data-active:shadow-sm"
                          >
                            <FileCode2 />
                            Dosyalar
                          </TabsTrigger>
                          <TabsTrigger
                            value="templates"
                            className="h-16 flex-col justify-center rounded-lg px-2 text-[11px] data-active:bg-background data-active:shadow-sm"
                          >
                            <LayoutTemplate />
                            Şablonlar
                          </TabsTrigger>
                          <TabsTrigger
                            value="snippets"
                            className="h-16 flex-col justify-center rounded-lg px-2 text-[11px] data-active:bg-background data-active:shadow-sm"
                          >
                            <WandSparkles />
                            Parçalar
                          </TabsTrigger>
                          <TabsTrigger
                            value="settings"
                            className="h-16 flex-col justify-center rounded-lg px-2 text-[11px] data-active:bg-background data-active:shadow-sm"
                          >
                            <Settings2 />
                            Ayarlar
                          </TabsTrigger>
                        </TabsList>
                      </div>

                      <div className="flex min-h-0 flex-1 flex-col">
                        <div className="border-b px-4 py-3">
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
                              {filesQuery.data?.files.map((file) => {
                                const selected = activeFileId === file.id;

                                return (
                                  <button
                                    key={file.id}
                                    onClick={() => setActiveFile(file.id)}
                                    className={cn(
                                      "w-full rounded-lg border px-3 py-3 text-left transition-colors",
                                      selected
                                        ? "border-primary/20 bg-muted"
                                        : "border-transparent hover:border-border hover:bg-muted/50",
                                    )}
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="min-w-0 space-y-1">
                                        <div className="truncate text-sm font-medium">{file.path}</div>
                                        <p className="text-xs text-muted-foreground">
                                          {formatRelativeDate(file.updatedAt)}
                                        </p>
                                      </div>
                                      {file.isMain ? <Badge variant="secondary">Ana</Badge> : null}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </ScrollArea>
                        </TabsContent>

                        <TabsContent value="templates" className="mt-0 min-h-0 flex-1">
                          <ScrollArea className="h-full px-4 py-4">
                            <div className="space-y-2">
                              {templatesQuery.data?.templates.map((template) => (
                                <button
                                  key={template.id}
                                  onClick={() => insertIntoActive(template.content)}
                                  className="w-full rounded-lg border border-transparent px-3 py-3 text-left transition-colors hover:border-border hover:bg-muted/50"
                                >
                                  <div className="space-y-1">
                                    <div className="text-sm font-medium">{template.title}</div>
                                    <p className="text-xs text-muted-foreground">{template.category}</p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </ScrollArea>
                        </TabsContent>

                        <TabsContent value="snippets" className="mt-0 min-h-0 flex-1">
                          <ScrollArea className="h-full px-4 py-4">
                            <div className="space-y-2">
                              {snippetsQuery.data?.snippets.map((snippet) => (
                                <button
                                  key={snippet.id}
                                  onClick={() => insertIntoActive(snippet.content)}
                                  className="w-full rounded-lg border border-transparent px-3 py-3 text-left transition-colors hover:border-border hover:bg-muted/50"
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="space-y-1">
                                      <div className="text-sm font-medium">{snippet.title}</div>
                                      <p className="text-xs text-muted-foreground">{snippet.category}</p>
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
                              key={projectQuery.data?.id ?? "project-settings"}
                              action={async (formData) => {
                                await settingsMutation.mutateAsync({
                                  title: String(formData.get("title") ?? ""),
                                  description: String(formData.get("description") ?? ""),
                                  isPublic: formData.get("isPublic") === "on",
                                });
                              }}
                              className="space-y-4"
                            >
                              <div className="space-y-2">
                                <label htmlFor="title" className="text-sm font-medium">
                                  Proje adı
                                </label>
                                <Input
                                  id="title"
                                  name="title"
                                  defaultValue={projectQuery.data?.title ?? ""}
                                />
                              </div>
                              <div className="space-y-2">
                                <label htmlFor="description" className="text-sm font-medium">
                                  Açıklama
                                </label>
                                <Textarea
                                  id="description"
                                  name="description"
                                  rows={5}
                                  defaultValue={projectQuery.data?.description ?? ""}
                                />
                              </div>
                              <div className="flex items-start justify-between gap-4 rounded-lg border p-3">
                                <div className="space-y-1">
                                  <div className="inline-flex items-center gap-2 text-sm font-medium">
                                    <Globe2 className="size-4" />
                                    Herkese açık okuma modu
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    Paylaşım için işaretle. Yetki kontrolü yine sunucuda kalır.
                                  </p>
                                </div>
                                <Switch
                                  name="isPublic"
                                  defaultChecked={projectQuery.data?.isPublic}
                                />
                              </div>
                              <Button
                                type="submit"
                                size="sm"
                                disabled={settingsMutation.isPending}
                                className="w-full"
                              >
                                <Settings2 />
                                {settingsMutation.isPending ? "Kaydediliyor" : "Ayarları kaydet"}
                              </Button>
                            </form>
                          </ScrollArea>
                        </TabsContent>
                      </div>
                    </div>
                  </Tabs>
                </CardContent>
              </Card>
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel defaultSize={52} minSize={38}>
              <Card className="h-full rounded-none border-0 shadow-none">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <CardTitle className="text-base">Kod Editörü</CardTitle>
                      <CardDescription>
                        {activeFile ? activeFile.path : "Aktif dosya seçilmedi"}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className={saveMeta.tone}>
                      {saveMeta.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="h-[calc(100%-5rem)] p-0">
                  <div className="h-full bg-background">
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
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel defaultSize={28} minSize={22}>
              <Card className="h-full rounded-none border-0 shadow-none">
                <CardHeader className="border-b">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-base">Çıktı Paneli</CardTitle>
                      <CardDescription>Derleme durumu, PDF ve günlük.</CardDescription>
                    </div>
                    <Badge variant="outline" className={compileMeta.className}>
                      <CompileIcon
                        className={cn(
                          "size-3",
                          currentCompile?.status === "RUNNING" && "animate-spin",
                        )}
                      />
                      {compileMeta.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex h-[calc(100%-5rem)] flex-col gap-4">
                  <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-1">
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Motor</p>
                      <p className="mt-1 text-sm font-medium">
                        {currentCompile?.engine ?? "TECTONIC"}
                      </p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Son tamamlanma</p>
                      <p className="mt-1 text-sm font-medium">
                        {currentCompile?.finishedAt
                          ? formatRelativeDate(currentCompile.finishedAt)
                          : "Henüz yok"}
                      </p>
                    </div>
                  </div>

                  {currentCompile?.outputUrl ? (
                    <Button asChild variant="outline" size="sm">
                      <a href={`${currentCompile.outputUrl}?download=1`}>
                        <Download />
                        PDF indir
                      </a>
                    </Button>
                  ) : null}

                  <PdfPreview
                    src={currentCompile?.outputUrl ?? null}
                    zoom={previewZoom}
                    onZoomChange={setPreviewZoom}
                  />

                  <div className="min-h-0 flex-1 rounded-xl border">
                    <div className="flex items-center gap-2 border-b px-3 py-2 text-sm font-medium">
                      <TerminalSquare className="size-4" />
                      Derleme Günlüğü
                    </div>
                    <ScrollArea className="h-55">
                      <pre className="p-3 font-mono text-xs leading-6 text-muted-foreground">
                        {currentCompile?.log ?? "Derleme çıktısı burada görünecek."}
                      </pre>
                    </ScrollArea>
                  </div>
                </CardContent>
              </Card>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>

        <div className="space-y-4 lg:hidden">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Kod Editörü</CardTitle>
              <CardDescription>{activeFile?.path ?? "Aktif dosya seçilmedi"}</CardDescription>
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
              <CardDescription>Dosyalar, şablonlar ve parçalar.</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <Tabs value={sidebarTab} onValueChange={(value) => setSidebarTab(value as typeof sidebarTab)}>
                <div className="px-4 mb-2">
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
                        key={file.id}
                        onClick={() => setActiveFile(file.id)}
                        className={cn(
                          "w-full rounded-lg border px-3 py-3 text-left",
                          activeFileId === file.id ? "border-primary/20 bg-muted" : "border-transparent bg-muted/30",
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
                        key={template.id}
                        onClick={() => insertIntoActive(template.content)}
                        className="w-full rounded-lg border border-transparent bg-muted/30 px-3 py-3 text-left"
                      >
                        <div className="text-sm font-medium">{template.title}</div>
                        <div className="mt-1 text-xs text-muted-foreground">{template.category}</div>
                      </button>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="snippets" className="px-4">
                  <div className="space-y-2">
                    {snippetsQuery.data?.snippets.map((snippet) => (
                      <button
                        key={snippet.id}
                        onClick={() => insertIntoActive(snippet.content)}
                        className="w-full rounded-lg border border-transparent bg-muted/30 px-3 py-3 text-left"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-medium">{snippet.title}</div>
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
                      placeholder="Proje adı"
                    />
                    <Textarea
                      name="description"
                      defaultValue={projectQuery.data?.description ?? ""}
                      placeholder="Açıklama"
                    />
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <div className="text-sm font-medium">Herkese açık okuma modu</div>
                        <div className="text-xs text-muted-foreground">Paylaşım için işaretle</div>
                      </div>
                      <Switch name="isPublic" defaultChecked={projectQuery.data?.isPublic} />
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
              <CardDescription>Derleme sonuçları ve PDF önizleme.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Badge variant="outline" className={compileMeta.className}>
                <CompileIcon
                  className={cn("size-3", currentCompile?.status === "RUNNING" && "animate-spin")}
                />
                {compileMeta.label}
              </Badge>
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
