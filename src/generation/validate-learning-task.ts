import type { ExerciseBlock, LearningTask, Skill, TaskBlueprint, TaskValidationIssue, TaskValidationResult } from "../types";

export function validateLearningTask(
  task: LearningTask,
  blueprint: TaskBlueprint,
): TaskValidationResult {
  const issues: TaskValidationIssue[] = [];
  const add = (code: string, path: string, message: string): void => {
    issues.push({ code, path, message });
  };
  const required = (value: string, path: string): boolean => {
    if (value.trim().length > 0) return true;
    add("required_field", path, "Must not be empty or whitespace.");
    return false;
  };
  const skills = (values: Skill[], path: string): void => {
    for (const skill of new Set(blueprint.targetSkills)) {
      if (!values.includes(skill)) add("missing_skill", path, `Must include target skill: ${skill}.`);
    }
  };
  const positive = (value: number): boolean => Number.isFinite(value) && value > 0;
  required(task.id, "id");
  required(task.title, "title");
  required(task.instructions, "instructions");
  if (task.activityType !== blueprint.activityType) {
    add("activity_mismatch", "activityType", "Must match the blueprint activity type.");
  }
  skills(task.targetSkills, "targetSkills");
  if (!positive(task.estimatedMinutes)) {
    add("invalid_duration", "estimatedMinutes", "Must be a positive finite number.");
  }
  if (!Number.isFinite(task.difficulty) || task.difficulty < 0 || task.difficulty > 1) {
    add("invalid_difficulty", "difficulty", "Must be a finite number between 0 and 1 inclusive.");
  }
  const responseTypes = new Set<ExerciseBlock["responseType"]>();
  const blockIds = new Set<string>();
  if (!task.blocks.some((block) => block.type === "exercise")) {
    add("missing_exercise", "blocks", "Must contain at least one exercise block.");
  }
  task.blocks.forEach((block, index) => {
    const path = `blocks[${index}]`;
    if (required(block.id, `${path}.id`)) {
      if (blockIds.has(block.id)) add("duplicate_block_id", `${path}.id`, "Block IDs must be unique within the task.");
      blockIds.add(block.id);
    }
    if (block.type === "text") {
      required(block.text, `${path}.text`);
    } else if (block.type === "audio" || block.type === "video") {
      if (required(block.url, `${path}.url`)) {
        let validUrl = false;
        try {
          const url = new URL(block.url);
          validUrl = /^https?:\/\//i.test(block.url)
            && (url.protocol === "http:" || url.protocol === "https:") && url.hostname.length > 0;
        } catch {
          // URL parsing performs no network request.
        }
        if (!validUrl) add("invalid_url", `${path}.url`, "Must be an absolute HTTP or HTTPS URL.");
      }
    } else {
      responseTypes.add(block.responseType);
      required(block.question, `${path}.question`);
      skills(block.targetSkills, `${path}.targetSkills`);
      if (!block.objectiveIds?.includes(blueprint.objectiveId)) {
        add("missing_objective", `${path}.objectiveIds`, "Must include the blueprint objective ID.");
      }
      if (block.responseType === "selected_answers") {
        if (block.options.length < 2) add("invalid_options", `${path}.options`, "Must contain at least two options.");
        const optionIds = new Set<string>();
        block.options.forEach((option, optionIndex) => {
          const optionPath = `${path}.options[${optionIndex}]`;
          if (required(option.id, `${optionPath}.id`)) {
            if (optionIds.has(option.id)) add("invalid_options", `${optionPath}.id`, "Option IDs must be unique within the exercise.");
            optionIds.add(option.id);
          }
          required(option.text, `${optionPath}.text`);
        });
        if (block.correctOptionIds.length === 0) {
          add("invalid_correct_answers", `${path}.correctOptionIds`, "Must contain at least one answer key reference.");
        }
        const answerIds = new Set<string>();
        block.correctOptionIds.forEach((id, answerIndex) => {
          const answerPath = `${path}.correctOptionIds[${answerIndex}]`;
          if (answerIds.has(id)) {
            add("invalid_correct_answers", answerPath, "Answer key references must be unique.");
          } else if (!optionIds.has(id)) {
            add("invalid_correct_answers", answerPath, "Answer key reference must identify an existing non-empty option ID.");
          }
          answerIds.add(id);
        });
      } else if (block.responseType === "written_answer") {
        const validMin = block.minWords === undefined || (Number.isInteger(block.minWords) && block.minWords > 0);
        const validMax = block.maxWords === undefined || (Number.isInteger(block.maxWords) && block.maxWords > 0);
        if (!validMin) add("invalid_word_limit", `${path}.minWords`, "Must be a positive integer when supplied.");
        if (!validMax) add("invalid_word_limit", `${path}.maxWords`, "Must be a positive integer when supplied.");
        if (validMin && validMax && block.minWords !== undefined && block.maxWords !== undefined
          && block.minWords > block.maxWords) {
          add("invalid_word_limit", `${path}.maxWords`, "Must be greater than or equal to minWords.");
        }
      } else if (block.responseType === "audio_answer" && "maxDurationSeconds" in block
        && block.maxDurationSeconds !== undefined) {
        if (typeof block.maxDurationSeconds !== "number" || !positive(block.maxDurationSeconds)) {
          add("invalid_duration", `${path}.maxDurationSeconds`, "Must be a positive finite number when supplied.");
        }
      }
    }
  });
  for (const responseType of new Set(blueprint.requiredResponseTypes)) {
    if (!responseTypes.has(responseType)) {
      add("missing_response_type", "blocks", `Must include an exercise with responseType: ${responseType}.`);
    }
  }
  return { valid: issues.length === 0, issues };
}
