import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AdminShell } from "@/components/admin-shell";
import { api, Author } from "@/lib/api";
import { Skeleton } from "@/components/skeleton";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Field } from "./admin.teams";

export const Route = createFileRoute("/admin/authors")({
  head: () => ({ meta: [{ title: "Authors — CupVision Admin" }] }),
  component: AuthorsAdmin,
});

const empty = { name: "", role: "", image: "", bio: "", github: "", linkedin: "", portfolio: "" };

function AuthorsAdmin() {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: ["authors"], queryFn: () => api.get<Author[]>("/api/authors") });
  const [editing, setEditing] = useState<Author | null>(null);
  const [form, setForm] = useState(empty);

  const save = useMutation({
    mutationFn: async () =>
      editing ? api.put(`/api/authors/${editing._id}`, form) : api.post("/api/authors", form, true),
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["authors"] });
      setEditing(null);
      setForm(empty);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: (id: string) => api.del(`/api/authors/${id}`),
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["authors"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  function startEdit(a: Author) {
    setEditing(a);
    setForm({
      name: a.name, role: a.role,
      image: a.image || "", bio: a.bio || "",
      github: a.github || "", linkedin: a.linkedin || "", portfolio: a.portfolio || "",
    });
  }

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Authors</h1>
          <p className="text-sm text-muted-foreground">People behind the site.</p>
        </div>
        <button onClick={() => { setEditing(null); setForm(empty); }} className="bg-primary text-primary-foreground rounded-md px-3 py-1.5 text-sm font-medium flex items-center gap-1.5">
          <Plus className="size-4" /> New author
        </button>
      </div>

      <div className="grid lg:grid-cols-[1fr_400px] gap-6">
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {list.isLoading ? (
            <Skeleton className="h-64" />
          ) : (
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-muted-foreground border-b border-border">
                <tr><th className="px-3 py-3 text-left">Name</th><th className="px-3 py-3 text-left">Role</th><th className="px-3 py-3 text-right">Actions</th></tr>
              </thead>
              <tbody>
                {list.data?.map((a) => (
                  <tr key={a._id} className="border-b border-border last:border-0">
                    <td className="px-3 py-2 font-medium">{a.name}</td>
                    <td className="px-3 py-2 text-muted-foreground">{a.role}</td>
                    <td className="px-3 py-2 text-right space-x-1">
                      <button onClick={() => startEdit(a)} className="p-1.5 rounded-md hover:bg-secondary"><Pencil className="size-4" /></button>
                      <button onClick={() => confirm(`Delete ${a.name}?`) && del.mutate(a._id)} className="p-1.5 rounded-md hover:bg-destructive/20 text-destructive"><Trash2 className="size-4" /></button>
                    </td>
                  </tr>
                ))}
                {list.data?.length === 0 && <tr><td colSpan={3} className="px-3 py-8 text-center text-muted-foreground">No authors.</td></tr>}
              </tbody>
            </table>
          )}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="bg-card border border-border rounded-lg p-5 space-y-3 h-fit">
          <h2 className="font-semibold">{editing ? "Edit author" : "New author"}</h2>
          <Field label="Name *"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm" /></Field>
          <Field label="Role *"><input required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm" /></Field>
          <Field label="Image URL"><input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm" /></Field>
          <Field label="Bio"><textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm" /></Field>
          <Field label="GitHub URL"><input value={form.github} onChange={(e) => setForm({ ...form, github: e.target.value })} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm" /></Field>
          <Field label="LinkedIn URL"><input value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm" /></Field>
          <Field label="Portfolio URL"><input value={form.portfolio} onChange={(e) => setForm({ ...form, portfolio: e.target.value })} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm" /></Field>
          <button disabled={save.isPending} className="w-full bg-primary text-primary-foreground rounded-md py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
            {save.isPending ? "Saving..." : editing ? "Update" : "Create"}
          </button>
        </form>
      </div>
    </AdminShell>
  );
}
