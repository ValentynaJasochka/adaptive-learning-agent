import type { LearningResource, ResourceSearchQuery } from "../types";

export function searchResources(
  resources: readonly LearningResource[],
  query: ResourceSearchQuery,
): LearningResource[] {
  const language = query.language?.trim().toLowerCase();
  const topic = query.topic?.trim().toLowerCase();
  return resources.filter((resource) => {
    const metadata = resource.metadata;
    if (query.type !== undefined && resource.type !== query.type) return false;
    if (language !== undefined && metadata.language.trim().toLowerCase() !== language) return false;
    if (query.skill !== undefined && !metadata.skills.includes(query.skill)) return false;
    if (topic !== undefined && !metadata.topics.some((value) => value.trim().toLowerCase() === topic)) return false;
    if (query.objectiveId !== undefined && !metadata.objectiveIds.includes(query.objectiveId)) return false;
    if (query.estimatedCEFR !== undefined && metadata.estimatedCEFR !== query.estimatedCEFR) {
      if (metadata.estimatedCEFR !== undefined || query.includeUnclassified !== true) return false;
    }
    return true;
  });
}
