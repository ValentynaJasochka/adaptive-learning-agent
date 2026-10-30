import type { LearningObjective } from "../types";

export const mockLearningObjectives: LearningObjective[] = [
  {
    id: "grammar-b1-present-perfect-experience",
    skill: "grammar",
    targetCEFR: "B1",
    title: "Present Perfect for experience",
    description: "Describe three life experiences and ask two questions about experiences using the present perfect.",
    assessmentCriteria: [
      "Use have or has with the correct past participle in all three statements.",
      "Form two experience questions using 'Have you ever ...?'.",
      "Use ever or never appropriately without combining the present perfect with a finished past-time expression.",
    ],
  },
  {
    id: "grammar-b1-first-conditional",
    skill: "grammar",
    targetCEFR: "B1",
    title: "First Conditional",
    description: "Write four first conditional sentences linking realistic future conditions to their possible results.",
    assessmentCriteria: [
      "Use the present simple in each if-clause and will plus the base verb in each result clause.",
      "Express a plausible cause-and-result relationship in all four sentences.",
      "Place the if-clause first in two sentences and last in two, using commas correctly.",
    ],
  },
  {
    id: "writing-b2-organizing-opinion-paragraph",
    skill: "writing",
    targetCEFR: "B2",
    title: "Organizing an opinion paragraph",
    description: "Write a coherent opinion paragraph of 120-150 words with a clear position, supporting reasons, and a concluding sentence.",
    assessmentCriteria: [
      "State a clear opinion in the topic sentence.",
      "Support the opinion with at least two reasons and one relevant example.",
      "Use linking expressions to connect reasons and examples in a logical order.",
      "End with a concluding sentence that reinforces the opinion without introducing a new argument.",
    ],
  },
];
