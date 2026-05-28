import { Suspense } from 'react';
import { PracticeReviewContent } from '@/components/practice/practice-review-content';

export default function PracticeReviewPage() {
  return (
    <Suspense fallback={null}>
      <PracticeReviewContent />
    </Suspense>
  );
}
