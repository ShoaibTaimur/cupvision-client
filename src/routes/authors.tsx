import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api, Author } from "@/lib/api";
import { Skeleton } from "@/components/skeleton";
import { Github, Linkedin, Globe, User } from "lucide-react";

export const Route = createFileRoute("/authors")({
  head: () => ({
    meta: [
      { title: "Authors — CupVision" },
      { name: "description", content: "The people behind CupVision." },
      { property: "og:title", content: "Authors — CupVision" },
      { property: "og:description", content: "The people behind CupVision." },
    ],
  }),
  component: AuthorsPage,
});

function AuthorsPage() {
  const authors = useQuery({
    queryKey: ["authors"],
    queryFn: () => api.get<Author[]>("/api/authors"),
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-bold mb-2">Authors</h1>
      <p className="text-muted-foreground mb-8">The team behind CupVision.</p>

      {authors.isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64" />)}
        </div>
      ) : authors.data?.length === 0 ? (
        <p className="text-sm text-muted-foreground">No authors added yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {authors.data?.map((a) => (
            <div key={a._id} className="bg-card border border-border rounded-lg p-5 hover:border-primary/40 transition-colors">
              <div className="size-20 rounded-full bg-secondary overflow-hidden mb-4 flex items-center justify-center">
                {a.image ? (
                  <img src={a.image} alt={a.name} className="size-full object-cover" loading="lazy" />
                ) : (
                  <User className="size-8 text-muted-foreground" />
                )}
              </div>
              <h3 className="font-semibold">{a.name}</h3>
              <p className="text-xs text-primary mb-2">{a.role}</p>
              {a.bio && <p className="text-sm text-muted-foreground mb-3">{a.bio}</p>}
              <div className="flex gap-2 mt-3">
                {a.github && <a href={a.github} target="_blank" rel="noreferrer" className="p-1.5 rounded-md hover:bg-secondary transition-colors" aria-label="GitHub"><Github className="size-4" /></a>}
                {a.linkedin && <a href={a.linkedin} target="_blank" rel="noreferrer" className="p-1.5 rounded-md hover:bg-secondary transition-colors" aria-label="LinkedIn"><Linkedin className="size-4" /></a>}
                {a.portfolio && <a href={a.portfolio} target="_blank" rel="noreferrer" className="p-1.5 rounded-md hover:bg-secondary transition-colors" aria-label="Portfolio"><Globe className="size-4" /></a>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
