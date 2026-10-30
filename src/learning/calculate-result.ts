import type { ExerciseResult, LearningFeedback, Skill, SkillScore } from "../types";
import { getLatestFeedback } from "./feedback";

export function calculateLearningResult(
  exerciseResults: ExerciseResult[],
  feedbacks: LearningFeedback[],
): { completionRate: number; score?: number; skillScores: SkillScore[] } {
  let answeredCount = 0;
  const exerciseScores: number[] = [];
  const skillTotals = new Map<Skill, { total: number; count: number }>();

  for (const result of exerciseResults) {
    if (result.status !== "answered") continue;
    answeredCount++;
    const feedback = getLatestFeedback(feedbacks, result.id);
    if (!feedback || feedback.skillScores.length === 0) continue;

    let exerciseTotal = 0;
    for (const { skill, score } of feedback.skillScores) {
      exerciseTotal += score;
      const previous = skillTotals.get(skill) ?? { total: 0, count: 0 };
      skillTotals.set(skill, { total: previous.total + score, count: previous.count + 1 });
    }
    exerciseScores.push(exerciseTotal / feedback.skillScores.length);
  }

  const completionRate = exerciseResults.length === 0 ? 0 : answeredCount / exerciseResults.length;
  const skillScores: SkillScore[] = Array.from(skillTotals, ([skill, { total, count }]) => ({
    skill,
    score: total / count,
  }));

  if (exerciseScores.length === 0) return { completionRate, skillScores: [] };
  const score = exerciseScores.reduce((total, value) => total + value, 0) / exerciseScores.length;
  return { completionRate, score, skillScores };
}
