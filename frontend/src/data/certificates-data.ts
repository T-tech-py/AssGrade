export type CertificateStatus = 'Issued' | 'Pending' | 'Locked';

export type StudentCertificate = {
  id: string;
  title: string;
  field: string;
  score: string;
  grade: string;
  verificationId: string;
  issuedAt: string;
  status: CertificateStatus;
  recipientName: string;
  readinessLevel: string;
  summary: string;
  eligibilityNote: string;
  skillSignals: string[];
  organization: string;
  assessmentDate: string;
  expires: string;
  href: string;
  verificationHash?: string;
  school?: string;
  marks?: string;
};

export const studentCertificates: StudentCertificate[] = [
  {
    id: 'ga-2026-02145',
    title: 'Tech Employability Assessment',
    field: 'Technology',
    score: '89%',
    grade: 'A',
    verificationId: 'GA-2026-02145',
    issuedAt: 'April 2, 2026',
    status: 'Issued',
    recipientName: 'Tobi Adebayo',
    readinessLevel: 'Job-Ready',
    summary:
      'Awarded for strong performance in practical problem solving, technical communication, and graduate workplace readiness.',
    eligibilityNote: 'Eligible for sharing with employers and training partners.',
    skillSignals: ['Problem solving', 'React foundations', 'Technical communication'],
    organization: 'GradAssess AI',
    assessmentDate: 'March 30, 2026',
    expires: 'Does not expire',
    href: '/certificates/ga-2026-02145',
  },
  {
    id: 'ga-2026-01872',
    title: 'Law Readiness Assessment',
    field: 'Law',
    score: '81%',
    grade: 'B+',
    verificationId: 'GA-2026-01872',
    issuedAt: 'March 14, 2026',
    status: 'Issued',
    recipientName: 'Tobi Adebayo',
    readinessLevel: 'Developing',
    summary:
      'Awarded for consistent legal reasoning and a passing level of structured case analysis in graduate-level assessment conditions.',
    eligibilityNote: 'Issued and available for verification.',
    skillSignals: ['Legal reasoning', 'Research structure', 'Written clarity'],
    organization: 'GradAssess AI',
    assessmentDate: 'March 10, 2026',
    expires: 'Does not expire',
    href: '/certificates/ga-2026-01872',
  },
  {
    id: 'engineering-locked',
    title: 'Engineering Readiness Assessment',
    field: 'Engineering',
    score: '72%',
    grade: 'B-',
    verificationId: 'Pending',
    issuedAt: 'Not issued',
    status: 'Locked',
    recipientName: 'Tobi Adebayo',
    readinessLevel: 'Developing',
    summary:
      'This certificate is not yet unlocked because the latest assessment score did not meet the certificate threshold.',
    eligibilityNote: 'Reach a passing certificate threshold to unlock this credential.',
    skillSignals: ['Systems thinking', 'Technical judgment', 'Analytical consistency'],
    organization: 'GradAssess AI',
    assessmentDate: 'February 22, 2026',
    expires: 'Not applicable',
    href: '/certificates/engineering-locked',
  },
];

export const certificateOverview = {
  totalIssued: '2',
  shareableNow: '2',
  pendingUnlocks: '1',
  latestIssued: 'April 2, 2026',
};

export function getCertificateById(id: string) {
  return studentCertificates.find((certificate) => certificate.id === id);
}
