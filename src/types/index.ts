export type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type Skill =
  | "grammar"
  | "vocabulary"
  | "reading"
  | "listening"
  | "speaking"
  | "writing";

export type ActivityType =
  | "read_article"
  | "read_book"
  | "listen_audio"
  | "watch_video"
  | "conversation"
  | "monologue"
  | "writing_task"
  | "grammar_exercise"
  | "vocabulary_review"
  | "flashcards"
  | "quiz";

export type WeekDay =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export type Goal = {
  target: CEFRLevel;
  deadline?: string;
  prioritySkills: Skill[];
};

export type SkillProgress = {
  skill: Skill;
  level: number;
  confidence: number;
  lastUpdatedAt: string;
};

export type LearningConstraints = {
  hoursPerWeek: number;
  preferredTimeOfDay?: "morning" | "afternoon" | "evening";
  availableDays: WeekDay[];
  preferredSessionMinutes: number;
};

export type LearningPreferences = {
  preferredActivities: ActivityType[];
  dislikedActivities: ActivityType[];
};

export type Evidence = {
  id: string;
  sourceType: "diagnostic" | "learning_task";
  sourceId: string;
  observations: string[];
  metrics: Record<string, number>;
};

export type SkillAssessment = {
  skill: Skill;
  level: number;
  confidence: number;
  assessedAt: string;
  evidenceIds: string[];
};

export type Diagnostic = {
  id: string;
  sequence: number;
  assessedAt: string;
  selfReportedLevel?: CEFRLevel;
  skillAssessments: SkillAssessment[];
};

export type LearningResult = {
  id: string;
  taskId: string;
  completedAt: string;
  score?: number;
  passed?: boolean;
  evidenceIds: string[];
};

export type Student = {
  id: string;

  profile: {
    profession?: string;
    interests: string[];
  };

  goals: Goal[];

  constraints: LearningConstraints;

  preferences: LearningPreferences;

  diagnostics: Diagnostic[];

  evidence: Evidence[];

  learningResults: LearningResult[];

  skills: SkillProgress[];
};