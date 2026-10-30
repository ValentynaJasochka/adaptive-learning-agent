import type { ExerciseResult } from "../types";

export const mockAnsweredExerciseResult: ExerciseResult = {
  id: "exercise-result-001",
  taskId: "task-listening-001",
  blockId: "block-quiz-001",
  submittedAt: "2026-10-28T10:00:00Z",
  status: "answered",
  response: {
    responseType: "selected_answers",
    selectedOptionIds: ["option-1"],
  },
};

export const mockSkippedExerciseResult: ExerciseResult = {
  id: "exercise-result-002",
  taskId: "task-listening-001",
  blockId: "block-writing-001",
  submittedAt: "2026-10-28T10:01:00Z",
  status: "skipped",
};
