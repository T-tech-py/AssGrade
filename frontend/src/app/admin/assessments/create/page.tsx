import Link from 'next/link';
import { AdminCreateAssessmentForm } from '@/components/admin/admin-create-assessment-form';
import { AdminLayout } from '@/components/admin/admin-layout';

export default function AdminCreateAssessmentPage() {
  return (
    <AdminLayout
      title="Create Assessment"
      subtitle="Set up a new readiness assessment, define its rules, and add the first questions."
    >
      <div className="mb-4">
        <Link
          href="/admin/assessments"
          className="dashboard-dark-button inline-flex items-center rounded-2xl px-4 py-3 text-sm font-semibold"
        >
          ← Back to Assessments
        </Link>
      </div>
      <AdminCreateAssessmentForm />
    </AdminLayout>
  );
}
