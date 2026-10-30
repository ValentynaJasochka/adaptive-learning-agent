import type { LearningResource, ResourceReference } from "../types";

export function findResourceVersion(
  resources: readonly LearningResource[],
  reference: ResourceReference,
): LearningResource | undefined {
  if (reference.resourceId.trim().length === 0) {
    throw new Error("Resource reference resourceId must not be empty or whitespace.");
  }
  if (!Number.isSafeInteger(reference.version) || reference.version <= 0) {
    throw new Error("Resource reference version must be a positive safe integer.");
  }
  let match: LearningResource | undefined;
  for (const resource of resources) {
    if (resource.id === reference.resourceId && resource.version === reference.version) {
      if (match !== undefined) {
        throw new Error(`Duplicate resource version identity: ${reference.resourceId}, version ${reference.version}.`);
      }
      match = resource;
    }
  }
  return match;
}
