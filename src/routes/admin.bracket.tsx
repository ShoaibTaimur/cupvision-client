import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { AdminShell } from "@/components/admin-shell";
import { api, HealScoresResult, MatchAdvance, MatchConfig, MatchConfigSyncResult, MatchSeed, Team } from "@/lib/api";
import { Skeleton } from "@/components/skeleton";
import { toast } from "sonner";
import { Field } from "./admin.teams";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, RefreshCcw, Stethoscope, Trash2 } from "lucide-react";
import { getFormDate, getFormTime } from "@/lib/date";

export const Route = createFileRoute("/admin/bracket")({
  head: () => ({ meta: [{ title: "Bracket Config — CupVision Admin" }] }),
  component: BracketAdmin,
});

const emptySeed: MatchSeed = { kind: "placeholder", label: "TBD" };
const emptyAdvance: MatchAdvance = { outcome: "winner", toMatchNumber: 1, slot: "home" };

function BracketAdmin() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number | null>(null);
  const configs = useQuery({
    queryKey: ["match-configs"],
    queryFn: () => api.authed<MatchConfig[]>("/api/match-configs"),
  });
  const teams = useQuery({ queryKey: ["teams"], queryFn: () => api.get<Team[]>("/api/teams") });
  const activeConfig = useMemo(
    () => configs.data?.find((row) => row.matchNumber === selected) || null,
    [configs.data, selected],
  );
  const [form, setForm] = useState<MatchConfig | null>(null);

  const list = useMemo(() => {
    const rows = configs.data || [];
    if (!search.trim()) return rows;
    return rows.filter((row) => String(row.matchNumber).includes(search.trim()));
  }, [configs.data, search]);

  const save = useMutation({
    mutationFn: async () => {
      if (!form) return;
      return api.put(`/api/match-configs/${form.matchNumber}`, form);
    },
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["match-configs"] });
      qc.invalidateQueries({ queryKey: ["admin-matches"] });
      qc.invalidateQueries({ queryKey: ["bracket"] });
    },
    onError: (e: any) => toast.error(e.message),
  });
  const syncFifa = useMutation({
    mutationFn: () => api.post<MatchConfigSyncResult>("/api/match-configs/sync-fifa", {}, true),
    onSuccess: (data) => {
      toast.success(`FIFA sync ok: ${data.synced} cfg`);
      qc.invalidateQueries({ queryKey: ["match-configs"] });
      qc.invalidateQueries({ queryKey: ["admin-matches"] });
      qc.invalidateQueries({ queryKey: ["bracket"] });
      if (selected != null) {
        const next = configs.data?.find((row) => row.matchNumber === selected);
        if (next) startEdit(next);
      }
    },
    onError: (e: any) => toast.error(e.message),
  });
  const healScores = useMutation({
    mutationFn: () => api.post<HealScoresResult>("/api/match-configs/heal-scores", {}, true),
    onSuccess: (data) => {
      toast.success(`Healed ${data.updated} scores`);
      qc.invalidateQueries({ queryKey: ["match-configs"] });
      qc.invalidateQueries({ queryKey: ["admin-matches"] });
      qc.invalidateQueries({ queryKey: ["bracket"] });
      if (data.errors.length) {
        toast.error(`${data.errors.length} provider errs`);
      }
    },
    onError: (e: any) => toast.error(e.message),
  });

  const startEdit = (config: MatchConfig) => {
    setSelected(config.matchNumber);
    const next = JSON.parse(JSON.stringify(config)) as MatchConfig;
    next.group = next.group || "";
    next.date = getFormDate(next.date);
    next.time = getFormTime(config.date, next.time);
    setForm(next);
  };

  return (
    <AdminShell>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Bracket Config</h1>
          <p className="text-sm text-muted-foreground">DB source truth by match number.</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => healScores.mutate()} disabled={healScores.isPending}>
            <Stethoscope className={`mr-2 size-4 ${healScores.isPending ? "animate-spin" : ""}`} />
            Heal Scores
          </Button>
          <Button type="button" variant="outline" onClick={() => syncFifa.mutate()} disabled={syncFifa.isPending}>
            <RefreshCcw className={`mr-2 size-4 ${syncFifa.isPending ? "animate-spin" : ""}`} />
            Sync FIFA
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="rounded-lg border border-border bg-card p-4">
          <Field label="Search match #">
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="73" />
          </Field>
          <div className="mt-4 max-h-[70vh] space-y-2 overflow-y-auto">
            {configs.isLoading ? (
              <Skeleton className="h-48" />
            ) : (
              list.map((row) => (
                <button
                  key={row.matchNumber}
                  type="button"
                  onClick={() => startEdit(row)}
                  className={`w-full rounded-lg border px-3 py-2 text-left transition-colors ${
                    selected === row.matchNumber
                      ? "border-primary bg-primary/10"
                      : "border-border bg-background hover:bg-secondary"
                  }`}
                >
                  <div className="text-sm font-semibold">Match {row.matchNumber}</div>
                  <div className="text-xs text-muted-foreground">{row.stage}</div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          {!form || !activeConfig ? (
            <div className="text-sm text-muted-foreground">Select match config.</div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                save.mutate();
              }}
              className="space-y-5"
            >
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Match #">
                  <Input value={String(form.matchNumber)} disabled />
                </Field>
                <Field label="Active">
                  <div className="flex h-10 items-center">
                    <Switch
                      checked={form.isActive}
                      onCheckedChange={(value) => setForm({ ...form, isActive: value })}
                    />
                  </div>
                </Field>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Stage">
                  <Input
                    value={form.stage}
                    onChange={(e) => setForm({ ...form, stage: e.target.value })}
                  />
                </Field>
                <Field label="Group">
                  <Input
                    value={form.group || ""}
                    onChange={(e) => setForm({ ...form, group: e.target.value.toUpperCase() })}
                  />
                </Field>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Date">
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </Field>
                <Field label="Time">
                  <Input
                    type="time"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                  />
                </Field>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Stadium">
                  <Input
                    value={form.stadium}
                    onChange={(e) => setForm({ ...form, stadium: e.target.value })}
                  />
                </Field>
                <Field label="City">
                  <Input
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                  />
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <SeedEditor
                  label="Home seed"
                  seed={form.homeSeed || emptySeed}
                  teams={teams.data || []}
                  onChange={(seed) => setForm({ ...form, homeSeed: seed })}
                />
                <SeedEditor
                  label="Away seed"
                  seed={form.awaySeed || emptySeed}
                  teams={teams.data || []}
                  onChange={(seed) => setForm({ ...form, awaySeed: seed })}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold">Advances</h2>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setForm({
                        ...form,
                        advances: [...(form.advances || []), { ...emptyAdvance, toMatchNumber: form.matchNumber }],
                      })
                    }
                  >
                    <Plus className="mr-1 size-3" /> Add
                  </Button>
                </div>
                {(form.advances || []).map((advance, index) => (
                  <div key={`${advance.toMatchNumber}-${index}`} className="grid gap-3 rounded-lg border border-border p-3 md:grid-cols-4">
                    <Field label="Outcome">
                      <Select
                        value={advance.outcome}
                        onValueChange={(value) => {
                          const next = [...(form.advances || [])];
                          next[index] = { ...advance, outcome: value as MatchAdvance["outcome"] };
                          setForm({ ...form, advances: next });
                        }}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="winner">winner</SelectItem>
                          <SelectItem value="loser">loser</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="To match #">
                      <Input
                        type="number"
                        min={1}
                        value={String(advance.toMatchNumber)}
                        onChange={(e) => {
                          const next = [...(form.advances || [])];
                          next[index] = { ...advance, toMatchNumber: Number(e.target.value) };
                          setForm({ ...form, advances: next });
                        }}
                      />
                    </Field>
                    <Field label="Slot">
                      <Select
                        value={advance.slot}
                        onValueChange={(value) => {
                          const next = [...(form.advances || [])];
                          next[index] = { ...advance, slot: value as MatchAdvance["slot"] };
                          setForm({ ...form, advances: next });
                        }}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="home">home</SelectItem>
                          <SelectItem value="away">away</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const next = [...(form.advances || [])];
                          next.splice(index, 1);
                          setForm({ ...form, advances: next });
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 rounded-lg border border-border p-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold">Bracket placement</h2>
                  <Switch
                    checked={form.bracket?.enabled || false}
                    onCheckedChange={(value) =>
                      setForm({
                        ...form,
                        bracket: {
                          enabled: value,
                          roundKey: form.bracket?.roundKey || "r32",
                          side: form.bracket?.side || "left",
                          order: form.bracket?.order || 0,
                        },
                      })
                    }
                  />
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <Field label="Round">
                    <Select
                      value={form.bracket?.roundKey || "r32"}
                      onValueChange={(value) =>
                        setForm({
                          ...form,
                          bracket: {
                            enabled: form.bracket?.enabled || false,
                            roundKey: value as NonNullable<MatchConfig["bracket"]>["roundKey"],
                            side: form.bracket?.side || "left",
                            order: form.bracket?.order || 0,
                          },
                        })
                      }
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="r32">r32</SelectItem>
                        <SelectItem value="r16">r16</SelectItem>
                        <SelectItem value="qf">qf</SelectItem>
                        <SelectItem value="sf">sf</SelectItem>
                        <SelectItem value="third">third</SelectItem>
                        <SelectItem value="final">final</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Side">
                    <Select
                      value={form.bracket?.side || "left"}
                      onValueChange={(value) =>
                        setForm({
                          ...form,
                          bracket: {
                            enabled: form.bracket?.enabled || false,
                            roundKey: form.bracket?.roundKey || "r32",
                            side: value as NonNullable<MatchConfig["bracket"]>["side"],
                            order: form.bracket?.order || 0,
                          },
                        })
                      }
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">left</SelectItem>
                        <SelectItem value="right">right</SelectItem>
                        <SelectItem value="center">center</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Order">
                    <Input
                      type="number"
                      min={0}
                      value={String(form.bracket?.order || 0)}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          bracket: {
                            enabled: form.bracket?.enabled || false,
                            roundKey: form.bracket?.roundKey || "r32",
                            side: form.bracket?.side || "left",
                            order: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </Field>
                </div>
              </div>

              <Button disabled={save.isPending}>
                {save.isPending ? "Saving..." : `Save match ${form.matchNumber}`}
              </Button>
            </form>
          )}
        </div>
      </div>
    </AdminShell>
  );
}

function SeedEditor({
  label,
  seed,
  teams,
  onChange,
}: {
  label: string;
  seed: MatchSeed;
  teams: Team[];
  onChange: (seed: MatchSeed) => void;
}) {
  return (
    <div className="space-y-3 rounded-lg border border-border p-4">
      <h2 className="text-sm font-semibold">{label}</h2>
      <Field label="Kind">
        <Select
          value={seed.kind}
          onValueChange={(value) => onChange({ ...seed, kind: value as MatchSeed["kind"] })}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="placeholder">placeholder</SelectItem>
            <SelectItem value="team">team</SelectItem>
            <SelectItem value="winner">winner</SelectItem>
            <SelectItem value="loser">loser</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      {seed.kind === "team" ? (
        <Field label="Team">
          <Select
            value={seed.teamId || ""}
            onValueChange={(value) => onChange({ ...seed, teamId: value })}
          >
            <SelectTrigger><SelectValue placeholder="Select team" /></SelectTrigger>
            <SelectContent>
              {teams.map((team) => (
                <SelectItem key={team._id} value={team._id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      ) : null}
      {seed.kind === "winner" || seed.kind === "loser" ? (
        <Field label="From match #">
          <Input
            type="number"
            min={1}
            value={String(seed.fromMatchNumber || "")}
            onChange={(e) => onChange({ ...seed, fromMatchNumber: Number(e.target.value) })}
          />
        </Field>
      ) : null}
      <Field label="Label">
        <Input
          value={seed.label || ""}
          onChange={(e) => onChange({ ...seed, label: e.target.value })}
        />
      </Field>
    </div>
  );
}
