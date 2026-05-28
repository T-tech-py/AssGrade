'use client';

import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminSectionHeader } from '@/components/admin/admin-section-header';
import { SettingsToggleCard } from '@/components/settings/settings-toggle-card';
import { generatedQuestions } from '@/data/admin-dashboard';
import { StatusBadge } from '@/components/admin/status-badge';

export default function AdminAiQuestionGeneratorPage() {
  return (
    <AdminLayout
      title="AI Question Generator"
      subtitle="Generate, preview, and refine quality question sets faster with AI-assisted drafting."
    >
      {/* TODO: Connect this generator to the admin AI question generation endpoint and question bank save flow. */}
      <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="dashboard-panel-strong rounded-[1.9rem] p-6">
          <AdminSectionHeader
            eyebrow="AI workspace"
            title="Generate a question batch"
            subtitle="Define the field, format, and difficulty, then review the draft output before saving."
          />

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              ['Field / category', 'Technology'],
              ['Topic', 'React Fundamentals'],
              ['Question type', 'Mixed'],
              ['Difficulty', 'Intermediate'],
              ['Number of questions', '10'],
              ['Tone / complexity', 'Interview-ready'],
              ['Add to assessment', 'Tech Employability Assessment'],
            ].map(([label, value]) => (
              <label key={label} className="block">
                <span className="text-sm font-semibold text-[var(--dashboard-text)]">{label}</span>
                <input
                  defaultValue={value}
                  className="dashboard-soft-tile mt-2 w-full rounded-[1.2rem] border border-[var(--dashboard-panel-border)] bg-transparent px-4 py-3 text-sm font-semibold text-[var(--dashboard-text)] outline-none"
                />
              </label>
            ))}
          </div>

          <div className="mt-5 space-y-3">
            <SettingsToggleCard
              title="Include answer key"
              description="Generate a draft answer key alongside each question."
              enabled
              onChange={() => undefined}
            />
            <SettingsToggleCard
              title="Include explanation"
              description="Generate reviewer-facing explanations for admin refinement."
              enabled
              onChange={() => undefined}
            />
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              className="dashboard-lime-panel rounded-2xl px-4 py-3 text-sm font-semibold text-[#223200]"
            >
              Generate Questions
            </button>
            <button type="button" className="dashboard-dark-button rounded-2xl px-4 py-3 text-sm font-semibold">
              Save to Question Bank
            </button>
          </div>
        </div>

        <div className="dashboard-panel-strong rounded-[1.9rem] p-6">
          <AdminSectionHeader
            eyebrow="Preview"
            title="Generated output"
            subtitle="Review the generated questions, adjust wording, and push them into the bank when ready."
          />

          <div className="mt-6 space-y-4">
            {generatedQuestions.map((question) => (
              <div key={question.id} className="dashboard-soft-tile rounded-[1.4rem] px-4 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge value={question.type} tone="draft" />
                  <StatusBadge value={question.difficulty} tone="warning" />
                  <StatusBadge value={question.topic} tone="neutral" />
                </div>
                <h3 className="mt-3 text-lg font-semibold text-[var(--dashboard-text)]">{question.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--dashboard-muted)]">{question.preview}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {question.includesAnswerKey ? <StatusBadge value="Answer Key" tone="active" /> : null}
                  {question.includesExplanation ? <StatusBadge value="Explanation" tone="draft" /> : null}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" className="dashboard-dark-button rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em]">
                    Edit
                  </button>
                  <button type="button" className="dashboard-dark-button rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em]">
                    Regenerate
                  </button>
                  <button type="button" className="dashboard-dark-button rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em]">
                    Save
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </AdminLayout>
  );
}
