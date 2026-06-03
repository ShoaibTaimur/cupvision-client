import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AdminShell } from "@/components/admin-shell";
import { api, Team } from "@/lib/api";
import { Skeleton } from "@/components/skeleton";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/teams")({
  head: () => ({ meta: [{ title: "Teams — CupVision Admin" }] }),
  component: TeamsAdmin,
});

const empty = { name: "", group: "", flag: "" };

function TeamsAdmin() {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: ["teams"], queryFn: () => api.get<Team[]>("/api/teams") });
  const [editing, setEditing] = useState<Team | null>(null);
  const [form, setForm] = useState<typeof empty>(empty);

  const save = useMutation({
    mutationFn: async () => {
      if (editing) return api.put(`/api/teams/${editing._id}`, form);
      return api.post("/api/teams", form, true);
    },
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["teams"] });
      setEditing(null);
      setForm(empty);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: (id: string) => api.del(`/api/teams/${id}`),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["teams"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  function startEdit(t: Team) {
    setEditing(t);
    setForm({ name: t.name, group: t.group || "", flag: t.flag || "" });
  }
  function startNew() {
    setEditing(null);
    setForm(empty);
  }

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Teams</h1>
          <p className="text-sm text-muted-foreground">Manage all competing teams.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {list.isLoading ? (
            <Skeleton className="h-64" />
          ) : (
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-muted-foreground border-b border-border">
                <tr>
                  <th className="text-left px-3 py-3">Name</th>
                  <th className="text-left px-3 py-3">Group</th>
                  <th className="text-right px-3 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.data?.map((t) => (
                  <tr key={t._id} className="border-b border-border last:border-0">
                    <td className="px-3 py-2 font-medium">{t.name}</td>
                    <td className="px-3 py-2 text-muted-foreground">{t.group || "—"}</td>
                    <td className="px-3 py-2 text-right space-x-1">
                      <button
                        onClick={() => startEdit(t)}
                        className="p-1.5 rounded-md hover:bg-secondary"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        onClick={() => confirm(`Delete ${t.name}?`) && del.mutate(t._id)}
                        className="p-1.5 rounded-md hover:bg-destructive/20 text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {list.data?.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-3 py-8 text-center text-muted-foreground">
                      No teams.
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
          className="bg-card border border-border rounded-lg p-5 space-y-3 h-fit"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{editing ? "Edit team" : "New team"}</h2>
            {editing && (
              <button
                type="button"
                onClick={startNew}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                <Plus className="size-3 inline" /> New
              </button>
            )}
          </div>
          <Field label="Name *">
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
            />
          </Field>
          <Field label="Group (A-L)">
            <input
              value={form.group}
              onChange={(e) => setForm({ ...form, group: e.target.value.toUpperCase() })}
              maxLength={1}
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
            />
          </Field>
          <Field label="Flag URL">
            <input
              value={form.flag}
              onChange={(e) => setForm({ ...form, flag: e.target.value })}
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
    </AdminShell>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
