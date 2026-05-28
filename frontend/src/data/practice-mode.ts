export type PracticeCategory = 'Law' | 'Engineering' | 'Tech';
export type PracticeQuestionType = 'MCQ' | 'Theory' | 'Coding' | 'Mixed';
export type PracticeDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type PracticeStyle = 'Instant Feedback' | 'End-of-Session Review';

export type PracticeTopicMap = Record<PracticeCategory, string[]>;

export type PracticeRecentSession = {
  id: string;
  title: string;
  topic: string;
  score: string;
  completion: string;
  summary: string;
  href: string;
};

export type PracticeRecommendation = {
  title: string;
  summary: string;
  category: PracticeCategory;
  topic: string;
  difficulty: PracticeDifficulty;
  questionType: PracticeQuestionType;
  questionCount: number;
  style: PracticeStyle;
  focusAreas: string[];
};

type PracticeBaseQuestion = {
  id: string;
  number: number;
  type: 'mcq' | 'theory' | 'coding';
  prompt: string;
  supportingText?: string;
  topic: string;
  difficulty: PracticeDifficulty;
  explanation: string;
  takeaway: string;
  recommendedTopic: string;
};

export type PracticeMCQQuestion = PracticeBaseQuestion & {
  type: 'mcq';
  options: Array<{ id: string; label: string }>;
  correctOptionId: string;
};

export type PracticeTheoryQuestion = PracticeBaseQuestion & {
  type: 'theory';
  placeholder: string;
  modelAnswer: string;
  feedback: {
    strengths: string[];
    improvements: string[];
    betterResponseTip: string;
  };
};

export type PracticeCodingQuestion = PracticeBaseQuestion & {
  type: 'coding';
  language: 'JavaScript' | 'Python';
  starterCode: string;
  sampleInput: string;
  sampleOutput: string;
  feedback: {
    logicQuality: string;
    codeClarity: string;
    improvementSuggestions: string[];
    modelApproach: string;
  };
};

export type PracticeQuestion = PracticeMCQQuestion | PracticeTheoryQuestion | PracticeCodingQuestion;

export type PracticeSessionDefinition = {
  id: string;
  title: string;
  category: PracticeCategory;
  topic: string;
  difficulty: PracticeDifficulty;
  questionType: PracticeQuestionType;
  questionCount: number;
  style: PracticeStyle;
  progressNote: string;
  relaxedModeLabel: string;
  focusAreas: string[];
  recommendedTopics: string[];
  studyTips: string[];
  questions: PracticeQuestion[];
};

export type PracticeSummaryMetric = {
  title: string;
  value: string;
  helper: string;
};

export type PracticeReviewQuestion = {
  id: string;
  number: number;
  type: 'MCQ' | 'Theory' | 'Coding';
  prompt: string;
  userAnswer: string;
  idealAnswer: string;
  explanation: string;
  improvementNote: string;
  outcome: 'Correct' | 'Needs Improvement';
};

export const practiceCategories: PracticeCategory[] = ['Law', 'Engineering', 'Tech'];

export const practiceTopics: PracticeTopicMap = {
  Law: ['Legal Reasoning', 'Constitutional Law', 'Contract Law', 'Case Analysis'],
  Engineering: ['Mathematics', 'Mechanics', 'Technical Drawing', 'Systems Design'],
  Tech: ['JavaScript', 'React Fundamentals', 'Algorithms', 'Databases'],
};

export const practiceQuestionTypes: PracticeQuestionType[] = ['MCQ', 'Theory', 'Coding', 'Mixed'];

export const practiceDifficultyLevels: PracticeDifficulty[] = ['Beginner', 'Intermediate', 'Advanced'];

export const practiceQuestionCounts = [5, 10, 15, 20];

export const practiceStyles: PracticeStyle[] = ['Instant Feedback', 'End-of-Session Review'];

export const practiceRecommendation: PracticeRecommendation = {
  title: 'Recommended for your next session',
  summary:
    'Based on your recent performance, we recommend a focused React Fundamentals session with mixed questions and instant feedback.',
  category: 'Tech',
  topic: 'React Fundamentals',
  difficulty: 'Intermediate',
  questionType: 'Mixed',
  questionCount: 10,
  style: 'Instant Feedback',
  focusAreas: ['State management', 'Component composition', 'Problem decomposition'],
};

