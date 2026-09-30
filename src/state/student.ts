import type { Student } from "../types";
import { mockDiagnostic } from "../assessment/diagnostic";

export const mockStudent: Student = {
  id: "student-001",

  profile: {
    profession: "software developer",
    interests: ["technology", "travel"],
  },

  goals: [
    {
      target: "B2",
      deadline: "2027-03-01",
      prioritySkills: ["speaking", "listening"],
    },
  ],

  constraints: {
    hoursPerWeek: 5,
    preferredTimeOfDay: "evening",
    availableDays: ["Monday", "Wednesday", "Friday", "Sunday"],
    preferredSessionMinutes: 45,
  },

  preferences: {
    preferredActivities: [
      "conversation",
      "listen_audio",
    ],
    dislikedActivities: [
      "grammar_exercise",
    ],
  },

  diagnostics: [mockDiagnostic],

  evidence: [],

  learningResults: [],

  skills: [
    {
      skill: "grammar",
      level: 0.55,
      confidence: 0.8,
      lastUpdatedAt: "2026-09-29",
    },
    {
      skill: "vocabulary",
      level: 0.65,
      confidence: 0.85,
      lastUpdatedAt: "2026-09-29",
    },
    {
      skill: "reading",
      level: 0.8,
      confidence: 0.9,
      lastUpdatedAt: "2026-09-29",
    },
    {
      skill: "listening",
      level: 0.4,
      confidence: 0.75,
      lastUpdatedAt: "2026-09-29",
    },
    {
      skill: "speaking",
      level: 0.5,
      confidence: 0.65,
      lastUpdatedAt: "2026-09-29",
    },
    {
      skill: "writing",
      level: 0.6,
      confidence: 0.7,
      lastUpdatedAt: "2026-09-29",
    },
  ],
};