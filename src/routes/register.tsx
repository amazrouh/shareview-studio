import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";
import { Mail, Lock, Loader2, ArrowRight, AlertCircle, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { AuthLayout, AuthField } from "@/components/auth-layout";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

function scorePassword(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const strength = useMemo(() => scorePassword(password), [password]);
  const strengthLabel = ["Too weak", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = [
    "bg-destructive",
    "bg-destructive/80",
    "bg-amber-500",
    "bg-primary",
    "bg-emerald-500",
  ][strength];

  const mismatch = confirm.length > 0 && confirm !== password;
  const matches = confirm.length > 0 && confirm === password;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (mismatch) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
  }

  return (
    <AuthLayout
      title="Create account"
      subtitle={
        <>
          Already have one?{" "}
          <Link
            to="/login"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      {error && (
        <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthField
          id="email"
          label="Email"
          type="email"
          icon={Mail}
          placeholder="you@company.com"
          value={email}
          onChange={setEmail}
          autoComplete="email"
          required
        />

        <div className="space-y-2">
          <AuthField
            id="password"
            label="Password"
            type={showPw ? "text" : "password"}
            icon={Lock}
            placeholder="At least 8 characters"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            required
            rightSlot={
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground"
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            }
          />
          {password && (
            <div className="flex items-center gap-2.5">
              <div className="flex h-1.5 flex-1 gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-full transition-colors ${
                      i < strength ? strengthColor : "bg-border"
                    }`}
                  />
                ))}
              </div>
              <span className="w-14 text-right text-[11px] font-medium text-muted-foreground">
                {strengthLabel}
              </span>
            </div>
          )}
        </div>

        <AuthField
          id="confirm"
          label="Confirm password"
          type={showPw ? "text" : "password"}
          icon={Lock}
          placeholder="Repeat password"
          value={confirm}
          onChange={setConfirm}
          autoComplete="new-password"
          required
          rightSlot={
            matches ? (
              <CheckCircle2 className="mr-1.5 h-4 w-4 text-emerald-500" />
            ) : mismatch ? (
              <AlertCircle className="mr-1.5 h-4 w-4 text-destructive" />
            ) : null
          }
        />
        {mismatch && (
          <p className="-mt-3 text-xs text-destructive">Passwords do not match.</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="ring-glow group inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-accent-gradient text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40 hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating account…
            </>
          ) : (
            <>
              Create account
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
