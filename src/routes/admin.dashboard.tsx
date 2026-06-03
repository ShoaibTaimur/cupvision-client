import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin-shell";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/skeleton";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — CupVision Admin" }] }),
  component: Dashboard,
});

function Dashboard() {
  const stats = useQuery({
    queryKey: ["admin", "tournament"],
    queryFn: () => api.get<any>("/api/stats/tournament"),
  });
  return (
    <AdminShell>
      <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
      <p className="text-sm text-muted-foreground mb-6">Tournament overview.</p>
      {stats.isLoading ? (
        <Skeleton className="h-32" />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            ["Total matches", stats.data?.totalMatches],
            ["Completed", stats.data?.completed],
            ["Upcoming", stats.data?.upcoming],
            ["Live", stats.data?.live],
            ["Teams", stats.data?.teamsCount],
          ].map(([l, v]) => (
            <div key={l as string} className="bg-card border border-border rounded-lg p-4">
              <div className="text-xs text-muted-foreground">{l}</div>
              <div className="text-2xl font-bold tabular-nums mt-1">{v ?? 0}</div>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
