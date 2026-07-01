import { Link } from "@tanstack/react-router";
import { Trophy, Menu, X, ArrowRight, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { getToken } from "@/lib/api";
import { api } from "@/lib/api";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/watch", label: "Watch" },
  { to: "/matches", label: "Matches" },
  { to: "/bracket", label: "Bracket" },
  { to: "/scoreboard", label: "Scoreboard" },
  { to: "/squads", label: "Squads" },
  { to: "/timeline", label: "Timeline" },
  { to: "/authors", label: "Authors" },
  { to: "/about", label: "About" },
];

const activeCls =
  "rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_rgba(62,156,255,0.24)]";
const idleCls =
  "rounded-full px-4 py-2 text-sm font-medium text-white/72 transition-colors hover:bg-white/10 hover:text-white";

interface SiteSettings {
  disabledNav?: Record<string, { message: string }>;
  hiddenNav?: Record<string, boolean>;
}

function useSiteSettings() {
  return useQuery({
    queryKey: ["site-settings"],
    queryFn: () => api.get<SiteSettings>("/api/settings"),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}

function handleDisabledClick(e: React.MouseEvent, message: string) {
  e.preventDefault();
  e.stopPropagation();
  toast(message || "This section is temporarily unavailable.", { icon: "🔒" });
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const settingsQ = useSiteSettings();
  const disabled = settingsQ.data?.disabledNav || {};
  const hidden = settingsQ.data?.hiddenNav || {};
  const visibleNav = NAV.filter((item) => !hidden[item.to]);

  useEffect(() => {
    const syncAdminState = () => setAdminLoggedIn(!!getToken());

    syncAdminState();
    window.addEventListener("focus", syncAdminState);
    window.addEventListener("storage", syncAdminState);
    return () => {
      window.removeEventListener("focus", syncAdminState);
      window.removeEventListener("storage", syncAdminState);
    };
  }, []);

  const adminHref = adminLoggedIn ? "/admin/dashboard" : "/admin/login";
  const adminLabel = adminLoggedIn ? "Dashboard" : "Admin";
  const mobileAdminLabel = adminLoggedIn ? "Dashboard" : "Admin login";

  const closeMenu = () => {
    setClosing(true);
    window.setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 280);
  };

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={`mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 transition-all duration-300 sm:px-6 ${
          scrolled
            ? "rounded-full border border-white/10 bg-white/8 backdrop-blur-xl shadow-[0_16px_40px_rgba(0,0,0,0.24)] mt-3"
            : "mt-0"
        }`}
      >
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <div
            className={`flex size-11 shrink-0 items-center justify-center rounded-2xl border text-primary backdrop-blur-md transition-colors ${scrolled ? "border-white/10 bg-white/6" : "border-transparent bg-white/0"}`}
          >
            <Trophy className="size-5" />
          </div>
          <div className="min-w-0 leading-tight">
            <div className="text-lg font-black tracking-tight text-white">CupVision</div>
            <div className="text-[10px] uppercase tracking-[0.28em] text-white/60">
              World Cup live radar
            </div>
          </div>
        </Link>

        <nav
          className={`hidden items-center gap-1 rounded-full p-1.5 transition-all duration-300 lg:flex ${scrolled ? "border border-white/10 bg-white/6 backdrop-blur-md" : "border border-transparent bg-transparent"}`}
        >
          {visibleNav.map((n) => {
            const d = disabled[n.to];
            if (d) {
              return (
                <button
                  key={n.to}
                  type="button"
                  onClick={(e) => handleDisabledClick(e, d.message)}
                  className="group inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-white/40 transition-colors hover:bg-white/5 hover:text-white/70"
                  title={d.message}
                >
                  <Lock className="size-3.5 transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110 motion-safe:animate-pulse" />
                  <span className="line-through decoration-white/30">{n.label}</span>
                </button>
              );
            }
            return (
              <Link
                key={n.to}
                to={n.to}
                className={idleCls}
                activeProps={{ className: activeCls }}
                activeOptions={{ exact: n.to === "/" }}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 lg:flex">
            <Link
              to={adminHref}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/10 ${scrolled ? "border border-white/10 bg-white/6 backdrop-blur-md" : "border border-transparent bg-transparent"}`}
            >
              {adminLabel}
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <button
            onClick={() => setOpen(true)}
            className={`inline-flex size-10 items-center justify-center rounded-full text-white transition-all duration-300 hover:bg-white/10 lg:hidden ${scrolled ? "border border-white/10 bg-white/6 backdrop-blur-md" : "border border-transparent bg-transparent"}`}
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </div>

      {/* Slide menu (portaled to body to escape header stacking context) */}
      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[100] overflow-hidden">
            <div
              className={`absolute inset-0 bg-background/60 backdrop-blur-md ${closing ? "animate-out fade-out duration-300" : "animate-in fade-in duration-200"}`}
              onClick={closeMenu}
            />
            <aside
              className={`absolute right-0 top-0 flex h-full w-72 max-w-[85%] flex-col border-l border-border bg-card shadow-2xl ${closing ? "animate-out slide-out-to-right duration-300" : "animate-in slide-in-from-right duration-300"}`}
            >
              <div className="flex h-16 items-center justify-between border-b border-border px-5">
                <div className="flex items-center gap-2">
                  <div className="flex size-9 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                    <Trophy className="size-5" />
                  </div>
                  <span className="font-bold tracking-tight">CupVision</span>
                </div>
                <button
                  onClick={closeMenu}
                  className="inline-flex size-9 items-center justify-center rounded-full hover:bg-secondary"
                  aria-label="Close menu"
                >
                  <X className="size-5" />
                </button>
              </div>
              <nav className="flex-1 space-y-1 p-3">
                {visibleNav.map((n) => {
                  const d = disabled[n.to];
                  if (d) {
                    return (
                      <button
                        key={n.to}
                        type="button"
                        onClick={(e) => {
                          handleDisabledClick(e, d.message);
                        }}
                        className="group flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm text-muted-foreground/60 transition-colors hover:bg-secondary"
                      >
                        <span className="flex items-center gap-2">
                          <Lock className="size-3.5 transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110 motion-safe:animate-pulse" />
                          <span className="line-through decoration-muted-foreground/50">
                            {n.label}
                          </span>
                        </span>
                        <span className="text-xs opacity-70">🔒</span>
                      </button>
                    );
                  }
                  return (
                    <Link
                      key={n.to}
                      to={n.to}
                      onClick={closeMenu}
                      className="flex items-center justify-between rounded-xl px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      activeProps={{
                        className:
                          "flex items-center justify-between rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground",
                      }}
                      activeOptions={{ exact: n.to === "/" }}
                    >
                      <span>{n.label}</span>
                      <span className="text-xs opacity-70">→</span>
                    </Link>
                  );
                })}
              </nav>
              <div className="border-t border-border p-4">
                <Link
                  to={adminHref}
                  onClick={closeMenu}
                  className="flex items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-3 text-sm font-semibold transition-colors hover:bg-secondary"
                >
                  {mobileAdminLabel}
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </aside>
          </div>,
          document.body,
        )}
    </header>
  );
}

export function SiteFooter() {
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const settingsQ = useSiteSettings();
  const disabled = settingsQ.data?.disabledNav || {};
  const hidden = settingsQ.data?.hiddenNav || {};
  const visibleNav = NAV.filter((item) => !hidden[item.to]);

  useEffect(() => {
    const syncAdminState = () => setAdminLoggedIn(!!getToken());

    syncAdminState();
    window.addEventListener("focus", syncAdminState);
    window.addEventListener("storage", syncAdminState);
    return () => {
      window.removeEventListener("focus", syncAdminState);
      window.removeEventListener("storage", syncAdminState);
    };
  }, []);

  const adminHref = adminLoggedIn ? "/admin/dashboard" : "/admin/login";
  const adminLabel = adminLoggedIn ? "Dashboard" : "Admin";

  return (
    <footer className="mt-16 border-t border-border/80">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                <Trophy className="size-5" />
              </div>
              <div>
                <div className="text-lg font-black tracking-tight text-foreground">CupVision</div>
                <div className="text-xs text-muted-foreground">World Cup tracker</div>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Live status, fixtures, scoreboard, squads, timeline. Clean tournament companion.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground md:justify-end">
            {visibleNav.map((item) => {
              const d = disabled[item.to];
              if (d) {
                return (
                  <button
                    key={item.to}
                    type="button"
                    onClick={(e) => handleDisabledClick(e, d.message)}
                    className="inline-flex items-center gap-1.5 text-muted-foreground/60 transition-colors hover:text-foreground/80"
                    title={d.message}
                  >
                    <Lock className="size-3.5" />
                    <span className="line-through decoration-muted-foreground/50">
                      {item.label}
                    </span>
                  </button>
                );
              }

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className="transition-colors hover:text-foreground"
                  activeProps={{ className: "font-semibold text-foreground" }}
                  activeOptions={{ exact: item.to === "/" }}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link to={adminHref} className="font-semibold text-primary">
              {adminLabel}
            </Link>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-5 text-xs text-muted-foreground">
          <div>© {new Date().getFullYear()} CupVision</div>
          <div>Built with React, TypeScript, Express, MongoDB</div>
        </div>
      </div>
    </footer>
  );
}
