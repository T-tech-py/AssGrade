import { Suspense } from 'react';
import { PracticeSessionExperience } from '@/components/practice/practice-session-experience';

export default function PracticeSessionPage() {
  return (
    <Suspense fallback={null}>
      <PracticeSessionExperience />
    </Suspense>
  );
}
