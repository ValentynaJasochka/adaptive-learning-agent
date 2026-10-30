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
    skillScores: [{ skill: "grammar", score: 0.55 }],
    createdAt: "2026-09-29",
  },

  {
    id: "evidence-diagnostic-001-vocabulary",
    sourceType: "diagnostic",
    sourceId: "diagnostic-001",
    observations: [
      "Used a good range of everyday vocabulary.",
      "Had difficulty with some less common words.",
    ],
    skillScores: [{ skill: "vocabulary", score: 0.65 }],
    createdAt: "2026-09-29",
  },

  {
    id: "evidence-diagnostic-001-reading",
    sourceType: "diagnostic",
    sourceId: "diagnostic-001",
    observations: [
      "Understood the main idea of the text.",
      "Successfully identified most supporting details.",
    ],
    skillScores: [{ skill: "reading", score: 0.8 }],
    createdAt: "2026-09-29",
  },

  {
    id: "evidence-diagnostic-001-listening",
    sourceType: "diagnostic",
    sourceId: "diagnostic-001",
    observations: [
      "Understood the general meaning.",
      "Missed several details in natural-speed speech.",
    ],
    skillScores: [{ skill: "listening", score: 0.4 }],
    createdAt: "2026-09-29",
  },

  {
    id: "evidence-diagnostic-001-speaking",
    sourceType: "diagnostic",
    sourceId: "diagnostic-001",
    observations: [
      "Can express basic ideas clearly.",
      "Needs more fluency and has difficulty with complex structures.",
    ],
    skillScores: [{ skill: "speaking", score: 0.5 }],
    createdAt: "2026-09-29",
  },

  {
    id: "evidence-diagnostic-001-writing",
    sourceType: "diagnostic",
    sourceId: "diagnostic-001",
    observations: [
      "Can structure a short text clearly.",
      "Made some grammatical and lexical errors.",
    ],
    skillScores: [{ skill: "writing", score: 0.6 }],
    createdAt: "2026-09-29",
  },
];