export const recentPracticeSessions: PracticeRecentSession[] = [
  {
    id: 'session-frontend-1',
    title: 'Frontend Momentum Session',
    topic: 'React Fundamentals',
    score: '82%',
    completion: 'Completed yesterday',
    summary: 'Strong on component structure, but conditional rendering and hooks still need more confidence.',
    href: '/practice/review',
  },
  {
    id: 'session-algorithms-1',
    title: 'Problem Solving Sprint',
    topic: 'Algorithms',
    score: '74%',
    completion: 'Completed 3 days ago',
    summary: 'You improved your reasoning pace, but array manipulation questions still slowed you down.',
    href: '/practice/review',
  },
  {
    id: 'session-database-1',
    title: 'Database Readiness Refresh',
    topic: 'Databases',
    score: '88%',
    completion: 'Completed last week',
    summary: 'Solid SQL intuition. Next step is strengthening query optimization explanations.',
    href: '/practice/review',
  },
];

export const practiceSessionMock: PracticeSessionDefinition = {
  id: 'practice-react-guided',
  title: 'AI Practice Session',
  category: 'Tech',
  topic: 'React Fundamentals',
  difficulty: 'Intermediate',
  questionType: 'Mixed',
  questionCount: 6,
  style: 'Instant Feedback',
  progressNote: 'Small, guided sessions help you improve without the pressure of a live exam.',
  relaxedModeLabel: 'Guided mode on',
  focusAreas: ['React state updates', 'Conditional rendering', 'Clear problem breakdown'],
  recommendedTopics: ['Hooks basics', 'Reusable component thinking', 'Array methods for UI rendering'],
  studyTips: [
    'Explain your thinking before jumping into syntax.',
    'Write short, testable chunks when answering coding prompts.',
    'Treat every explanation as if you are teaching a junior teammate.',
  ],
  questions: [
    {
      id: 'p1',
      number: 1,
      type: 'mcq',
      topic: 'React Fundamentals',
      difficulty: 'Beginner',
      prompt: 'Which React pattern is best for updating UI when an input field changes?',
      supportingText: 'Think about how React keeps form state in sync with what a user sees.',
      options: [
        { id: 'a', label: 'Mutate the DOM directly with query selectors' },
        { id: 'b', label: 'Use component state and update it from the input event' },
        { id: 'c', label: 'Reload the entire page after every keystroke' },
        { id: 'd', label: 'Store values only in CSS classes' },
      ],
      correctOptionId: 'b',
      explanation:
        'React works best when the UI reflects state. Updating component state from the input event keeps the interface predictable and easy to reason about.',
      takeaway: 'Controlled inputs are a core React pattern for predictable form behavior.',
      recommendedTopic: 'Controlled components',
    },
    {
      id: 'p2',
      number: 2,
      type: 'theory',
      topic: 'Problem Decomposition',
      difficulty: 'Intermediate',
      prompt: 'A student dashboard feels slow when loading several summary cards. How would you investigate and improve the experience?',
      supportingText: 'Focus on how you would structure your thinking, not only on technical fixes.',
      placeholder: 'Write a short, structured response describing what you would inspect first and what improvements you would test...',
      modelAnswer:
        'I would first identify whether the delay comes from network requests, heavy rendering, or too many blocking operations on page load. Then I would prioritize quick wins such as loading critical summary data first, deferring non-essential panels, and reducing expensive rendering work. Finally, I would measure the impact with real user metrics before rolling changes out broadly.',
      explanation:
        'Strong answers show a calm troubleshooting sequence: identify the bottleneck, prioritize likely improvements, and confirm results with metrics.',
      takeaway: 'A strong product response combines diagnosis, prioritization, and measurement.',
      recommendedTopic: 'Frontend performance thinking',
      feedback: {
        strengths: ['You recognized that speed issues can come from multiple layers, not just code rendering.'],
        improvements: ['Call out how you would measure success after each change.', 'Separate investigation from implementation more clearly.'],
        betterResponseTip: 'Use a three-part structure: diagnose, improve, validate.',
      },
    },
    {
      id: 'p3',
      number: 3,
      type: 'coding',
      topic: 'JavaScript',
      difficulty: 'Intermediate',
      prompt: 'Write a function that returns only the completed tasks from an array of task objects.',
      supportingText: 'Each task has a title and a completed boolean field.',
      language: 'JavaScript',
      starterCode: `function getCompletedTasks(tasks) {\n  // return only completed items\n}\n`,
      sampleInput: `[{ title: 'Practice hooks', completed: true }, { title: 'Read docs', completed: false }]`,
      sampleOutput: `[{ title: 'Practice hooks', completed: true }]`,
      explanation:
        'A clean solution filters the array by the completed property and returns a new array without mutating the original input.',
      takeaway: 'Filtering arrays is one of the most useful building blocks for UI-ready data shaping.',
      recommendedTopic: 'Array methods',
      feedback: {
        logicQuality: 'Good start. Your structure is clear, but the final return path should be tighter and fully handle empty arrays.',
        codeClarity: 'Readable naming helps here. Keep function intent obvious and avoid extra loops when a filter is enough.',
        improvementSuggestions: [
          'Use `filter` to express intent directly.',
          'Return the result instead of mutating an external variable.',
          'Add a quick empty-array mental check before submitting.',
        ],
        modelApproach:
          'A concise answer would return `tasks.filter((task) => task.completed)` and leave the original array untouched.',
      },
    },
    {
      id: 'p4',
      number: 4,
      type: 'mcq',
      topic: 'Databases',
      difficulty: 'Intermediate',
      prompt: 'Which database improvement most helps when a frequently used student search screen becomes slow?',
      supportingText: 'Assume the same fields are queried repeatedly.',
      options: [
        { id: 'a', label: 'Remove all filtering options from the UI' },
        { id: 'b', label: 'Add an index to the fields used in the search query' },
        { id: 'c', label: 'Store the results in a text file' },
        { id: 'd', label: 'Increase the size of every response payload' },
      ],
      correctOptionId: 'b',
      explanation:
        'Indexes help the database locate matching records faster when queries repeatedly target the same columns.',
      takeaway: 'Good performance answers connect product behavior to the underlying data access pattern.',
      recommendedTopic: 'Query optimization basics',
    },
    {
      id: 'p5',
      number: 5,
      type: 'theory',
      topic: 'Communication',
      difficulty: 'Advanced',
      prompt: 'How should an employability platform explain a low readiness score to a student without discouraging them?',
      placeholder: 'Write a supportive product response that balances honesty, guidance, and motivation...',
      modelAnswer:
        'The platform should be direct about the score while framing it as a snapshot, not a fixed identity. It should explain what the score means, highlight one or two strengths, then provide a clear next step such as a study plan or practice recommendation. The tone should remain encouraging and actionable.',
      explanation:
        'The best responses combine empathy with clarity. Students need honest signals, but they also need a visible path forward.',
      takeaway: 'Feedback is strongest when it pairs truth with guidance.',
      recommendedTopic: 'Product communication',
      feedback: {
        strengths: ['Your tone is empathetic and student-centered.'],
        improvements: ['Mention how the system should surface next steps immediately after the score.', 'Add a line about highlighting strengths alongside gaps.'],
        betterResponseTip: 'Anchor the answer in three things: meaning, encouragement, next step.',
      },
    },
    {
      id: 'p6',
      number: 6,
      type: 'coding',
      topic: 'React Fundamentals',
      difficulty: 'Advanced',
      prompt: 'Write a React helper that returns a label for readiness scores: "Beginner", "Developing", or "Job-Ready".',
      supportingText: 'Use these ranges: below 50, 50-74, and 75 or above.',
      language: 'JavaScript',
      starterCode: `function getReadinessLabel(score) {\n  // return the right label\n}\n`,
      sampleInput: '78',
      sampleOutput: `'Job-Ready'`,
      explanation:
        'This is mainly about writing clear branching logic and handling boundary values carefully.',
      takeaway: 'Small utility logic should still be explicit and easy to test.',
      recommendedTopic: 'Conditional logic',
      feedback: {
        logicQuality: 'Your structure is close, but the boundary values need more care so scores like 50 and 75 map correctly.',
        codeClarity: 'Simple if-statements are enough here. Avoid overcomplicating straightforward branching.',
        improvementSuggestions: [
          'Check lower thresholds first and keep each return explicit.',
          'Test edge values like 49, 50, 74, and 75 mentally before finalizing.',
          'Use descriptive labels directly in the return statements.',
        ],
        modelApproach:
          'A clean answer uses ordered conditions: below 50 returns Beginner, below 75 returns Developing, otherwise return Job-Ready.',
      },
    },
  ],
};

