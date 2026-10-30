import type { CEFRLevel, Goal, LearningObjective, ObjectiveDecision, ObjectiveSelection, Skill } from "../types";
import { prioritizeObjectives } from "./prioritize-objectives";

function objective(id: string, skill: Skill, targetCEFR: CEFRLevel): LearningObjective {
  return { id, skill, targetCEFR, title: id, description: "Local fixture", assessmentCriteria: [] };
}
function selection(objectiveId: string, decision: ObjectiveDecision): ObjectiveSelection {
  return { objectiveId, decision, confidence: 0.6, reason: "Local fixture" };
}
function check(actual: unknown, expected: unknown): void {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`Expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
  }
}
function throws(action: () => unknown, message: string): void {
  try { action(); } catch (error) {
    if (error instanceof Error && error.message === message) return;
    throw error;
  }
  throw new Error(`Expected error: ${message}`);
}

const goal: Goal = { target: "B2", prioritySkills: ["speaking", "writing"] };
const objectives = [
  objective("foundation-1", "grammar", "B1"),
  objective("grammar", "grammar", "B2"),
  objective("writing", "writing", "B2"),
  objective("foundation-assess", "grammar", "B1"),
  objective("advanced", "reading", "A2"),
  objective("future", "speaking", "C1"),
  objective("speaking", "speaking", "B2"),
  objective("missing", "writing", "B2"),
  objective("reading", "reading", "B2"),
  objective("foundation-2", "writing", "A1"),
];
const selections = [
  selection("foundation-1", "practice"), selection("grammar", "practice"),
  selection("writing", "practice"), selection("foundation-assess", "assess"),
  selection("advanced", "advance"), selection("future", "assess"),
  selection("speaking", "assess"), selection("reading", "assess"),
  selection("foundation-2", "practice"),
];
const before = JSON.stringify({ objectives, selections, goal });
objectives.forEach((item) => { Object.freeze(item.assessmentCriteria); Object.freeze(item); });
selections.forEach(Object.freeze);
Object.freeze(objectives);
Object.freeze(selections);
Object.freeze(goal.prioritySkills);
Object.freeze(goal);

check(prioritizeObjectives(objectives, selections, goal), {
  selected: [
    { objectiveId: "writing", decision: "practice", relevance: "target", priority: "high",
      reasonCodes: ["target_level", "priority_skill", "needs_practice"] },
    { objectiveId: "speaking", decision: "assess", relevance: "target", priority: "high",
      reasonCodes: ["target_level", "priority_skill", "needs_assessment"] },
    { objectiveId: "grammar", decision: "practice", relevance: "target", priority: "medium",
      reasonCodes: ["target_level", "standard_skill", "needs_practice"] },
    { objectiveId: "reading", decision: "assess", relevance: "target", priority: "medium",
      reasonCodes: ["target_level", "standard_skill", "needs_assessment"] },
    { objectiveId: "foundation-1", decision: "practice", relevance: "foundation", priority: "foundation",
      reasonCodes: ["confirmed_foundation_gap", "needs_practice"] },
    { objectiveId: "foundation-2", decision: "practice", relevance: "foundation", priority: "foundation",
      reasonCodes: ["confirmed_foundation_gap", "needs_practice"] },
  ],
  excluded: [
    { objectiveId: "foundation-assess", reason: "unconfirmed_foundation_gap" },
    { objectiveId: "advanced", reason: "already_advanced" },
    { objectiveId: "future", reason: "future_level" },
    { objectiveId: "missing", reason: "missing_selection" },
  ],
});
check(JSON.stringify({ objectives, selections, goal }), before);
check(prioritizeObjectives([], [], goal), { selected: [], excluded: [] });
// Missing selection precedes future level; advance also precedes future level.
check(prioritizeObjectives([objective("future", "speaking", "C2")], [], goal).excluded,
  [{ objectiveId: "future", reason: "missing_selection" }]);
check(prioritizeObjectives([objective("future", "speaking", "C2")], [selection("future", "advance")], goal).excluded,
  [{ objectiveId: "future", reason: "already_advanced" }]);
throws(() => prioritizeObjectives([objectives[0], objectives[0]], [], goal),
  "Duplicate objective ID: foundation-1");
throws(() => prioritizeObjectives(objectives, [selections[0], selections[0]], goal),
  "Duplicate selection objective ID: foundation-1");
throws(() => prioritizeObjectives(objectives, [selection("unknown", "assess")], goal),
  "Unknown selection objective ID: unknown");
console.log("prioritizeObjectives: all example checks passed.");
