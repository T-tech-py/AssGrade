export type AdminIconName =
  | 'overview'
  | 'users'
  | 'assessments'
  | 'questions'
  | 'attempts'
  | 'certificates'
  | 'security'
  | 'ai'
  | 'settings'
  | 'trend'
  | 'score'
  | 'alert'
  | 'bolt'
  | 'search'
  | 'notification'
  | 'calendar'
  | 'time'
  | 'more'
  | 'duplicate'
  | 'archive'
  | 'edit'
  | 'review'
  | 'verified'
  | 'shield'
  | 'support';

export type AdminNavItem = {
  label: string;
  href: string;
  icon: AdminIconName;
};

export type AdminMetric = {
  title: string;
  value: string;
  helper: string;
  trend: string;
  tone: 'accent' | 'warm' | 'success' | 'danger' | 'neutral';
  icon: AdminIconName;
};

export type AdminActivity = {
  title: string;
  description: string;
  timestamp: string;
};

export type AdminQuickAction = {
  title: string;
  description: string;
  href: string;
  icon: AdminIconName;
};

export type AttemptsPoint = {
  label: string;
  attempts: number;
  passRate: number;
};

export type PassFailPoint = {
  label: string;
  passed: number;
  failed: number;
};

export type CategoryStat = {
  label: string;
  value: number;
  helper: string;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  field: string;
  graduationYear: string;
  role: 'Student' | 'Admin';
  status: 'Active' | 'Suspended' | 'Pending' | 'Rejected';
  assessmentsTaken: number;
  lastActive: string;
  joinedAt: string;
  school: string;
  phone: string;
  location: string;
  bio: string;
};

export type AdminAssessment = {
  id: string;
  title: string;
  field: string;
  questionCount: number;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  status: 'Draft' | 'Active' | 'Archived';
  attemptsCount: number;
  formats: string[];
  createdAt: string;
  updatedAt: string;
  passRate: string;
  averageScore: string;
  description: string;
};

export type AdminQuestion = {
  id: string;
  snippet: string;
  type: 'MCQ' | 'Theory' | 'Coding';
  field: string;
  topic: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  source: 'Manual' | 'AI-generated';
  lastUpdated: string;
};

export type AdminAttempt = {
  id: string;
  student: string;
  assessment: string;
  score: string;
  grade: string;
  status: 'Submitted' | 'Reviewed' | 'Flagged';
  submittedAt: string;
  security: 'Clean' | 'Flagged' | 'High Risk';
  field: string;
};

export type AdminAttemptDetail = AdminAttempt & {
  studentEmail: string;
  studentSchool: string;
  duration: string;
  startedAt: string;
  device: string;
  ipAddress: string;
  warningCount: number;
  readinessNote: string;
  summary: {
    mcqCorrect: string;
    theoryQuality: string;
    codingQuality: string;
  };
  answers: Array<{
    id: string;
    number: number;
    type: 'MCQ' | 'Theory' | 'Coding';
    prompt: string;
    answer: string;
    status: 'Strong' | 'Needs Review' | 'Flagged';
    awardedMarks: string;
    note: string;
  }>;
  securityTimeline: Array<{
    time: string;
    title: string;
    note: string;
    severity: 'Low' | 'Medium' | 'High';
  }>;
};

export type AdminCertificate = {
  id: string;
  student: string;
  assessment: string;
  score: string;
  grade: string;
  verificationId: string;
  issuedAt: string;
  status: 'Issued' | 'Reissued' | 'Pending Verification';
};

export type SecurityIncident = {
  id: string;
  student: string;
  assessment: string;
  violation: string;
  warningCount: number;
  risk: 'Low' | 'Medium' | 'High';
  detectedAt: string;
  status: 'Open' | 'Reviewed' | 'Escalated' | 'Cleared';
  device: string;
  ipAddress: string;
  timeline: Array<{ time: string; title: string; note: string }>;
};