export const practiceSummaryMetrics: PracticeSummaryMetric[] = [
  { title: 'Correct answers', value: '4/6', helper: 'You handled the strongest fundamentals well.' },
  { title: 'Accuracy rate', value: '67%', helper: 'A solid base with room to sharpen weaker areas.' },
  { title: 'Strongest area', value: 'React basics', helper: 'You are most confident when the question is concrete and practical.' },
  { title: 'Weakest area', value: 'Structured explanations', helper: 'Long-form reasoning becomes stronger with a tighter response structure.' },
];

export const practiceReviewQuestions: PracticeReviewQuestion[] = [
  {
    id: 'r1',
    number: 1,
    type: 'MCQ',
    prompt: 'Which React pattern is best for updating UI when an input field changes?',
    userAnswer: 'Use component state and update it from the input event.',
    idealAnswer: 'Use component state and update it from the input event.',
    explanation: 'Correct. Controlled inputs keep UI and state aligned, which makes forms predictable and easier to validate.',
    improvementNote: 'Keep reinforcing this pattern by building small form components from scratch.',
    outcome: 'Correct',
  },
  {
    id: 'r2',
    number: 2,
    type: 'Theory',
    prompt: 'A student dashboard feels slow when loading several summary cards. How would you investigate and improve the experience?',
    userAnswer:
      'I would reduce the number of cards, optimize API calls, and make the app feel faster. I would also try caching and maybe loading sections separately.',
    idealAnswer:
      'Identify whether the issue is network, rendering, or blocking work first, then prioritize critical data, defer lower-value panels, and validate the changes with performance metrics.',
    explanation: 'Your answer points in the right direction, but it skips the order of investigation and does not explain how success would be measured.',
    improvementNote: 'Try using a diagnose, improve, validate structure for performance questions.',
    outcome: 'Needs Improvement',
  },
  {
    id: 'r3',
    number: 3,
    type: 'Coding',
    prompt: 'Write a function that returns only the completed tasks from an array of task objects.',
    userAnswer:
      "function getCompletedTasks(tasks) {\n  const done = [];\n  tasks.forEach((task) => {\n    if (task.completed) done.push(task);\n  });\n  return done;\n}",
    idealAnswer: 'Return `tasks.filter((task) => task.completed)` so the intent is direct and concise.',
    explanation: 'Your solution works, which is great. The improvement opportunity is expressiveness and using the array method that best matches the task.',
    improvementNote: 'Prefer the clearest built-in array method when it communicates your intent more directly.',
    outcome: 'Correct',
  },
  {
    id: 'r4',
    number: 4,
    type: 'MCQ',
    prompt: 'Which database improvement most helps when a frequently used student search screen becomes slow?',
    userAnswer: 'Add an index to the fields used in the search query.',
    idealAnswer: 'Add an index to the fields used in the search query.',
    explanation: 'Correct. This answer shows you understand that product speed often comes down to data access patterns.',
    improvementNote: 'Keep connecting product behavior to underlying systems thinking.',
    outcome: 'Correct',
  },
  {
    id: 'r5',
    number: 5,
    type: 'Theory',
    prompt: 'How should an employability platform explain a low readiness score to a student without discouraging them?',
    userAnswer:
      'The platform should be polite and helpful. It should tell the student to keep learning and maybe show recommendations.',
    idealAnswer:
      'Explain what the score means, emphasize that it is a snapshot, highlight one or two strengths, and give a visible next step such as practice or a study plan.',
    explanation: 'Your tone is good, but the response stays generic. The stronger version gives a clearer communication structure and a more actionable next step.',
    improvementNote: 'When answering communication questions, include message structure and user emotion in the same response.',
    outcome: 'Needs Improvement',
  },
  {
    id: 'r6',
    number: 6,
    type: 'Coding',
    prompt: 'Write a React helper that returns a label for readiness scores.',
    userAnswer:
      "function getReadinessLabel(score) {\n  if (score < 50) return 'Beginner';\n  if (score < 75) return 'Developing';\n  return 'Job-Ready';\n}",
    idealAnswer:
      "function getReadinessLabel(score) {\n  if (score < 50) return 'Beginner';\n  if (score < 75) return 'Developing';\n  return 'Job-Ready';\n}",
    explanation: 'Correct. The logic is clear and the boundary handling is consistent.',
    improvementNote: 'Nice work. Keep this level of clarity in slightly larger utility functions too.',
    outcome: 'Correct',
  },
];

