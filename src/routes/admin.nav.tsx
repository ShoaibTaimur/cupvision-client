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
  hiddenNav?: Record<string, boolean>;
}

function NavAdmin() {
  const qc = useQueryClient();
  const settingsQ = useQuery({
    queryKey: ["settings"],
    queryFn: () => api.get<Settings>("/api/settings"),
  });

  const [state, setState] = useState<
    Record<string, { disabled: boolean; hidden: boolean; message: string }>
  >({});

  useEffect(() => {
    if (!settingsQ.data) return;
    const dn = settingsQ.data.disabledNav || {};
    const hn = settingsQ.data.hiddenNav || {};
    const next: Record<string, { disabled: boolean; hidden: boolean; message: string }> = {};
    for (const n of NAV_ITEMS) {
      next[n.to] = {
        disabled: !!dn[n.to],
        hidden: !!hn[n.to],
        message: dn[n.to]?.message || "This section is temporarily unavailable.",
      };
    }
    setState(next);
  }, [settingsQ.data]);

  const save = useMutation({
    mutationFn: async () => {
      const disabledNav: Record<string, { message: string }> = {};
      const hiddenNav: Record<string, boolean> = {};
      for (const [to, v] of Object.entries(state)) {
        if (v.disabled) disabledNav[to] = { message: v.message };
        if (v.hidden) hiddenNav[to] = true;
      }
      return api.put("/api/settings", { disabledNav, hiddenNav });
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
          Control public tab access, click message, menu visibility.
        </p>
      </div>

      {settingsQ.isLoading ? (
        <Skeleton className="h-64" />
      ) : (
        <div className="space-y-3 max-w-3xl">
          {NAV_ITEMS.map((n) => {
            const v = state[n.to] || { disabled: false, hidden: false, message: "" };
            return (
              <div
                key={n.to}
                className="bg-card border border-border rounded-lg p-4 flex flex-col gap-3 sm:flex-row sm:items-start"
              >
                <div className="sm:w-52 shrink-0">
                  <div>
                    <div className="font-medium">{n.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {v.disabled ? "Access off" : "Access on"} · {v.hidden ? "Menu hidden" : "Menu shown"}
                    </div>
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm">
                      <Switch
                        checked={!v.disabled}
                        onCheckedChange={(checked) =>
                          setState((s) => ({
                            ...s,
                            [n.to]: { ...v, disabled: !checked },
                          }))
                        }
                      />
                      <span>{v.disabled ? "Disabled" : "Enabled"}</span>
                    </label>
                    <Button
                      type="button"
                      variant={v.hidden ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        setState((s) => ({
                          ...s,
                          [n.to]: { ...v, hidden: !v.hidden },
                        }))
                      }
                    >
                      {v.hidden ? "Show in menu" : "Hide from menu"}
                    </Button>
                  </div>
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
