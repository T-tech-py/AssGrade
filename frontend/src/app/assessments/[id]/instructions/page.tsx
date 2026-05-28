import { AssessmentInstructionsPageClient } from '@/components/assessment/assessment-instructions-page-client';

type InstructionsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AssessmentInstructionsPage({ params }: InstructionsPageProps) {
  const { id } = await params;
  return <AssessmentInstructionsPageClient id={id} />;
}
