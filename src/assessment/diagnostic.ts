import type { Diagnostic } from "../types";

export const mockDiagnostic: Diagnostic =  {
      id: "diagnostic-001",
      sequence: 1,
      assessedAt: "2026-09-29",
      selfReportedLevel: "B1",

      skillAssessments: [
        {
          skill: "grammar",
          level: 0.55,
          confidence: 0.8,
          assessedAt: "2026-09-29",
          evidenceIds: ["evidence-diagnostic-001-grammar"],
        },
        {
          skill: "vocabulary",
          level: 0.65,
          confidence: 0.85,
          assessedAt: "2026-09-29",
          evidenceIds: ["evidence-diagnostic-001-vocabulary"],
        },
        {
          skill: "reading",
          level: 0.8,
          confidence: 0.9,
          assessedAt: "2026-09-29",
          evidenceIds: ["evidence-diagnostic-001-reading"],
        },
        {
          skill: "listening",
          level: 0.4,
          confidence: 0.75,
          assessedAt: "2026-09-29",
          evidenceIds: ["evidence-diagnostic-001-listening"],
        },
        {
          skill: "speaking",
          level: 0.5,
          confidence: 0.65,
          assessedAt: "2026-09-29",
          evidenceIds: ["evidence-diagnostic-001-speaking"],
        },
        {
          skill: "writing",
          level: 0.6,
          confidence: 0.7,
          assessedAt: "2026-09-29",
          evidenceIds: ["evidence-diagnostic-001-writing"],
        },
      ],
    }