export type GeneratedQuestion = {
  id: string;
  title: string;
  type: 'MCQ' | 'Theory' | 'Coding';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  topic: string;
  preview: string;
  includesAnswerKey: boolean;
  includesExplanation: boolean;
};

export const adminProfile = {
  name: 'Ifeoma Daniel',
  role: 'Platform Admin',
  team: 'Assessment Operations',
};

export const adminNavItems: AdminNavItem[] = [
  { label: 'Overview', href: '/admin', icon: 'overview' },
  { label: 'Users', href: '/admin/users', icon: 'users' },
  { label: 'Assessments', href: '/admin/assessments', icon: 'assessments' },
  { label: 'Attempts', href: '/admin/attempts', icon: 'attempts' },
  { label: 'Certificates', href: '/admin/certificates', icon: 'certificates' },
  { label: 'Security Alerts', href: '/admin/security', icon: 'security' },
  { label: 'Settings', href: '/admin/settings', icon: 'settings' },
];

export const adminOverviewMetrics: AdminMetric[] = [
  {
    title: 'Total Students',
    value: '8,426',
    helper: '312 added this month',
    trend: '+9.4%',
    tone: 'accent',
    icon: 'users',
  },
  {
    title: 'Active Assessments',
    value: '28',
    helper: '6 scheduled this week',
    trend: '+4',
    tone: 'neutral',
    icon: 'assessments',
  },
  {
    title: 'Total Attempts',
    value: '14,208',
    helper: 'Across all published assessments',
    trend: '+12.8%',
    tone: 'warm',
    icon: 'attempts',
  },
  {
    title: 'Certificates Issued',
    value: '3,184',
    helper: '47 reissued this quarter',
    trend: 'Healthy',
    tone: 'success',
    icon: 'certificates',
  },
  {
    title: 'Flagged Security Events',
    value: '126',
    helper: '18 require manual review',
    trend: '-7%',
    tone: 'danger',
    icon: 'security',
  },
  {
    title: 'Average Platform Score',
    value: '81%',
    helper: 'Across reviewed attempts',
    trend: '+3.1%',
    tone: 'neutral',
    icon: 'score',
  },
];

export const adminQuickActions: AdminQuickAction[] = [
  {
    title: 'Create New Assessment',
    description: 'Launch a new graduate-readiness exam with formats, rules, and timing.',
    href: '/admin/assessments/create',
    icon: 'bolt',
  },
  {
    title: 'Review Flagged Attempts',
    description: 'Investigate cheating signals, warnings, and security escalations.',
    href: '/admin/security',
    icon: 'security',
  },
  {
    title: 'Review Certificates',
    description: 'Verify, reissue, and track certificate records in one workspace.',
    href: '/admin/certificates',
    icon: 'certificates',
  },
];

export const adminActivity: AdminActivity[] = [
  {
    title: 'New engineering assessment published',
    description: 'Graduate Engineering Analyst Readiness was published with 42 questions.',
    timestamp: '12 mins ago',
  },
  {
    title: 'Security alert escalated',
    description: 'A high-risk tab-switching incident was escalated for manual review.',
    timestamp: '38 mins ago',
  },
  {
    title: 'Question bank updated',
    description: 'New manually curated assessment questions were added to the draft bank.',
    timestamp: '1 hour ago',
  },
  {
    title: 'Certificate reissued',
    description: 'A corrected certificate record was reissued for Tech Employability Assessment.',
    timestamp: 'Today',
  },
];

export const attemptsTrend: AttemptsPoint[] = [
  { label: 'Mon', attempts: 420, passRate: 78 },
  { label: 'Tue', attempts: 510, passRate: 81 },
  { label: 'Wed', attempts: 610, passRate: 83 },
  { label: 'Thu', attempts: 580, passRate: 79 },
  { label: 'Fri', attempts: 640, passRate: 84 },
  { label: 'Sat', attempts: 450, passRate: 77 },
  { label: 'Sun', attempts: 390, passRate: 76 },
];

