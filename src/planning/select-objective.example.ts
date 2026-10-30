import type { ObjectiveDecision, ObjectiveMastery } from "../types";
import { MASTERY_ADVANCE_THRESHOLD, MIN_OBJECTIVE_CONFIDENCE, selectObjective } from "./select-objective";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function check(
  value: number | undefined,
  confidence: number,
  decision: ObjectiveDecision,
  reason: string,
): void {
  const mastery: ObjectiveMastery = {
    objectiveId: "local-objective",
    mastery: value,
    confidence,
    evidenceIds: ["local-evidence"],
    lastUpdatedAt: "2026-10-30T12:00:00Z",
  };
  const before = JSON.stringify(mastery);
  Object.freeze(mastery.evidenceIds);
  Object.freeze(mastery);
  const result = selectObjective(mastery.objectiveId, mastery);
  assert(result.objectiveId === mastery.objectiveId && result.mastery === value
    && result.confidence === confidence && result.decision === decision && result.reason === reason,
    `Unexpected selection: ${JSON.stringify(result)}`);
  assert(JSON.stringify(mastery) === before, "Input was mutated");
}

assert(MIN_OBJECTIVE_CONFIDENCE === 0.5 && MASTERY_ADVANCE_THRESHOLD === 0.8,
  "Unexpected decision thresholds");
check(undefined, 0.9, "assess", "Mastery is unknown; assess the objective.");
check(0.95, 0.49, "assess", "Confidence is below 0.5; assess the objective.");
check(0.7, 0.7, "practice", "Confidence is sufficient, but mastery is below 0.8; practise the objective.");
check(0.9, 0.7, "advance", "Confidence is sufficient and mastery is at least 0.8; advance.");
check(0.79, 0.5, "practice", "Confidence is sufficient, but mastery is below 0.8; practise the objective.");
check(0.8, 0.5, "advance", "Confidence is sufficient and mastery is at least 0.8; advance.");

const mismatched: ObjectiveMastery = {
  objectiveId: "other-objective",
  confidence: 0,
  evidenceIds: [],
  lastUpdatedAt: "2026-10-30T12:00:00Z",
};
const beforeMismatch = JSON.stringify(mismatched);
let threw = false;
try {
  selectObjective("local-objective", mismatched);
} catch (error) {
  threw = error instanceof Error && error.message === "Objective ID does not match mastery objective ID.";
}
assert(threw, "Expected an objective ID mismatch error");
assert(JSON.stringify(mismatched) === beforeMismatch, "Mismatch validation mutated input");
console.log("selectObjective: all example checks passed.");
