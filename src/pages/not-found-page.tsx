import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center">
      <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/75">404</p>
      <h2 className="mt-3 text-3xl font-semibold text-white">Route not found</h2>
      <p className="mt-3 text-zinc-300">Return to public dashboard.</p>
      <Link
        to="/"
        className="mt-6 inline-flex rounded-full bg-cyan-400 px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-cyan-300"
      >
        Go home
      </Link>
    </div>
  );
}
