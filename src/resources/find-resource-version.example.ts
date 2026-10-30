import type { LearningResource, ResourceReference } from "../types";
import { findResourceVersion } from "./find-resource-version";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}
function resource(id: string, version: number): LearningResource {
  return {
    id, version, type: "text", title: "Local fixture",
    source: { kind: "file", reference: "local-text" },
    metadata: {
      language: "English", topics: ["Experience"], estimatedCEFR: "B1",
      skills: ["reading", "grammar"], objectiveIds: ["local-objective"],
    },
    classification: { status: "verified", classifiedBy: "teacher" },
  };
}
function frozenSnapshot(resources: readonly LearningResource[], reference: ResourceReference): string {
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
  Object.freeze(reference);
  return JSON.stringify({ resources, reference });
}
function check(
  resources: readonly LearningResource[],
  reference: ResourceReference,
  expected: LearningResource | undefined,
): void {
  const before = frozenSnapshot(resources, reference);
  const order = [...resources];
  assert(findResourceVersion(resources, reference) === expected, "Unexpected lookup result or object reference");
  assert(findResourceVersion(resources, reference) === expected, "Repeated lookup must return the same reference");
  assert(resources.every((item, index) => item === order[index]), "Catalog order changed");
  assert(JSON.stringify({ resources, reference }) === before, "Inputs were mutated");
}
function rejects(resources: readonly LearningResource[], reference: ResourceReference, message: string): void {
  const before = frozenSnapshot(resources, reference);
  let threw = false;
  try {
    findResourceVersion(resources, reference);
  } catch (error) {
    threw = error instanceof Error && error.message === message;
  }
  assert(threw, `Expected error: ${message}`);
  assert(JSON.stringify({ resources, reference }) === before, "Rejected lookup mutated inputs");
}

const v1 = resource("resource-a", 1);
const v2 = resource("resource-a", 2);
const other = resource("resource-b", 1);
const padded = resource(" resource-a ", 1);
const maximum = resource("maximum", Number.MAX_SAFE_INTEGER);
const catalog = [other, v2, padded, maximum, v1];

// Exact identities, version distinction, case sensitivity, and no ID normalization.
check(catalog, { resourceId: "resource-a", version: 1 }, v1);
check(catalog, { resourceId: "resource-a", version: 2 }, v2);
check(catalog, { resourceId: "resource-b", version: 1 }, other);
check(catalog, { resourceId: "unknown", version: 1 }, undefined);
check(catalog, { resourceId: "resource-a", version: 3 }, undefined);
check(catalog, { resourceId: "RESOURCE-A", version: 1 }, undefined);
check([v1], { resourceId: " resource-a ", version: 1 }, undefined);
check([padded], { resourceId: "resource-a", version: 1 }, undefined);
check(catalog, { resourceId: " resource-a ", version: 1 }, padded);
check(catalog, { resourceId: "maximum", version: Number.MAX_SAFE_INTEGER }, maximum);
check([], { resourceId: "resource-a", version: 1 }, undefined);

// Invalid versions are rejected even when the catalog is empty.
for (const version of [0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
  rejects([], { resourceId: "resource-a", version },
    "Resource reference version must be a positive safe integer.");
}
for (const resourceId of ["", " ", "\t\n"]) {
  rejects(catalog, { resourceId, version: 1 },
    "Resource reference resourceId must not be empty or whitespace.");
}

// Only duplicates of the requested identity are errors, including repeated references.
rejects([v1, resource("resource-a", 1)], { resourceId: "resource-a", version: 1 },
  "Duplicate resource version identity: resource-a, version 1.");
rejects([v1, v1], { resourceId: "resource-a", version: 1 },
  "Duplicate resource version identity: resource-a, version 1.");
check([v2, v1], { resourceId: "resource-a", version: 1 }, v1);
check([v1, v1, other], { resourceId: "resource-b", version: 1 }, other);
check([v1, v1], { resourceId: "resource-a", version: 2 }, undefined);
console.log("findResourceVersion: all example checks passed.");
