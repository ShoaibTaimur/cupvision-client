import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { apiRequest } from "@/lib/api"
import { storeAdminToken } from "@/lib/auth"

type LoginResponse = {
  token: string
  admin: {
    id: string
    username: string
  }
}

export function AdminLoginPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState("admin")
  const [password, setPassword] = useState("admin123")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const data = await apiRequest<LoginResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      })

      storeAdminToken(data.token)
      navigate("/admin")
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Login failed"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-[2rem] border border-white/10 bg-slate-950/60 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
      <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/80">
        Admin Access
      </p>
      <h2 className="mt-3 text-3xl font-semibold text-white">Login</h2>
      <p className="mt-3 text-sm leading-6 text-zinc-300">
        Default bootstrap account auto-creates when `admins` collection empty.
      </p>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-sm text-zinc-300">Username</span>
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-300/50"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm text-zinc-300">Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-300/50"
          />
        </label>
        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  )
}
