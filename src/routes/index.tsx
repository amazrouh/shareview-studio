import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Lock,
  Download,
  Eye,
  FileText,
  FileArchive,
  FileVideo,
  FileAudio,
  File as FileIcon,
  ShieldCheck,
  Link2,
  Check,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: SharePage,
  head: () => ({
    meta: [
      { title: "Shared files · Driftshare" },
      { name: "description", content: "View and download shared files securely." },
      { property: "og:title", content: "Shared files · Driftshare" },
      { property: "og:description", content: "View and download shared files securely." },
    ],
  }),
});

type SharedFile = {
  id: string;
  name: string;
  size: number;
  kind: "image" | "pdf" | "video" | "audio" | "zip" | "doc" | "other";
  thumb?: string;
};

const FILES: SharedFile[] = [
  { id: "1", name: "campaign-hero-final.jpg", size: 3_421_000, kind: "image", thumb: "https://images.unsplash.com/photo-1506765515384-028b60a970df?w=600&q=70&auto=format&fit=crop" },
  { id: "2", name: "brand-guidelines-2026.pdf", size: 8_120_000, kind: "pdf" },
  { id: "3", name: "product-launch-cut.mp4", size: 142_900_000, kind: "video" },
  { id: "4", name: "studio-portrait-04.jpg", size: 2_104_000, kind: "image", thumb: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=70&auto=format&fit=crop" },
  { id: "5", name: "source-files.zip", size: 412_000_000, kind: "zip" },
  { id: "6", name: "voiceover-take-3.wav", size: 18_300_000, kind: "audio" },
  { id: "7", name: "deck-investor-q2.pdf", size: 5_640_000, kind: "pdf" },
  { id: "8", name: "moodboard-warm.jpg", size: 1_820_000, kind: "image", thumb: "https://images.unsplash.com/photo-1558865869-c93f6f8482af?w=600&q=70&auto=format&fit=crop" },
];

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let v = bytes / 1024;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
  return `${v.toFixed(v < 10 ? 1 : 0)} ${units[i]}`;
}

function KindIcon({ kind, className }: { kind: SharedFile["kind"]; className?: string }) {
  const map = {
    pdf: FileText,
    video: FileVideo,
    audio: FileAudio,
    zip: FileArchive,
    doc: FileText,
    image: FileIcon,
    other: FileIcon,
  } as const;
  const Cmp = map[kind];
  return <Cmp className={className} />;
}

function kindLabel(kind: SharedFile["kind"]) {
  return { pdf: "PDF", video: "Video", audio: "Audio", zip: "Archive", doc: "Document", image: "Image", other: "File" }[kind];
}

function SharePage() {
  const [unlocked, setUnlocked] = useState(true); // toggle to false to preview locked state
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const totalSize = useMemo(() => FILES.reduce((a, f) => a + f.size, 0), []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.trim().length < 3) { setError("Incorrect password. Try again."); return; }
    setError(""); setUnlocked(true);
  }

  function copyLink() {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  }

  return (
    <div className="dark min-h-screen bg-app-gradient text-foreground relative overflow-hidden">
      {/* ambient blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-32 h-[28rem] w-[28rem] rounded-full bg-primary/30 blur-3xl animate-float-slow" />
        <div className="absolute top-40 -right-40 h-[32rem] w-[32rem] rounded-full bg-primary-glow/25 blur-3xl animate-float-slow" style={{ animationDelay: "-6s" }} />
      </div>

      <main className="relative mx-auto max-w-5xl px-4 py-10 sm:py-16">
        {/* Branded header */}
        <header className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-gradient shadow-lg shadow-primary/30">
              <span className="font-bold text-white text-lg tracking-tight">D</span>
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight">Driftshare</p>
              <p className="text-xs text-muted-foreground">Shared by alex@studio.co</p>
            </div>
          </div>
          <button
            onClick={copyLink}
            className="ring-glow inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-foreground/80 backdrop-blur transition hover:bg-white/10"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy link"}
          </button>
        </header>

        {!unlocked ? (
          <section className="glass-card mx-auto max-w-md rounded-3xl p-8 sm:p-10">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-gradient shadow-lg shadow-primary/40">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <p className="text-sm font-medium text-primary-glow">Password required</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">Protected share</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              The owner has restricted access. Enter the password to view the contents.
            </p>

            <form onSubmit={submit} className="mt-6 space-y-3">
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="Enter password"
                  className="ring-glow w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 backdrop-blur transition focus:border-primary/50"
                  autoFocus
                />
              </div>
              {error && <p className="text-xs text-red-400">{error}</p>}
              <button
                type="submit"
                className="ring-glow inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent-gradient px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition hover:brightness-110 active:brightness-95"
              >
                <ShieldCheck className="h-4 w-4" /> Unlock
              </button>
            </form>

            <p className="mt-6 text-center text-[11px] text-muted-foreground">
              End-to-end protected · Powered by Driftshare
            </p>
          </section>
        ) : (
          <section className="glass-card rounded-3xl p-6 sm:p-10">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/5 pb-6">
              <div>
                <p className="text-sm font-medium text-primary-glow">Shared content</p>
                <h1 className="mt-1 text-3xl sm:text-4xl font-bold tracking-tight">
                  Q2 Launch <span className="text-gradient">Assets</span>
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  {FILES.length} items · {formatSize(totalSize)} total · Expires in 6 days
                </p>
              </div>
              <button className="ring-glow inline-flex items-center gap-2 rounded-xl bg-accent-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition hover:brightness-110">
                <Download className="h-4 w-4" /> Download all
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FILES.map((f) => (
                <article
                  key={f.id}
                  className="glass-tile group flex flex-col overflow-hidden rounded-2xl transition hover:-translate-y-0.5 hover:border-primary/40"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-white/5 to-white/0">
                    {f.kind === "image" && f.thumb ? (
                      <img
                        src={f.thumb}
                        alt={f.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-gradient/20 ring-1 ring-primary/30">
                          <KindIcon kind={f.kind} className="h-8 w-8 text-primary-glow" />
                        </div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-primary-glow/80">
                          {kindLabel(f.kind)}
                        </span>
                      </div>
                    )}
                    <span className="absolute left-3 top-3 rounded-md bg-black/50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/90 backdrop-blur">
                      {kindLabel(f.kind)}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col gap-3 p-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground" title={f.name}>{f.name}</p>
                      <p className="text-xs text-muted-foreground">{formatSize(f.size)}</p>
                    </div>
                    <div className="mt-auto flex items-center gap-2">
                      <button className="ring-glow inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-foreground/90 transition hover:bg-white/10">
                        <Eye className="h-3.5 w-3.5" /> Preview
                      </button>
                      <button className="ring-glow inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-accent-gradient px-3 py-2 text-xs font-semibold text-white shadow shadow-primary/30 transition hover:brightness-110">
                        <Download className="h-3.5 w-3.5" /> Download
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <footer className="mt-8 flex items-center justify-between text-xs text-muted-foreground">
          <span>© Driftshare 2026</span>
          <button
            onClick={() => setUnlocked((v) => !v)}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 hover:bg-white/10"
          >
            Toggle locked preview
          </button>
        </footer>
      </main>
    </div>
  );
}
