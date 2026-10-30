import type {
  ActivitySelectionReason, ActivityType, LearningObjective, LearningPreferences,
  PrioritizedObjective, Skill,
} from "../types";
import { selectActivity } from "./select-activity";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function fixtures(
  skill: Skill,
  decision: PrioritizedObjective["decision"],
  preferredActivities: ActivityType[] = [],
  dislikedActivities: ActivityType[] = [],
) {
  const objective: LearningObjective = {
    id: `local-${skill}`, skill, targetCEFR: "B1", title: "Local objective",
    description: "Local fixture", assessmentCriteria: ["Local criterion"],
  };
  const prioritized: PrioritizedObjective = {
    objectiveId: objective.id, decision, relevance: "target", priority: "medium",
    reasonCodes: ["target_level"],
  };
  const preferences: LearningPreferences = { preferredActivities, dislikedActivities };
  Object.freeze(objective.assessmentCriteria);
  Object.freeze(objective);
  Object.freeze(prioritized.reasonCodes);
  Object.freeze(prioritized);
  Object.freeze(preferences.preferredActivities);
  Object.freeze(preferences.dislikedActivities);
  Object.freeze(preferences);
  return { objective, prioritized, preferences };
}

const coverage: Record<Skill, Set<PrioritizedObjective["decision"]>> = {
  grammar: new Set(), vocabulary: new Set(), reading: new Set(),
  listening: new Set(), speaking: new Set(), writing: new Set(),
};

function check(
  skill: Skill,
  decision: PrioritizedObjective["decision"],
  activityType: ActivityType,
  reason: ActivitySelectionReason,
  preferred: ActivityType[] = [],
  disliked: ActivityType[] = [],
): void {
  const inputs = fixtures(skill, decision, preferred, disliked);
  const before = JSON.stringify(inputs);
  const result = selectActivity(inputs.objective, inputs.prioritized, inputs.preferences);
  assert(result.objectiveId === inputs.objective.id && result.decision === decision
    && result.activityType === activityType && result.reason === reason,
    `Unexpected ${skill}/${decision} result: ${JSON.stringify(result)}`);
  assert(JSON.stringify(inputs) === before, "Inputs were mutated");
  coverage[skill].add(decision);
}

// Skill mapping: scenarios 1-15.
check("grammar", "assess", "quiz", "default_activity");
check("grammar", "practice", "grammar_exercise", "default_activity");
check("grammar", "practice", "quiz", "preferred_activity", ["quiz"]);
check("vocabulary", "assess", "quiz", "default_activity");
check("vocabulary", "practice", "vocabulary_practice", "default_activity");
check("vocabulary", "practice", "flashcards", "preferred_activity", ["flashcards"]);
check("reading", "assess", "read_article", "default_activity");
check("reading", "practice", "read_book", "preferred_activity", ["read_book"]);
check("listening", "assess", "listen_audio", "default_activity");
check("listening", "practice", "watch_video", "preferred_activity", ["watch_video"]);
check("speaking", "assess", "monologue", "default_activity");
check("speaking", "practice", "conversation", "default_activity");
check("speaking", "practice", "monologue", "default_activity", [], ["conversation"]);
check("writing", "assess", "writing_task", "default_activity");
check("writing", "practice", "writing_task", "default_activity");

// Preferences and fallback: scenarios 16-22.
check("writing", "assess", "writing_task", "disliked_fallback", [], ["writing_task"]);
check("grammar", "practice", "grammar_exercise", "disliked_fallback", [], ["grammar_exercise", "quiz"]);
check("speaking", "practice", "monologue", "default_activity", ["conversation"], ["conversation"]);
check("grammar", "practice", "quiz", "preferred_activity", ["quiz"], ["grammar_exercise"]);
// Reverse preference order to prove candidate mapping order wins.
check("grammar", "practice", "grammar_exercise", "preferred_activity", ["quiz", "grammar_exercise"]);
check("grammar", "practice", "grammar_exercise", "default_activity", ["flashcards"]);
check("grammar", "practice", "grammar_exercise", "disliked_fallback", ["quiz"], ["grammar_exercise", "quiz"]);

const inputs = fixtures("grammar", "assess");
const mismatched: PrioritizedObjective = { ...inputs.prioritized, objectiveId: "other-objective" };
Object.freeze(mismatched);
const beforeMismatch = JSON.stringify({ ...inputs, prioritized: mismatched });
let threw = false;
try {
  selectActivity(inputs.objective, mismatched, inputs.preferences);
} catch (error) {
  threw = error instanceof Error && error.message === "Objective ID does not match prioritized objective ID.";
}
assert(threw, "Expected the exact objective ID mismatch error");
assert(JSON.stringify({ ...inputs, prioritized: mismatched }) === beforeMismatch,
  "Mismatch validation mutated inputs");
for (const decisions of [coverage.grammar, coverage.vocabulary, coverage.reading,
  coverage.listening, coverage.speaking, coverage.writing]) {
  assert(decisions.has("assess") && decisions.has("practice"), "Missing skill/decision coverage");
}
console.log("selectActivity: all example checks passed.");
