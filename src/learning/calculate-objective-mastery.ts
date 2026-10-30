import type { Evidence, ObjectiveMastery } from "../types";

// Evidence is already filtered to current, independent records by the caller.
export function calculateObjectiveMastery(
  objectiveId: string,
  evidence: Evidence[],
  calculatedAt: string,
): ObjectiveMastery {
  let total = 0;
  const evidenceIds: string[] = [];
  for (const record of evidence) {
    const score = record.objectiveScores?.find((entry) => entry.objectiveId === objectiveId);
    if (score === undefined) continue;
    total += score.score;
    evidenceIds.push(record.id);
  }
  const n = evidenceIds.length;
  return {
    objectiveId,
    mastery: n === 0 ? undefined : total / n,
    confidence: n / (n + 3),
    evidenceIds,
    lastUpdatedAt: calculatedAt,
  };
}
