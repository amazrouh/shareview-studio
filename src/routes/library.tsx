import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Folder,
  FolderOpen,
  Upload,
  Share2,
  Download,
  Eye,
  Plus,
  Search,
  MoreHorizontal,
  FileText,
  FileVideo,
  FileAudio,
  FileArchive,
  File as FileIcon,
  Image as ImageIcon,
  Settings2,
  ChevronRight,
  Sparkles,
  CloudUpload,
  Library as LibraryIcon,
} from "lucide-react";
import { ShareManageModal, type ShareLink, type ShareManageTarget } from "@/components/share-manage-modal";

export const Route = createFileRoute("/library")({
  component: LibraryPage,
  head: () => ({
    meta: [
      { title: "Library · Driftshare" },
      { name: "description", content: "Manage folders, files, and share links from your library." },
    ],
  }),
});

type FolderNode = {
  id: string;
  name: string;
  fileCount: number;
  children?: FolderNode[];
};

type LibFile = {
  id: string;
  name: string;
  size: number;
  kind: "image" | "pdf" | "video" | "audio" | "zip" | "doc" | "other";
  thumb?: string;
  updatedAt: string;
};

type ShareRow = {
  id: string;
  type: "Folder" | "File";
  name: string;
  active: number;
  total: number;
  views: number;
  downloads: number;
  status: "active" | "revoked" | "expired";
};

const FOLDERS: FolderNode[] = [
  { id: "root", name: "Library (root)", fileCount: 24 },
  {
    id: "f1",
    name: "Brand assets",
    fileCount: 12,
    children: [
      { id: "f1a", name: "Logos", fileCount: 6 },
      { id: "f1b", name: "Type specimens", fileCount: 3 },
    ],
  },
  { id: "f2", name: "testfolder004", fileCount: 8 },
  { id: "f3", name: "Q2 launch", fileCount: 17 },
  { id: "f4", name: "Client deliverables", fileCount: 41 },
];

const FILES: LibFile[] = [
  { id: "1", name: "0004.jpg", size: 3_421_000, kind: "image", thumb: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=400&q=70&auto=format&fit=crop", updatedAt: "2h ago" },
  { id: "2", name: "0002.jpg", size: 2_140_000, kind: "image", thumb: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=70&auto=format&fit=crop", updatedAt: "2h ago" },
  { id: "3", name: "moodboard-spring.jpg", size: 5_812_000, kind: "image", thumb: "https://images.unsplash.com/photo-1506765515384-028b60a970df?w=400&q=70&auto=format&fit=crop", updatedAt: "yesterday" },
  { id: "4", name: "system-architecture.pdf", size: 1_240_000, kind: "pdf", updatedAt: "yesterday" },
  { id: "5", name: "walkthrough-final.mp4", size: 142_900_000, kind: "video", updatedAt: "3d ago" },
  { id: "6", name: "voiceover-take-3.mp3", size: 6_412_000, kind: "audio", updatedAt: "3d ago" },
  { id: "7", name: "deliverables-v2.zip", size: 218_000_000, kind: "zip", updatedAt: "1w ago" },
  { id: "8", name: "kickoff-notes.docx", size: 92_000, kind: "doc", updatedAt: "1w ago" },
];

const SHARES: ShareRow[] = [
  { id: "s1", type: "Folder", name: "testfolder004", active: 1, total: 1, views: 4, downloads: 0, status: "active" },
  { id: "s2", type: "File", name: "day_and_night_night_1_year.jpg", active: 1, total: 1, views: 3, downloads: 1, status: "active" },
  { id: "s3", type: "Folder", name: "Brand assets / Logos", active: 0, total: 2, views: 87, downloads: 14, status: "revoked" },
  { id: "s4", type: "File", name: "system-architecture.pdf", active: 0, total: 1, views: 12, downloads: 5, status: "expired" },
];

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let v = bytes / 1024;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v < 10 ? 1 : 0)} ${units[i]}`;
}

function FileTypeIcon({ kind, className = "h-6 w-6" }: { kind: LibFile["kind"]; className?: string }) {
  switch (kind) {
    case "pdf": return <FileText className={className} />;
    case "video": return <FileVideo className={className} />;
    case "audio": return <FileAudio className={className} />;
    case "zip": return <FileArchive className={className} />;
    case "doc": return <FileText className={className} />;
    case "image": return <ImageIcon className={className} />;
    default: return <FileIcon className={className} />;
  }
}

function kindTint(kind: LibFile["kind"]) {
  switch (kind) {
    case "pdf": return "bg-rose-500/10 text-rose-500 dark:text-rose-300";
    case "video": return "bg-violet-500/10 text-violet-500 dark:text-violet-300";
    case "audio": return "bg-emerald-500/10 text-emerald-500 dark:text-emerald-300";
    case "zip": return "bg-amber-500/10 text-amber-600 dark:text-amber-300";
    case "doc": return "bg-sky-500/10 text-sky-500 dark:text-sky-300";
    case "image": return "bg-primary/10 text-primary";
    default: return "bg-muted text-muted-foreground";
  }
}

function StatusBadge({ status }: { status: ShareRow["status"] }) {
  const map = {
    active: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-300 ring-emerald-500/30",
    revoked: "bg-amber-500/12 text-amber-600 dark:text-amber-300 ring-amber-500/30",
    expired: "bg-rose-500/12 text-rose-600 dark:text-rose-300 ring-rose-500/30",
  } as const;
  const label = { active: "Active", revoked: "Revoked", expired: "Expired" }[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${map[status]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-foreground/10 ${className}`} />;
}

