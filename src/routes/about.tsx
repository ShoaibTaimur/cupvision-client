import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — CupVision" },
      { name: "description", content: "About CupVision: purpose, features and tech stack." },
      { property: "og:title", content: "About — CupVision" },
      { property: "og:description", content: "About CupVision: purpose, features and tech stack." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">About CupVision</h1>
      <p className="text-muted-foreground mb-8">Track. Analyze. Follow.</p>

      <section className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">Purpose</h2>
          <p className="text-sm text-muted-foreground">
            CupVision is a fan-built companion for the 2026 FIFA World Cup. It provides live match
            status, group standings, and a full timeline — all from data curated by our admins (no
            FIFA APIs).
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Features</h2>
          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
            <li>Match tracking with rich status (scheduled, live, completed, …)</li>
            <li>Live watch tab powered by admin-managed channel publishing</li>
            <li>Dynamic group standings (no stored stats)</li>
            <li>Team statistics and per-team breakdown</li>
            <li>Search across teams, stadiums, cities and match numbers</li>
            <li>Chronological timeline view</li>
            <li>Admin dashboard with CSV import</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Stack</h2>
          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
            <li>Frontend: Vite, React, TypeScript, TanStack Router, Tailwind CSS</li>
            <li>Backend: Node.js, Express, TypeScript</li>
            <li>Database: MongoDB Atlas (native driver)</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
