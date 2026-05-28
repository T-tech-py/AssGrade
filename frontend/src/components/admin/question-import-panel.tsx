'use client';

import { useRef, useState } from 'react';
import { emitAppToast } from '@/components/ui/app-toast';
import type { QuestionImportResult } from '@/lib/question-import';
import { importQuestionsFromFile } from '@/lib/question-import';

type QuestionImportPanelProps = {
  onReplace: (result: QuestionImportResult) => void;
  onAppend: (result: QuestionImportResult) => void;
};

export function QuestionImportPanel({ onReplace, onAppend }: QuestionImportPanelProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [preview, setPreview] = useState<QuestionImportResult | null>(null);

  const handleFile = async (file: File) => {
    setIsImporting(true);

    try {
      const parsed = await importQuestionsFromFile(file);
      setPreview(parsed);
      emitAppToast({
        title: 'Questions extracted',
        description: `${parsed.questions.length} questions are ready to review from ${parsed.fileName}.`,
        tone: 'success',
      });
    } catch (error) {
      emitAppToast({
        title: 'Import failed',
        description: error instanceof Error ? error.message : 'The file could not be imported.',
        tone: 'error',
      });
    } finally {
      setIsImporting(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  return (
    <div className="dashboard-panel-strong rounded-[1.5rem] border border-[var(--dashboard-panel-border)] p-4 sm:p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-[var(--dashboard-text)]">Import questions from a file</p>
          <p className="mt-2 text-sm leading-6 text-[var(--dashboard-muted)]">
            Upload a CSV, JSON, spreadsheet, or PDF and we&apos;ll turn it into draft questions for this assessment. CSV,
            JSON, and spreadsheet files are the most reliable. PDF import uses best-effort extraction and should be reviewed
            before publishing.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {['CSV', 'JSON', 'XLSX', 'PDF'].map((label) => (
            <span
              key={label}
              className="rounded-full border border-[var(--dashboard-panel-border)] bg-[var(--dashboard-soft-tile-bg)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-subtle)]"
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-[1.35rem] border border-dashed border-[var(--dashboard-panel-border)] bg-[var(--dashboard-soft-tile-bg)] p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-[var(--dashboard-text)]">
              Upload and auto-fill the question builder
            </p>
            <p className="mt-1 text-sm text-[var(--dashboard-muted)]">
              Expected columns can include `type`, `prompt`, `option_a`, `option_b`, `correct_answer`, `marks`,
              `difficulty`, `language`, and `explanation`.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.json,.xlsx,.xls,.pdf"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  void handleFile(file);
                }
              }}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={isImporting}
              className="dashboard-dark-button rounded-2xl px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isImporting ? 'Reading file...' : 'Choose file'}
            </button>
          </div>
        </div>
      </div>

      {preview ? (
        <div className="mt-4 rounded-[1.35rem] border border-[var(--dashboard-panel-border)] bg-[var(--dashboard-panel-bg)] p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--dashboard-text)]">Import preview</p>
              <p className="mt-1 text-sm text-[var(--dashboard-muted)]">
                {preview.fileName} • {preview.formatLabel} • {preview.questions.length} questions extracted
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onAppend(preview)}
                className="dashboard-dark-button rounded-2xl px-4 py-3 text-sm font-semibold"
              >
                Append to builder
              </button>
              <button
                type="button"
                onClick={() => onReplace(preview)}
                className="dashboard-lime-panel rounded-2xl px-4 py-3 text-sm font-semibold text-[#223200]"
              >
                Replace current questions
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="dashboard-soft-tile rounded-[1.1rem] px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-subtle)]">MCQ</p>
              <p className="mt-1 text-sm font-semibold text-[var(--dashboard-text)]">
                {preview.questions.filter((question) => question.type === 'MCQ').length}
              </p>
            </div>
            <div className="dashboard-soft-tile rounded-[1.1rem] px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-subtle)]">Theory</p>
              <p className="mt-1 text-sm font-semibold text-[var(--dashboard-text)]">
                {preview.questions.filter((question) => question.type === 'THEORY').length}
              </p>
            </div>
            <div className="dashboard-soft-tile rounded-[1.1rem] px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-subtle)]">Coding</p>
              <p className="mt-1 text-sm font-semibold text-[var(--dashboard-text)]">
                {preview.questions.filter((question) => question.type === 'CODING').length}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-3">
              {preview.questions.slice(0, 3).map((question, index) => (
                <div key={`${question.prompt}-${index}`} className="dashboard-soft-tile rounded-[1.1rem] px-4 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[var(--dashboard-icon-surface)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-accent-foreground)]">
                      {question.type}
                    </span>
                    <span className="rounded-full border border-[var(--dashboard-panel-border)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-subtle)]">
                      {question.difficulty}
                    </span>
                    <span className="text-xs text-[var(--dashboard-muted)]">{question.marks} marks</span>
                  </div>
                  <p className="mt-3 text-sm font-semibold leading-6 text-[var(--dashboard-text)]">
                    {question.prompt}
                  </p>
                </div>
              ))}
            </div>

            <div className="dashboard-soft-tile rounded-[1.1rem] px-4 py-4">
              <p className="text-sm font-semibold text-[var(--dashboard-text)]">Import notes</p>
              {preview.issues.length ? (
                <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--dashboard-muted)]">
                  {preview.issues.slice(0, 5).map((issue) => (
                    <li key={issue}>• {issue}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm leading-6 text-[var(--dashboard-muted)]">
                  No issues were detected. You can safely replace the current builder or append these questions.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
