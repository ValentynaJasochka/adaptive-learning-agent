import type { LearningResource, ResourceSearchQuery } from "../types";
import { searchResources } from "./search-resources";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}
const text: LearningResource = {
  version: 1,
  id: "text", type: "text", title: "Travel experiences",
  source: { kind: "file", reference: "local-text" },
  metadata: {
    language: " English ", topics: [" Travel ", "Experience"], estimatedCEFR: "B1",
    skills: ["reading", "grammar"], objectiveIds: ["objective-1", "objective-2"],
  },
  classification: { status: "verified", classifiedBy: "teacher" },
};
const audio: LearningResource = {
  version: 1,
  id: "audio", type: "audio", title: "Travel conversation",
  source: { kind: "url", reference: "https://example.com/audio" },
  metadata: {
    language: "english", topics: ["travel"], estimatedCEFR: "B2",
    skills: ["listening"], objectiveIds: ["objective-2"],
  },
  classification: { status: "ai_classified", classifiedBy: "ai" },
};
const video: LearningResource = {
  version: 1,
  id: "video", type: "video", title: "Unclassified video",
  source: { kind: "url", reference: "https://example.com/video" },
  metadata: { language: "ENGLISH", topics: ["Travel"], skills: ["listening"], objectiveIds: [] },
  classification: { status: "pending" },
};
const exercises: LearningResource = {
  version: 1,
  id: "exercises", type: "exercise_set", title: "French grammar",
  source: { kind: "database", reference: "local-exercises" },
  metadata: {
    language: "French", topics: ["Grammar"], estimatedCEFR: "B1",
    skills: ["grammar", "writing"], objectiveIds: ["objective-3"],
  },
  classification: { status: "pending" },
};
const blank: LearningResource = {
  ...text, id: "blank", metadata: { language: " ", topics: [" "], skills: [], objectiveIds: [] },
};
// Deliberately unsorted, with a repeated reference: search must not sort or deduplicate.
const resources: readonly LearningResource[] = [video, text, exercises, audio, text, blank];
for (const resource of resources) {
  Object.freeze(resource.metadata.topics);
  Object.freeze(resource.metadata.skills);
  Object.freeze(resource.metadata.objectiveIds);
  Object.freeze(resource.metadata);
  Object.freeze(resource.source);
  Object.freeze(resource.classification);
  Object.freeze(resource);
}
Object.freeze(resources);

function check(query: ResourceSearchQuery, expected: readonly LearningResource[]): void {
  Object.freeze(query);
  const before = JSON.stringify({ resources, query });
  const result = searchResources(resources, query);
  assert(result !== resources, "Search must return a new array");
  assert(result.length === expected.length && result.every((item, index) => item === expected[index]),
    `Unexpected results for ${JSON.stringify(query)}: ${JSON.stringify(result.map((item) => item.id))}`);
  const repeated = searchResources(resources, query);
  assert(repeated !== result && repeated.length === result.length
    && repeated.every((item, index) => item === result[index]), "Results must be deterministic with original references");
  assert(JSON.stringify({ resources, query }) === before, "Inputs were mutated");
}

// A: Exact matching, case normalization, trimming on both sides, and array membership.
check({}, resources);
check({ type: "text" }, [text, text, blank]);
check({ type: "audio" }, [audio]);
check({ type: "video" }, [video]);
check({ type: "exercise_set" }, [exercises]);
check({ language: "eNgLiSh" }, [video, text, audio, text]);
check({ language: "  English  " }, [video, text, audio, text]);
check({ skill: "grammar" }, [text, exercises, text]);
check({ topic: "tRaVeL" }, [video, text, audio, text]);
check({ topic: "  travel  " }, [video, text, audio, text]);
check({ topic: "experience" }, [text, text]);
check({ objectiveId: "objective-2" }, [text, audio, text]);
check({ objectiveId: "OBJECTIVE-2" }, []);
check({ objectiveId: " objective-2 " }, []);
check({ estimatedCEFR: "B1" }, [text, exercises, text]);

// B: Missing CEFR is distinct from a different known CEFR or classification status.
check({ estimatedCEFR: "B1", includeUnclassified: false }, [text, exercises, text]);
check({ estimatedCEFR: "B1", includeUnclassified: true }, [video, text, exercises, text, blank]);
check({ includeUnclassified: true }, resources);
check({ includeUnclassified: false }, resources);
check({ type: "video", skill: "listening" }, [video]);
check({ type: "exercise_set", estimatedCEFR: "B1" }, [exercises]);

// C: All filters use AND; changing any one field excludes the otherwise matching text.
const combined: ResourceSearchQuery = {
  type: "text", language: "english", skill: "grammar", topic: "travel",
  objectiveId: "objective-1", estimatedCEFR: "B1",
};
check(combined, [text, text]);
const failingQueries: ResourceSearchQuery[] = [
  { ...combined, type: "audio" }, { ...combined, language: "French" },
  { ...combined, skill: "speaking" }, { ...combined, topic: "grammar" },
  { ...combined, objectiveId: "objective-3" }, { ...combined, estimatedCEFR: "C2" },
];
for (const query of failingQueries) check(query, []);
check({ topic: "missing" }, []);
check({ language: "engl" }, []);
check({ topic: "trav" }, []);
check({ language: "" }, [blank]);
check({ topic: "" }, [blank]);
check({ language: " ", topic: " " }, [blank]);
console.log("searchResources: all example checks passed.");
