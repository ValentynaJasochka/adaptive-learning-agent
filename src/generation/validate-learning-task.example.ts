import type {
  ActivityType, AudioAnswerExercise, CompletionExercise, LearningTask, MultipleChoiceExercise,
  TaskBlock, TaskBlueprint, WrittenAnswerExercise,
} from "../types";
import { validateLearningTask } from "./validate-learning-task";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}
function equal(actual: unknown, expected: unknown): void {
  assert(JSON.stringify(actual) === JSON.stringify(expected),
    `Expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
}
const blueprint: TaskBlueprint = {
  objectiveId: "local-objective", activityType: "quiz", purpose: "assessment",
  targetSkills: ["grammar"], targetCEFR: "B1", assessmentCriteria: ["Use correct grammar."],
  requiredResponseTypes: ["selected_answers"], estimatedMinutes: 15,
};
const quiz: MultipleChoiceExercise = {
  id: "quiz", type: "exercise", responseType: "selected_answers", question: "Choose the correct form.",
  targetSkills: ["grammar"], objectiveIds: [blueprint.objectiveId],
  options: [{ id: "option-a", text: "First answer" }, { id: "option-b", text: "Second answer" }],
  correctOptionIds: ["option-a"],
};
const writing: WrittenAnswerExercise = {
  id: "writing", type: "exercise", responseType: "written_answer", question: "Write a paragraph.",
  targetSkills: ["grammar"], objectiveIds: [blueprint.objectiveId], minWords: 10, maxWords: 50,
};
const audio: AudioAnswerExercise = {
  id: "speaking", type: "exercise", responseType: "audio_answer", question: "Record your answer.",
  targetSkills: ["grammar"], objectiveIds: [blueprint.objectiveId],
};
const completion: CompletionExercise = {
  id: "completion", type: "exercise", responseType: "completion", question: "Review these cards.",
  targetSkills: ["grammar"], objectiveIds: [blueprint.objectiveId],
};
function task(blocks: TaskBlock[] = [quiz], activityType: ActivityType = "quiz"): LearningTask {
  return {
    id: "local-task", title: "Local task", instructions: "Complete the exercises.",
    activityType, targetSkills: ["grammar"], difficulty: 0.5, estimatedMinutes: 15, blocks,
    status: "planned", createdBy: "agent", planId: "local-plan", scheduledFor: "2026-10-30",
  };
}
function freezeInputs(value: LearningTask, plan: TaskBlueprint): void {
  value.blocks.forEach((block) => {
    if (block.type === "exercise") {
      Object.freeze(block.targetSkills);
      Object.freeze(block.objectiveIds);
      if (block.responseType === "selected_answers") {
        block.options.forEach(Object.freeze);
        Object.freeze(block.options);
        Object.freeze(block.correctOptionIds);
      }
    }
    Object.freeze(block);
  });
  Object.freeze(value.blocks);
  Object.freeze(value.targetSkills);
  Object.freeze(value);
  Object.freeze(plan.targetSkills);
  Object.freeze(plan.assessmentCriteria);
  Object.freeze(plan.requiredResponseTypes);
  Object.freeze(plan);
}
// Every case checks issue metadata, validity, determinism, and frozen-input immutability.
function check(value: LearningTask, expected: [string, string][] = [], plan = blueprint): void {
  const before = JSON.stringify({ value, plan });
  freezeInputs(value, plan);
  const result = validateLearningTask(value, plan);
  equal(result.issues.map((issue) => [issue.code, issue.path]), expected);
  assert(result.valid === (result.issues.length === 0), "Incorrect valid flag");
  for (const issue of result.issues) {
    assert(issue.code.trim().length > 0 && issue.path.trim().length > 0
      && issue.message.trim().length > 0, "Incomplete issue metadata");
  }
  equal(validateLearningTask(value, plan), result);
  equal(JSON.stringify({ value, plan }), before);
}
function exerciseError(block: TaskBlock, code: string, path: string): void {
  check(task([block]), [[code, `blocks[0].${path}`]]);
}
const writingPlan: TaskBlueprint = {
  ...blueprint, activityType: "writing_task", requiredResponseTypes: ["written_answer"],
};
const audioPlan: TaskBlueprint = {
  ...blueprint, activityType: "monologue", requiredResponseTypes: ["audio_answer"],
};

// A: Valid task structures and all four exercise variants.
check(task());
check(task([writing], "writing_task"), [], writingPlan);
check(task([audio], "monologue"), [], audioPlan);
check(task([{ id: "text", type: "text", text: "Read this passage." }, quiz], "read_article"), [],
  { ...blueprint, activityType: "read_article" });
check(task([{ id: "audio", type: "audio", url: "https://example.com/audio.mp3" }, quiz], "listen_audio"), [],
  { ...blueprint, activityType: "listen_audio" });
check(task([{ id: "video", type: "video", url: "https://example.com/video.mp4" }, quiz], "watch_video"), [],
  { ...blueprint, activityType: "watch_video" });
check(task([completion], "flashcards"), [],
  { ...blueprint, activityType: "flashcards", requiredResponseTypes: ["completion"] });
check(task([quiz, writing, audio, completion]));

// B: Task-level errors and numeric boundaries.
check({ ...task(), id: "" }, [["required_field", "id"]]);
check({ ...task(), title: "  " }, [["required_field", "title"]]);
check({ ...task(), instructions: "" }, [["required_field", "instructions"]]);
check({ ...task(), activityType: "writing_task" }, [["activity_mismatch", "activityType"]]);
check({ ...task(), targetSkills: [] }, [["missing_skill", "targetSkills"]]);
for (const estimatedMinutes of [0, -1, Infinity, NaN]) {
  check({ ...task(), estimatedMinutes }, [["invalid_duration", "estimatedMinutes"]]);
}
for (const difficulty of [-0.1, 1.1, Infinity, NaN]) {
  check({ ...task(), difficulty }, [["invalid_difficulty", "difficulty"]]);
}
for (const difficulty of [0, 1]) check({ ...task(), difficulty });
check(task([]), [["missing_exercise", "blocks"], ["missing_response_type", "blocks"]]);
check(task([{ id: "text", type: "text", text: "Read." }]),
  [["missing_exercise", "blocks"], ["missing_response_type", "blocks"]]);
check(task([quiz, { ...writing, id: quiz.id }]), [["duplicate_block_id", "blocks[1].id"]]);
exerciseError({ ...quiz, id: "" }, "required_field", "id");

// C: Text and media validation, without network access.
check(task([{ id: "text", type: "text", text: "" }, quiz]), [["required_field", "blocks[0].text"]]);
for (const type of ["audio", "video"] as const) {
  for (const url of ["", "relative/media", "ftp://example.com/media"]) {
    check(task([{ id: "media", type, url }, quiz]),
      [[url === "" ? "required_field" : "invalid_url", "blocks[0].url"]]);
  }
  for (const url of ["https://example.com/media", "http://example.com/media"]) {
    check(task([{ id: "media", type, url }, quiz]));
  }
}

// D: Exercise fields, options, answer keys, and optional limits.
exerciseError({ ...quiz, question: "" }, "required_field", "question");
exerciseError({ ...quiz, targetSkills: [] }, "missing_skill", "targetSkills");
for (const objectiveIds of [undefined, [], ["different-objective"]]) {
  exerciseError({ ...quiz, objectiveIds }, "missing_objective", "objectiveIds");
}
exerciseError({ ...quiz, options: [quiz.options[0]] }, "invalid_options", "options");
exerciseError({ ...quiz, options: [quiz.options[0], { ...quiz.options[1], id: "option-a" }] },
  "invalid_options", "options[1].id");
exerciseError({ ...quiz, options: [quiz.options[0], { ...quiz.options[1], id: "" }] },
  "required_field", "options[1].id");
exerciseError({ ...quiz, options: [quiz.options[0], { ...quiz.options[1], text: "" }] },
  "required_field", "options[1].text");
exerciseError({ ...quiz, correctOptionIds: [] }, "invalid_correct_answers", "correctOptionIds");
exerciseError({ ...quiz, correctOptionIds: ["option-a", "option-a"] },
  "invalid_correct_answers", "correctOptionIds[1]");
exerciseError({ ...quiz, correctOptionIds: ["unknown-option"] },
  "invalid_correct_answers", "correctOptionIds[0]");
for (const limit of [0, -1, 1.5, Infinity, NaN]) {
  check(task([{ ...writing, minWords: limit }], "writing_task"),
    [["invalid_word_limit", "blocks[0].minWords"]], writingPlan);
  check(task([{ ...writing, maxWords: limit }], "writing_task"),
    [["invalid_word_limit", "blocks[0].maxWords"]], writingPlan);
}
check(task([{ ...writing, minWords: 60 }], "writing_task"),
  [["invalid_word_limit", "blocks[0].maxWords"]], writingPlan);
check(task([{ ...writing, minWords: 1, maxWords: 1 }], "writing_task"), [], writingPlan);
check(task([{ ...writing, minWords: undefined, maxWords: undefined }], "writing_task"), [], writingPlan);
// Local extension exercises the validator's property-presence check without changing the domain model.
for (const maxDurationSeconds of [0, -1, Infinity, NaN, 1.5]) {
  const recording: AudioAnswerExercise & { maxDurationSeconds: number } = { ...audio, maxDurationSeconds };
  check(task([recording], "monologue"), maxDurationSeconds === 1.5 ? []
    : [["invalid_duration", "blocks[0].maxDurationSeconds"]], audioPlan);
}

// E: Required response types; additional types are allowed and duplicates are ignored.
check(task([writing]), [["missing_response_type", "blocks"]]);
const mixedPlan: TaskBlueprint = { ...blueprint, requiredResponseTypes: ["selected_answers", "written_answer"] };
check(task([quiz, writing]), [], mixedPlan);
check(task([quiz]), [["missing_response_type", "blocks"]], mixedPlan);
check(task([quiz]), [["missing_response_type", "blocks"]],
  { ...blueprint, requiredResponseTypes: ["selected_answers", "written_answer", "written_answer"] });

// F: Independent errors are aggregated in a fixed order, including block-level issues.
const broken = task([{ ...quiz, question: "", objectiveIds: [] }]);
check({ ...broken, title: " ", estimatedMinutes: 0, difficulty: -1 }, [
  ["required_field", "title"], ["invalid_duration", "estimatedMinutes"],
  ["invalid_difficulty", "difficulty"], ["required_field", "blocks[0].question"],
  ["missing_objective", "blocks[0].objectiveIds"],
]);
const secret = "PRIVATE_ANSWER_KEY_SENTINEL";
const secretTask = task([{ ...quiz, correctOptionIds: [secret, secret] }]);
check(secretTask, [["invalid_correct_answers", "blocks[0].correctOptionIds[0]"],
  ["invalid_correct_answers", "blocks[0].correctOptionIds[1]"]]);
assert(validateLearningTask(secretTask, blueprint).issues.every((issue) => !issue.message.includes(secret)),
  "Issue messages must not expose answer key values");
console.log("validateLearningTask: all example checks passed.");
