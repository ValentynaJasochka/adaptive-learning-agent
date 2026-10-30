import type {
  ActivityType, LearningResource, LearningResourceType, ResourceResolution,
  ResourceResolutionContext, TaskBlueprint,
} from "../types";
import { resolveResource } from "./resolve-resource";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}
const blueprint: TaskBlueprint = {
  objectiveId: "local-objective", activityType: "read_article", purpose: "practice",
  targetSkills: ["reading", "grammar"], targetCEFR: "B1",
  assessmentCriteria: ["Understand the passage."], requiredResponseTypes: ["selected_answers"],
  estimatedMinutes: 20,
};
const context: ResourceResolutionContext = { language: "  eNgLiSh ", topic: " tRaVeL " };
function resource(id: string, type: LearningResourceType = "text"): LearningResource {
  return {
    id, version: 1, type, title: id, source: { kind: "file", reference: id },
    metadata: {
      language: " English ", topics: [" Travel "], estimatedCEFR: "B1",
      skills: ["reading", "grammar"], objectiveIds: [blueprint.objectiveId],
    },
    classification: { status: "verified", classifiedBy: "teacher" },
  };
}
const text = resource("text");
const audio = resource("audio", "audio");
const video = resource("video", "video");
const exercises = resource("exercises", "exercise_set");
const unknown: LearningResource = {
  ...text, id: "unknown", metadata: { ...text.metadata, estimatedCEFR: undefined },
};
const pending: LearningResource = {
  ...text, id: "pending", classification: { status: "pending" },
};
const ai: LearningResource = {
  ...text, id: "ai", classification: { status: "ai_classified", classifiedBy: "ai" },
};
const unrelated: LearningResource = {
  ...text, id: "unrelated", metadata: { ...text.metadata, objectiveIds: [] },
};

// Every case checks frozen inputs, unchanged catalog order, and deterministic references.
function check(
  resources: readonly LearningResource[],
  expected: ResourceResolution,
  plan = blueprint,
  resolutionContext = context,
): void {
  const before = JSON.stringify({ resources, plan, resolutionContext });
  for (const item of resources) {
    Object.freeze(item.metadata.topics);
    Object.freeze(item.metadata.skills);
    Object.freeze(item.metadata.objectiveIds);
    Object.freeze(item.metadata);
    Object.freeze(item.source);
    Object.freeze(item.classification);
    Object.freeze(item);
  }
  Object.freeze(resources);
  Object.freeze(plan.targetSkills);
  Object.freeze(plan.assessmentCriteria);
  Object.freeze(plan.requiredResponseTypes);
  Object.freeze(plan);
  Object.freeze(resolutionContext);
  const first = resolveResource(resources, plan, resolutionContext);
  const second = resolveResource(resources, plan, resolutionContext);
  for (const result of [first, second]) {
    assert(result.decision === expected.decision, `Unexpected decision: ${JSON.stringify(result)}`);
    if (result.decision === "reuse" && expected.decision === "reuse") {
      assert(result.resource === expected.resource, "Must reuse the expected original resource reference");
    } else if (result.decision === "review_needed" && expected.decision === "review_needed") {
      assert(result.candidates !== resources && result.candidates !== expected.candidates,
        "Review candidates must be a new array");
      assert(result.candidates.length === expected.candidates.length
        && result.candidates.every((item, index) => item === expected.candidates[index]),
        "Review candidates must preserve order, references, and duplicates");
    }
  }
  if (first.decision === "review_needed" && second.decision === "review_needed") {
    assert(first.candidates !== second.candidates, "Calls must return independent candidate arrays");
  }
  assert(JSON.stringify({ resources, plan, resolutionContext }) === before, "Inputs were mutated");
}

// A: All current activities and resource-type mismatches.
const mappings: [ActivityType, LearningResource][] = [
  ["read_article", text], ["read_book", text], ["listen_audio", audio], ["watch_video", video],
];
for (const [activityType, expected] of mappings) {
  check([exercises, video, audio, text], { decision: "reuse", resource: expected }, { ...blueprint, activityType });
  check([exercises, ...[text, audio, video].filter((item) => item.type !== expected.type)],
    { decision: "generate_needed" }, { ...blueprint, activityType });
}
const unmapped: ActivityType[] = [
  "conversation", "monologue", "writing_task", "grammar_exercise", "vocabulary_practice", "flashcards", "quiz",
];
for (const activityType of unmapped) {
  check([text, audio, video, exercises], { decision: "generate_needed" }, { ...blueprint, activityType });
}

// B/C: Eligibility, classification, and decision precedence.
check([text], { decision: "reuse", resource: text });
check([text], { decision: "generate_needed" }, blueprint, { language: "French" });
check([text], { decision: "generate_needed" }, blueprint, { language: "English", topic: "work" });
check([text], { decision: "reuse", resource: text }, blueprint, { language: "English" });
const otherTopic: LearningResource = { ...text, metadata: { ...text.metadata, topics: ["Work"] } };
check([otherTopic], { decision: "reuse", resource: otherTopic }, blueprint, { language: "English" });
const missingSkill: LearningResource = { ...text, metadata: { ...text.metadata, skills: ["reading"] } };
check([missingSkill], { decision: "generate_needed" });
const wrongCEFR: LearningResource = { ...text, metadata: { ...text.metadata, estimatedCEFR: "B2" } };
check([wrongCEFR], { decision: "generate_needed" });
check([unknown], { decision: "review_needed", candidates: [unknown] });
check([pending], { decision: "review_needed", candidates: [pending] });
check([unrelated], { decision: "reuse", resource: unrelated });
check([], { decision: "generate_needed" });
check([unknown, pending, text], { decision: "reuse", resource: text });
check([text, unknown, pending], { decision: "reuse", resource: text });
check([pending, wrongCEFR, unknown, pending],
  { decision: "review_needed", candidates: [pending, unknown, pending] });

// D: Objective relevance precedes classification; exact ties preserve catalog order.
check([unrelated, text], { decision: "reuse", resource: text });
check([ai, text], { decision: "reuse", resource: text });
check([text, ai], { decision: "reuse", resource: text });
const samePriority = resource("same-priority");
check([samePriority, text], { decision: "reuse", resource: samePriority });
check([text, samePriority], { decision: "reuse", resource: text });
check([unrelated, ai], { decision: "reuse", resource: ai });
check([ai, unrelated], { decision: "reuse", resource: ai });
const unrelatedAi: LearningResource = { ...ai, metadata: { ...ai.metadata, objectiveIds: [] } };
check([unrelatedAi, unrelated], { decision: "reuse", resource: unrelated });
console.log("resolveResource: all example checks passed.");
