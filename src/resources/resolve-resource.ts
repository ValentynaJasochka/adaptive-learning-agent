import type {
  ActivityType, LearningResource, LearningResourceType, ResourceResolution,
  ResourceResolutionContext, TaskBlueprint,
} from "../types";
import { searchResources } from "./search-resources";

const RESOURCE_TYPES: Record<ActivityType, LearningResourceType | null> = {
  read_article: "text",
  read_book: "text",
  listen_audio: "audio",
  watch_video: "video",
  conversation: null,
  monologue: null,
  writing_task: null,
  grammar_exercise: null,
  vocabulary_practice: null,
  flashcards: null,
  quiz: null,
};

export function resolveResource(
  resources: readonly LearningResource[],
  blueprint: TaskBlueprint,
  context: ResourceResolutionContext,
): ResourceResolution {
  const type = RESOURCE_TYPES[blueprint.activityType];
  if (type === null) return { decision: "generate_needed" };

  const eligible = searchResources(resources, {
    type,
    language: context.language,
    topic: context.topic,
    estimatedCEFR: blueprint.targetCEFR,
    includeUnclassified: true,
  }).filter((resource) => blueprint.targetSkills.every((skill) => resource.metadata.skills.includes(skill)));

  let selected: LearningResource | undefined;
  const candidates: LearningResource[] = [];
  for (const resource of eligible) {
    if (resource.metadata.estimatedCEFR === undefined || resource.classification.status === "pending") {
      candidates.push(resource);
      continue;
    }
    // Every reusable resource already has an exact CEFR match. Keep the first on ties.
    const objectiveMatch = resource.metadata.objectiveIds.includes(blueprint.objectiveId);
    const selectedObjectiveMatch = selected?.metadata.objectiveIds.includes(blueprint.objectiveId);
    if (selected === undefined
      || (objectiveMatch && !selectedObjectiveMatch)
      || (objectiveMatch === selectedObjectiveMatch && resource.classification.status === "verified"
        && selected.classification.status !== "verified")) {
      selected = resource;
    }
  }
  if (selected !== undefined) return { decision: "reuse", resource: selected };
  if (candidates.length > 0) return { decision: "review_needed", candidates };
  return { decision: "generate_needed" };
}
