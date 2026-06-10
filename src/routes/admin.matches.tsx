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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Matches</h1>
          <p className="text-sm text-muted-foreground">Create, edit and submit results.</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setForm(empty);
            setFormModalOpen(true);
          }}
          className="bg-primary text-primary-foreground rounded-md px-3 py-1.5 text-sm font-medium flex items-center gap-1.5"
        >
          <Plus className="size-4" /> New match
        </button>
      </div>

      <div className="grid lg:grid-cols-[1fr_400px] gap-6">
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {list.isLoading ? (
            <Skeleton className="h-64" />
          ) : (
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-muted-foreground border-b border-border">
                <tr>
                  <th className="text-left px-3 py-3">#</th>
                  <th className="text-left px-3 py-3">Match</th>
                  <th className="text-left px-3 py-3 hidden sm:table-cell">When</th>
                  <th className="text-left px-3 py-3 hidden sm:table-cell">Status</th>
                  <th className="text-right px-3 py-3 hidden md:table-cell">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.data?.map((m) => (
                  <tr
                    key={m._id}
                    className="border-b border-border last:border-0 md:cursor-default cursor-pointer hover:bg-secondary/50 md:hover:bg-transparent"
                    onClick={(e) => {
                      // Only trigger popup on small screens
                      if (window.matchMedia("(min-width: 768px)").matches) return;
                      e.stopPropagation();
                      setActionsFor(m);
                    }}
                  >
                    <td className="px-3 py-2 tabular-nums">{m.matchNumber}</td>
                    <td className="px-3 py-2">
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
                    </td>
                    <td className="px-3 py-2 text-muted-foreground text-xs hidden sm:table-cell">
                      {formatDateTime(m.date, m.time)}
                    </td>
                    <td className="px-3 py-2 hidden sm:table-cell">
                      <StatusBadge status={m.status} />
                    </td>
                    <td className="px-3 py-2 text-right space-x-1 whitespace-nowrap hidden md:table-cell">
                      <button
                        onClick={() => setResultFor(m)}
                        className="p-1.5 rounded-md hover:bg-secondary"
                        title="Submit result"
                      >
                        <Trophy className="size-4" />
                      </button>
                      <button
                        onClick={() => startEdit(m)}
                        className="p-1.5 rounded-md hover:bg-secondary"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        onClick={() => confirm("Delete match?") && del.mutate(m._id)}
                        className="p-1.5 rounded-md hover:bg-destructive/20 text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {list.data?.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">
                      No matches.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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
              <input
                type="number"
                min={1}
                required
                value={form.matchNumber}
                onChange={(e) => setForm({ ...form, matchNumber: Number(e.target.value) })}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
              />
            </Field>
            <Field label="Status *">
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace("_", " ")}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Live provider match ID">
            <input
              value={form.externalMatchId}
              onChange={(e) => setForm({ ...form, externalMatchId: e.target.value })}
              placeholder="Provider fixture or match id"
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
            />
          </Field>
          <Field label="Home team *">
            <select
              required
              value={form.homeTeamId}
              onChange={(e) => setForm({ ...form, homeTeamId: e.target.value })}
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
            >
              <option value="">— select —</option>
              {teams.data?.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Away team *">
            <select
              required
              value={form.awayTeamId}
              onChange={(e) => setForm({ ...form, awayTeamId: e.target.value })}
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
            >
              <option value="">— select —</option>
              {teams.data?.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date *">
              <input
                required
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
              />
            </Field>
            <Field label="Time *">
              <input
                required
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
              />
            </Field>
          </div>
          <Field label="Stadium *">
            <input
              required
              value={form.stadium}
              onChange={(e) => setForm({ ...form, stadium: e.target.value })}
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="City *">
              <input
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
              />
            </Field>
            <Field label="Group (A-L)">
              <input
                value={form.group}
                maxLength={1}
                onChange={(e) => setForm({ ...form, group: e.target.value.toUpperCase() })}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
              />
            </Field>
          </div>
          <Field label="Stage *">
            <input
              required
              value={form.stage}
              onChange={(e) => setForm({ ...form, stage: e.target.value })}
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
            />
          </Field>
          <Field label="Notes">
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
            />
          </Field>
          <button
            disabled={save.isPending}
            className="w-full bg-primary text-primary-foreground rounded-md py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {save.isPending ? "Saving..." : editing ? "Update" : "Create"}
          </button>
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
                <input
                  type="number"
                  min={1}
                  required
                  value={form.matchNumber}
                  onChange={(e) => setForm({ ...form, matchNumber: Number(e.target.value) })}
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
                />
              </Field>
              <Field label="Status *">
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Live provider match ID">
              <input
                value={form.externalMatchId}
                onChange={(e) => setForm({ ...form, externalMatchId: e.target.value })}
                placeholder="Provider fixture or match id"
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
              />
            </Field>
            <Field label="Home team *">
              <select
                required
                value={form.homeTeamId}
                onChange={(e) => setForm({ ...form, homeTeamId: e.target.value })}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
              >
                <option value="">— select —</option>
                {teams.data?.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Away team *">
              <select
                required
                value={form.awayTeamId}
                onChange={(e) => setForm({ ...form, awayTeamId: e.target.value })}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
              >
                <option value="">— select —</option>
                {teams.data?.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Date *">
                <input
                  required
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
                />
              </Field>
              <Field label="Time *">
                <input
                  required
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
                />
              </Field>
            </div>
            <Field label="Stadium *">
              <input
                required
                value={form.stadium}
                onChange={(e) => setForm({ ...form, stadium: e.target.value })}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="City *">
                <input
                  required
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
                />
              </Field>
              <Field label="Group (A-L)">
                <input
                  value={form.group}
                  maxLength={1}
                  onChange={(e) => setForm({ ...form, group: e.target.value.toUpperCase() })}
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
                />
              </Field>
            </div>
            <Field label="Stage *">
              <input
                required
                value={form.stage}
                onChange={(e) => setForm({ ...form, stage: e.target.value })}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
              />
            </Field>
            <Field label="Notes">
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
              />
            </Field>
            <button
              disabled={save.isPending}
              className="w-full bg-primary text-primary-foreground rounded-md py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              {save.isPending ? "Saving..." : editing ? "Update" : "Create"}
            </button>
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
  const submit = useMutation({
    mutationFn: () =>
      api.post(`/api/matches/${match._id}/result`, { homeScore: home, awayScore: away }, true),
    onSuccess: () => {
      toast.success("Result saved");
      onSaved();
    },
    onError: (e: any) => toast.error(e.message),
  });
  return (
    <div
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-lg w-full max-w-md p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-semibold mb-1">Submit result · Match #{match.matchNumber}</h3>
        <p className="text-xs text-muted-foreground mb-4">
          {match.homeTeam?.name} vs {match.awayTeam?.name}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Field label={match.homeTeam?.name || "Home"}>
            <input
              type="number"
              min={0}
              value={home}
              onChange={(e) => setHome(Number(e.target.value))}
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-lg text-center font-bold"
            />
          </Field>
          <Field label={match.awayTeam?.name || "Away"}>
            <input
              type="number"
              min={0}
              value={away}
              onChange={(e) => setAway(Number(e.target.value))}
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-lg text-center font-bold"
            />
          </Field>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm rounded-md border border-border hover:bg-secondary"
          >
            Cancel
          </button>
          <button
            onClick={() => submit.mutate()}
            disabled={submit.isPending}
            className="px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {submit.isPending ? "Saving..." : "Save result"}
          </button>
        </div>
      </div>
    </div>
  );
}
