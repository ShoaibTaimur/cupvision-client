import { NavLink, Outlet } from "react-router-dom"
import { ThemeToggle } from "./theme-toggle"
import { cn } from "@/lib/utils"

const navItems = [
  { to: "/", label: "Home" },
  { to: "/matches", label: "Matches" },
  { to: "/scoreboard", label: "Scoreboard" },
  { to: "/timeline", label: "Timeline" },
  { to: "/authors", label: "Authors" },
  { to: "/about", label: "About" },
  { to: "/admin/login", label: "Admin" },
]

export function SiteShell() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.14),_transparent_30%),linear-gradient(180deg,_rgba(10,17,40,1)_0%,_rgba(3,7,18,1)_100%)] text-zinc-50">
      <header className="border-b border-white/10 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/80">
              CupVision
            </p>
            <h1 className="text-lg font-semibold text-white">
              Track. Analyze. Follow.
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 md:flex">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "rounded-full px-4 py-2 text-sm text-zinc-300 transition hover:text-white",
                      isActive && "bg-cyan-400/15 text-cyan-200"
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <Outlet />
      </main>
    </div>
  )
}
