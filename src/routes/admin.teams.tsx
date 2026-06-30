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
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      setIsModalOpen(false);
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
    setIsModalOpen(true);
  }
  function startNew() {
    setEditing(null);
    setForm(empty);
    setIsModalOpen(true);
  }

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Teams</h1>
          <p className="text-sm text-muted-foreground">Manage all competing teams.</p>
        </div>
        <Button onClick={startNew}>
          <Plus className="size-4 mr-2" /> New Team
        </Button>
      </div>

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

      {isModalOpen && (
        <FormModal
          title={editing ? "Edit Team" : "New Team"}
          onClose={() => {
            setIsModalOpen(false);
            setEditing(null);
            setForm(empty);
          }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate();
            }}
            className="space-y-4"
          >
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

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
