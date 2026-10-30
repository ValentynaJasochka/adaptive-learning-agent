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
  | "vocabulary_practice"
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

export type LearningObjective = {
  id: string;
  skill: Skill;
  targetCEFR: CEFRLevel;
  title: string;
  description: string;
  assessmentCriteria: string[];
};

export type LearningResourceType =
  | "text"
  | "audio"
  | "video"
  | "exercise_set";

export type ResourceSourceKind =
  | "file"
  | "url"
  | "database"
  | "generated";

export type ResourceClassificationStatus =
  | "pending"
  | "ai_classified"
  | "verified";

export type ResourceReference = {
  resourceId: string;
  version: number;
};

export type LearningResource = {
  id: string;
  version: number;
  type: LearningResourceType;
  title: string;

  source: {
    kind: ResourceSourceKind;
    reference: string;
  };

  content?: string;

  metadata: {
    language: string;
    topics: string[];
    estimatedCEFR?: CEFRLevel;
    skills: Skill[];
    objectiveIds: string[];
    durationMinutes?: number;
  };

  classification: {
    status: ResourceClassificationStatus;
    classifiedBy?: "ai" | "teacher";
  };
};

export type ResourceSearchQuery = {
  type?: LearningResourceType;
  language?: string;
  skill?: Skill;
  topic?: string;
  objectiveId?: string;
  estimatedCEFR?: CEFRLevel;
  includeUnclassified?: boolean;
};

export type ResourceResolutionContext = {
  language: string;
  topic?: string;
};

export type ResourceResolution =
  | { decision: "reuse"; resource: LearningResource }
  | { decision: "review_needed"; candidates: LearningResource[] }
  | { decision: "generate_needed" };

export type ObjectiveMastery = {
  objectiveId: string;
  mastery?: number;
  confidence: number;
  evidenceIds: string[];
  lastUpdatedAt: string;
};

export type ObjectiveDecision = "assess" | "practice" | "advance";

export type ObjectiveSelection = {
  objectiveId: string;
  decision: ObjectiveDecision;
  reason: string;
  mastery?: number;
  confidence: number;
};

export type ObjectiveRelevance = "foundation" | "target" | "future";

export type ObjectivePriority = "high" | "medium" | "foundation";

export type ObjectiveExclusionReason =
  | "already_advanced"
  | "future_level"
  | "unconfirmed_foundation_gap"
  | "missing_selection";

export type PrioritizedObjective = {
  objectiveId: string;
  decision: "assess" | "practice";
  relevance: "foundation" | "target";
  priority: ObjectivePriority;
  reasonCodes: string[];
};

export type ObjectivePrioritizationResult = {
  selected: PrioritizedObjective[];
  excluded: {
    objectiveId: string;
    reason: ObjectiveExclusionReason;
  }[];
};

export type ActivitySelectionReason =
  | "preferred_activity"
  | "default_activity"
  | "disliked_fallback";