export const practiceReviewMeta = {
  title: 'React Fundamentals Guided Practice',
  field: 'Tech',
  topic: 'React Fundamentals',
  difficulty: 'Intermediate' as PracticeDifficulty,
  score: '67%',
  completion: '4 of 6 answered correctly',
  completedAt: 'April 6, 2026',
  weakAreas: ['Structured technical explanations', 'Hooks reasoning', 'Boundary-case checking'],
  studyPlan: [
    { day: 'Day 1', focus: 'Review controlled components and state updates with one small form build.' },
    { day: 'Day 2', focus: 'Practice two short theory prompts using a diagnose, improve, validate structure.' },
    { day: 'Day 3', focus: 'Revisit array methods and refactor one coding answer using filter or map.' },
    { day: 'Day 4', focus: 'Study React hooks with emphasis on when state and effects are actually needed.' },
    { day: 'Day 5', focus: 'Attempt a mixed mini-session and review every explanation carefully.' },
    { day: 'Day 6', focus: 'Write two communication-focused answers about product feedback and student guidance.' },
    { day: 'Day 7', focus: 'Take another 10-question guided practice session and compare improvement areas.' },
  ],
  careerInsight:
    'Your current performance suggests strong promise for frontend-focused graduate roles. Sharpening your explanation structure will make your problem-solving feel even more interview-ready.',
};

export function getTopicsForCategory(category: PracticeCategory) {
  return practiceTopics[category];
}
