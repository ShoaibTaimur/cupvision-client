import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin-shell";
import { api, HealScoresResult, MatchAdvance, MatchConfig, MatchConfigSyncResult, MatchSeed, Team } from "@/lib/api";
import { Skeleton } from "@/components/skeleton";
import { toast } from "sonner";
import { Field } from "./admin.teams";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, RefreshCcw, Search, Stethoscope, Trash2, Pencil } from "lucide-react";
import { formatMatchDateTime, getFormDate, getFormTime } from "@/lib/date";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/admin/bracket")({
  head: () => ({ meta: [{ title: "Bracket — CupVision Admin" }] }),
  component: BracketAdmin,
});

const emptySeed: MatchSeed = { kind: "placeholder", label: "TBD" };
const emptyAdvance: MatchAdvance = { outcome: "winner", toMatchNumber: 1, slot: "home" };

function BracketAdmin() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [healProgressData, setHealProgressData] = useState<{
    active: boolean;
    current: number;
    total: number;
    message: string;
  } | null>(null);

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
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      setIsModalOpen(false);
      setSelected(null);
      setForm(null);
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

  useEffect(() => {
    if (!healScores.isPending) {
      setHealProgressData(null);
      return;
    }
    const interval = setInterval(async () => {
      try {
        const res = await api.authed<{
          active: boolean;
          current: number;
          total: number;
          message: string;
        }>("/api/match-configs/heal-progress");
        setHealProgressData(res);
      } catch (err) {
        // ignore
      }
    }, 400);
    return () => clearInterval(interval);
  }, [healScores.isPending]);

  const startEdit = (config: MatchConfig) => {
    setSelected(config.matchNumber);
    const next = JSON.parse(JSON.stringify(config)) as MatchConfig;
    next.group = next.group || "";
    next.date = getFormDate(next.date);
    next.time = getFormTime(config.date, next.time);
    setForm(next);
    setIsModalOpen(true);
  };

  return (
    <AdminShell>
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Bracket</h1>
          <p className="text-sm text-muted-foreground">DB source truth by match number.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground z-10" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search match #..."
              className="pl-10 h-10 rounded-xl bg-background/50 border-border"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => healScores.mutate()} disabled={healScores.isPending}>
              <Stethoscope className={`mr-2 size-4 ${healScores.isPending ? "animate-spin" : ""}`} />
              Heal
            </Button>
            <Button type="button" variant="outline" onClick={() => syncFifa.mutate()} disabled={syncFifa.isPending}>
              <RefreshCcw className={`mr-2 size-4 ${syncFifa.isPending ? "animate-spin" : ""}`} />
              Sync FIFA
            </Button>
          </div>
        </div>
      </div>

      {healScores.isPending && healProgressData && (
        <div className="mb-6 p-4 rounded-lg border border-border bg-card max-w-xl">
          <div className="flex justify-between items-center text-sm font-semibold mb-2">
            <span className="truncate text-muted-foreground">{healProgressData.message}</span>
            <span className="font-mono text-xs whitespace-nowrap ml-4">
              {healProgressData.current} / {healProgressData.total}
            </span>
          </div>
          <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-300 ease-out"
              style={{
                width: `${(healProgressData.current / (healProgressData.total || 1)) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {configs.isLoading ? (
        <Skeleton className="h-64" />
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20 text-center">Match #</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Group</TableHead>
                <TableHead>Seeds (Home vs Away)</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead>Date / Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((row) => (
                <TableRow key={row.matchNumber}>
                  <TableCell className="font-semibold text-center tabular-nums text-primary bg-primary/5">
                    M{row.matchNumber}
                  </TableCell>
                  <TableCell className="font-medium">{row.stage}</TableCell>
                  <TableCell className="text-muted-foreground">{row.group || "—"}</TableCell>
                  <TableCell className="text-xs">
                    <span className="font-medium">
                      {row.homeSeed?.label || row.homeSeed?.kind || "TBD"}
                    </span>
                    <span className="mx-2 text-muted-foreground/40">vs</span>
                    <span className="font-medium">
                      {row.awaySeed?.label || row.awaySeed?.kind || "TBD"}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {row.stadium ? `${row.stadium}, ${row.city}` : "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                    {formatMatchDateTime(row.date, row.time)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider ${row.isActive ? "text-emerald-400" : "text-muted-foreground"}`}
                    >
                      {row.isActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startEdit(row)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {list.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    No matches found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {isModalOpen && form && activeConfig && (
        <FormModal
          title={`Edit Bracket Config — Match #${form.matchNumber}`}
          onClose={() => {
            setIsModalOpen(false);
            setSelected(null);
            setForm(null);
          }}
        >
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
                  placeholder="e.g. Round of 16"
                />
              </Field>
              <Field label="Group">
                <Input
                  value={form.group || ""}
                  onChange={(e) => setForm({ ...form, group: e.target.value.toUpperCase() })}
                  placeholder="e.g. A"
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
                  placeholder="e.g. Lusail Stadium"
                />
              </Field>
              <Field label="City">
                <Input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="e.g. Lusail"
                />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <SeedEditor
                label="Home seed"
                seed={form.homeSeed || emptySeed}
                teams={teams.data || []}
                onChange={(homeSeed) => setForm({ ...form, homeSeed })}
              />
              <SeedEditor
                label="Away seed"
                seed={form.awaySeed || emptySeed}
                teams={teams.data || []}
                onChange={(awaySeed) => setForm({ ...form, awaySeed })}
              />
            </div>

            <div className="space-y-3 rounded-lg border border-border p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Advances ({form.advances?.length || 0})</h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setForm({ ...form, advances: [...(form.advances || []), emptyAdvance] })
                  }
                >
                  Add advance
                </Button>
              </div>
              <div className="space-y-4">
                {form.advances?.map((advance, index) => (
                  <div
                    key={index}
                    className="grid gap-3 rounded-md border border-border/60 bg-muted/20 p-3 md:grid-cols-4 relative"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        const next = [...(form.advances || [])];
                        next.splice(index, 1);
                        setForm({ ...form, advances: next });
                      }}
                      className="absolute top-2 right-2 text-destructive hover:text-destructive/80 text-xs font-semibold"
                    >
                      Remove
                    </button>
                    <Field label="Outcome">
                      <Select
                        value={advance.outcome}
                        onValueChange={(value) => {
                          const next = [...(form.advances || [])];
                          next[index] = {
                            ...advance,
                            outcome: value as MatchAdvance["outcome"],
                          };
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
                        placeholder="e.g. 73"
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
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3 rounded-lg border border-border p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold font-mono">bracket round mapping</h2>
                <div className="flex h-6 items-center">
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
              </div>
              {form.bracket?.enabled && (
                <div className="grid gap-3 md:grid-cols-3">
                  <Field label="Round Key">
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
                        <SelectItem value="r32">r32 (Round of 32)</SelectItem>
                        <SelectItem value="r16">r16 (Round of 16)</SelectItem>
                        <SelectItem value="qf">qf (Quarter-finals)</SelectItem>
                        <SelectItem value="sf">sf (Semi-finals)</SelectItem>
                        <SelectItem value="third">third (Third place)</SelectItem>
                        <SelectItem value="final">final (Final)</SelectItem>
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
                      placeholder="e.g. 0"
                    />
                  </Field>
                </div>
              )}
            </div>

            <Button disabled={save.isPending} className="w-full">
              {save.isPending ? "Saving..." : `Save changes`}
            </Button>
          </form>
        </FormModal>
      )}
    </AdminShell>
  );
}

function FormModal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-[90] bg-background/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border w-full sm:max-w-2xl rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300 ease-out"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="size-8 inline-flex items-center justify-center rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="p-5 overflow-y-auto">{children}</div>
      </div>
    </div>
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
            placeholder="e.g. 49"
          />
        </Field>
      ) : null}
      <Field label="Label">
        <Input
          value={seed.label || ""}
          onChange={(e) => onChange({ ...seed, label: e.target.value })}
          placeholder="e.g. Winner Match 49"
        />
      </Field>
    </div>
  );
}
