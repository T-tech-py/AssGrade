'use client';

import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { AdminCreateAssessmentForm } from '@/components/admin/admin-create-assessment-form';
import { AdminLayout } from '@/components/admin/admin-layout';
import type { AdminAssessmentDetailResponse } from '@/lib/admin-api';
import { getAdminAssessmentDetailRequest } from '@/lib/admin-api';

type EditAssessmentPageProps = {
  params: Promise<{ id: string }>;
};

export default function EditAssessmentPage({ params }: EditAssessmentPageProps) {
  const resolvedParams = use(params);
  const [assessment, setAssessment] = useState<AdminAssessmentDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadAssessment() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getAdminAssessmentDetailRequest(resolvedParams.id);
        if (!cancelled) {
          setAssessment(response);
          setMissing(false);
        }
      } catch (requestError) {
        if (!cancelled) {
          const message = requestError instanceof Error ? requestError.message : 'Unable to load assessment.';
          if (message.toLowerCase().includes('not found')) {
            setMissing(true);
          } else {
            setError(message);
          }
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadAssessment();
    return () => {
      cancelled = true;
    };
  }, [resolvedParams.id]);

  if (missing) {
    notFound();
  }

  return (
    <AdminLayout
      title={assessment ? `Edit ${assessment.title}` : 'Edit Assessment'}
      subtitle="Update details, refine questions, and keep this assessment ready for the next student cohort."
    >
      <div className="mb-4">
        <Link
          href={`/admin/assessments/${resolvedParams.id}`}
          className="dashboard-dark-button inline-flex items-center rounded-2xl px-4 py-3 text-sm font-semibold"
        >
          ← Back to Assessment
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          <div className="dashboard-panel-strong h-64 rounded-[1.9rem] animate-pulse" />
          <div className="dashboard-panel h-[32rem] rounded-[1.9rem] animate-pulse" />
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className="dashboard-panel rounded-[1.8rem] p-6">
          <p className="text-sm font-semibold text-rose-400">Unable to load assessment</p>
          <p className="mt-2 text-sm leading-6 text-[var(--dashboard-muted)]">{error}</p>
        </div>
      ) : null}

      {!isLoading && !error && assessment ? (
        <AdminCreateAssessmentForm
          mode="edit"
          assessmentId={assessment.id}
          initialAssessment={assessment}
        />
      ) : null}
    </AdminLayout>
  );
}
