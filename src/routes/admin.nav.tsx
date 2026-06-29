import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin-shell";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/nav")({
  head: () => ({ meta: [{ title: "Navigation — CupVision Admin" }] }),
  component: NavAdmin,
});

const NAV_ITEMS: { to: string; label: string }[] = [
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

interface Settings {
  liveScoreTrackingEnabled?: boolean;
  disabledNav?: Record<string, { message: string }>;
}

function NavAdmin() {
  const qc = useQueryClient();
  const settingsQ = useQuery({
    queryKey: ["settings"],
    queryFn: () => api.get<Settings>("/api/settings"),
  });

  const [state, setState] = useState<Record<string, { disabled: boolean; message: string }>>({});

  useEffect(() => {
    if (!settingsQ.data) return;
    const dn = settingsQ.data.disabledNav || {};
    const next: Record<string, { disabled: boolean; message: string }> = {};
    for (const n of NAV_ITEMS) {
      next[n.to] = {
        disabled: !!dn[n.to],
        message: dn[n.to]?.message || "This section is temporarily unavailable.",
      };
    }
    setState(next);
  }, [settingsQ.data]);

  const save = useMutation({
    mutationFn: async () => {
      const disabledNav: Record<string, { message: string }> = {};
      for (const [to, v] of Object.entries(state)) {
        if (v.disabled) disabledNav[to] = { message: v.message };
      }
      return api.put("/api/settings", { disabledNav });
    },
    onSuccess: () => {
      toast.success("Navigation settings saved");
      qc.invalidateQueries({ queryKey: ["settings"] });
      qc.invalidateQueries({ queryKey: ["site-settings"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <AdminShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Navigation</h1>
        <p className="text-sm text-muted-foreground">
          Disable any public nav tab and set the message visitors see when they click it.
        </p>
      </div>

      {settingsQ.isLoading ? (
        <Skeleton className="h-64" />
      ) : (
        <div className="space-y-3 max-w-3xl">
          {NAV_ITEMS.map((n) => {
            const v = state[n.to] || { disabled: false, message: "" };
            return (
              <div
                key={n.to}
                className="bg-card border border-border rounded-lg p-4 flex flex-col gap-3 sm:flex-row sm:items-start"
              >
                <div className="flex items-center gap-3 sm:w-44 shrink-0">
                  <Switch
                    checked={!v.disabled}
                    onCheckedChange={(checked) =>
                      setState((s) => ({
                        ...s,
                        [n.to]: { ...v, disabled: !checked },
                      }))
                    }
                  />
                  <div>
                    <div className="font-medium">{n.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {v.disabled ? "Disabled" : "Enabled"}
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <Input
                    disabled={!v.disabled}
                    placeholder="Message shown when this tab is clicked"
                    value={v.message}
                    onChange={(e) =>
                      setState((s) => ({
                        ...s,
                        [n.to]: { ...v, message: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>
            );
          })}

          <div className="flex justify-end pt-2">
            <Button onClick={() => save.mutate()} disabled={save.isPending}>
              {save.isPending ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