function LibraryPage() {
  const [activeFolder, setActiveFolder] = useState("f2");
  const [newFolder, setNewFolder] = useState("");
  const [query, setQuery] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1100);
    return () => clearTimeout(t);
  }, []);

  const filteredFiles = useMemo(
    () => FILES.filter((f) => f.name.toLowerCase().includes(query.toLowerCase())),
    [query],
  );
  const imageFiles = filteredFiles.filter((f) => f.kind === "image");
  const otherFiles = filteredFiles.filter((f) => f.kind !== "image");
  const galleryImages = FILES.filter((f) => f.kind === "image").slice(0, 6);

  return (
    <div className="relative min-h-screen overflow-hidden bg-app-gradient text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="animate-float-slow absolute -top-40 -left-32 h-[28rem] w-[28rem] rounded-full bg-primary/30 blur-3xl" />
        <div className="animate-float-slow absolute top-1/3 -right-32 h-[24rem] w-[24rem] rounded-full bg-primary-glow/25 blur-3xl" style={{ animationDelay: "-6s" }} />
      </div>

      <div className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
              <LibraryIcon className="h-3.5 w-3.5" />
              Workspace
            </div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              <span className="text-gradient">Library</span>
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Organize folders, share files, and track every link in one place.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="glass-tile relative hidden items-center rounded-xl px-3 py-2 sm:flex">
              <Search className="mr-2 h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search files…"
                className="bg-transparent text-sm outline-none placeholder:text-muted-foreground w-44"
              />
            </div>
            <button className="glass-tile inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium hover:bg-primary/5 ring-glow">
              <Settings2 className="h-4 w-4" /> Settings
            </button>
            <button className="bg-accent-gradient inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] hover:opacity-95 ring-glow">
              <Sparkles className="h-4 w-4" /> New share
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <section className="glass-card rounded-2xl p-5 lg:col-span-3">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold tracking-wide text-foreground/90">Folders</h2>
              <span className="rounded-full bg-foreground/5 px-2 py-0.5 text-[11px] text-muted-foreground">
                {FOLDERS.length}
              </span>
            </div>

            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <ul className="space-y-1">
                {FOLDERS.map((f) => {
                  const active = activeFolder === f.id;
                  return (
                    <li key={f.id}>
                      <button
                        onClick={() => setActiveFolder(f.id)}
                        className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition ${
                          active
                            ? "bg-accent-gradient text-primary-foreground shadow-[var(--shadow-glow)]"
                            : "hover:bg-primary/5"
                        }`}
                      >
                        <span className="flex min-w-0 items-center gap-2.5">
                          {active ? (
                            <FolderOpen className="h-4 w-4 shrink-0" />
                          ) : (
                            <Folder className="h-4 w-4 shrink-0 text-primary" />
                          )}
                          <span className="truncate text-sm font-medium">{f.name}</span>
                        </span>
                        <span className={`flex items-center gap-1.5 text-[11px] ${active ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                          {f.fileCount}
                          <button
                            onClick={(e) => { e.stopPropagation(); }}
                            className={`rounded-md p-1 opacity-0 transition group-hover:opacity-100 ${active ? "hover:bg-white/15" : "hover:bg-primary/10"}`}
                            aria-label="Share folder"
                          >
                            <Share2 className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="mt-4 border-t border-border/60 pt-4">
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                New subfolder
              </label>
              <div className="flex gap-2">
                <input
                  value={newFolder}
                  onChange={(e) => setNewFolder(e.target.value)}
                  placeholder="e.g. Q3 assets"
                  className="glass-tile w-full rounded-lg px-3 py-2 text-sm outline-none placeholder:text-muted-foreground ring-glow"
                />
                <button className="bg-accent-gradient inline-flex items-center gap-1 rounded-lg px-3 text-sm font-medium text-primary-foreground hover:opacity-95 ring-glow">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </section>

          <section className="glass-card rounded-2xl p-5 lg:col-span-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span>Library</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                  <span className="text-foreground/80">testfolder004</span>
                </div>
                <h2 className="mt-0.5 text-lg font-semibold tracking-tight">Files</h2>
              </div>
              <button className="bg-accent-gradient inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] hover:opacity-95 ring-glow">
                <Upload className="h-4 w-4" /> Upload
              </button>
            </div>

            <label
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); }}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-7 text-center transition ${
                dragOver
                  ? "border-primary bg-primary/10"
                  : "border-primary/25 hover:border-primary/50 hover:bg-primary/5"
              }`}
            >
              <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CloudUpload className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium">
                Drop files here, or <span className="text-primary">browse</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Up to 5 GB per file · images, video, PDF, zip
              </p>
              <input type="file" multiple className="hidden" />
            </label>

            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Images
                </h3>
                <span className="text-[11px] text-muted-foreground">{imageFiles.length} items</span>
              </div>
              {loading ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-[4/3] w-full" />
                  ))}
                </div>
              ) : imageFiles.length === 0 ? (
                <p className="text-sm text-muted-foreground">No images match your search.</p>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {imageFiles.map((f) => (
                    <figure
                      key={f.id}
                      className="glass-tile group relative overflow-hidden rounded-xl"
                    >
                      <div className="aspect-[4/3] overflow-hidden">
                        <img
                          src={f.thumb}
                          alt={f.name}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/0 to-black/0 opacity-0 transition group-hover:opacity-100" />
                      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-2.5 opacity-0 transition group-hover:opacity-100">
                        <div className="min-w-0 text-white">
                          <p className="truncate text-xs font-medium">{f.name}</p>
                          <p className="text-[10px] text-white/70">{formatSize(f.size)}</p>
                        </div>
                        <div className="flex gap-1">
                          <button className="rounded-md bg-white/20 p-1.5 text-white backdrop-blur hover:bg-white/30" aria-label="Preview">
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button className="rounded-md bg-white/20 p-1.5 text-white backdrop-blur hover:bg-white/30" aria-label="Download">
                            <Download className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </figure>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Documents & media
                </h3>
                <span className="text-[11px] text-muted-foreground">{otherFiles.length} items</span>
              </div>
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : (
                <ul className="space-y-2">
                  {otherFiles.map((f) => (
                    <li
                      key={f.id}
                      className="glass-tile group flex items-center gap-3 rounded-xl p-3 transition hover:border-primary/30"
                    >
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${kindTint(f.kind)}`}>
                        <FileTypeIcon kind={f.kind} className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{f.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatSize(f.size)} · updated {f.updatedAt}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button className="rounded-lg p-2 text-muted-foreground hover:bg-primary/10 hover:text-primary" aria-label="Preview">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="rounded-lg p-2 text-muted-foreground hover:bg-primary/10 hover:text-primary" aria-label="Share">
                          <Share2 className="h-4 w-4" />
                        </button>
                        <button className="rounded-lg p-2 text-muted-foreground hover:bg-primary/10 hover:text-primary" aria-label="Download">
                          <Download className="h-4 w-4" />
                        </button>
                        <button className="rounded-lg p-2 text-muted-foreground hover:bg-primary/10 hover:text-primary" aria-label="More">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <aside className="lg:col-span-3">
            <div className="lg:sticky lg:top-6">
              <div className="glass-card rounded-2xl p-5">
                <div className="mb-1 flex items-center justify-between">
                  <h2 className="text-sm font-semibold">Folder preview</h2>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                    testfolder004
                  </span>
                </div>
                <p className="mb-4 text-xs text-muted-foreground">
                  Server-rendered thumbnails load as you scroll. Open a tile for the full-resolution preview.
                </p>

                {loading ? (
                  <div className="grid grid-cols-2 gap-2.5">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="aspect-square w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5">
                    {galleryImages.map((img) => (
                      <figure key={img.id} className="group relative overflow-hidden rounded-lg ring-1 ring-border/60">
                        <div className="aspect-square overflow-hidden">
                          <img
                            src={img.thumb}
                            alt={img.name}
                            loading="lazy"
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                          />
                        </div>
                        <figcaption className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/75 to-transparent px-2 py-1.5 text-[10px] font-medium text-white">
                          {img.name}
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                )}

                <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                  <div className="glass-tile rounded-lg p-2.5">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Files</p>
                    <p className="mt-0.5 text-base font-semibold">{FILES.length}</p>
                  </div>
                  <div className="glass-tile rounded-lg p-2.5">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Size</p>
                    <p className="mt-0.5 text-base font-semibold">
                      {formatSize(FILES.reduce((s, f) => s + f.size, 0))}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <section className="glass-card mt-6 rounded-2xl p-5 sm:p-6">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Your shares</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                One row per file or folder with totals across all links. Manage opens the dialog to work on each link.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Active
              </span>
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Revoked
              </span>
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> Expired
              </span>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-border/60">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-foreground/5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Links</th>
                    <th className="px-4 py-3 text-right">Views</th>
                    <th className="px-4 py-3 text-right">Downloads</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {loading
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <tr key={i}>
                          {Array.from({ length: 7 }).map((__, j) => (
                            <td key={j} className="px-4 py-3.5">
                              <Skeleton className="h-4 w-full" />
                            </td>
                          ))}
                        </tr>
                      ))
                    : SHARES.map((s) => (
                        <tr key={s.id} className="transition hover:bg-primary/5">
                          <td className="px-4 py-3.5">
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                              {s.type === "Folder" ? (
                                <Folder className="h-3.5 w-3.5 text-primary" />
                              ) : (
                                <FileIcon className="h-3.5 w-3.5 text-primary" />
                              )}
                              {s.type}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 font-medium">{s.name}</td>
                          <td className="px-4 py-3.5"><StatusBadge status={s.status} /></td>
                          <td className="px-4 py-3.5 text-xs text-muted-foreground">
                            <span className="font-medium text-emerald-600 dark:text-emerald-300">
                              {s.active} active
                            </span>
                            <span> / {s.total} total</span>
                          </td>
                          <td className="px-4 py-3.5 text-right tabular-nums">{s.views}</td>
                          <td className="px-4 py-3.5 text-right tabular-nums">{s.downloads}</td>
                          <td className="px-4 py-3.5 text-right">
                            <button className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10">
                              Manage <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <footer className="mt-8 text-center text-xs text-muted-foreground">
          Driftshare · End-to-end encrypted file sharing
        </footer>
      </div>
    </div>
  );
}
