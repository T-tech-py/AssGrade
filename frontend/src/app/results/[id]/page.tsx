import { StudentResultDetailClient } from '@/components/results/student-result-detail-client';

export default async function ResultDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <StudentResultDetailClient id={id} />;
}
