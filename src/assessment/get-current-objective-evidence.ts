import type { Evidence, LearningFeedback } from "../types";
import { getLatestFeedback } from "../learning/feedback";

export function getCurrentObjectiveEvidence(
  objectiveId: string,
  evidence: Evidence[],
  feedbacks: LearningFeedback[],
): Evidence[] {
  const diagnosticIds = new Set<string>();
  const exerciseResultIds = new Set<string>();
  return evidence.filter((record) => {
    if (!record.objectiveScores?.some((score) => score.objectiveId === objectiveId)) return false;
    if (record.sourceType === "diagnostic") {
      if (diagnosticIds.has(record.id)) return false;
      diagnosticIds.add(record.id);
      return true;
    }
    const latest = getLatestFeedback(feedbacks, record.exerciseResultId);
    if (!latest || latest.id !== record.feedbackId
      || latest.exerciseResultId !== record.exerciseResultId
      || exerciseResultIds.has(record.exerciseResultId)) return false;
    exerciseResultIds.add(record.exerciseResultId);
    return true;
  });
}
