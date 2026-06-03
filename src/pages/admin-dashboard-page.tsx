import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { apiRequest } from "@/lib/api"
import { clearStoredAdminToken, getStoredAdminToken } from "@/lib/auth"
import { SectionCard } from "@/components/section-card"

type AdminMeResponse = {
  admin: {
    id: string
    username: string
  }
}

type AdminSummaryResponse = {
  message: string
  modules: string[]
}

export function AdminDashboardPage() {
  const token = getStoredAdminToken()
  const [adminName, setAdminName] = useState<string | null>(null)
  const [modules, setModules] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      return
    }

    let isActive = true

    async function loadAdminData() {
      try {
        const [me, summary] = await Promise.all([
          apiRequest<AdminMeResponse>("/api/admin/me", { token }),
          apiRequest<AdminSummaryResponse>("/api/admin/summary", { token }),
        ])

        if (!isActive) {
          return
        }

        setAdminName(me.admin.username)
        setModules(summary.modules)
      } catch (requestError) {
        if (!isActive) {
          return
        }

        clearStoredAdminToken()
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Failed to load admin data"
        )
      }
    }

    void loadAdminData()

    return () => {
      isActive = false
    }
  }, [token])

  if (!token) {
    return <Navigate to="/admin/login" replace />
  }

  if (error) {
    return <Navigate to="/admin/login" replace state={{ error }} />
  }

  return (
    <div className="space-y-6">
      <SectionCard
        title="Admin Dashboard"
        description={`Authenticated as ${adminName ?? "loading..."}. Foundation APIs live; CRUD modules next.`}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {modules.map((module) => (
            <div
              key={module}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-zinc-200"
            >
              {module}
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}