export const passFailDistribution: PassFailPoint[] = [
  { label: 'Tech', passed: 68, failed: 32 },
  { label: 'Law', passed: 74, failed: 26 },
  { label: 'Engineering', passed: 61, failed: 39 },
];

export const topAssessmentCategories: CategoryStat[] = [
  { label: 'Technology', value: 42, helper: 'Most attempts this month' },
  { label: 'Law', value: 27, helper: 'Strongest pass consistency' },
  { label: 'Engineering', value: 19, helper: 'Highest review volume' },
];

export const adminUsers: AdminUser[] = [
  {
    id: 'user-1',
    name: 'Adaeze Okafor',
    email: 'adaeze.okafor@example.com',
    field: 'Computer Science',
    graduationYear: '2026',
    role: 'Student',
    status: 'Active',
    assessmentsTaken: 12,
    lastActive: '2 hours ago',
    joinedAt: 'Jan 12, 2026',
    school: 'University of Lagos',
    phone: '+234 803 102 4451',
    location: 'Lagos',
    bio: 'Focused on frontend engineering, product thinking, and employability readiness for internship-to-full-time pathways.',
  },
  {
    id: 'user-2',
    name: 'Tunde Balogun',
    email: 'tunde.balogun@example.com',
    field: 'Mechanical Engineering',
    graduationYear: '2025',
    role: 'Student',
    status: 'Suspended',
    assessmentsTaken: 8,
    lastActive: 'Yesterday',
    joinedAt: 'Feb 03, 2026',
    school: 'University of Ibadan',
    phone: '+234 802 771 1149',
    location: 'Ibadan',
    bio: 'Mechanical engineering student with strong interest in technical operations and graduate analyst roles.',
  },
  {
    id: 'user-3',
    name: 'Mariam Yusuf',
    email: 'mariam.yusuf@example.com',
    field: 'Law',
    graduationYear: '2026',
    role: 'Student',
    status: 'Active',
    assessmentsTaken: 10,
    lastActive: '18 mins ago',
    joinedAt: 'Mar 08, 2026',
    school: 'Ahmadu Bello University',
    phone: '+234 809 440 2298',
    location: 'Zaria',
    bio: 'Law student preparing for legal research, policy analysis, and structured case reasoning opportunities.',
  },
  {
    id: 'user-4',
    name: 'Chidera Obi',
    email: 'chidera.obi@example.com',
    field: 'Electrical Engineering',
    graduationYear: '2027',
    role: 'Student',
    status: 'Suspended',
    assessmentsTaken: 4,
    lastActive: '6 days ago',
    joinedAt: 'Jan 24, 2026',
    school: 'Federal University of Technology Owerri',
    phone: '+234 816 994 2380',
    location: 'Owerri',
    bio: 'Electrical engineering student working on stronger assessment consistency and technical problem-solving under time pressure.',
  },
];

export function getAdminUserById(id: string) {
  return adminUsers.find((user) => user.id === id) ?? null;
}

export const adminAssessments: AdminAssessment[] = [
  {
    id: 'tech-employability',
    title: 'Tech Employability Assessment',
    field: 'Technology',
    questionCount: 40,
    duration: '45 mins',
    difficulty: 'Intermediate',
    status: 'Active',
    attemptsCount: 1432,
    formats: ['MCQ', 'Theory', 'Coding'],
    createdAt: 'Jan 18, 2026',
    updatedAt: 'Apr 02, 2026',
    passRate: '82%',
    averageScore: '84%',
    description: 'Measures applied frontend, problem-solving, and workplace readiness.',
  },
  {
    id: 'law-readiness',
    title: 'Law Readiness Assessment',
    field: 'Law',
    questionCount: 28,
    duration: '35 mins',
    difficulty: 'Beginner',
    status: 'Active',
    attemptsCount: 884,
    formats: ['MCQ', 'Theory'],
    createdAt: 'Feb 11, 2026',
    updatedAt: 'Mar 21, 2026',
    passRate: '79%',
    averageScore: '81%',
    description: 'Assesses legal reasoning, argument structure, and case interpretation.',
  },
  {
    id: 'engineering-readiness',
    title: 'Engineering Readiness Assessment',
    field: 'Engineering',
    questionCount: 42,
    duration: '50 mins',
    difficulty: 'Advanced',
    status: 'Draft',
    attemptsCount: 0,
    formats: ['MCQ', 'Theory'],
    createdAt: 'Apr 03, 2026',
    updatedAt: 'Apr 06, 2026',
    passRate: 'N/A',
    averageScore: 'N/A',
    description: 'Evaluates analytical foundations, system reasoning, and technical judgment.',
  },
];

