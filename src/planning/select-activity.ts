import type {
  ActivityType, LearningObjective, LearningPreferences, PrioritizedObjective, SelectedActivity, Skill,
} from "../types";

const ACTIVITY_CANDIDATES: Record<
  Skill,
  Record<PrioritizedObjective["decision"], readonly [ActivityType, ...ActivityType[]]>
> = {
  grammar: { assess: ["quiz"], practice: ["grammar_exercise", "quiz"] },
  vocabulary: { assess: ["quiz"], practice: ["vocabulary_practice", "flashcards"] },
  reading: { assess: ["read_article"], practice: ["read_article", "read_book"] },
  listening: { assess: ["listen_audio"], practice: ["listen_audio", "watch_video"] },
  speaking: { assess: ["monologue"], practice: ["conversation", "monologue"] },
  writing: { assess: ["writing_task"], practice: ["writing_task"] },
};

export function selectActivity(
  objective: LearningObjective,
  prioritized: PrioritizedObjective,
  preferences: LearningPreferences,
): SelectedActivity {
  if (objective.id !== prioritized.objectiveId) {
    throw new Error("Objective ID does not match prioritized objective ID.");
  }
  const candidates = ACTIVITY_CANDIDATES[objective.skill][prioritized.decision];
  const remaining = candidates.filter((activity) => !preferences.dislikedActivities.includes(activity));
  const preferred = remaining.find((activity) => preferences.preferredActivities.includes(activity));
  return {
    objectiveId: objective.id,
    decision: prioritized.decision,
    activityType: preferred ?? remaining[0] ?? candidates[0],
    reason: remaining.length === 0 ? "disliked_fallback"
      : preferred !== undefined ? "preferred_activity" : "default_activity",
  };
}
