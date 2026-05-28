import { StudentCareerInsightsPageClient } from '@/components/career/student-career-insights-page-client';

export default async function CareerInsightsPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role } = await searchParams;

  return <StudentCareerInsightsPageClient selectedRoleId={role} />;
}
