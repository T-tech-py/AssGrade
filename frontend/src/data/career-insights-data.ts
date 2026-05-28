export type CareerInsightStat = {
  title: string;
  value: string;
  helper: string;
};

export type CareerRoleMatch = {
  id: string;
  title: string;
  match: number;
  summary: string;
  skills: string[];
  fitType: 'Strong fit' | 'Emerging fit' | 'Stretch fit';
  focusAreas: string[];
  environments: string[];
  href: string;
};

export type CareerSignal = {
  label: string;
  score: number;
  helper: string;
};

export type CareerNextStep = {
  title: string;
  description: string;
  href: string;
  tone: 'primary' | 'secondary';
};

export type CareerInsightHero = {
  title: string;
  subtitle: string;
  readinessLevel: string;
  readinessScore: number;
  summary: string;
};

export const careerInsightHero: CareerInsightHero = {
  title: 'Career Insights',
  subtitle:
    'See where your assessment performance points, understand the roles you are trending toward, and get practical next steps for becoming more job-ready.',
  readinessLevel: 'Developing',
  readinessScore: 78,
  summary:
    'Your current results suggest the strongest momentum in frontend-oriented graduate roles, with communication structure and speed under pressure as the biggest opportunities for improvement.',
};

export const careerInsightStats: CareerInsightStat[] = [
  {
    title: 'Top role match',
    value: '86%',
    helper: 'Junior Frontend Developer is your strongest current fit.',
  },
  {
    title: 'Career direction',
    value: 'Product + Tech',
    helper: 'Your best signals combine applied thinking with technical clarity.',
  },
  {
    title: 'Highest signal',
    value: 'Problem solving',
    helper: 'You perform best when questions are practical and clearly scoped.',
  },
  {
    title: 'Growth focus',
    value: 'Communication',
    helper: 'Sharper written reasoning will improve both readiness and role fit.',
  },
];

export const careerRoleMatches: CareerRoleMatch[] = [
  {
    id: 'frontend-dev',
    title: 'Junior Frontend Developer',
    match: 86,
    summary:
      'Strong alignment with UI thinking, web fundamentals, and practical implementation patterns shown in your recent assessment results.',
    skills: ['React', 'Problem solving', 'UI systems'],
    fitType: 'Strong fit',
    focusAreas: ['State management', 'Component architecture', 'Applied frontend problem solving'],
    environments: ['Product teams', 'Startups', 'Internal tools platforms'],
    href: '/career-insights?role=frontend-dev#role-spotlight',
  },
  {
    id: 'product-analyst',
    title: 'Graduate Product Analyst',
    match: 81,
    summary:
      'Your reasoning and product judgment suggest good potential for roles that combine analysis, user understanding, and structured decision-making.',
    skills: ['Product thinking', 'Analysis', 'Communication'],
    fitType: 'Emerging fit',
    focusAreas: ['Structured insight writing', 'Decision framing', 'User problem analysis'],
    environments: ['Product teams', 'Research-driven startups', 'Digital services'],
    href: '/career-insights?role=product-analyst#role-spotlight',
  },
  {
    id: 'legal-research',
    title: 'Legal Research Assistant',
    match: 74,
    summary:
      'You show promise in structured writing and reasoning, but would need stronger research depth and case analysis confidence for this path.',
    skills: ['Research', 'Writing', 'Case analysis'],
    fitType: 'Stretch fit',
    focusAreas: ['Case analysis depth', 'Research synthesis', 'Legal writing confidence'],
    environments: ['Law firms', 'Policy teams', 'Compliance and advisory units'],
    href: '/career-insights?role=legal-research#role-spotlight',
  },
  {
    id: 'engineering-analyst',
    title: 'Graduate Engineering Analyst',
    match: 79,
    summary:
      'Your analytical base is solid, though improving consistency under time pressure would make this path more realistic.',
    skills: ['Systems thinking', 'Technical judgment', 'Analytical consistency'],
    fitType: 'Emerging fit',
    focusAreas: ['Timed analytical work', 'Technical reporting', 'Systems accuracy'],
    environments: ['Operations teams', 'Engineering support units', 'Technical analysis roles'],
    href: '/career-insights?role=engineering-analyst#role-spotlight',
  },
];

export const careerSignals: CareerSignal[] = [
  {
    label: 'Practical problem solving',
    score: 88,
    helper: 'Your strongest signal across assessment and guided practice performance.',
  },
  {
    label: 'Technical communication',
    score: 76,
    helper: 'Clear enough to support job readiness, but still needs more structure.',
  },
  {
    label: 'Speed under pressure',
    score: 69,
    helper: 'This is the biggest barrier between developing and job-ready right now.',
  },
  {
    label: 'Applied product judgment',
    score: 83,
    helper: 'A strong signal for product-facing and execution-focused roles.',
  },
];

export const careerStrengths = [
  'You work best when the task mirrors a real workplace scenario instead of abstract theory.',
  'Your strongest results come from roles that reward practical implementation and clear judgment.',
  'Your readiness profile suggests you can grow quickly when feedback is specific and action-oriented.',
];

export const careerGaps = [
  'Improve long-form explanation structure so your strongest ideas are communicated more clearly.',
  'Build more confidence answering under timed conditions without losing accuracy.',
  'Strengthen one deeper specialization lane so employers can place you faster.',
];

export const careerNextSteps: CareerNextStep[] = [
  {
    title: 'Start focused practice',
    description: 'Use AI-guided practice to sharpen the skill gaps affecting your strongest role match.',
    href: '/practice',
    tone: 'primary',
  },
  {
    title: 'Take another assessment',
    description: 'Retest after targeted preparation to improve both readiness level and role fit confidence.',
    href: '/assessments',
    tone: 'secondary',
  },
  {
    title: 'Review latest results',
    description: 'Open your most recent result breakdown to see which signals are pulling your fit upward or downward.',
    href: '/results',
    tone: 'secondary',
  },
];
