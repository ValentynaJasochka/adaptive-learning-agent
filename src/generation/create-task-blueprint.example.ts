import type { ActivityType, LearningObjective, SelectedActivity, TaskBlueprint } from "../types";
import { createTaskBlueprint } from "./create-task-blueprint";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}
function check(actual: unknown, expected: unknown): void {
  assert(JSON.stringify(actual) === JSON.stringify(expected),
    `Expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
}

const cases: Record<ActivityType, [TaskBlueprint["requiredResponseTypes"][number], number]> = {
  grammar_exercise: ["selected_answers", 15],
  vocabulary_practice: ["selected_answers", 15],
  flashcards: ["completion", 10],
  quiz: ["selected_answers", 15],
  read_article: ["selected_answers", 20],
  read_book: ["selected_answers", 25],
  listen_audio: ["selected_answers", 20],
  watch_video: ["selected_answers", 20],
  conversation: ["audio_answer", 20],
  monologue: ["audio_answer", 15],
  writing_task: ["written_answer", 25],
};
const activities: ActivityType[] = [
  "grammar_exercise", "vocabulary_practice", "flashcards", "quiz", "read_article",
  "read_book", "listen_audio", "watch_video", "conversation", "monologue", "writing_task",
];
const decisions: SelectedActivity["decision"][] = ["assess", "practice"];
check([...activities].sort(), Object.keys(cases).sort());
assert(new Set(activities).size === 11, "Expected all 11 distinct activities");
const objective: LearningObjective = {
  id: "local-objective", skill: "grammar", targetCEFR: "B1",
  title: "Local objective", description: "Local fixture",
  assessmentCriteria: ["Use the correct verb form.", "Use an appropriate time expression."],
};
Object.freeze(objective.assessmentCriteria);
Object.freeze(objective);

for (const activityType of activities) {
  for (const decision of decisions) {
    const selection: SelectedActivity = {
      objectiveId: objective.id, activityType, decision, reason: "default_activity",
    };
    Object.freeze(selection);
    const before = JSON.stringify({ objective, selection });
    const [responseType, estimatedMinutes] = cases[activityType];
    const first = createTaskBlueprint(objective, selection);
    const second = createTaskBlueprint(objective, selection);
    const expected: TaskBlueprint = {
      objectiveId: objective.id,
      activityType,
      purpose: decision === "assess" ? "assessment" : "practice",
      targetSkills: [objective.skill],
      targetCEFR: objective.targetCEFR,
      assessmentCriteria: [...objective.assessmentCriteria],
      requiredResponseTypes: [responseType],
      estimatedMinutes,
    };
    check(first, expected);
    check(second, first);
    assert(first.assessmentCriteria !== objective.assessmentCriteria,
      "Assessment criteria must be copied");
    assert(first.assessmentCriteria !== second.assessmentCriteria
      && first.requiredResponseTypes !== second.requiredResponseTypes
      && first.targetSkills !== second.targetSkills, "Calls must return independent arrays");
    first.assessmentCriteria.push("Caller-added criterion");
    first.requiredResponseTypes.splice(0, 1);
    first.targetSkills.push("writing");
    check(second, expected);
    check(createTaskBlueprint(objective, selection), expected);
    check(JSON.stringify({ objective, selection }), before);
  }
}

const mismatched: SelectedActivity = {
  objectiveId: "other-objective", decision: "assess", activityType: "quiz", reason: "default_activity",
};
Object.freeze(mismatched);
const beforeMismatch = JSON.stringify({ objective, mismatched });
let threw = false;
try {
  createTaskBlueprint(objective, mismatched);
} catch (error) {
  threw = error instanceof Error
    && error.message === "Objective ID does not match selected activity objective ID.";
}
assert(threw, "Expected the exact objective ID mismatch error");
check(JSON.stringify({ objective, mismatched }), beforeMismatch);
console.log("createTaskBlueprint: all example checks passed.");
