import { Moon, SunMedium } from "lucide-react"
import { useTheme } from "./theme-provider"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-100 transition hover:border-cyan-300/40 hover:bg-cyan-300/10 hover:text-cyan-200"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <SunMedium size={18} /> : <Moon size={18} />}
    </button>
  )
}
