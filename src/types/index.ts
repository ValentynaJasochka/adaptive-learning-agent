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
  lastAssessedAt?: string;
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

export type DiagnosticResult = {
  selfReportedLevel?: CEFRLevel;
  assessedAt: string;
  skills: SkillProgress[];
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

  diagnostic?: DiagnosticResult;

  skills: SkillProgress[];
};