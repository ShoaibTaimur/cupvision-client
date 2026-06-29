import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AdminShell } from "@/components/admin-shell";
import { api, Author } from "@/lib/api";
import { Skeleton } from "@/components/skeleton";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Field } from "./admin.teams";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/admin/authors")({
  head: () => ({ meta: [{ title: "Authors — CupVision Admin" }] }),
  component: AuthorsAdmin,
});

const empty = { name: "", role: "", image: "", bio: "", github: "", linkedin: "", portfolio: "" };

function AuthorsAdmin() {
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ["authors"],
    queryFn: () => api.get<Author[]>("/api/authors"),
  });
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
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["authors"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  function startEdit(a: Author) {
    setEditing(a);
    setForm({
      name: a.name,
      role: a.role,
      image: a.image || "",
      bio: a.bio || "",
      github: a.github || "",
      linkedin: a.linkedin || "",
      portfolio: a.portfolio || "",
    });
  }

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Authors</h1>
          <p className="text-sm text-muted-foreground">People behind the site.</p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setForm(empty);
          }}
          className="flex items-center gap-1.5"
        >
          <Plus className="size-4" /> New author
        </Button>
      </div>

      <div className="grid lg:grid-cols-[1fr_400px] gap-6">
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {list.isLoading ? (
            <Skeleton className="h-64" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.data?.map((a) => (
                  <TableRow key={a._id}>
                    <TableCell className="font-medium">{a.name}</TableCell>
                    <TableCell className="text-muted-foreground">{a.role}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startEdit(a)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => confirm(`Delete ${a.name}?`) && del.mutate(a._id)}
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
                      No authors.
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
          <h2 className="font-semibold">{editing ? "Edit author" : "New author"}</h2>
          <Field label="Name *">
            <Input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Field>
          <Field label="Role *">
            <Input
              required
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            />
          </Field>
          <Field label="Image URL">
            <Input
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
            />
          </Field>
          <Field label="Bio">
            <Textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={3}
            />
          </Field>
          <Field label="GitHub URL">
            <Input
              value={form.github}
              onChange={(e) => setForm({ ...form, github: e.target.value })}
            />
          </Field>
          <Field label="LinkedIn URL">
            <Input
              value={form.linkedin}
              onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
            />
          </Field>
          <Field label="Portfolio URL">
            <Input
              value={form.portfolio}
              onChange={(e) => setForm({ ...form, portfolio: e.target.value })}
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
