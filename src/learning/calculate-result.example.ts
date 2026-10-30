import type { ExerciseResult, LearningFeedback } from "../types";
import { calculateLearningResult } from "./calculate-result";
import { mockAnsweredExerciseResult, mockSkippedExerciseResult } from "./exercise-result";
import { mockLearningFeedback } from "./feedback";

function check(actual: unknown, expected: unknown): void {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`Expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
  }
}

const exercises = [mockAnsweredExerciseResult, mockSkippedExerciseResult];
const before = JSON.stringify({ exercises, feedbacks: mockLearningFeedback });
check(calculateLearningResult(exercises, mockLearningFeedback), {
  completionRate: 0.5,
  score: 0.9,
  skillScores: [{ skill: "grammar", score: 0.9 }],
});
check(JSON.stringify({ exercises, feedbacks: mockLearningFeedback }), before);
check(calculateLearningResult([], mockLearningFeedback), { completionRate: 0, skillScores: [] });
check(calculateLearningResult(exercises, []), { completionRate: 0.5, skillScores: [] });
check(calculateLearningResult([mockSkippedExerciseResult], mockLearningFeedback), {
  completionRate: 0,
  skillScores: [],
});
const firstExercise: ExerciseResult = {
  ...mockAnsweredExerciseResult,
  id: "local-exercise-1",
};
const secondExercise: ExerciseResult = {
  ...mockAnsweredExerciseResult,
  id: "local-exercise-2",
};
const firstFeedback: LearningFeedback = {
  id: "local-feedback-1",
  exerciseResultId: firstExercise.id,
  version: 1,
  createdBy: "ai",
  summary: "Local evaluation fixture",
  strengths: [],
  improvements: [],
  skillScores: [
    { skill: "grammar", score: 0.25 },
    { skill: "writing", score: 0.75 },
  ],
  createdAt: "2026-10-28T12:00:00Z",
};
const secondFeedback: LearningFeedback = {
  ...firstFeedback,
  id: "local-feedback-2",
  exerciseResultId: secondExercise.id,
  skillScores: [{ skill: "grammar", score: 1 }],
};

// Exercise means are 0.5 and 1; skills are averaged independently.
check(calculateLearningResult([firstExercise, secondExercise], [firstFeedback, secondFeedback]), {
  completionRate: 1,
  score: 0.75,
  skillScores: [
    { skill: "grammar", score: 0.625 },
    { skill: "writing", score: 0.75 },
  ],
});

const revisedFeedback: LearningFeedback = {
  ...firstFeedback,
  id: "local-feedback-1-v2",
  version: 2,
  createdBy: "teacher",
  skillScores: [{ skill: "grammar", score: 0.75 }],
};
// Put the highest version first to verify selection is independent of array order.
check(calculateLearningResult([firstExercise], [revisedFeedback, firstFeedback]), {
  completionRate: 1,
  score: 0.75,
  skillScores: [{ skill: "grammar", score: 0.75 }],
});

// The second answer has no feedback: it increases completion but leaves scores unchanged.
check(calculateLearningResult([firstExercise, secondExercise], [firstFeedback]), {
  completionRate: 1,
  score: 0.5,
  skillScores: [
    { skill: "grammar", score: 0.25 },
    { skill: "writing", score: 0.75 },
  ],
});
console.log("calculateLearningResult example checks passed.");
