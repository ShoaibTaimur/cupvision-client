export const BRACKET_PAIRINGS: Record<number, [number, number]> = {
  89: [73, 75],
  90: [74, 77],
  91: [76, 78],
  92: [79, 80],
  93: [83, 84],
  94: [81, 82],
  95: [86, 88],
  96: [85, 87],
  97: [89, 90],
  98: [93, 94],
  99: [91, 92],
  100: [95, 96],
  101: [97, 98],
  102: [99, 100],
};

// Visual topology order source of truth.
// Downstream rounds derive from previous round child order.
const R32_MATCH_ORDER = [73, 75, 74, 77, 83, 84, 81, 82, 76, 78, 79, 80, 86, 88, 85, 87] as const;
const FINAL_MATCH_ORDER = [104] as const;

function deriveRoundOrder(matchNumbers: number[], previousRoundOrder: readonly number[]) {
  const previousIndex = new Map(previousRoundOrder.map((matchNumber, index) => [matchNumber, index]));
  return [...matchNumbers].sort((a, b) => {
    const [a1, a2] = BRACKET_PAIRINGS[a];
    const [b1, b2] = BRACKET_PAIRINGS[b];
    const aPos = ((previousIndex.get(a1) ?? 0) + (previousIndex.get(a2) ?? 0)) / 2;
    const bPos = ((previousIndex.get(b1) ?? 0) + (previousIndex.get(b2) ?? 0)) / 2;
    return aPos - bPos;
  });
}

const R16_MATCH_ORDER = deriveRoundOrder([89, 90, 91, 92, 93, 94, 95, 96], R32_MATCH_ORDER);
const QF_MATCH_ORDER = deriveRoundOrder([97, 98, 99, 100], R16_MATCH_ORDER);
const SF_MATCH_ORDER = deriveRoundOrder([101, 102], QF_MATCH_ORDER);

export const BRACKET_COLUMNS = [
  {
    key: "r32",
    title: "Round of 32",
    matches: R32_MATCH_ORDER,
  },
  {
    key: "r16",
    title: "Round of 16",
    matches: R16_MATCH_ORDER,
  },
  {
    key: "qf",
    title: "Quarter Finals",
    matches: QF_MATCH_ORDER,
  },
  {
    key: "sf",
    title: "Semi Finals",
    matches: SF_MATCH_ORDER,
  },
  {
    key: "final",
    title: "Final",
    matches: FINAL_MATCH_ORDER,
  },
] as const;

export function bracketPrefixFor(srcMatchNumber: number) {
  if (srcMatchNumber >= 73 && srcMatchNumber <= 88) return "R32";
  if (srcMatchNumber >= 89 && srcMatchNumber <= 96) return "R16";
  if (srcMatchNumber >= 97 && srcMatchNumber <= 100) return "QF";
  return "";
}

function validateBracketConfig() {
  const allColumnMatches = BRACKET_COLUMNS.flatMap((column) => [...column.matches]);
  const uniqueMatches = new Set(allColumnMatches);
  if (uniqueMatches.size !== allColumnMatches.length) {
    throw new Error("Invalid bracket config: duplicate match in BRACKET_COLUMNS");
  }

  const expectedColumns = [
    { key: "r32", count: 16, min: 73, max: 88 },
    { key: "r16", count: 8, min: 89, max: 96 },
    { key: "qf", count: 4, min: 97, max: 100 },
    { key: "sf", count: 2, min: 101, max: 102 },
    { key: "final", count: 1, min: 104, max: 104 },
  ] as const;

  expectedColumns.forEach((expected, index) => {
    const column = BRACKET_COLUMNS[index];
    if (column.key !== expected.key) {
      throw new Error(`Invalid bracket config: expected column ${expected.key}`);
    }
    if (column.matches.length !== expected.count) {
      throw new Error(`Invalid bracket config: ${expected.key} length mismatch`);
    }
    column.matches.forEach((matchNumber) => {
      if (matchNumber < expected.min || matchNumber > expected.max) {
        throw new Error(`Invalid bracket config: ${expected.key} contains out-of-range match ${matchNumber}`);
      }
    });
  });

  const r32Set = new Set(BRACKET_COLUMNS[0].matches);
  const r16Set = new Set(BRACKET_COLUMNS[1].matches);
  const qfSet = new Set(BRACKET_COLUMNS[2].matches);
  const sfSet = new Set(BRACKET_COLUMNS[3].matches);

  BRACKET_COLUMNS[1].matches.forEach((matchNumber, index) => {
    const expectedChildren = BRACKET_PAIRINGS[matchNumber];
    const actualChildren = BRACKET_COLUMNS[0].matches.slice(index * 2, index * 2 + 2);
    if (
      !expectedChildren ||
      actualChildren.length !== 2 ||
      actualChildren[0] !== expectedChildren[0] ||
      actualChildren[1] !== expectedChildren[1]
    ) {
      throw new Error(`Invalid bracket config: R32 topology mismatch under match ${matchNumber}`);
    }
  });

  Object.entries(BRACKET_PAIRINGS).forEach(([childKey, [a, b]]) => {
    const child = Number(childKey);
    if (child >= 89 && child <= 96) {
      if (!r16Set.has(child) || !r32Set.has(a) || !r32Set.has(b)) {
        throw new Error(`Invalid bracket config: R16 pairing mismatch for match ${child}`);
      }
    } else if (child >= 97 && child <= 100) {
      if (!qfSet.has(child) || !r16Set.has(a) || !r16Set.has(b)) {
        throw new Error(`Invalid bracket config: QF pairing mismatch for match ${child}`);
      }
    } else if (child >= 101 && child <= 102) {
      if (!sfSet.has(child) || !qfSet.has(a) || !qfSet.has(b)) {
        throw new Error(`Invalid bracket config: SF pairing mismatch for match ${child}`);
      }
    }
  });
}

validateBracketConfig();
