import { Link } from "@tanstack/react-router";
import { ShieldCheck, Sparkles, Share2, Layers, Zap } from "lucide-react";
import type { ReactNode } from "react";

interface AuthLayoutProps {
  title: string;
  subtitle: ReactNode;
  children: ReactNode;
}

const FEATURES = [
  {
    icon: Share2,
    title: "Branded share links",
    desc: "Custom logos, colors, and titles for every collection.",
  },
  {
    icon: ShieldCheck,
    title: "Password protection",
    desc: "Lock sensitive shares with expiring access tokens.",
  },
  {
    icon: Layers,
    title: "Organized library",
    desc: "Folders, thumbnails, and instant previews built-in.",
  },
  {
    icon: Zap,
    title: "Fast and lightweight",
    desc: "Edge-deployed, optimized for any device or network.",
  },
];

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-app-gradient">
      {/* Ambient blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-32 h-[28rem] w-[28rem] rounded-full bg-accent-gradient opacity-40 blur-3xl animate-float-slow"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-24 h-[26rem] w-[26rem] rounded-full bg-accent-gradient opacity-30 blur-3xl animate-float-slow"
        style={{ animationDelay: "-7s" }}
      />

      <div className="relative mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 lg:grid-cols-2">
        {/* Left: branding */}
        <aside className="relative hidden flex-col justify-between overflow-hidden p-10 lg:flex xl:p-14">
          <div className="absolute inset-6 rounded-3xl bg-accent-gradient opacity-90" />
          <div className="absolute inset-6 rounded-3xl bg-[radial-gradient(ellipse_at_top_right,white_0%,transparent_45%)] opacity-20" />

          <div className="relative z-10 flex h-full flex-col justify-between text-white">
            <Link to="/" className="flex items-center gap-2.5 group w-fit">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/30 backdrop-blur-md transition-transform group-hover:scale-105">
                <Sparkles className="h-5 w-5" />
              </span>
              <span className="text-lg font-semibold tracking-tight">Share Showcase</span>
            </Link>

            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">
                  Share files beautifully.
                  <br />
                  <span className="text-white/75">No friction.</span>
                </h2>
                <p className="max-w-md text-base leading-relaxed text-white/80">
                  Curate, brand, and protect every file you share — from one calm,
                  glassy library.
                </p>
              </div>

              <ul className="grid max-w-md gap-3">
                {FEATURES.map((f) => (
                  <li
                    key={f.title}
                    className="flex items-start gap-3 rounded-xl bg-white/10 p-3.5 ring-1 ring-white/15 backdrop-blur-md"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/25">
                      <f.icon className="h-4.5 w-4.5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{f.title}</p>
                      <p className="text-xs text-white/70">{f.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-xs text-white/60">
              © {new Date().getFullYear()} Share Showcase · Built for creators
            </p>
          </div>
        </aside>

        {/* Right: form */}
        <main className="relative flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            {/* Mobile brand */}
            <Link
              to="/"
              className="mb-8 flex items-center gap-2.5 lg:hidden"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-gradient text-white shadow-md">
                <Sparkles className="h-5 w-5" />
              </span>
              <span className="text-lg font-semibold tracking-tight text-foreground">
                Share Showcase
              </span>
            </Link>

            <div className="glass-card rounded-3xl p-8 sm:p-10">
              <header className="mb-7 space-y-1.5">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[1.7rem]">
                  {title}
                </h1>
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              </header>
              {children}
            </div>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              By continuing you agree to our{" "}
              <a href="#" className="underline-offset-2 hover:text-foreground hover:underline">
                Terms
              </a>{" "}
              and{" "}
              <a href="#" className="underline-offset-2 hover:text-foreground hover:underline">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

interface AuthFieldProps {
  id: string;
  label: string;
  type?: string;
  icon: React.ComponentType<{ className?: string }>;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  required?: boolean;
  rightSlot?: ReactNode;
}

export function AuthField({
  id,
  label,
  type = "text",
  icon: Icon,
  placeholder,
  value,
  onChange,
  autoComplete,
  required,
  rightSlot,
}: AuthFieldProps) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="text-xs font-medium tracking-wide text-foreground/80 uppercase"
      >
        {label}
      </label>
      <div className="group relative">
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          className="ring-glow w-full rounded-xl border border-border/70 bg-background/60 py-2.5 pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground/70 shadow-sm transition-colors hover:border-primary/40 focus:border-primary/60 focus:outline-none"
        />
        {rightSlot && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">{rightSlot}</div>
        )}
      </div>
    </div>
  );
}
