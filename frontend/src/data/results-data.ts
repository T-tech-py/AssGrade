export type ResultMetric = {
  title: string;
  value: string;
  helper: string;
  icon: 'score' | 'growth' | 'certificate' | 'readiness';
};

export type ResultAttempt = {
  id: string;
  title: string;
  field: string;
  score: number;
  grade: string;
  status: 'Fail' | 'Fairly passed' | 'Passed' | 'Credit' | 'Excellent';
  completedAt: string;
  duration: string;
  questionCount: number;
  improvement: string;
  certificateAvailable: boolean;
};

export type TrendPoint = {
  label: string;
  score: number;
};

export type CompetencyBreakdown = {
  name: string;
  score: number;
  tone: 'accent' | 'warm' | 'success' | 'neutral';
};

export type FormatPerformance = {
  label: string;
  score: number;
  helper: string;
};

export const resultMetrics: ResultMetric[] = [
  {
    title: 'Average score',
    value: '84%',
    helper: 'Across your latest 5 completed assessments',
    icon: 'score',
  },
  {
    title: 'Readiness growth',
    value: '+11 pts',
    helper: 'Since your first recorded assessment',
    icon: 'growth',
  },
  {
    title: 'Certificates ready',
    value: '3',
    helper: 'Available to view and share right now',
    icon: 'certificate',
  },
  {
    title: 'Current signal',
    value: 'Developing',
    helper: 'One strong result away from job-ready',
    icon: 'readiness',
  },
];

export const resultTrend: TrendPoint[] = [
  { label: 'Jan', score: 63 },
  { label: 'Feb', score: 68 },
  { label: 'Mar', score: 74 },
  { label: 'Apr', score: 79 },
  { label: 'May', score: 83 },
  { label: 'Jun', score: 89 },
];

export const resultAttempts: ResultAttempt[] = [
  {
    id: 'tech-result-1',
    title: 'Tech Employability Assessment',
    field: 'Technology',
    score: 89,
    grade: 'A',
    status: 'Excellent',
    completedAt: 'April 6, 2026',
    duration: '41 mins',
    questionCount: 12,
    improvement: '+6 pts from your previous tech result',
    certificateAvailable: true,
  },
  {
    id: 'law-result-1',
    title: 'Law Readiness Assessment',
    field: 'Law',
    score: 81,
    grade: 'B+',
    status: 'Passed',
    completedAt: 'March 14, 2026',
    duration: '34 mins',
    questionCount: 28,
    improvement: 'Steady written reasoning, but case analysis can still sharpen',
    certificateAvailable: true,
  },
  {
    id: 'engineering-result-1',
    title: 'Engineering Readiness Assessment',
    field: 'Engineering',
    score: 72,
    grade: 'B-',
    status: 'Passed',
    completedAt: 'February 22, 2026',
    duration: '48 mins',
    questionCount: 42,
    improvement: 'Analytical foundations are solid, but accuracy dropped under time pressure',
    certificateAvailable: false,
  },
];

export const competencyBreakdown: CompetencyBreakdown[] = [
  { name: 'Problem solving', score: 88, tone: 'success' },
  { name: 'Technical communication', score: 76, tone: 'accent' },
  { name: 'Product thinking', score: 83, tone: 'warm' },
  { name: 'Time management', score: 69, tone: 'neutral' },
];

export const formatPerformance: FormatPerformance[] = [
  {
    label: 'MCQ performance',
    score: 86,
    helper: 'Fast and accurate on structured questions',
  },
  {
    label: 'Theory performance',
    score: 74,
    helper: 'Good clarity, but explanations still need stronger structure',
  },
  {
    label: 'Coding performance',
    score: 81,
    helper: 'Logic is promising and getting more consistent',
  },
];

export const resultHighlights = {
  latestTitle: 'Tech Employability Assessment',
  latestScore: 89,
  latestGrade: 'A',
  latestSummary:
    'Your latest result shows stronger problem solving, calmer decision-making, and better response quality across mixed question formats.',
  strengths: [
    'You are strongest when the task is practical and the expected output is clear.',
    'Your coding logic has become more consistent across JavaScript-focused prompts.',
    'You recover well after difficult questions instead of losing momentum.',
  ],
  focusAreas: [
    'Structure longer theory responses with clearer opening logic.',
    'Improve confidence on questions that require tradeoff explanations.',
    'Continue building speed without losing answer quality.',
  ],
};
