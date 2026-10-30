import type { ObjectiveMastery, ObjectiveSelection } from "../types";

export const MIN_OBJECTIVE_CONFIDENCE = 0.5;
export const MASTERY_ADVANCE_THRESHOLD = 0.8;

export function selectObjective(
  objectiveId: string,
  mastery: ObjectiveMastery,
): ObjectiveSelection {
  if (objectiveId !== mastery.objectiveId) {
    throw new Error("Objective ID does not match mastery objective ID.");
  }
  const values = { objectiveId, mastery: mastery.mastery, confidence: mastery.confidence };
  if (mastery.mastery === undefined) {
    return { ...values, decision: "assess", reason: "Mastery is unknown; assess the objective." };
  }
  if (mastery.confidence < MIN_OBJECTIVE_CONFIDENCE) {
    return { ...values, decision: "assess", reason: "Confidence is below 0.5; assess the objective." };
  }
  if (mastery.mastery < MASTERY_ADVANCE_THRESHOLD) {
    return { ...values, decision: "practice", reason: "Confidence is sufficient, but mastery is below 0.8; practise the objective." };
  }
  return { ...values, decision: "advance", reason: "Confidence is sufficient and mastery is at least 0.8; advance." };
}
