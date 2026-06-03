import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { api, Match } from "@/lib/api";
import { MatchCard } from "@/components/match-card";
import { Skeleton } from "@/components/skeleton";

export const Route = createFileRoute("/timeline")({
  head: () => ({
    meta: [
      { title: "Timeline — CupVision" },
      {
        name: "description",
        content: "Chronological timeline of every match in the 2026 World Cup.",
      },
      { property: "og:title", content: "Timeline — CupVision" },
      { property: "og:description", content: "Every World Cup 2026 match in chronological order." },
    ],
  }),
  component: TimelinePage,
});

function TimelinePage() {
  const matches = useQuery({
    queryKey: ["matches"],
    queryFn: () => api.get<Match[]>("/api/matches"),
  });

  const grouped = useMemo(() => {
    const list = (matches.data || [])
      .slice()
      .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
    const map = new Map<string, Match[]>();
    for (const m of list) {
      if (!map.has(m.date)) map.set(m.date, []);
      map.get(m.date)!.push(m);
    }
    return Array.from(map.entries());
  }, [matches.data]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-bold mb-2">Timeline</h1>
      <p className="text-muted-foreground mb-8">Every match, day by day.</p>

      {matches.isLoading ? (
        <Skeleton className="h-96" />
      ) : grouped.length === 0 ? (
        <p className="text-sm text-muted-foreground">No matches yet.</p>
      ) : (
        <div className="relative pl-6 border-l border-border space-y-8">
          {grouped.map(([date, items]) => (
            <div key={date} className="relative">
              <div className="absolute -left-[31px] top-1 size-3 rounded-full bg-primary ring-4 ring-background" />
              <div className="text-sm font-semibold mb-3">{date}</div>
              <div className="grid md:grid-cols-2 gap-3">
                {items.map((m) => (
                  <MatchCard key={m._id} m={m} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
