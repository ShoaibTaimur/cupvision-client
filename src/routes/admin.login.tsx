import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { api, setToken } from "@/lib/api";
import { toast } from "sonner";
import { Trophy } from "lucide-react";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Admin login — CupVision" }] }),
  component: AdminLogin,
});

function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-card border border-border rounded-lg p-6 space-y-4">
        <div className="text-center mb-2">
          <div className="mx-auto size-12 rounded-lg bg-primary flex items-center justify-center text-primary-foreground mb-3">
            <Trophy className="size-6" />
          </div>
          <h1 className="text-xl font-bold">Admin login</h1>
          <p className="text-xs text-muted-foreground mt-1">CupVision admin dashboard</p>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
            className="w-full mt-1 bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full mt-1 bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-primary-foreground rounded-md py-2 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
        <p className="text-[11px] text-muted-foreground text-center">
          Credentials are checked against backend env vars.
        </p>
      </form>
    </div>
  );
}
