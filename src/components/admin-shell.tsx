import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { clearToken, getToken } from "@/lib/api";
import {
  LayoutDashboard,
  Calendar,
  Users,
  UserCog,
  Upload,
  LogOut,
  Trophy,
  Menu,
  X,
  Home,
  Radio,
  Shirt,
} from "lucide-react";

const NAV = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/matches", label: "Matches", icon: Calendar },
  { to: "/admin/channels", label: "Channels", icon: Radio },
  { to: "/admin/teams", label: "Teams", icon: Users },
  { to: "/admin/authors", label: "Authors", icon: UserCog },
  { to: "/admin/import", label: "Import Matches", icon: Upload },
  { to: "/admin/players-import", label: "Import Players", icon: Shirt },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  const closeMenu = () => {
    setClosing(true);
    window.setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 280);
  };

  useEffect(() => {
    if (!getToken()) {
      navigate({ to: "/admin/login" });
    } else {
      setReady(true);
    }
  }, [navigate]);

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  if (!ready) return null;

  const logOut = () => {
    clearToken();
    navigate({ to: "/admin/login" });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Desktop sidebar */}
      <aside className="w-60 shrink-0 border-r border-border bg-card hidden md:flex flex-col">
        <Link to="/" className="flex items-center gap-2 px-5 py-4 border-b border-border">
          <div className="size-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground">
            <Trophy className="size-5" />
          </div>
          <div>
            <div className="font-bold tracking-tight">CupVision</div>
            <div className="text-[10px] text-muted-foreground">Admin</div>
          </div>
        </Link>
        <nav className="flex-1 p-2 space-y-1">
          {NAV.map((n) => {
            const active = path === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}
              >
                <n.icon className="size-4" /> {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-2 space-y-1 border-t border-border">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <Home className="size-4" /> Back to site
          </Link>
          <button
            onClick={logOut}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <LogOut className="size-4" /> Log out
          </button>
        </div>
      </aside>

      {/* Mobile top bar with hamburger */}
      <header className="md:hidden sticky top-0 z-40 backdrop-blur-lg bg-background/80 border-b border-border w-full">
        <div className="h-14 px-4 flex items-center justify-between">
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <div className="size-7 rounded-md bg-primary flex items-center justify-center text-primary-foreground">
              <Trophy className="size-4" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-bold tracking-tight">CupVision</div>
              <div className="text-[10px] text-muted-foreground -mt-0.5">Admin</div>
            </div>
          </Link>
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center justify-center size-10 rounded-md border border-border bg-card hover:bg-secondary transition-colors"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </header>

      {/* Mobile slide-in drawer (portaled) */}
      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="md:hidden fixed inset-0 z-[100] overflow-hidden">
            <div
              className={`absolute inset-0 bg-background/60 backdrop-blur-md ${closing ? "animate-out fade-out duration-300" : "animate-in fade-in duration-200"}`}
              onClick={closeMenu}
            />
            <aside
              className={`absolute right-0 top-0 h-full w-72 max-w-[85%] bg-card border-l border-border shadow-2xl flex flex-col ${closing ? "animate-out slide-out-to-right duration-300" : "animate-in slide-in-from-right duration-300"}`}
            >
              <div className="flex items-center justify-between px-5 h-16 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground">
                    <Trophy className="size-5" />
                  </div>
                  <div className="leading-tight">
                    <div className="font-bold tracking-tight">CupVision</div>
                    <div className="text-[10px] text-muted-foreground -mt-0.5">Admin</div>
                  </div>
                </div>
                <button
                  onClick={closeMenu}
                  className="inline-flex items-center justify-center size-9 rounded-md hover:bg-secondary"
                  aria-label="Close menu"
                >
                  <X className="size-5" />
                </button>
              </div>
              <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {NAV.map((n) => {
                  const active = path === n.to;
                  return (
                    <Link
                      key={n.to}
                      to={n.to}
                      onClick={closeMenu}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${active ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}
                    >
                      <n.icon className="size-4" />
                      <span className="flex-1">{n.label}</span>
                    </Link>
                  );
                })}
              </nav>
              <div className="p-3 space-y-1 border-t border-border">
                <Link
                  to="/"
                  onClick={closeMenu}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <Home className="size-4" />
                  <span>Back to site</span>
                </Link>
                <button
                  onClick={() => {
                    closeMenu();
                    setTimeout(logOut, 290);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <LogOut className="size-4" />
                  <span>Log out</span>
                </button>
              </div>
            </aside>
          </div>,
          document.body,
        )}

      <main className="flex-1 p-6 overflow-x-hidden">{children}</main>
    </div>
  );
}
