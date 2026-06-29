import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Lock } from "lucide-react";
import { api } from "@/lib/api";
import type { ReactNode } from "react";

interface SiteSettings {
  disabledNav?: Record<string, { message: string }>;
}

export function DisabledRouteGuard({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { data } = useQuery({
    queryKey: ["site-settings"],
    queryFn: () => api.get<SiteSettings>("/api/settings"),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const disabled = data?.disabledNav || {};
  // Match exact or as prefix (e.g. /matches/123 blocked by /matches)
  const match = Object.entries(disabled).find(([to]) => {
    if (to === "/") return path === "/";
    return path === to || path.startsWith(to + "/");
  });

  if (!match) return <>{children}</>;
  const message = match[1].message || "This section is temporarily unavailable.";

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full border border-white/10 bg-white/5 text-primary motion-safe:animate-pulse">
          <Lock className="size-9" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Section unavailable</h1>
        <p className="mt-3 text-sm text-muted-foreground">{message}</p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
