export type NavItem = {
  label: string;
  href: string;
  icon: DashboardIconName;
};

export type DashboardIconName =
  | 'dashboard'
  | 'assignment'
  | 'psychology'
  | 'analytics'
  | 'workspace_premium'
  | 'insights'
  | 'settings'
  | 'trending_up'
  | 'track_changes'
  | 'play_circle'
  | 'school';

export type SummaryStat = {
  title: string;
  value: string;
  helper: string;
  trend: string;
  icon: DashboardIconName;
  tone: 'accent' | 'warm' | 'neutral' | 'success';
};

export type PerformancePoint = {
  label: string;
  score: number;
};

export type Assessment = {
  title: string;
  field: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  questions: number;
  description: string;
  href: string;
};

export type CareerInsight = {
  title: string;
  match: number;
  summary: string;
  skills: string[];
  href: string;
};

export type Certificate = {
  title: string;
  score: string;
  grade: string;
  verificationId: string;
  issuedAt: string;
  href: string;
};

export type Activity = {
  title: string;
  description: string;
  timestamp: string;
};

export type QuickAction = {
  label: string;
  description: string;
  href: string;
  icon: DashboardIconName;
};

export const studentProfile = {
  name: 'Tobi Adebayo',
  role: 'Student',
  school: 'Lagos State University',
  course: 'Computer Science',
  readinessScore: 78,
  readinessLabel: 'Developing',
  nextGoal: 'Complete one more assessment to unlock a stronger readiness signal.',
};

export const studentNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
  { label: 'Assessments', href: '/assessments', icon: 'assignment' },
  { label: 'Practice Mode', href: '/practice', icon: 'psychology' },
  { label: 'Results', href: '/results', icon: 'analytics' },
  { label: 'Certificates', href: '/certificates', icon: 'workspace_premium' },
  { label: 'Career Insights', href: '/career-insights', icon: 'insights' },
  { label: 'Settings', href: '/settings', icon: 'settings' },
];

export const summaryStats: SummaryStat[] = [
  {
    title: 'Total Assessments Taken',
    value: '12',
    helper: '2 completed this month',
    trend: '+18%',
    icon: 'assignment',
    tone: 'accent',
  },
  {
    title: 'Average Score',
    value: '84%',
    helper: 'Across recent attempts',
    trend: '+6%',
    icon: 'trending_up',
    tone: 'warm',
  },
  {
    title: 'Certificates Earned',
    value: '3',
    helper: '1 newly issued this week',
    trend: 'Updated',
    icon: 'workspace_premium',
    tone: 'success',
  },
  {
    title: 'Current Readiness Level',
    value: 'Developing',
    helper: 'Closing in on job-ready',
    trend: '78/100',
    icon: 'track_changes',
    tone: 'neutral',
  },
];

export const performanceSeries: PerformancePoint[] = [
  { label: 'Jan', score: 61 },
  { label: 'Feb', score: 68 },
  { label: 'Mar', score: 73 },
  { label: 'Apr', score: 79 },
  { label: 'May', score: 82 },
  { label: 'Jun', score: 84 },
];

export const availableAssessments: Assessment[] = [
  {
    title: 'Tech Employability Assessment',
    field: 'Technology',
    duration: '45 mins',
    difficulty: 'Intermediate',
    questions: 40,
    description: 'Measure your practical problem-solving, web fundamentals, and workplace readiness.',
    href: '/assessments/tech-employability/instructions',
  },
  {
    title: 'Law Readiness Assessment',
    field: 'Law',
    duration: '35 mins',
    difficulty: 'Beginner',
    questions: 28,
    description: 'Test legal reasoning, research accuracy, and case analysis in a graduate context.',
    href: '/assessments/tech-employability/instructions',
  },
  {
    title: 'Engineering Readiness Assessment',
    field: 'Engineering',
    duration: '50 mins',
    difficulty: 'Advanced',
    questions: 42,
    description: 'Evaluate systems thinking, technical judgment, and analytical consistency.',
    href: '/assessments/tech-employability/instructions',
  },
];

export const careerInsights: CareerInsight[] = [
  {
    title: 'Junior Frontend Developer',
    match: 86,
    summary: 'Strong performance in product thinking, web fundamentals, and technical communication.',
    skills: ['React', 'Problem solving', 'UI systems'],
    href: '/career-insights',
  },
  {
    title: 'Legal Research Assistant',
    match: 74,
    summary: 'Your reasoning accuracy and structured writing suggest strong potential for research-heavy roles.',
    skills: ['Research', 'Writing', 'Case analysis'],
    href: '/career-insights',
  },
  {
    title: 'Graduate Engineering Analyst',
    match: 79,
    summary: 'You show promise in analytical thinking and performance consistency under timed assessment.',
    skills: ['Data review', 'Systems thinking', 'Technical accuracy'],
    href: '/career-insights',
  },
];

export const certificates: Certificate[] = [
  {
    title: 'Tech Employability Assessment',
    score: '89%',
    grade: 'A',
    verificationId: 'GA-2026-02145',
    issuedAt: 'April 2, 2026',
    href: '/certificates/ga-2026-02145',
  },
  {
    title: 'Law Readiness Assessment',
    score: '81%',
    grade: 'B+',
    verificationId: 'GA-2026-01872',
    issuedAt: 'March 14, 2026',
    href: '/certificates/ga-2026-01872',
  },
];

export const recentActivity: Activity[] = [
  {
    title: 'Completed Tech Employability Assessment',
    description: 'Scored 89% and improved your readiness score by 4 points.',
    timestamp: '2 hours ago',
  },
  {
    title: 'Started AI practice session',
    description: 'Generated 12 tailored frontend interview questions.',
    timestamp: 'Yesterday',
  },
  {
    title: 'Downloaded certificate',
    description: 'Saved your Tech Employability certificate for sharing.',
    timestamp: '2 days ago',
  },
  {
    title: 'Career recommendations refreshed',
    description: 'New match scores were generated from your latest results.',
    timestamp: 'This week',
  },
];

export const quickActions: QuickAction[] = [
  {
    label: 'Start Assessment',
    description: 'Jump into the next available readiness test.',
    href: '/assessments',
    icon: 'play_circle',
  },
  {
    label: 'Continue Practice',
    description: 'Resume your AI-guided revision plan.',
    href: '/practice',
    icon: 'psychology',
  },
  {
    label: 'View Certificates',
    description: 'Open your recent verified achievements.',
    href: '/certificates',
    icon: 'workspace_premium',
  },
  {
    label: 'Update Profile',
    description: 'Keep your student details and goals current.',
    href: '/settings',
    icon: 'settings',
  },
];

export const dashboardMeta = {
  searchPlaceholder: 'Search assessments, certificates, or practice topics',
  notifications: 3,
};
