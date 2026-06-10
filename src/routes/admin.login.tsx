import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api, getToken, setToken } from "@/lib/api";
import { toast } from "sonner";
import { ArrowRight, ShieldCheck, TimerReset, Trophy } from "lucide-react";
import { SectionReveal } from "@/components/section-reveal";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Admin login — CupVision" }] }),
  component: AdminLogin,
});

function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (getToken()) navigate({ to: "/admin/dashboard" });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post<{ token: string }>("/api/auth/login", { username, password });
      setToken(res.token);
      toast.success("Welcome back");
      navigate({ to: "/admin/dashboard" });
    } catch (e: any) {
      toast.error(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(97,194,255,0.2),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))]">
      <SiteHeader />
      <SectionReveal
        delay={0.06}
        className="relative flex min-h-screen items-center overflow-hidden px-4 pb-10 pt-24 sm:px-6 sm:pb-14 sm:pt-28"
      >
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-card/75 p-8 shadow-[0_24px_90px_rgba(0,0,0,0.22)] backdrop-blur xl:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(117,197,255,0.16),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(83,214,168,0.14),transparent_30%)]" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                <ShieldCheck className="size-3.5" />
                Admin access
              </div>
              <h1 className="mt-6 max-w-xl text-4xl font-black tracking-tight text-foreground sm:text-5xl">
                Match ops. Score control. Publishing desk.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                Sign in to manage live match cards, channel updates, author records, tournament
                data.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-border/70 bg-background/70 p-5">
                  <div className="flex items-center gap-3 text-sm font-semibold text-foreground">
                    <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                      <TimerReset className="size-5" />
                    </div>
                    Fast control
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    Update channels, review content, push tournament changes without extra steps.
                  </p>
                </div>
                <div className="rounded-3xl border border-border/70 bg-background/70 p-5">
                  <div className="flex items-center gap-3 text-sm font-semibold text-foreground">
                    <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                      <Trophy className="size-5" />
                    </div>
                    CupVision hub
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    Same data spine powering scoreboard, squads, timeline, watch experience.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <form
            onSubmit={onSubmit}
            className="rounded-[2rem] border border-border/70 bg-card/92 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.22)] backdrop-blur sm:p-8"
          >
            <div className="mb-8">
              <div className="flex size-14 items-center justify-center rounded-[1.4rem] bg-primary text-primary-foreground shadow-[0_16px_40px_rgba(117,197,255,0.25)]">
                <Trophy className="size-6" />
              </div>
              <h2 className="mt-5 text-2xl font-black tracking-tight text-foreground">
                Admin login
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Use backend credentials. Session token stored in browser for dashboard access.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  placeholder="Enter admin username"
                  className="mt-2 h-12 w-full rounded-2xl border border-border bg-background/70 px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="Enter admin password"
                  className="mt-2 h-12 w-full rounded-2xl border border-border bg-background/70 px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
              {!loading && <ArrowRight className="size-4" />}
            </button>

            <p className="mt-4 text-center text-[11px] leading-5 text-muted-foreground">
              Credentials checked against backend env vars.
            </p>
          </form>
        </div>
      </SectionReveal>
      <SiteFooter />
    </div>
  );
}
