import type { LearningFeedback } from "../types";
import { mockAnsweredExerciseResult } from "./exercise-result";

// Append new versions instead of replacing previous evaluations.
export const mockLearningFeedback: LearningFeedback[] = [
  {
    id: "feedback-001",
    exerciseResultId: mockAnsweredExerciseResult.id,
    version: 1,
    createdBy: "ai",
    summary: "The selected sentence uses the present simple correctly.",
    strengths: ["Recognized correct third-person singular verb agreement."],
    improvements: ["Practise applying the same rule in your own sentences."],
    skillScores: [{ skill: "grammar", score: 1 }],
    createdAt: "2026-10-28T10:02:00Z",
  },
  {
    id: "feedback-002",
    exerciseResultId: mockAnsweredExerciseResult.id,
    version: 2,
    createdBy: "teacher",
    summary: "Correct recognition of verb agreement; broader mastery needs more evidence.",
    strengths: ["Distinguished 'she goes' from the incorrect alternatives."],
    improvements: ["Practise third-person agreement in negative sentences and questions."],
    skillScores: [{ skill: "grammar", score: 0.9 }],
    createdAt: "2026-10-28T11:00:00Z",
  },
];

/** Only the latest version should eventually contribute to student progress. */
export function getLatestFeedback(
  feedbacks: LearningFeedback[],
  exerciseResultId: string,
): LearningFeedback | undefined {
  return feedbacks
    .filter((feedback) => feedback.exerciseResultId === exerciseResultId)
    .reduce<LearningFeedback | undefined>(
      (latest, feedback) =>
        latest === undefined || feedback.version > latest.version ? feedback : latest,
      undefined,
    );
}
