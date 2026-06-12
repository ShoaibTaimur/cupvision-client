import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { AdminShell } from "@/components/admin-shell";
import { api, Match, Team } from "@/lib/api";
import { Skeleton } from "@/components/skeleton";
import { StatusBadge } from "@/components/match-card";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, Trophy } from "lucide-react";
import { Field } from "./admin.teams";
import { formatDateTime } from "@/lib/date";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { RefreshCw } from "lucide-react";

export const Route = createFileRoute("/admin/matches")({
  head: () => ({ meta: [{ title: "Matches — CupVision Admin" }] }),
  component: MatchesAdmin,
});

const STATUSES = [
  "scheduled",
  "live",
  "awaiting_result",
  "completed",
  "cancelled",
  "postponed",
] as const;

const empty = {
  matchNumber: 1,
  homeTeamId: "",
  awayTeamId: "",
  date: "",
  time: "",
  stadium: "",
  city: "",
  stage: "Group Stage",
  group: "",
  status: "scheduled" as (typeof STATUSES)[number],
  notes: "",
  externalMatchId: "",
};

function MatchesAdmin() {
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ["admin-matches"],
    queryFn: () => api.get<Match[]>("/api/matches"),
  });
  const teams = useQuery({ queryKey: ["teams"], queryFn: () => api.get<Team[]>("/api/teams") });
  const [editing, setEditing] = useState<Match | null>(null);
  const [form, setForm] = useState(empty);
  const [resultFor, setResultFor] = useState<Match | null>(null);
  const [actionsFor, setActionsFor] = useState<Match | null>(null);
  const [formModalOpen, setFormModalOpen] = useState(false);

  const save = useMutation({
    mutationFn: async () => {
      if (editing) return api.put(`/api/matches/${editing._id}`, form);
      return api.post("/api/matches", form, true);
    },
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["admin-matches"] });
      setEditing(null);
      setForm(empty);
      setFormModalOpen(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: (id: string) => api.del(`/api/matches/${id}`),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin-matches"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  function startEdit(m: Match) {
    setEditing(m);
    setForm({
      matchNumber: m.matchNumber,
      homeTeamId: m.homeTeamId,
      awayTeamId: m.awayTeamId,
      date: m.date,
      time: m.time,
      stadium: m.stadium,
      city: m.city,
      stage: m.stage,
      group: m.group || "",
      status: m.status,
      notes: m.notes || "",
      externalMatchId: m.externalMatchId || "",
    });
  }

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Matches</h1>
          <p className="text-sm text-muted-foreground">Create, edit and submit results.</p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setForm(empty);
            setFormModalOpen(true);
          }}
          className="flex items-center gap-1.5"
        >
          <Plus className="size-4" /> New match
        </Button>
      </div>

      <LiveTrackingPanel />


      <div className="grid lg:grid-cols-[1fr_400px] gap-6">
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {list.isLoading ? (
            <Skeleton className="h-64" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Match</TableHead>
                  <TableHead className="hidden sm:table-cell">When</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead className="text-right hidden md:table-cell">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.data?.map((m) => (
                  <TableRow
                    key={m._id}
                    className="md:cursor-default cursor-pointer md:hover:bg-transparent"
                    onClick={(e) => {
                      if (window.matchMedia("(min-width: 768px)").matches) return;
                      e.stopPropagation();
                      setActionsFor(m);
                    }}
                  >
                    <TableCell className="tabular-nums">{m.matchNumber}</TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {m.homeTeam?.name} vs {m.awayTeam?.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {m.stage}
                        {m.group ? ` · Group ${m.group}` : ""}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 sm:hidden flex items-center gap-2">
                        <span>{formatDateTime(m.date, m.time)}</span>
                        <StatusBadge status={m.status} />
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden sm:table-cell">
                      {formatDateTime(m.date, m.time)}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <StatusBadge status={m.status} />
                    </TableCell>
                    <TableCell className="text-right space-x-1 whitespace-nowrap hidden md:table-cell">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setResultFor(m)}
                        title="Submit result"
                      >
                        <Trophy className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startEdit(m)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => confirm("Delete match?") && del.mutate(m._id)}
                        className="text-destructive hover:bg-destructive/20 hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {list.data?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No matches.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
          className="bg-card border border-border rounded-lg p-5 space-y-3 h-fit hidden lg:block"
        >
          <h2 className="font-semibold">
            {editing ? `Edit match #${editing.matchNumber}` : "New match"}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Match # *">
              <Input
                type="number"
                min={1}
                required
                value={form.matchNumber}
                onChange={(e) => setForm({ ...form, matchNumber: Number(e.target.value) })}
              />
            </Field>
            <Field label="Status *">
              <Select
                value={form.status}
                onValueChange={(value) => setForm({ ...form, status: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field label="Live provider match ID">
            <Input
              value={form.externalMatchId}
              onChange={(e) => setForm({ ...form, externalMatchId: e.target.value })}
              placeholder="Provider fixture or match id"
            />
          </Field>
          <Field label="Home team *">
            <Select
              required
              value={form.homeTeamId}
              onValueChange={(value) => setForm({ ...form, homeTeamId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="— select —" />
              </SelectTrigger>
              <SelectContent>
                {teams.data?.map((t) => (
                  <SelectItem key={t._id} value={t._id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Away team *">
            <Select
              required
              value={form.awayTeamId}
              onValueChange={(value) => setForm({ ...form, awayTeamId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="— select —" />
              </SelectTrigger>
              <SelectContent>
                {teams.data?.map((t) => (
                  <SelectItem key={t._id} value={t._id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date *">
              <Input
                required
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </Field>
            <Field label="Time *">
              <Input
                required
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Stadium *">
            <Input
              required
              value={form.stadium}
              onChange={(e) => setForm({ ...form, stadium: e.target.value })}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="City *">
              <Input
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </Field>
            <Field label="Group (A-L)">
              <Input
                value={form.group}
                maxLength={1}
                onChange={(e) => setForm({ ...form, group: e.target.value.toUpperCase() })}
              />
            </Field>
          </div>
          <Field label="Stage *">
            <Input
              required
              value={form.stage}
              onChange={(e) => setForm({ ...form, stage: e.target.value })}
            />
          </Field>
          <Field label="Notes">
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
            />
          </Field>
          <Button
            disabled={save.isPending}
            className="w-full"
          >
            {save.isPending ? "Saving..." : editing ? "Update" : "Create"}
          </Button>
        </form>
      </div>

      {resultFor && (
        <ResultModal
          match={resultFor}
          onClose={() => setResultFor(null)}
          onSaved={() => {
            setResultFor(null);
            qc.invalidateQueries({ queryKey: ["admin-matches"] });
          }}
        />
      )}

      {actionsFor && (
        <ActionsModal
          match={actionsFor}
          onClose={() => setActionsFor(null)}
          onEdit={() => {
            startEdit(actionsFor);
            setActionsFor(null);
            setFormModalOpen(true);
          }}
          onResult={() => {
            setResultFor(actionsFor);
            setActionsFor(null);
          }}
          onDelete={() => {
            if (confirm("Delete match?")) {
              del.mutate(actionsFor._id);
              setActionsFor(null);
            }
          }}
        />
      )}

      {formModalOpen && (
        <FormModal
          title={editing ? `Edit match #${editing.matchNumber}` : "New match"}
          onClose={() => {
            setFormModalOpen(false);
            setEditing(null);
            setForm(empty);
          }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate();
            }}
            className="space-y-3"
          >
            <div className="grid grid-cols-2 gap-3">
              <Field label="Match # *">
                <Input
                  type="number"
                  min={1}
                  required
                  value={form.matchNumber}
                  onChange={(e) => setForm({ ...form, matchNumber: Number(e.target.value) })}
                />
              </Field>
              <Field label="Status *">
                <Select
                  value={form.status}
                  onValueChange={(value) => setForm({ ...form, status: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Field label="Live provider match ID">
              <Input
                value={form.externalMatchId}
                onChange={(e) => setForm({ ...form, externalMatchId: e.target.value })}
                placeholder="Provider fixture or match id"
              />
            </Field>
            <Field label="Home team *">
              <Select
                required
                value={form.homeTeamId}
                onValueChange={(value) => setForm({ ...form, homeTeamId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="— select —" />
                </SelectTrigger>
                <SelectContent>
                  {teams.data?.map((t) => (
                    <SelectItem key={t._id} value={t._id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Away team *">
              <Select
                required
                value={form.awayTeamId}
                onValueChange={(value) => setForm({ ...form, awayTeamId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="— select —" />
                </SelectTrigger>
                <SelectContent>
                  {teams.data?.map((t) => (
                    <SelectItem key={t._id} value={t._id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Date *">
                <Input
                  required
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </Field>
              <Field label="Time *">
                <Input
                  required
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Stadium *">
              <Input
                required
                value={form.stadium}
                onChange={(e) => setForm({ ...form, stadium: e.target.value })}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="City *">
                <Input
                  required
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </Field>
              <Field label="Group (A-L)">
                <Input
                  value={form.group}
                  maxLength={1}
                  onChange={(e) => setForm({ ...form, group: e.target.value.toUpperCase() })}
                />
              </Field>
            </div>
            <Field label="Stage *">
              <Input
                required
                value={form.stage}
                onChange={(e) => setForm({ ...form, stage: e.target.value })}
              />
            </Field>
            <Field label="Notes">
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
              />
            </Field>
            <Button
              disabled={save.isPending}
              className="w-full"
            >
              {save.isPending ? "Saving..." : editing ? "Update" : "Create"}
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
  children: ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-[90] bg-background/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300 ease-out"
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

function ActionsModal({
  match,
  onClose,
  onEdit,
  onResult,
  onDelete,
}: {
  match: Match;
  onClose: () => void;
  onEdit: () => void;
  onResult: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[90] bg-background/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-5 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4">
          <div className="text-xs text-muted-foreground">
            Match #{match.matchNumber} · {match.stage}
            {match.group ? ` · Group ${match.group}` : ""}
          </div>
          <div className="font-semibold mt-0.5">
            {match.homeTeam?.name} vs {match.awayTeam?.name}
          </div>
          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
            <span>{formatDateTime(match.date, match.time)}</span>
            <StatusBadge status={match.status} />
          </div>
        </div>
        <div className="space-y-2">
          <button
            onClick={onResult}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-secondary hover:bg-secondary/70 text-sm font-medium transition-colors"
          >
            <Trophy className="size-4" /> Submit result
          </button>
          <button
            onClick={onEdit}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-secondary hover:bg-secondary/70 text-sm font-medium transition-colors"
          >
            <Pencil className="size-4" /> Edit match
          </button>
          <button
            onClick={onDelete}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-destructive/15 hover:bg-destructive/25 text-destructive text-sm font-medium transition-colors"
          >
            <Trash2 className="size-4" /> Delete match
          </button>
        </div>
        <button
          onClick={onClose}
          className="w-full mt-3 px-4 py-2.5 rounded-lg border border-border text-sm hover:bg-secondary transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function ResultModal({
  match,
  onClose,
  onSaved,
}: {
  match: Match;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [home, setHome] = useState<number>(match.homeScore ?? 0);
  const [away, setAway] = useState<number>(match.awayScore ?? 0);

  const saveLive = useMutation({
    mutationFn: () =>
      api.post(
        `/api/matches/${match._id}/live-score`,
        { homeScore: home, awayScore: away, setLive: true },
        true,
      ),
    onSuccess: () => {
      toast.success("Live score updated");
      onSaved();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const finish = useMutation({
    mutationFn: () =>
      api.post(`/api/matches/${match._id}/result`, { homeScore: home, awayScore: away }, true),
    onSuccess: () => {
      toast.success("Match finished");
      onSaved();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const busy = saveLive.isPending || finish.isPending;
  const isFinal = match.status === "completed";

  function Stepper({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: number;
    onChange: (n: number) => void;
  }) {
    return (
      <div className="rounded-lg border border-border p-3">
        <div className="text-xs text-muted-foreground text-center mb-2 truncate">{label}</div>
        <div className="flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => onChange(Math.max(0, value - 1))}
            disabled={busy}
          >
            −
          </Button>
          <Input
            type="number"
            min={0}
            value={value}
            onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
            className="text-2xl text-center font-bold h-12"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => onChange(value + 1)}
            disabled={busy}
          >
            +
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-semibold mb-1">
          {isFinal ? "Edit result" : "Live score"} · Match #{match.matchNumber}
        </h3>
        <p className="text-xs text-muted-foreground mb-4 flex items-center gap-2">
          <span>{match.homeTeam?.name} vs {match.awayTeam?.name}</span>
          <StatusBadge status={match.status} />
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Stepper label={match.homeTeam?.name || "Home"} value={home} onChange={setHome} />
          <Stepper label={match.awayTeam?.name || "Away"} value={away} onChange={setAway} />
        </div>
        <p className="text-[11px] text-muted-foreground mt-3">
          Tap + / − to update goals during the match. The match stays{" "}
          <span className="font-medium">live</span> until you press{" "}
          <span className="font-medium">Finish match</span>.
        </p>
        <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          {!isFinal && (
            <Button
              variant="secondary"
              onClick={() => saveLive.mutate()}
              disabled={busy}
            >
              {saveLive.isPending ? "Saving..." : "Save (keep live)"}
            </Button>
          )}
          <Button onClick={() => finish.mutate()} disabled={busy}>
            {finish.isPending ? "Saving..." : isFinal ? "Save result" : "Finish match"}
          </Button>
        </div>
      </div>
    </div>
  );
}

interface LiveSettings {
  liveScoreTrackingEnabled: boolean;
}

function LiveTrackingPanel() {
  const qc = useQueryClient();
  const settings = useQuery({
    queryKey: ["app-settings"],
    queryFn: () => api.get<LiveSettings>("/api/settings"),
  });
  const toggle = useMutation({
    mutationFn: (enabled: boolean) =>
      api.put<LiveSettings>("/api/settings", { liveScoreTrackingEnabled: enabled }),
    onSuccess: (data) => {
      qc.setQueryData(["app-settings"], data);
      toast.success(
        data.liveScoreTrackingEnabled
          ? "Live score tracking ON"
          : "Live score tracking OFF"
      );
    },
    onError: (e: any) => toast.error(e.message),
  });

  const enabled = settings.data?.liveScoreTrackingEnabled ?? false;

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6 flex items-center justify-between gap-3 flex-wrap">
      <div className="flex items-start gap-3">
        <RefreshCw
          className={`size-5 mt-0.5 ${enabled ? "text-primary animate-spin" : "text-muted-foreground"}`}
          style={enabled ? { animationDuration: "3s" } : undefined}
        />
        <div>
          <div className="font-semibold text-sm">Live score auto-tracking</div>
          <p className="text-xs text-muted-foreground max-w-md">
            Polls TheSportsDB on every API hit (throttled to ~30s) and updates scores for
            matches that have a <span className="font-mono">Live provider match ID</span> and
            are live or kicking off within 6 hours. Toggle off if scores ever go wrong.
          </p>
        </div>
      </div>
      <Switch
        checked={enabled}
        disabled={settings.isLoading || toggle.isPending}
        onCheckedChange={(v) => toggle.mutate(v)}
      />
    </div>
  );
}