export const assessmentQuestions: AdminQuestion[] = [
  {
    id: 'q-1',
    snippet: 'Which React state update pattern best prevents stale UI during repeated form edits?',
    type: 'MCQ',
    field: 'Technology',
    topic: 'React Fundamentals',
    difficulty: 'Intermediate',
    source: 'Manual',
    lastUpdated: 'Apr 04, 2026',
  },
  {
    id: 'q-2',
    snippet: 'Explain the difference between consideration and intention in contract formation.',
    type: 'Theory',
    field: 'Law',
    topic: 'Contract Law',
    difficulty: 'Beginner',
    source: 'Manual',
    lastUpdated: 'Mar 25, 2026',
  },
  {
    id: 'q-3',
    snippet: 'Write a function that returns the first non-repeating character in a string.',
    type: 'Coding',
    field: 'Technology',
    topic: 'Algorithms',
    difficulty: 'Advanced',
    source: 'AI-generated',
    lastUpdated: 'Apr 06, 2026',
  },
];

export const adminAttempts: AdminAttempt[] = [
  {
    id: 'attempt-1',
    student: 'Adaeze Okafor',
    assessment: 'Tech Employability Assessment',
    score: '89%',
    grade: 'A',
    status: 'Reviewed',
    submittedAt: 'Apr 06, 2026 • 11:14 AM',
    security: 'Clean',
    field: 'Technology',
  },
  {
    id: 'attempt-2',
    student: 'Tunde Balogun',
    assessment: 'Engineering Readiness Assessment',
    score: '72%',
    grade: 'B-',
    status: 'Flagged',
    submittedAt: 'Apr 05, 2026 • 4:48 PM',
    security: 'High Risk',
    field: 'Engineering',
  },
  {
    id: 'attempt-3',
    student: 'Mariam Yusuf',
    assessment: 'Law Readiness Assessment',
    score: '81%',
    grade: 'B+',
    status: 'Submitted',
    submittedAt: 'Apr 05, 2026 • 1:20 PM',
    security: 'Flagged',
    field: 'Law',
  },
];

