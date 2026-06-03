import { Link } from "@tanstack/react-router";
import { Trophy, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/matches", label: "Matches" },
  { to: "/scoreboard", label: "Scoreboard" },
  { to: "/timeline", label: "Timeline" },
  { to: "/authors", label: "Authors" },
  { to: "/about", label: "About" },
];

const activeCls = "px-3 py-1.5 rounded-md text-sm font-medium text-primary-foreground bg-primary";
const idleCls =
  "px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);

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

  return (
    <header className="sticky top-0 z-40 backdrop-blur-lg bg-background/80 border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="size-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground">
            <Trophy className="size-5" />
          </div>
          <div className="leading-tight">
            <div className="font-bold tracking-tight">CupVision</div>
            <div className="text-[10px] text-muted-foreground -mt-0.5">Track. Analyze. Follow.</div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={idleCls}
              activeProps={{ className: activeCls }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/login"
            className="hidden md:inline text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Admin
          </Link>
          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(true)}
            className="md:hidden inline-flex items-center justify-center size-10 rounded-md border border-border bg-card hover:bg-secondary transition-colors"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </div>

      {/* Mobile slide menu (portaled to body to escape header stacking context) */}
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
                  <span className="font-bold tracking-tight">CupVision</span>
                </div>
                <button
                  onClick={closeMenu}
                  className="inline-flex items-center justify-center size-9 rounded-md hover:bg-secondary"
                  aria-label="Close menu"
                >
                  <X className="size-5" />
                </button>
              </div>
              <nav className="flex-1 p-3 space-y-1">
                {NAV.map((n) => (
                  <Link
                    key={n.to}
                    to={n.to}
                    onClick={closeMenu}
                    className="flex items-center justify-between px-4 py-3 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    activeProps={{
                      className:
                        "flex items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold text-primary-foreground bg-primary",
                    }}
                    activeOptions={{ exact: n.to === "/" }}
                  >
                    <span>{n.label}</span>
                    <span className="text-xs opacity-70">→</span>
                  </Link>
                ))}
              </nav>
              <div className="p-4 border-t border-border">
                <Link
                  to="/admin/login"
                  onClick={closeMenu}
                  className="block text-center text-xs text-muted-foreground hover:text-foreground py-2"
                >
                  Admin login
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
  return (
    <footer className="border-t border-border mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 text-xs text-muted-foreground flex flex-wrap items-center justify-between gap-4">
        <div>© {new Date().getFullYear()} CupVision — FIFA World Cup 2026 tracker</div>
        <div>Built with React, TypeScript, Express, MongoDB</div>
      </div>
    </footer>
  );
}