export type SelectedActivity = {
  objectiveId: string;
  decision: "assess" | "practice";
  activityType: ActivityType;
  reason: ActivitySelectionReason;
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

export type EvidenceBase = {
  id: string;
  skillScores: SkillScore[];
  objectiveScores?: ObjectiveScore[];
  observations: string[];
  createdAt: string;
};

export type DiagnosticEvidence = EvidenceBase & {
  sourceType: "diagnostic";
  sourceId: string;
  exerciseResultId?: never;
  feedbackId?: never;
  difficulty?: never;
};

export type LearningTaskEvidence = EvidenceBase & {
  sourceType: "learning_task";
  sourceId: string;
  exerciseResultId: string;
  feedbackId: string;
  difficulty: number;
};

export type Evidence = DiagnosticEvidence | LearningTaskEvidence;

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
  exerciseResultIds: string[];
  completionRate: number;
  skillScores: SkillScore[];
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
export type MultipleChoiceExercise = {
  id: string;
  type: "exercise";
  responseType: "selected_answers";

  question: string;
  targetSkills: Skill[];
  objectiveIds?: string[];

  options: {
    id: string;
    text: string;
  }[];
  /** Server-side answer keys. Omit from student-facing API payloads. */
  correctOptionIds: string[];
};

export type WrittenAnswerExercise = {
  id: string;
  type: "exercise";
  responseType: "written_answer";

  question: string;
  targetSkills: Skill[];
  objectiveIds?: string[];

  minWords?: number;
  maxWords?: number;
};

export type AudioAnswerExercise = {
  id: string;
  type: "exercise";
  responseType: "audio_answer";
  question: string;
  targetSkills: Skill[];
  objectiveIds?: string[];
};

export type CompletionExercise = {
  id: string;
  type: "exercise";
  responseType: "completion";
  question: string;
  targetSkills: Skill[];
  objectiveIds?: string[];
};

export type TextBlock = {
  id: string;
  type: "text";
  text: string;
};

export type VideoBlock = {
  id: string;
  type: "video";
  url: string;
};

export type AudioBlock = {
  id: string;
  type: "audio";
  url: string;
};
export type ExerciseBlock =
  | MultipleChoiceExercise
  | WrittenAnswerExercise
  | AudioAnswerExercise
  | CompletionExercise;

export type TaskBlock =
  | TextBlock
  | VideoBlock
  | AudioBlock
  | ExerciseBlock;

export type TaskPurpose = "assessment" | "practice";

export type TaskBlueprint = {
  objectiveId: string;
  activityType: ActivityType;
  purpose: TaskPurpose;
  targetSkills: Skill[];
  targetCEFR: CEFRLevel;
  assessmentCriteria: string[];
  requiredResponseTypes: ExerciseBlock["responseType"][];
  estimatedMinutes: number;
};

export type TaskValidationIssue = {
  code: string;
  path: string;
  message: string;
};

export type TaskValidationResult = {
  valid: boolean;
  issues: TaskValidationIssue[];
};

export type TaskStatus =
  | "planned"
  | "in_progress"
  | "completed"
  | "skipped";

export type TeacherReviewStatus =
  | "pending"
  | "approved"
  | "modified"
  | "rejected";

export type LearningTask = {
  id: string;
  resourceRef?: ResourceReference;
  title: string;
  instructions: string;
  activityType: ActivityType;
  targetSkills: Skill[];
  /** Conceptually in the range 0..1; no runtime validation. */
  difficulty: number;
  estimatedMinutes: number;
  /** Blocks appear in the order the student should complete them. */
  blocks: TaskBlock[];
  status: TaskStatus;
  createdBy: "agent" | "teacher";
  teacherReview?: TeacherReviewStatus;
  planId: string;
  scheduledFor: string;
};

export type ExerciseResponse =
  | { responseType: "selected_answers"; selectedOptionIds: string[] }
  | { responseType: "written_answer"; text: string }
  | { responseType: "audio_answer"; audioRef: string }
  | { responseType: "completion"; completed: true };

export type SkillScore = {
  skill: Skill;
  /** Conceptually in the range 0..1; no runtime validation. */
  score: number;
};

export type ObjectiveScore = {
  objectiveId: string;
  /** Conceptually in the range 0..1; no runtime validation. */
  score: number;
};

export type ExerciseResultBase = {
  id: string;
  taskId: string;
  blockId: string;
  submittedAt: string;
};

export type AnsweredExerciseResult = ExerciseResultBase & {
  status: "answered";
  response: ExerciseResponse;
};

export type SkippedExerciseResult = ExerciseResultBase & {
  status: "skipped";
  response?: never;
  skillScores?: never;
  feedbackId?: never;
};

export type ExerciseResult = AnsweredExerciseResult | SkippedExerciseResult;

/** Append-only evaluation history for an answered exercise; highest version is current. */
export type LearningFeedback = {
  id: string;
  exerciseResultId: string;
  version: number;
  createdBy: "ai" | "teacher";
  summary: string;
  strengths: string[];
  improvements: string[];
  skillScores: SkillScore[];
  objectiveScores?: ObjectiveScore[];
  createdAt: string;
};
