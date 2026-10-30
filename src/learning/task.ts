import type { LearningTask } from "../types";

export const mockLearningTask: LearningTask = {
  id: "task-listening-001",
  title: "Talking about daily routines",
  instructions: "Watch the video, answer the quiz, then write about your routine.",
  activityType: "watch_video",
  targetSkills: ["listening", "grammar", "writing"],
  difficulty: 0.4,
  estimatedMinutes: 20,
  blocks: [
    {
      id: "block-video-001",
      type: "video",
      // Placeholder media URL for this mock.
      url: "https://example.com/videos/daily-routines.mp4",
    },
    {
      id: "block-quiz-001",
      type: "exercise",
      responseType: "selected_answers",
      question: "Which sentence correctly describes a daily routine?",
      targetSkills: ["grammar"],
      options: [
        { id: "option-1", text: "She goes to work every morning." },
        { id: "option-2", text: "She go to work every morning." },
        { id: "option-3", text: "She going to work every morning." },
      ],
      correctOptionIds: ["option-1"],
    },
    {
      id: "block-writing-001",
      type: "exercise",
      responseType: "written_answer",
      question: "Describe your daily routine using the present simple.",
      targetSkills: ["grammar", "writing"],
      minWords: 50,
      maxWords: 100,
    },
  ],
  status: "planned",
  createdBy: "agent",
  teacherReview: "pending",
  planId: "plan-001",
  scheduledFor: "2026-10-28",
};
