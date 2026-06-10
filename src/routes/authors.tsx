import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api, Author } from "@/lib/api";
import { SectionReveal } from "@/components/section-reveal";
import { Skeleton, AuthorSkeleton } from "@/components/skeleton";
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
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <SectionReveal delay={0.06} className="border-b border-border/70 pb-10">
        <div className="max-w-3xl">
          <div className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
            Editorial team
          </div>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-foreground sm:text-5xl">
            People building CupVision.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            Small team shaping match coverage, tournament structure, publishing flow, product
            direction.
          </p>
        </div>
      </SectionReveal>

      <SectionReveal delay={0.14} className="py-10">
        {authors.isLoading ? (
          <div className="divide-y divide-border/70 border-t border-border/70">
            {Array.from({ length: 3 }).map((_, i) => (
              <AuthorSkeleton key={i} />
            ))}
          </div>
        ) : authors.data?.length === 0 ? (
          <p className="text-sm text-muted-foreground">No authors added yet.</p>
        ) : (
          <div className="divide-y divide-border/70 border-t border-border/70">
            {authors.data?.map((a) => (
              <section
                key={a._id}
                className="grid gap-6 py-8 md:grid-cols-[220px_1fr] md:items-start"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="flex size-48 sm:size-34 shrink-0 items-center justify-center rounded-full border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04))] p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.16)] backdrop-blur-xl">
                    {a.image ? (
                      <img
                        src={a.image}
                        alt={a.name}
                        className="size-full rounded-full object-cover ring-1 ring-white/8"
                        loading="lazy"
                      />
                    ) : (
                      <User className="size-18 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-tight text-foreground">{a.name}</h2>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                      {a.role}
                    </p>
                  </div>
                </div>

                <div>
                  {a.bio && (
                    <p className="max-w-3xl text-sm leading-7 text-muted-foreground">{a.bio}</p>
                  )}
                  <div className="mt-5 flex flex-wrap gap-3">
                    {a.github && (
                      <a
                        href={a.github}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-border/70 px-4 py-2 text-sm text-muted-foreground transition hover:border-primary/30 hover:text-foreground"
                      >
                        <Github className="size-4" />
                        GitHub
                      </a>
                    )}
                    {a.linkedin && (
                      <a
                        href={a.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-border/70 px-4 py-2 text-sm text-muted-foreground transition hover:border-primary/30 hover:text-foreground"
                      >
                        <Linkedin className="size-4" />
                        LinkedIn
                      </a>
                    )}
                    {a.portfolio && (
                      <a
                        href={a.portfolio}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-border/70 px-4 py-2 text-sm text-muted-foreground transition hover:border-primary/30 hover:text-foreground"
                      >
                        <Globe className="size-4" />
                        Portfolio
                      </a>
                    )}
                  </div>
                </div>
              </section>
            ))}
          </div>
        )}
      </SectionReveal>
    </div>
  );
}