export const adminAttemptDetails: AdminAttemptDetail[] = [
  {
    id: 'attempt-1',
    student: 'Adaeze Okafor',
    studentEmail: 'adaeze.okafor@example.com',
    studentSchool: 'University of Lagos',
    assessment: 'Tech Employability Assessment',
    score: '89%',
    grade: 'A',
    status: 'Reviewed',
    submittedAt: 'Apr 06, 2026 • 11:14 AM',
    startedAt: 'Apr 06, 2026 • 10:28 AM',
    duration: '46 mins',
    security: 'Clean',
    field: 'Technology',
    device: 'Chrome on macOS',
    ipAddress: '102.89.44.18',
    warningCount: 0,
    readinessNote: 'Strong frontend readiness with clear problem-solving confidence and no integrity concerns.',
    summary: {
      mcqCorrect: '18/20',
      theoryQuality: 'Strong',
      codingQuality: 'Strong',
    },
    answers: [
      {
        id: 'attempt-1-q1',
        number: 1,
        type: 'MCQ',
        prompt: 'Which React state update pattern best prevents stale UI during repeated form edits?',
        answer: 'Use component state and update it from the input event.',
        status: 'Strong',
        awardedMarks: '5/5',
        note: 'Response aligned with the expected controlled-input pattern.',
      },
      {
        id: 'attempt-1-q2',
        number: 2,
        type: 'Theory',
        prompt: 'Explain how component boundaries improve maintainability in a frontend codebase.',
        answer:
          'Component boundaries isolate responsibilities, reduce repetition, and make testing easier by keeping each unit focused.',
        status: 'Strong',
        awardedMarks: '8/10',
        note: 'Good conceptual clarity with room for stronger real-world examples.',
      },
      {
        id: 'attempt-1-q3',
        number: 3,
        type: 'Coding',
        prompt: 'Write a function that returns the first non-repeating character in a string.',
        answer:
          'Used a frequency map followed by a second pass to return the first unique character efficiently.',
        status: 'Strong',
        awardedMarks: '12/15',
        note: 'Logic was correct and readable, but the solution could be further optimized in explanation.',
      },
    ],
    securityTimeline: [
      {
        time: '10:28 AM',
        title: 'Secure session started',
        note: 'Webcam, fullscreen, and session controls initialized normally.',
        severity: 'Low',
      },
      {
        time: '10:52 AM',
        title: 'Webcam heartbeat confirmed',
        note: 'No interruptions or suspicious events were detected.',
        severity: 'Low',
      },
      {
        time: '11:14 AM',
        title: 'Attempt submitted',
        note: 'Attempt completed without warnings.',
        severity: 'Low',
      },
    ],
  },
  {
    id: 'attempt-2',
    student: 'Tunde Balogun',
    studentEmail: 'tunde.balogun@example.com',
    studentSchool: 'University of Ibadan',
    assessment: 'Engineering Readiness Assessment',
    score: '72%',
    grade: 'B-',
    status: 'Flagged',
    submittedAt: 'Apr 05, 2026 • 4:48 PM',
    startedAt: 'Apr 05, 2026 • 4:01 PM',
    duration: '47 mins',
    security: 'High Risk',
    field: 'Engineering',
    device: 'Chrome on macOS',
    ipAddress: '102.89.44.18',
    warningCount: 4,
    readinessNote: 'Analytical foundations are present, but the attempt requires integrity review before relying on the result.',
    summary: {
      mcqCorrect: '14/22',
      theoryQuality: 'Needs Review',
      codingQuality: 'N/A',
    },
    answers: [
      {
        id: 'attempt-2-q1',
        number: 1,
        type: 'MCQ',
        prompt: 'Which mechanical principle best explains this load distribution case?',
        answer: 'Selected shear-stress explanation instead of the correct bending-moment answer.',
        status: 'Needs Review',
        awardedMarks: '2/5',
        note: 'Conceptual direction was close, but the applied principle was off.',
      },
      {
        id: 'attempt-2-q2',
        number: 2,
        type: 'Theory',
        prompt: 'Describe the engineering trade-offs you would consider in this system design.',
        answer:
          'Focused on cost and material strength, but did not adequately justify operational constraints or safety implications.',
        status: 'Needs Review',
        awardedMarks: '6/10',
        note: 'Decent structure, but the reasoning lacked depth under time pressure.',
      },
      {
        id: 'attempt-2-q3',
        number: 3,
        type: 'MCQ',
        prompt: 'Which formula should be used to solve the given system?',
        answer: 'Selected an incorrect equilibrium formula.',
        status: 'Flagged',
        awardedMarks: '0/5',
        note: 'This answer was given shortly after a tab-switch sequence and should be reviewed carefully.',
      },
    ],
    securityTimeline: [
      {
        time: '4:01 PM',
        title: 'Secure session started',
        note: 'Assessment launched successfully.',
        severity: 'Low',
      },
      {
        time: '4:18 PM',
        title: 'Tab switch detected',
        note: 'Student exited fullscreen and returned after a brief interval.',
        severity: 'Medium',
      },
      {
        time: '4:22 PM',
        title: 'Repeated tab switch',
        note: 'Warning count increased to 3 after multiple context changes.',
        severity: 'High',
      },
      {
        time: '4:31 PM',
        title: 'Session escalated',
        note: 'Attempt marked high risk for admin review.',
        severity: 'High',
      },
    ],
  },
  {
    id: 'attempt-3',
    student: 'Mariam Yusuf',
    studentEmail: 'mariam.yusuf@example.com',
    studentSchool: 'Ahmadu Bello University',
    assessment: 'Law Readiness Assessment',
    score: '81%',
    grade: 'B+',
    status: 'Submitted',
    submittedAt: 'Apr 05, 2026 • 1:20 PM',
    startedAt: 'Apr 05, 2026 • 12:34 PM',
    duration: '41 mins',
    security: 'Flagged',
    field: 'Law',
    device: 'Edge on Windows',
    ipAddress: '41.90.12.32',
    warningCount: 2,
    readinessNote: 'Strong written reasoning with a medium-risk webcam interruption that still needs review.',
    summary: {
      mcqCorrect: '15/18',
      theoryQuality: 'Strong',
      codingQuality: 'N/A',
    },
    answers: [
      {
        id: 'attempt-3-q1',
        number: 1,
        type: 'MCQ',
        prompt: 'Which principle best applies to the constitutional scenario presented?',
        answer: 'Correctly selected the proportionality principle.',
        status: 'Strong',
        awardedMarks: '5/5',
        note: 'Accurate and confidently answered.',
      },
      {
        id: 'attempt-3-q2',
        number: 2,
        type: 'Theory',
        prompt: 'Analyze the strengths and weaknesses of the claimant’s argument.',
        answer:
          'Presented a structured two-sided analysis with clear legal reasoning, but the conclusion could be more decisive.',
        status: 'Strong',
        awardedMarks: '9/10',
        note: 'High-quality legal reasoning with minor polish needed.',
      },
      {
        id: 'attempt-3-q3',
        number: 3,
        type: 'Theory',
        prompt: 'Explain the distinction between consideration and intention in contract formation.',
        answer:
          'Differentiated both doctrines correctly and used a concise contract example to support the explanation.',
        status: 'Strong',
        awardedMarks: '8/10',
        note: 'Well structured and accurate.',
      },
    ],
    securityTimeline: [
      {
        time: '12:34 PM',
        title: 'Secure session started',
        note: 'Assessment launched with webcam active.',
        severity: 'Low',
      },
      {
        time: '12:36 PM',
        title: 'Webcam interruption',
        note: 'Feed dropped briefly before reconnecting.',
        severity: 'Medium',
      },
      {
        time: '12:44 PM',
        title: 'Feed restored',
        note: 'Attempt continued after the webcam feed returned.',
        severity: 'Medium',
      },
      {
        time: '1:20 PM',
        title: 'Attempt submitted',
        note: 'Submission completed and queued for review.',
        severity: 'Low',
      },
    ],
  },
];

