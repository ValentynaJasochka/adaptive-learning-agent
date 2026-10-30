import type { Evidence } from "../types";
import { calculateObjectiveMastery } from "./calculate-objective-mastery";

const objectiveId = "local-objective";
const calculatedAt = "2026-10-29T12:00:00Z";

function fixture(id: string, score: number): Evidence {
  return {
    id,
    sourceType: "diagnostic",
    sourceId: "local-diagnostic",
    skillScores: [],
    objectiveScores: [{ objectiveId, score }],
    observations: [],
    createdAt: "2026-10-28",
  };
}

function approximate(actual: number | undefined, expected: number | undefined): void {
  if (actual === expected) return;
  if (actual === undefined || expected === undefined || !Number.isFinite(actual)
    || Math.abs(actual - expected) > 1e-12) {
    throw new Error(`Expected ${expected}, received ${actual}`);
  }
}

function check(records: Evidence[], mastery: number | undefined, confidence: number, ids: string[]): void {
  const before = JSON.stringify(records);
  const result = calculateObjectiveMastery(objectiveId, records, calculatedAt);
  approximate(result.mastery, mastery);
  approximate(result.confidence, confidence);
  if (result.objectiveId !== objectiveId || result.lastUpdatedAt !== calculatedAt
    || JSON.stringify(result.evidenceIds) !== JSON.stringify(ids)) {
    throw new Error(`Unexpected result: ${JSON.stringify(result)}`);
  }
  if (JSON.stringify(records) !== before) throw new Error("Input was mutated");
}

check([], undefined, 0, []);
const missing: Evidence = { ...fixture("missing", 1), objectiveScores: undefined };
const unrelated: Evidence = {
  ...fixture("unrelated", 1),
  objectiveScores: [{ objectiveId: "other-objective", score: 1 }],
};
check([missing, unrelated], undefined, 0, []);
check([fixture("one", 0.9)], 0.9, 0.25, ["one"]);
check([fixture("a", 0.9), unrelated, fixture("b", 0.7), missing, fixture("c", 0.8)],
  0.8, 0.5, ["a", "b", "c"]);
check([fixture("a", 0.3), fixture("b", 0.4), fixture("c", 0.5)],
  0.4, 0.5, ["a", "b", "c"]);
check([0.7, 0.8, 0.9, 0.8, 0.8].map((score, index) => fixture(`e${index}`, score)),
  0.8, 0.625, ["e0", "e1", "e2", "e3", "e4"]);
const multiple: Evidence = {
  ...fixture("multiple", 0.7),
  objectiveScores: [{ objectiveId: "other-objective", score: 0.1 }, { objectiveId, score: 0.7 }],
};
// Freeze nested objects and arrays so mutation attempts also fail during execution.
multiple.objectiveScores?.forEach(Object.freeze);
Object.freeze(multiple.objectiveScores);
Object.freeze(multiple.skillScores);
Object.freeze(multiple.observations);
Object.freeze(multiple);
const frozenRecords = [multiple];
Object.freeze(frozenRecords);
check(frozenRecords, 0.7, 0.25, ["multiple"]);
console.log("calculateObjectiveMastery: all example checks passed.");
