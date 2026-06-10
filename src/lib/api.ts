import { env } from "@/config/env";

const API_URL = env.apiUrl;
const TOKEN_KEY = "cupvision_admin_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(t: string) {
  localStorage.setItem(TOKEN_KEY, t);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, opts: RequestInit = {}, auth = false): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(opts.headers as Record<string, string>),
  };
  if (opts.body && !(opts.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  if (auth) {
    const t = getToken();
    if (t) headers.Authorization = `Bearer ${t}`;
  }
  const res = await fetch(`${API_URL}${path}`, { ...opts, headers });
  const text = await res.text();
  const data = text
    ? (() => {
        try {
          return JSON.parse(text);
        } catch {
          return text;
        }
      })()
    : null;
  if (!res.ok) {
    const msg = (data && (data as any).error) || res.statusText || "Request failed";
    throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
  }
  return data as T;
}

export const api = {
  get: <T>(p: string) => request<T>(p),
  post: <T>(p: string, body?: any, auth = false) =>
    request<T>(
      p,
      { method: "POST", body: body instanceof FormData ? body : JSON.stringify(body || {}) },
      auth,
    ),
  put: <T>(p: string, body?: any) =>
    request<T>(p, { method: "PUT", body: JSON.stringify(body || {}) }, true),
  del: <T>(p: string) => request<T>(p, { method: "DELETE" }, true),
  authed: <T>(p: string) => request<T>(p, {}, true),
};

export { API_URL };

// Domain types
export interface Team {
  _id: string;
  name: string;
  group?: string;
  flag?: string;
}
export interface Match {
  _id: string;
  matchNumber: number;
  homeTeamId: string;
  awayTeamId: string;
  homeTeam?: Team | null;
  awayTeam?: Team | null;
  date: string;
  time: string;
  stadium: string;
  city: string;
  stage: string;
  group?: string;
  status: "scheduled" | "live" | "awaiting_result" | "completed" | "cancelled" | "postponed";
  homeScore?: number;
  awayScore?: number;
  winnerTeamId?: string | null;
  isDraw?: boolean;
  notes?: string;
}
export interface Author {
  _id: string;
  name: string;
  role: string;
  image?: string;
  bio?: string;
  github?: string;
  linkedin?: string;
  portfolio?: string;
}
export interface Player {
  _id: string;
  teamId: string;
  team?: Team | null;
  name: string;
  position: "GK" | "DEF" | "MID" | "FWD" | "COACH";
  jerseyNumber?: number;
  dateOfBirth?: string;
  height?: number;
  club?: string;
  nationality?: string;
  role?: string;
}
export interface Channel {
  _id: string;
  name: string;
  category?: string;
  badge?: string;
  description?: string;
  poster?: string;
  accent?: string;
  streamType: "hls" | "file" | "auto";
  isFeatured?: boolean;
  isPublished?: boolean;
  sortOrder?: number;
  playbackUrl: string;
  useRedirect?: boolean;
  redirectUrl?: string;
  redirectLabel?: string;
}
export interface AdminChannel extends Channel {
  streamType: "hls" | "file" | "auto";
  sourceUrl: string;
}
export interface Standing {
  teamId: string;
  team: Team;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
}
