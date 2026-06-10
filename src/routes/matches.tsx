import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { api, Match } from "@/lib/api";
import { MatchCard } from "@/components/match-card";
import { SectionReveal } from "@/components/section-reveal";
import { Skeleton, MatchCardSkeleton } from "@/components/skeleton";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/matches")({
  head: () => ({
    meta: [
      { title: "Matches — CupVision" },
      {
        name: "description",
        content: "Browse and search all 2026 FIFA World Cup matches by status, group and team.",
      },
      { property: "og:title", content: "Matches — CupVision" },
      { property: "og:description", content: "Browse and search all 2026 FIFA World Cup matches." },
    ],
  }),
  component: MatchesPage,
});

const STATUSES = [
  "all",
  "scheduled",
  "live",
  "awaiting_result",
  "completed",
  "cancelled",
  "postponed",
];
const GROUPS = ["all", ...["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"]];

function MatchesPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [group, setGroup] = useState("all");

  const matches = useQuery({
    queryKey: ["matches", "all"],
    queryFn: () => api.get<Match[]>("/api/matches"),
    refetchInterval: 15_000,
  });

  const filtered = useMemo(() => {
    const list = matches.data || [];
    return list.filter((m) => {
      if (status !== "all" && m.status !== status) return false;
      if (group !== "all" && m.group !== group) return false;
      if (q) {
        const n = q.toLowerCase();
        const hay = [
          m.homeTeam?.name,
          m.awayTeam?.name,
          m.stadium,
          m.city,
          String(m.matchNumber),
          m.stage,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(n)) return false;
      }
      return true;
    });
  }, [matches.data, q, status, group]);

  return (
    <SectionReveal delay={0.08} className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold mb-2">Matches</h1>
      <p className="text-muted-foreground mb-6">Browse fixtures and results.</p>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground z-10" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by team, stadium, city, match #"
            className="pl-10"
          />
        </div>
        <div className="w-full md:w-48">
          <Select value={status} onValueChange={setStatus}>
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
        </div>
        <div className="w-full md:w-48">
          <Select value={group} onValueChange={setGroup}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GROUPS.map((g) => (
                <SelectItem key={g} value={g}>
                  {g === "all" ? "All groups" : `Group ${g}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {matches.isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <MatchCardSkeleton key={i} />
          ))}
        </div>
      ) : matches.isError ? (
        <p className="text-sm text-destructive">Failed to load matches. Check VITE_API_URL.</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">No matches match your filters.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((m) => (
            <MatchCard key={m._id} m={m} />
          ))}
        </div>
      )}
    </SectionReveal>
  );
}
