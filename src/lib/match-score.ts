export function formatScoreValue(score?: number, penaltyScore?: number) {
  const base = String(score ?? 0);
  return typeof penaltyScore === "number" ? `${base} (${penaltyScore})` : base;
}
