import type {
  CEFRLevel, Goal, LearningObjective, ObjectivePrioritizationResult,
  ObjectivePriority, ObjectiveSelection, PrioritizedObjective,
} from "../types";

const CEFR_ORDER: Record<CEFRLevel, number> = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };

export function prioritizeObjectives(
  objectives: LearningObjective[],
  selections: ObjectiveSelection[],
  goal: Goal,
): ObjectivePrioritizationResult {
  const objectiveIds = new Set<string>();
  for (const objective of objectives) {
    if (objectiveIds.has(objective.id)) throw new Error(`Duplicate objective ID: ${objective.id}`);
    objectiveIds.add(objective.id);
  }
  const selectionById = new Map<string, ObjectiveSelection>();
  for (const selection of selections) {
    if (selectionById.has(selection.objectiveId)) {
      throw new Error(`Duplicate selection objective ID: ${selection.objectiveId}`);
    }
    if (!objectiveIds.has(selection.objectiveId)) {
      throw new Error(`Unknown selection objective ID: ${selection.objectiveId}`);
    }
    selectionById.set(selection.objectiveId, selection);
  }

  const buckets: Record<ObjectivePriority, PrioritizedObjective[]> = {
    high: [], medium: [], foundation: [],
  };
  const excluded: ObjectivePrioritizationResult["excluded"] = [];
  for (const objective of objectives) {
    const selection = selectionById.get(objective.id);
    const level = CEFR_ORDER[objective.targetCEFR];
    const target = CEFR_ORDER[goal.target];
    if (!selection) {
      excluded.push({ objectiveId: objective.id, reason: "missing_selection" });
    } else if (selection.decision === "advance") {
      excluded.push({ objectiveId: objective.id, reason: "already_advanced" });
    } else if (level > target) {
      excluded.push({ objectiveId: objective.id, reason: "future_level" });
    } else if (level < target && selection.decision !== "practice") {
      excluded.push({ objectiveId: objective.id, reason: "unconfirmed_foundation_gap" });
    } else {
      const foundation = level < target;
      const prioritySkill = goal.prioritySkills.includes(objective.skill);
      const priority: ObjectivePriority = foundation ? "foundation" : prioritySkill ? "high" : "medium";
      const reasonCodes = foundation
        ? ["confirmed_foundation_gap", "needs_practice"]
        : ["target_level", prioritySkill ? "priority_skill" : "standard_skill",
          selection.decision === "assess" ? "needs_assessment" : "needs_practice"];
      buckets[priority].push({
        objectiveId: objective.id,
        decision: selection.decision,
        relevance: foundation ? "foundation" : "target",
        priority,
        reasonCodes,
      });
    }
  }
  return { selected: [...buckets.high, ...buckets.medium, ...buckets.foundation], excluded };
}
