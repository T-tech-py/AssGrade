export type ExamQuestionStatus = 'not_visited' | 'answered' | 'current' | 'flagged';

export type BaseQuestion = {
  id: string;
  number: number;
  prompt: string;
  type: 'mcq' | 'theory' | 'coding';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  scenario?: string;
};

export type MCQQuestionData = BaseQuestion & {
  type: 'mcq';
  options: { id: string; label: string; value?: string }[];
};

export type TheoryQuestionData = BaseQuestion & {
  type: 'theory';
  placeholder: string;
};

export type CodingQuestionData = BaseQuestion & {
  type: 'coding';
  language: 'JavaScript' | 'Python';
  starterCode: string;
  sampleInput: string;
  sampleOutput: string;
};

export type ExamQuestion = MCQQuestionData | TheoryQuestionData | CodingQuestionData;

export type ExamDefinition = {
  id: string;
  title: string;
  field: string;
  durationMinutes: number;
  totalQuestions: number;
  formats: Array<'MCQ' | 'Theory' | 'Coding'>;
  instructions: string[];
  securityNotes: string[];
  description: string;
  questions: ExamQuestion[];
};

export const mockExams: ExamDefinition[] = [
  {
    id: 'tech-employability',
    title: 'Tech Employability Assessment',
    field: 'Technology',
    durationMinutes: 45,
    totalQuestions: 12,
    formats: ['MCQ', 'Theory', 'Coding'],
    description:
      'A secure mixed-format assessment focused on practical thinking, communication, and technical readiness.',
    instructions: [
      'Read every question carefully before selecting or typing your response.',
      'Use the question palette to navigate, but make sure you review flagged items before submitting.',
      'Your responses will autosave while you work.',
      'The assessment will submit automatically when the timer expires.',
    ],
    securityNotes: [
      'Do not switch tabs during the assessment.',
      'Keep your webcam on at all times.',
      'Exiting fullscreen may trigger a warning.',
      'Ensure your internet connection remains stable.',
    ],
    questions: [
      {
        id: 'q1',
        number: 1,
        type: 'mcq',
        difficulty: 'Beginner',
        prompt: 'Which practice most improves accessibility in a job-application portal?',
        options: [
          { id: 'a', label: 'Using color alone to indicate errors' },
          { id: 'b', label: 'Adding semantic labels to form controls' },
          { id: 'c', label: 'Hiding helper text until submit' },
          { id: 'd', label: 'Disabling keyboard navigation on modals' },
        ],
      },
      {
        id: 'q2',
        number: 2,
        type: 'mcq',
        difficulty: 'Intermediate',
        prompt: 'A graduate product team wants faster feedback loops. Which metric is the strongest indicator?',
        options: [
          { id: 'a', label: 'Number of colors in the UI' },
          { id: 'b', label: 'Time from user action to reviewed insight' },
          { id: 'c', label: 'How many pages exist in the app' },
          { id: 'd', label: 'Team meeting length per week' },
        ],
      },
      {
        id: 'q3',
        number: 3,
        type: 'theory',
        difficulty: 'Intermediate',
        prompt: 'Explain how you would handle conflicting feedback from two stakeholders on a graduate assessment platform.',
        scenario:
          'One stakeholder wants more advanced questions for stronger candidates, while another wants a simpler test for broader accessibility.',
        placeholder: 'Write a concise response explaining your reasoning, tradeoffs, and proposed next step...',
      },
      {
        id: 'q4',
        number: 4,
        type: 'mcq',
        difficulty: 'Beginner',
        prompt: 'What is the strongest reason to autosave responses during an online assessment?',
        options: [
          { id: 'a', label: 'To reduce the need for timers' },
          { id: 'b', label: 'To protect student progress during interruptions' },
          { id: 'c', label: 'To hide unanswered questions' },
          { id: 'd', label: 'To disable review before submission' },
        ],
      },
      {
        id: 'q5',
        number: 5,
        type: 'coding',
        difficulty: 'Intermediate',
        prompt: 'Write a function that returns the average of a list of numeric assessment scores.',
        scenario: 'Ignore invalid values and return 0 when the list is empty.',
        language: 'JavaScript',
        starterCode: `function averageScore(scores) {\n  // your solution here\n}\n`,
        sampleInput: '[70, 84, 90]',
        sampleOutput: '81.33',
      },
      {
        id: 'q6',
        number: 6,
        type: 'mcq',
        difficulty: 'Advanced',
        prompt: 'Which design choice best reduces cheating risk in a remote assessment environment?',
        options: [
          { id: 'a', label: 'Displaying all answers on one screen' },
          { id: 'b', label: 'Disabling time limits entirely' },
          { id: 'c', label: 'Combining proctoring signals with navigation monitoring' },
          { id: 'd', label: 'Allowing session refresh without tracking' },
        ],
      },
      {
        id: 'q7',
        number: 7,
        type: 'theory',
        difficulty: 'Advanced',
        prompt: 'Describe how an employability platform should communicate low readiness scores without discouraging students.',
        placeholder: 'Focus on tone, guidance, and what the product should show next...',
      },
      {
        id: 'q8',
        number: 8,
        type: 'mcq',
        difficulty: 'Intermediate',
        prompt: 'Which response is most helpful after a student completes a secure assessment?',
        options: [
          { id: 'a', label: 'A blank confirmation page' },
          { id: 'b', label: 'An immediate explanation for every answer during the real exam' },
          { id: 'c', label: 'A clear submission confirmation and next-step guidance' },
          { id: 'd', label: 'A hidden score with no timeline' },
        ],
      },
      {
        id: 'q9',
        number: 9,
        type: 'coding',
        difficulty: 'Advanced',
        prompt: 'Write a function that groups recent student activities by day.',
        scenario: 'Each activity has a timestamp and title. Return an object keyed by date.',
        language: 'Python',
        starterCode: `def group_activities(items):\n    # your solution here\n    return {}\n`,
        sampleInput: "[{'title': 'Completed exam', 'date': '2026-04-06'}]",
        sampleOutput: "{'2026-04-06': [{'title': 'Completed exam', 'date': '2026-04-06'}]}",
      },
      {
        id: 'q10',
        number: 10,
        type: 'mcq',
        difficulty: 'Beginner',
        prompt: 'Which statement best reflects a trustworthy assessment platform?',
        options: [
          { id: 'a', label: 'It hides all system status from students' },
          { id: 'b', label: 'It clearly shows time, security state, and save status' },
          { id: 'c', label: 'It removes review controls' },
          { id: 'd', label: 'It delays confirmation after submission' },
        ],
      },
      {
        id: 'q11',
        number: 11,
        type: 'theory',
        difficulty: 'Intermediate',
        prompt: 'How would you prioritize improvements after noticing that many students abandon the assessment halfway through?',
        placeholder: 'Discuss the signals you would review and the product changes you would test first...',
      },
      {
        id: 'q12',
        number: 12,
        type: 'mcq',
        difficulty: 'Intermediate',
        prompt: 'Which product detail most improves student confidence during an exam?',
        options: [
          { id: 'a', label: 'Random animations between questions' },
          { id: 'b', label: 'Visible autosave and progress indicators' },
          { id: 'c', label: 'Removing all warning messages' },
          { id: 'd', label: 'A hidden submit action' },
        ],
      },
    ],
  },
];

export function getExamById(id: string) {
  return mockExams.find((exam) => exam.id === id);
}