export function getAdminAttemptDetailById(id: string) {
  return adminAttemptDetails.find((attempt) => attempt.id === id) ?? null;
}

export const adminCertificates: AdminCertificate[] = [
  {
    id: 'cert-1',
    student: 'Adaeze Okafor',
    assessment: 'Tech Employability Assessment',
    score: '89%',
    grade: 'A',
    verificationId: 'GA-2026-02145',
    issuedAt: 'Apr 02, 2026',
    status: 'Issued',
  },
  {
    id: 'cert-2',
    student: 'Mariam Yusuf',
    assessment: 'Law Readiness Assessment',
    score: '81%',
    grade: 'B+',
    verificationId: 'GA-2026-01872',
    issuedAt: 'Mar 14, 2026',
    status: 'Reissued',
  },
  {
    id: 'cert-3',
    student: 'Tunde Balogun',
    assessment: 'Engineering Readiness Assessment',
    score: '72%',
    grade: 'B-',
    verificationId: 'GA-2026-02410',
    issuedAt: 'Apr 05, 2026',
    status: 'Pending Verification',
  },
];

export const securityIncidents: SecurityIncident[] = [
  {
    id: 'incident-1',
    student: 'Tunde Balogun',
    assessment: 'Engineering Readiness Assessment',
    violation: 'Tab switching',
    warningCount: 4,
    risk: 'High',
    detectedAt: 'Apr 05, 2026 • 4:31 PM',
    status: 'Escalated',
    device: 'Chrome on macOS',
    ipAddress: '102.89.44.18',
    timeline: [
      { time: '4:11 PM', title: 'Session started', note: 'Secure session was initialized.' },
      { time: '4:18 PM', title: 'Tab switch detected', note: 'Student left fullscreen and returned.' },
      { time: '4:22 PM', title: 'Repeated tab switch', note: 'Warning count increased to 3.' },
      { time: '4:31 PM', title: 'Escalation threshold reached', note: 'Session marked high risk for admin review.' },
    ],
  },
  {
    id: 'incident-2',
    student: 'Mariam Yusuf',
    assessment: 'Law Readiness Assessment',
    violation: 'Webcam offline',
    warningCount: 2,
    risk: 'Medium',
    detectedAt: 'Apr 05, 2026 • 12:44 PM',
    status: 'Reviewed',
    device: 'Edge on Windows',
    ipAddress: '41.90.12.32',
    timeline: [
      { time: '12:10 PM', title: 'Session started', note: 'Webcam active at launch.' },
      { time: '12:36 PM', title: 'Webcam disconnect', note: 'Video feed dropped for 18 seconds.' },
      { time: '12:44 PM', title: 'Feed restored', note: 'Session continued after reconnect.' },
    ],
  },
  {
    id: 'incident-3',
    student: 'Chidera Obi',
    assessment: 'Tech Employability Assessment',
    violation: 'Multiple faces detected',
    warningCount: 1,
    risk: 'Low',
    detectedAt: 'Apr 02, 2026 • 9:18 AM',
    status: 'Open',
    device: 'Chrome on Windows',
    ipAddress: '102.91.18.67',
    timeline: [
      { time: '9:02 AM', title: 'Session started', note: 'Secure assessment launched normally.' },
      { time: '9:18 AM', title: 'Additional face detected', note: 'Snapshot flagged for quick review.' },
    ],
  },
];

