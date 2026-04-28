import { useEffect, useMemo, useRef, useState } from "react";
import {
  X,
  Link2,
  Copy,
  Check,
  Activity,
  Palette,
  Ban,
  Plus,
  Eye,
  Download,
  Lock,
  Calendar,
  ImagePlus,
  Sparkles,
  Folder,
  File as FileIcon,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";

export type ShareLink = {
  id: string;
  url: string;
  createdAt: string;
  status: "active" | "revoked" | "expired";
  views: number;
  downloads: number;
  hasPassword?: boolean;
  expiresAt?: string;
};

export type ShareManageTarget = {
  name: string;
  type: "Folder" | "File";
  path?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  target: ShareManageTarget;
  initialLinks?: ShareLink[];
};

function StatusPill({ status }: { status: ShareLink["status"] }) {
  const map = {
    active: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-300 ring-emerald-500/30",
    revoked: "bg-amber-500/12 text-amber-600 dark:text-amber-300 ring-amber-500/30",
    expired: "bg-rose-500/12 text-rose-600 dark:text-rose-300 ring-rose-500/30",
  } as const;
  const label = { active: "Active", revoked: "Revoked", expired: "Expired" }[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ring-inset ${map[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

export function ShareManageModal({ open, onClose, target, initialLinks = [] }: Props) {
  const [links, setLinks] = useState<ShareLink[]>(initialLinks);
  const [password, setPassword] = useState("");
  const [expiry, setExpiry] = useState("");
  const [pageTitle, setPageTitle] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [accent, setAccent] = useState("#6366f1");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [createdLink, setCreatedLink] = useState<ShareLink | null>(null);
  const [showBranding, setShowBranding] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = "share-manage-title";

  useEffect(() => {
    if (open) {
      setLinks(initialLinks);
      setCreatedLink(null);
      setPassword("");
      setExpiry("");
      setPageTitle("");
      setLogoUrl("");
      setAccent("#6366f1");
      setShowBranding(false);
      setTimeout(() => {
        dialogRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
      }, 30);
    }
  }, [open, initialLinks]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const totals = useMemo(
    () => ({
      active: links.filter((l) => l.status === "active").length,
      views: links.reduce((s, l) => s + l.views, 0),
      downloads: links.reduce((s, l) => s + l.downloads, 0),
    }),
    [links],
  );

  if (!open) return null;

  const handleCopy = async (link: ShareLink) => {
    try {
      await navigator.clipboard.writeText(link.url);
      setCopiedId(link.id);
      setTimeout(() => setCopiedId((c) => (c === link.id ? null : c)), 1500);
    } catch {
      // ignore
    }
  };

  const handleRevoke = (id: string) => {
    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, status: "revoked" } : l)));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `s_${Math.random().toString(36).slice(2, 8)}`;
    const link: ShareLink = {
      id,
      url: `https://drift.share/${id}`,
      createdAt: "Just now",
      status: "active",
      views: 0,
      downloads: 0,
      hasPassword: !!password,
      expiresAt: expiry || undefined,
    };
    setLinks((prev) => [link, ...prev]);
    setCreatedLink(link);
    setPassword("");
    setExpiry("");
  };

  const TargetIcon = target.type === "Folder" ? Folder : FileIcon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/40 backdrop-blur-md transition-opacity animate-in fade-in"
      />

      <div
        ref={dialogRef}
        className="glass-card relative z-10 flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="relative flex items-start justify-between gap-4 border-b border-border/60 bg-gradient-to-br from-primary/10 via-transparent to-primary-glow/10 px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-gradient text-primary-foreground shadow-lg shadow-primary/30">
              <TargetIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                Share {target.type.toLowerCase()}
              </p>
              <h2 id={titleId} className="truncate text-lg font-semibold tracking-tight">
                {target.name}
              </h2>
              {target.path && (
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{target.path}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ring-glow rounded-lg p-1.5 text-muted-foreground transition hover:bg-foreground/10 hover:text-foreground"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {createdLink && (
            <div className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 animate-in fade-in slide-in-from-top-2">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                <ShieldCheck className="h-4 w-4" /> Link created
              </div>
              <p className="mb-3 text-xs text-emerald-700/80 dark:text-emerald-200/80">
                Anyone with this URL can view the {target.type.toLowerCase()}. Copy it and share securely.
              </p>
              <div className="flex items-center gap-2 rounded-lg bg-background/70 p-1.5 ring-1 ring-emerald-500/20">
                <Link2 className="ml-1.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-300" />
                <input
                  readOnly
                  value={createdLink.url}
                  className="min-w-0 flex-1 truncate bg-transparent px-1 text-sm font-medium text-foreground outline-none"
                  onFocus={(e) => e.currentTarget.select()}
                />
                <button
                  type="button"
                  onClick={() => handleCopy(createdLink)}
                  className="ring-glow inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-500"
                >
                  {copiedId === createdLink.id ? (
                    <>
                      <Check className="h-3.5 w-3.5" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" /> Copy
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          <section className="mb-6">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Existing links · this item only
                </h3>
              </div>
              {links.length > 0 && (
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Eye className="h-3 w-3" /> {totals.views}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Download className="h-3 w-3" /> {totals.downloads}
                  </span>
                </div>
              )}
            </div>

            {links.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-foreground/[0.02] px-4 py-8 text-center">
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Link2 className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium">No links yet</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Create one below to start sharing.
                </p>
              </div>
            ) : (
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li
                    key={link.id}
                    className="glass-tile group rounded-xl p-3 transition hover:border-primary/40"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Link2 className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-medium">{link.url}</p>
                          {link.hasPassword && (
                            <Lock className="h-3 w-3 shrink-0 text-muted-foreground" aria-label="Password protected" />
                          )}
                        </div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                          <span>Created {link.createdAt}</span>
                          <span className="inline-flex items-center gap-1">
                            <Eye className="h-3 w-3" /> {link.views}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Download className="h-3 w-3" /> {link.downloads}
                          </span>
                          {link.expiresAt && (
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="h-3 w-3" /> Expires {link.expiresAt}
                            </span>
                          )}
                        </div>
                      </div>
                      <StatusPill status={link.status} />
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-border/50 pt-2.5">
                      <button
                        type="button"
                        onClick={() => handleCopy(link)}
                        disabled={link.status !== "active"}
                        className="ring-glow inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-primary/10 hover:text-primary disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
                      >
                        {copiedId === link.id ? (
                          <>
                            <Check className="h-3.5 w-3.5" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" /> Copy link
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        className="ring-glow inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-primary/10 hover:text-primary"
                      >
                        <Activity className="h-3.5 w-3.5" /> Activity
                      </button>
                      <button
                        type="button"
                        className="ring-glow inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-primary/10 hover:text-primary"
                      >
                        <Palette className="h-3.5 w-3.5" /> Branding
                      </button>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="ring-glow inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-primary/10 hover:text-primary"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> Open
                      </a>
                      <div className="ml-auto">
                        <button
                          type="button"
                          onClick={() => handleRevoke(link.id)}
                          disabled={link.status !== "active"}
                          className="ring-glow inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-500/10 disabled:opacity-40 disabled:hover:bg-transparent dark:text-rose-300"
                        >
                          <Ban className="h-3.5 w-3.5" /> Revoke
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-border/60" />
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-primary">
                <Sparkles className="h-3 w-3" /> Create a new link
              </span>
              <div className="h-px flex-1 bg-border/60" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                id="sm-password"
                label="Optional password"
                icon={<Lock className="h-3.5 w-3.5" />}
              >
                <input
                  id="sm-password"
                  data-autofocus
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave empty for public link"
                  className="ring-glow w-full rounded-lg border border-border/70 bg-background/60 px-3 py-2 text-sm placeholder:text-muted-foreground/70 focus:border-primary/50"
                />
              </Field>
              <Field
                id="sm-expiry"
                label="Optional expiry"
                icon={<Calendar className="h-3.5 w-3.5" />}
              >
                <input
                  id="sm-expiry"
                  type="datetime-local"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  className="ring-glow w-full rounded-lg border border-border/70 bg-background/60 px-3 py-2 text-sm focus:border-primary/50 [color-scheme:light] dark:[color-scheme:dark]"
                />
              </Field>
            </div>

            <div className="rounded-xl border border-border/60 bg-foreground/[0.02]">
              <button
                type="button"
                onClick={() => setShowBranding((v) => !v)}
                className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
              >
                <span className="inline-flex items-center gap-2 text-sm font-medium">
                  <Palette className="h-4 w-4 text-primary" />
                  Public page branding
                  <span className="text-xs font-normal text-muted-foreground">(optional)</span>
                </span>
                <span className="text-xs text-muted-foreground">{showBranding ? "Hide" : "Show"}</span>
              </button>
              {showBranding && (
                <div className="space-y-4 border-t border-border/60 px-4 py-4 animate-in fade-in slide-in-from-top-1">
                  <Field id="sm-title" label="Page title">
                    <input
                      id="sm-title"
                      value={pageTitle}
                      onChange={(e) => setPageTitle(e.target.value)}
                      placeholder="Shown on the share page"
                      maxLength={80}
                      className="ring-glow w-full rounded-lg border border-border/70 bg-background/60 px-3 py-2 text-sm focus:border-primary/50"
                    />
                  </Field>
                  <Field
                    id="sm-logo"
                    label="Logo URL"
                    icon={<ImagePlus className="h-3.5 w-3.5" />}
                    hint="https only"
                  >
                    <input
                      id="sm-logo"
                      type="url"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="https://…"
                      className="ring-glow w-full rounded-lg border border-border/70 bg-background/60 px-3 py-2 text-sm focus:border-primary/50"
                    />
                  </Field>
                  <Field id="sm-accent" label="Accent color">
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor="sm-accent-picker"
                        className="relative inline-flex h-10 w-12 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-border/70 ring-1 ring-inset ring-border/40"
                        style={{ backgroundColor: accent }}
                      >
                        <input
                          id="sm-accent-picker"
                          type="color"
                          value={accent}
                          onChange={(e) => setAccent(e.target.value)}
                          className="absolute inset-0 cursor-pointer opacity-0"
                          aria-label="Pick accent color"
                        />
                      </label>
                      <input
                        id="sm-accent"
                        value={accent}
                        onChange={(e) => setAccent(e.target.value)}
                        placeholder="#6366f1"
                        maxLength={7}
                        className="ring-glow flex-1 rounded-lg border border-border/70 bg-background/60 px-3 py-2 font-mono text-sm uppercase focus:border-primary/50"
                      />
                    </div>
                  </Field>
                </div>
              )}
            </div>
          </form>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border/60 bg-background/40 px-6 py-4 backdrop-blur">
          <p className="hidden text-xs text-muted-foreground sm:block">
            Links can be revoked or expired at any time.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="ring-glow rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-foreground/5 hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleCreate}
              className="ring-glow inline-flex items-center gap-1.5 rounded-lg bg-accent-gradient px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition hover:opacity-95"
            >
              <Plus className="h-4 w-4" />
              Create link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  icon,
  hint,
  children,
}: {
  id: string;
  label: string;
  icon?: React.ReactNode;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="flex items-center gap-1.5 text-xs font-semibold text-foreground/80"
      >
        {icon}
        {label}
        {hint && <span className="font-normal text-muted-foreground">· {hint}</span>}
      </label>
      {children}
    </div>
  );
}
