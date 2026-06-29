import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AdminShell } from "@/components/admin-shell";
import { api, Team } from "@/lib/api";
import { Skeleton } from "@/components/skeleton";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Group</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.data?.map((t) => (
                  <TableRow key={t._id}>
                    <TableCell className="font-medium">{t.name}</TableCell>
                    <TableCell className="text-muted-foreground">{t.group || "—"}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startEdit(t)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => confirm(`Delete ${t.name}?`) && del.mutate(t._id)}
                        className="text-destructive hover:bg-destructive/20 hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {list.data?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      No teams.
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
          className="bg-card border border-border rounded-lg p-5 space-y-3 h-fit lg:sticky lg:top-6 lg:self-start lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{editing ? "Edit team" : "New team"}</h2>
            {editing && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={startNew}
                className="text-muted-foreground"
              >
                <Plus className="size-3 mr-1" /> New
              </Button>
            )}
          </div>
          <Field label="Name *">
            <Input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Field>
          <Field label="Group (A-L)">
            <Input
              value={form.group}
              onChange={(e) => setForm({ ...form, group: e.target.value.toUpperCase() })}
              maxLength={1}
            />
          </Field>
          <Field label="Flag URL">
            <Input
              value={form.flag}
              onChange={(e) => setForm({ ...form, flag: e.target.value })}
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