export const generatedQuestions: GeneratedQuestion[] = [
  {
    id: 'gen-1',
    title: 'React component state transitions',
    type: 'MCQ',
    difficulty: 'Intermediate',
    topic: 'React Fundamentals',
    preview: 'A student edits a form repeatedly. Which state pattern best prevents stale render output?',
    includesAnswerKey: true,
    includesExplanation: true,
  },
  {
    id: 'gen-2',
    title: 'Array transformation challenge',
    type: 'Coding',
    difficulty: 'Advanced',
    topic: 'Algorithms',
    preview: 'Write a function that groups repeated values and returns the highest frequency sequence.',
    includesAnswerKey: true,
    includesExplanation: false,
  },
];

export const adminSettingsMock = {
  profile: {
    fullName: 'Ifeoma Daniel',
    email: 'ifeoma.daniel@gradassess.ai',
    title: 'Platform Admin',
    team: 'Assessment Operations',
  },
  notifications: {
    incidentEscalations: true,
    newCertificateAlerts: true,
    aiGenerationUpdates: false,
  },
  security: {
    sessionTimeout: '30 minutes',
    deviceReview: 'Manual review for high-risk sessions',
  },
  platform: {
    defaultAssessmentVisibility: 'Institution only',
    aiGenerationMode: 'Require admin review',
  },
  support: {
    contact: 'ops@gradassess.ai',
    line: '+234 800 000 0000',
  },
};
