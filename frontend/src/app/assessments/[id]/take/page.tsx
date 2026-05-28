import { AssessmentTakePageClient } from '@/components/assessment/assessment-take-page-client';

type TakePageProps = {
  params: Promise<{ id: string }>;
};

export default async function AssessmentTakePage({ params }: TakePageProps) {
  const { id } = await params;
  return <AssessmentTakePageClient id={id} />;
}
