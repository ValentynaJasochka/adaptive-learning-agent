import type { LearningResult } from "../types";

export const mockLearningResult: LearningResult = {
  id: "result-001",
  taskId: "task-listening-001",
  completedAt: "2026-10-28T11:00:00Z",
  // Only the answered quiz's latest feedback (version 2) contributes scores.
  score: 0.9,
  passed: true,
  evidenceIds: [],
  exerciseResultIds: ["exercise-result-001", "exercise-result-002"],
  completionRate: 0.5, // One answered exercise out of two; the other was skipped.
  skillScores: [{ skill: "grammar", score: 0.9 }],
};
