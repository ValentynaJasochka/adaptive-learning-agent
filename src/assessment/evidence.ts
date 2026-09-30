import type { Evidence } from "../types";

export const mockEvidence: Evidence[] = [
  {
    id: "evidence-diagnostic-001-grammar",
    sourceType: "diagnostic",
    sourceId: "diagnostic-001",
    observations: [
      "Correctly used basic tenses.",
      "Made several errors with conditionals.",
    ],
    metrics: {
      accuracy: 0.55,
    },
  },

  {
    id: "evidence-diagnostic-001-vocabulary",
    sourceType: "diagnostic",
    sourceId: "diagnostic-001",
    observations: [
      "Used a good range of everyday vocabulary.",
      "Had difficulty with some less common words.",
    ],
    metrics: {
      vocabularyRange: 0.65,
    },
  },

  {
    id: "evidence-diagnostic-001-reading",
    sourceType: "diagnostic",
    sourceId: "diagnostic-001",
    observations: [
      "Understood the main idea of the text.",
      "Successfully identified most supporting details.",
    ],
    metrics: {
      comprehension: 0.8,
    },
  },

  {
    id: "evidence-diagnostic-001-listening",
    sourceType: "diagnostic",
    sourceId: "diagnostic-001",
    observations: [
      "Understood the general meaning.",
      "Missed several details in natural-speed speech.",
    ],
    metrics: {
      comprehension: 0.4,
    },
  },

  {
    id: "evidence-diagnostic-001-speaking",
    sourceType: "diagnostic",
    sourceId: "diagnostic-001",
    observations: [
      "Can express basic ideas clearly.",
      "Needs more fluency and has difficulty with complex structures.",
    ],
    metrics: {
      fluency: 0.5,
    },
  },

  {
    id: "evidence-diagnostic-001-writing",
    sourceType: "diagnostic",
    sourceId: "diagnostic-001",
    observations: [
      "Can structure a short text clearly.",
      "Made some grammatical and lexical errors.",
    ],
    metrics: {
      accuracy: 0.6,
    },
  },
];