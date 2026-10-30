import type { ActivityType, LearningObjective, SelectedActivity, TaskBlueprint } from "../types";

const REQUIRED_RESPONSE_TYPES: Record<ActivityType, readonly TaskBlueprint["requiredResponseTypes"][number][]> = {
  grammar_exercise: ["selected_answers"],
  vocabulary_practice: ["selected_answers"],
  flashcards: ["completion"],
  quiz: ["selected_answers"],
  read_article: ["selected_answers"],
  read_book: ["selected_answers"],
  listen_audio: ["selected_answers"],
  watch_video: ["selected_answers"],
  conversation: ["audio_answer"],
  monologue: ["audio_answer"],
  writing_task: ["written_answer"],
};

// Initial duration heuristics in minutes, not CEFR standards.
const ESTIMATED_MINUTES: Record<ActivityType, number> = {
  grammar_exercise: 15,
  vocabulary_practice: 15,
  flashcards: 10,
  quiz: 15,
  read_article: 20,
  read_book: 25,
  listen_audio: 20,
  watch_video: 20,
  conversation: 20,
  monologue: 15,
  writing_task: 25,
};

export function createTaskBlueprint(
  objective: LearningObjective,
  selection: SelectedActivity,
): TaskBlueprint {
  if (objective.id !== selection.objectiveId) {
    throw new Error("Objective ID does not match selected activity objective ID.");
  }
  return {
    objectiveId: objective.id,
    activityType: selection.activityType,
    purpose: selection.decision === "assess" ? "assessment" : "practice",
    targetSkills: [objective.skill],
    targetCEFR: objective.targetCEFR,
    assessmentCriteria: [...objective.assessmentCriteria],
    requiredResponseTypes: [...REQUIRED_RESPONSE_TYPES[selection.activityType]],
    estimatedMinutes: ESTIMATED_MINUTES[selection.activityType],
  };
}
