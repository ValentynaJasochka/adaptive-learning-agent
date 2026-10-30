import type { DiagnosticEvidence, Evidence, LearningFeedback, LearningTaskEvidence } from "../types";
import { getCurrentObjectiveEvidence } from "./get-current-objective-evidence";

const objectiveId = "local-objective";
const diagnostic: DiagnosticEvidence = {
  id: "diagnostic-evidence",
  sourceType: "diagnostic",
  sourceId: "diagnostic-1",
  skillScores: [],
  objectiveScores: [{ objectiveId, score: 0.8 }],
  observations: [],
  createdAt: "2026-10-29",
};
const v1: LearningFeedback = {
  id: "feedback-v1",
  exerciseResultId: "exercise-1",
  version: 1,
  createdBy: "ai",
  summary: "Local fixture",
  strengths: [],
  improvements: [],
  skillScores: [],
  objectiveScores: [{ objectiveId, score: 0.8 }],
  createdAt: "2026-10-29",
};
const v2: LearningFeedback = { ...v1, id: "feedback-v2", version: 2, createdBy: "teacher" };
const oldEvidence: LearningTaskEvidence = {
  ...diagnostic,
  id: "learning-v1",
  sourceType: "learning_task",
  sourceId: "task-1",
  exerciseResultId: v1.exerciseResultId,
  feedbackId: v1.id,
  difficulty: 0.5,
};
const current: LearningTaskEvidence = { ...oldEvidence, id: "learning-v2", feedbackId: v2.id };
const other: Evidence = {
  ...diagnostic,
  id: "other",
  objectiveScores: [{ objectiveId: "other-objective", score: 1 }],
};

function check(evidence: Evidence[], feedbacks: LearningFeedback[], expected: Evidence[]): void {
  const before = JSON.stringify({ evidence, feedbacks });
  const actual = getCurrentObjectiveEvidence(objectiveId, evidence, feedbacks);
  if (actual.length !== expected.length || actual.some((record, index) => record !== expected[index])) {
    throw new Error(`Unexpected evidence: ${JSON.stringify(actual)}`);
  }
  if (JSON.stringify({ evidence, feedbacks }) !== before) throw new Error("Inputs were mutated");
}

check([], [], []);
check([diagnostic], [], [diagnostic]);
check([other, { ...diagnostic, objectiveScores: undefined }], [], []);
check([oldEvidence], [v1], [oldEvidence]);
check([oldEvidence, current], [v2, v1], [current]);
check([oldEvidence], [v1, v2], []); // No fallback when current evidence is missing.
check([current], [], []);
check([current], [{ ...v2, exerciseResultId: "different-exercise" }], []);
check([current, { ...current, id: "duplicate-learning" }], [v1, v2], [current]);
check([diagnostic, { ...diagnostic }], [], [diagnostic]);
check([other, current, diagnostic, oldEvidence], [v1, v2], [current, diagnostic]);
check([diagnostic, oldEvidence, current, other], [v1, v2], [diagnostic, current]);
console.log("getCurrentObjectiveEvidence: all example checks passed.");
