import { ActionMenu } from '@/components/admin/action-menu';
import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminSectionHeader } from '@/components/admin/admin-section-header';
import { DataTable } from '@/components/admin/data-table';
import { FilterBar } from '@/components/admin/filter-bar';
import { MobileDataCard } from '@/components/admin/mobile-data-card';
import { StatusBadge } from '@/components/admin/status-badge';
import { assessmentQuestions } from '@/data/admin-dashboard';

export default function AdminQuestionsPage() {
  return (
    <AdminLayout
      title="Questions"
      subtitle="Manage the question bank, review AI-generated drafts, and add quality questions to assessments."
    >
      {/* TODO: Connect this page to the question bank and admin question management endpoints. */}
      <FilterBar
        searchPlaceholder="Search question snippets, topics, or assessment areas"
        filters={[
          { label: 'Field', value: 'All' },
          { label: 'Topic', value: 'All topics' },
          { label: 'Type', value: 'All formats' },
          { label: 'Difficulty', value: 'All' },
          { label: 'Source', value: 'Manual + AI' },
        ]}
      />

      <section className="space-y-4">
        <AdminSectionHeader
          eyebrow="Question bank"
          title="Question inventory"
          subtitle="Review and refine reusable questions before they enter published assessments."
        />

        <div className="space-y-4 lg:hidden">
          {assessmentQuestions.map((question) => (
            <MobileDataCard
              key={question.id}
              title={question.snippet}
              subtitle={`${question.field} • ${question.topic}`}
              badges={
                <>
                  <StatusBadge value={question.type} tone="draft" />
                  <StatusBadge value={question.source} tone={question.source === 'Manual' ? 'neutral' : 'active'} />
                </>
              }
              rows={[
                { label: 'Difficulty', value: question.difficulty },
                { label: 'Updated', value: question.lastUpdated },
              ]}
              actions={<ActionMenu actions={['Edit', 'Delete', 'Duplicate', 'Add to Assessment']} />}
            />
          ))}
        </div>

        <DataTable columns={['Question', 'Field', 'Topic', 'Difficulty', 'Source', 'Updated', 'Actions']}>
          {assessmentQuestions.map((question) => (
            <div
              key={question.id}
              className="grid grid-cols-[1.3fr_1.4fr_1fr_0.9fr_0.9fr_1fr_0.9fr] gap-4 border-b border-[var(--dashboard-panel-border)] px-5 py-4 last:border-b-0"
            >
              <div className="text-sm font-semibold text-[var(--dashboard-text)]">{question.snippet}</div>
              <div className="text-sm text-[var(--dashboard-text)]">{question.field}</div>
              <div className="text-sm text-[var(--dashboard-muted)]">{question.topic}</div>
              <div className="text-sm text-[var(--dashboard-text)]">{question.difficulty}</div>
              <div>
                <StatusBadge value={question.source} tone={question.source === 'Manual' ? 'neutral' : 'active'} />
              </div>
              <div className="text-sm text-[var(--dashboard-muted)]">{question.lastUpdated}</div>
              <ActionMenu actions={['Edit', 'Delete', 'Duplicate', 'Add']} />
            </div>
          ))}
        </DataTable>
      </section>
    </AdminLayout>
  );
}
