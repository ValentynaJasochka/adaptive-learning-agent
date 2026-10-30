import type { LearningFeedback, LearningTaskEvidence } from "../types";
import { calculateObjectiveMastery } from "../learning/calculate-objective-mastery";
import { getCurrentObjectiveEvidence } from "./get-current-objective-evidence";

const objectiveId = "grammar-present-perfect-experience";
const calculatedAt = "2026-10-30T12:00:00Z";
const aiV1: LearningFeedback = {
  id: "feedback-exercise-1-v1",
  exerciseResultId: "exercise-result-1",
  version: 1,
  createdBy: "ai",
  summary: "Local integration fixture",
  strengths: [],
  improvements: [],
  skillScores: [],
  objectiveScores: [{ objectiveId, score: 0.9 }],
  createdAt: "2026-10-30T10:00:00Z",
};
const teacherV2: LearningFeedback = {
  ...aiV1,
  id: "feedback-exercise-1-v2",
  version: 2,
  createdBy: "teacher",
  objectiveScores: [{ objectiveId, score: 0.7 }],
  createdAt: "2026-10-30T11:00:00Z",
};
const secondAiV1: LearningFeedback = {
  ...aiV1,
  id: "feedback-exercise-2-v1",
  exerciseResultId: "exercise-result-2",
  objectiveScores: [{ objectiveId, score: 0.8 }],
};

function evidenceFor(feedback: LearningFeedback): LearningTaskEvidence {
  return {
    id: `evidence-${feedback.id}`,
    sourceType: "learning_task",
    sourceId: "local-task",
    exerciseResultId: feedback.exerciseResultId,
    feedbackId: feedback.id,
    difficulty: 0.5,
    skillScores: [],
    objectiveScores: feedback.objectiveScores?.map((score) => ({ ...score })),
    observations: [],
    createdAt: feedback.createdAt,
  };
}

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function approximate(actual: number | undefined, expected: number): void {
  assert(actual !== undefined && Number.isFinite(actual) && Math.abs(actual - expected) < 1e-12,
    `Expected ${expected}, received ${actual}`);
}

const oldEvidence = evidenceFor(aiV1);
const teacherEvidence = evidenceFor(teacherV2);
const secondEvidence = evidenceFor(secondAiV1);
const evidence = [oldEvidence, secondEvidence, teacherEvidence];
const feedbacks = [teacherV2, aiV1, secondAiV1];
const before = JSON.stringify({ evidence, feedbacks });
const current = getCurrentObjectiveEvidence(objectiveId, evidence, feedbacks);
assert(current.length === 2, "Expected exactly two current evidence records");
assert(current[0] === secondEvidence && current[1] === teacherEvidence,
  "Expected exercise 2 AI v1 and exercise 1 teacher v2 in input order");
assert(!current.includes(oldEvidence), "Superseded AI evidence must be excluded");
assert(JSON.stringify({ evidence, feedbacks }) === before, "Selection mutated inputs");

const currentBefore = JSON.stringify(current);
const mastery = calculateObjectiveMastery(objectiveId, current, calculatedAt);
approximate(mastery.mastery, 0.75);
approximate(mastery.confidence, 0.4);
assert(JSON.stringify(mastery.evidenceIds) === JSON.stringify([secondEvidence.id, teacherEvidence.id]),
  "Unexpected contributing evidence IDs or order");
assert(mastery.objectiveId === objectiveId, "Unexpected objective ID");
assert(mastery.lastUpdatedAt === calculatedAt, "Unexpected calculation timestamp");
assert(JSON.stringify(current) === currentBefore, "Calculation mutated selected evidence");
assert(JSON.stringify({ evidence, feedbacks }) === before, "Calculation mutated original inputs");
console.log("Objective mastery integration example: all checks passed.");
