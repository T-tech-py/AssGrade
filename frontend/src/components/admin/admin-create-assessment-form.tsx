'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { QuestionImportPanel } from '@/components/admin/question-import-panel';
import { emitAppToast } from '@/components/ui/app-toast';
import type { AdminAssessmentDetailResponse } from '@/lib/admin-api';
import { createAdminExamRequest, updateAdminExamRequest } from '@/lib/admin-api';
import type { ImportedQuestion, QuestionImportResult } from '@/lib/question-import';

type QuestionDraft = {
  id: string;
  type: 'MCQ' | 'THEORY' | 'CODING';
  prompt: string;
  explanation: string;
  marks: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  language: string;
  correctAnswerText: string;
  options: Array<{
    id: string;
    label: string;
    value: string;
    isCorrect: boolean;
  }>;
};

function createOption(index: number) {
  return {
    id: `option-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
    label: `Option ${index + 1}`,
    value: '',
    isCorrect: index === 0,
  };
}

function createQuestion(index: number): QuestionDraft {
  return {
    id: `question-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
    type: 'MCQ',
    prompt: '',
    explanation: '',
    marks: 5,
    difficulty: 'Intermediate',
    language: 'JavaScript',
    correctAnswerText: '',
    options: [createOption(0), createOption(1), createOption(2), createOption(3)],
  };
}

function mapImportedQuestion(
  importedQuestion: ImportedQuestion,
  index: number,
): QuestionDraft {
  return {
    id: `question-import-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
    type: importedQuestion.type,
    prompt: importedQuestion.prompt,
    explanation: importedQuestion.explanation ?? '',
    marks: importedQuestion.marks,
    difficulty: importedQuestion.difficulty,
    language: importedQuestion.language ?? 'JavaScript',
    correctAnswerText: importedQuestion.correctAnswerText ?? '',
    options:
      importedQuestion.type === 'MCQ' && importedQuestion.options.length
        ? importedQuestion.options.map((option, optionIndex) => ({
            id: `option-import-${Date.now()}-${index}-${optionIndex}-${Math.random().toString(36).slice(2, 7)}`,
            label: option.label || `Option ${optionIndex + 1}`,
            value: option.value,
            isCorrect: option.isCorrect,
          }))
        : [createOption(0), createOption(1), createOption(2), createOption(3)],
  };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

type AdminCreateAssessmentFormProps = {
  mode?: 'create' | 'edit';
  assessmentId?: string;
  initialAssessment?: AdminAssessmentDetailResponse | null;
};

function buildQuestionDraftFromAssessment(
  question: AdminAssessmentDetailResponse['questions'][number],
  index: number,
): QuestionDraft {
  return {
    id: question.id || `question-${index}`,
    type: question.type,
    prompt: question.prompt,
    explanation: question.explanation ?? '',
    marks: question.marks,
    difficulty: (question.difficulty as QuestionDraft['difficulty']) || 'Intermediate',
    language: question.language || 'JavaScript',
    correctAnswerText: question.correctAnswerText ?? '',
    options:
      question.type === 'MCQ' && question.options.length
        ? question.options.map((option, optionIndex) => ({
            id: option.id || `option-existing-${question.id}-${optionIndex}`,
            label: option.label || `Option ${optionIndex + 1}`,
            value: option.value,
            isCorrect: option.isCorrect,
          }))
        : [createOption(0), createOption(1), createOption(2), createOption(3)],
  };
}

export function AdminCreateAssessmentForm({
  mode: formMode = 'create',
  assessmentId,
  initialAssessment,
}: AdminCreateAssessmentFormProps = {}) {
  const certificateThreshold = 70;
  const router = useRouter();
  const [title, setTitle] = useState(initialAssessment?.title ?? '');
  const [slug, setSlug] = useState(initialAssessment?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState(initialAssessment?.description ?? '');
  const [instructions, setInstructions] = useState(initialAssessment?.instructions ?? '');
  const [mode, setMode] = useState<'REAL' | 'PRACTICE'>(
    initialAssessment?.mode ?? 'REAL',
  );
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>(
    initialAssessment?.status === 'Active' ? 'PUBLISHED' : 'DRAFT',
  );
  const [durationInMinutes, setDurationInMinutes] = useState(
    initialAssessment ? Number(initialAssessment.duration.replace(/\D+/g, '')) || 45 : 45,
  );
  const [shuffleQuestions, setShuffleQuestions] = useState(initialAssessment?.shuffleQuestions ?? false);
  const [shuffleOptions, setShuffleOptions] = useState(initialAssessment?.shuffleOptions ?? false);
  const [fullscreenRequired, setFullscreenRequired] = useState(initialAssessment?.fullscreenRequired ?? true);
  const [webcamRequired, setWebcamRequired] = useState(initialAssessment?.webcamRequired ?? true);
  const [tabSwitchLimit, setTabSwitchLimit] = useState(initialAssessment?.tabSwitchLimit ?? 2);
  const [questions, setQuestions] = useState<QuestionDraft[]>(
    initialAssessment?.questions?.length
      ? initialAssessment.questions.map((question, index) => buildQuestionDraftFromAssessment(question, index))
      : [createQuestion(0)],
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!initialAssessment) return;

    setTitle(initialAssessment.title);
    setSlugTouched(true);
    setSlug(initialAssessment.slug ?? slugify(initialAssessment.title));
    setDescription(initialAssessment.description ?? '');
    setInstructions(initialAssessment.instructions ?? '');
    setMode(initialAssessment.mode ?? 'REAL');
    setStatus(initialAssessment.status === 'Active' ? 'PUBLISHED' : 'DRAFT');
    setDurationInMinutes(Number(initialAssessment.duration.replace(/\D+/g, '')) || 45);
    setShuffleQuestions(initialAssessment.shuffleQuestions);
    setShuffleOptions(initialAssessment.shuffleOptions);
    setFullscreenRequired(initialAssessment.fullscreenRequired);
    setWebcamRequired(initialAssessment.webcamRequired);
    setTabSwitchLimit(initialAssessment.tabSwitchLimit);
    setQuestions(
      initialAssessment.questions.length
        ? initialAssessment.questions.map((question, index) => buildQuestionDraftFromAssessment(question, index))
        : [createQuestion(0)],
    );
  }, [initialAssessment]);

  const totalMarks = useMemo(
    () => questions.reduce((sum, question) => sum + Number(question.marks || 0), 0),
    [questions],
  );

  const canSubmit = title.trim() && slug.trim() && questions.every((question) => {
    if (!question.prompt.trim()) return false;
    if (question.type === 'MCQ') {
      return question.options.length >= 2 && question.options.every((option) => option.value.trim()) && question.options.some((option) => option.isCorrect);
    }
    return true;
  });

  const updateQuestion = <K extends keyof QuestionDraft>(questionId: string, field: K, value: QuestionDraft[K]) => {
    setQuestions((current) =>
      current.map((question) => (question.id === questionId ? { ...question, [field]: value } : question)),
    );
  };

  const addQuestion = () => {
    setQuestions((current) => [...current, createQuestion(current.length)]);
  };

  const handleImportedQuestions = (
    result: QuestionImportResult,
    strategy: 'append' | 'replace',
  ) => {
    const importedDrafts = result.questions.map((question, index) => mapImportedQuestion(question, index));

    setQuestions((current) =>
      strategy === 'replace'
        ? importedDrafts
        : [...current, ...importedDrafts],
    );

    emitAppToast({
      title: strategy === 'replace' ? 'Question builder replaced' : 'Questions appended',
      description:
        strategy === 'replace'
          ? `${result.questions.length} questions from ${result.fileName} are now in the builder.`
          : `${result.questions.length} questions from ${result.fileName} were added to the current builder.`,
      tone: 'success',
    });
  };

  const removeQuestion = (questionId: string) => {
    setQuestions((current) => current.filter((question) => question.id !== questionId));
  };

  const addOption = (questionId: string) => {
    setQuestions((current) =>
      current.map((question) =>
        question.id === questionId
          ? {
              ...question,
              options: [...question.options, createOption(question.options.length)],
            }
          : question,
      ),
    );
  };

  const updateOption = (
    questionId: string,
    optionId: string,
    field: 'label' | 'value' | 'isCorrect',
    value: string | boolean,
  ) => {
    setQuestions((current) =>
      current.map((question) => {
        if (question.id !== questionId) return question;

        const nextOptions = question.options.map((option) => {
          if (option.id !== optionId) return option;
          return {
            ...option,
            [field]: value,
          };
        });

        if (field === 'isCorrect' && value === true) {
          return {
            ...question,
            options: nextOptions.map((option) => ({
              ...option,
              isCorrect: option.id === optionId,
            })),
          };
        }

        return {
          ...question,
          options: nextOptions,
        };
      }),
    );
  };

  const removeOption = (questionId: string, optionId: string) => {
    setQuestions((current) =>
      current.map((question) =>
        question.id === questionId
          ? {
              ...question,
              options: question.options.filter((option) => option.id !== optionId),
            }
          : question,
      ),
    );
  };

  const handleSubmit = async (targetStatus: 'DRAFT' | 'PUBLISHED') => {
    if (!canSubmit) {
      emitAppToast({
        title: 'Complete the assessment form',
        description: 'Fill the core fields and make sure each question is valid before creating the assessment.',
        tone: 'error',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim(),
        description: description.trim() || undefined,
        instructions: instructions.trim() || undefined,
        mode,
        status: targetStatus,
        durationInMinutes,
        shuffleQuestions,
        shuffleOptions,
        fullscreenRequired,
        webcamRequired,
        tabSwitchLimit,
        questions: questions.map((question, index) => ({
          type: question.type,
          prompt: question.prompt.trim(),
          explanation: question.explanation.trim() || undefined,
          marks: question.marks,
          orderIndex: index,
          difficulty: question.difficulty,
          metadata:
            question.type === 'CODING'
              ? { language: question.language || 'JavaScript' }
              : undefined,
          correctAnswer:
            question.type === 'MCQ'
              ? question.options.find((option) => option.isCorrect)?.value ?? ''
              : question.correctAnswerText.trim() || undefined,
          options:
            question.type === 'MCQ'
              ? question.options.map((option, optionIndex) => ({
                  label: option.label.trim() || `Option ${optionIndex + 1}`,
                  value: option.value.trim(),
                  isCorrect: option.isCorrect,
                  orderIndex: optionIndex,
                }))
              : undefined,
        })),
      };

      if (formMode === 'edit' && assessmentId) {
        await updateAdminExamRequest(assessmentId, payload);
      } else {
        await createAdminExamRequest(payload);
      }

      emitAppToast({
        title: formMode === 'edit' ? 'Assessment updated' : 'Assessment created',
        description:
          formMode === 'edit'
            ? targetStatus === 'PUBLISHED'
              ? 'Your assessment has been updated and published.'
              : 'Your assessment draft has been updated successfully.'
            : targetStatus === 'PUBLISHED'
              ? 'Your assessment has been created and published.'
              : 'Your assessment draft has been created successfully.',
        tone: 'success',
      });

      router.push(formMode === 'edit' && assessmentId ? `/admin/assessments/${assessmentId}` : '/admin/assessments');
    } catch (error) {
      emitAppToast({
        title: formMode === 'edit' ? 'Unable to update assessment' : 'Unable to create assessment',
        description: error instanceof Error ? error.message : 'Please try again.',
        tone: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <section className="grid gap-4 xl:grid-cols-[1.02fr_0.98fr]">
        <div className="dashboard-panel-strong rounded-[1.9rem] p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--dashboard-accent-foreground)]">
            Assessment setup
          </p>
          <h2 className="mt-2 text-[1.7rem] font-semibold tracking-[-0.04em] text-[var(--dashboard-text)]">
            {formMode === 'edit' ? 'Edit this assessment' : 'Create a new assessment'}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--dashboard-muted)]">
            {formMode === 'edit'
              ? 'Update the exam shell, refine security rules, and keep the question set aligned before the next student attempt.'
              : 'Define the exam shell, security rules, and the first question set before moving it into the live admin workflow.'}
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-sm font-semibold text-[var(--dashboard-text)]">Assessment title</span>
              <input
                value={title}
                onChange={(event) => {
                  const nextTitle = event.target.value;
                  setTitle(nextTitle);
                  if (!slugTouched) {
                    setSlug(slugify(nextTitle));
                  }
                }}
                className="dashboard-soft-tile mt-2 w-full rounded-[1.15rem] border border-[var(--dashboard-panel-border)] bg-transparent px-4 py-3 text-sm text-[var(--dashboard-text)] outline-none"
                placeholder="Tech Employability Assessment"
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="text-sm font-semibold text-[var(--dashboard-text)]">Slug</span>
              <input
                value={slug}
                onChange={(event) => {
                  setSlugTouched(true);
                  setSlug(slugify(event.target.value));
                }}
                className="dashboard-soft-tile mt-2 w-full rounded-[1.15rem] border border-[var(--dashboard-panel-border)] bg-transparent px-4 py-3 text-sm text-[var(--dashboard-text)] outline-none"
                placeholder="tech-employability-assessment"
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="text-sm font-semibold text-[var(--dashboard-text)]">Description</span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="dashboard-soft-tile mt-2 min-h-[110px] w-full rounded-[1.15rem] border border-[var(--dashboard-panel-border)] bg-transparent px-4 py-3 text-sm leading-6 text-[var(--dashboard-text)] outline-none"
                placeholder="Describe the employability skills, discipline focus, and readiness outcomes this assessment should measure."
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="text-sm font-semibold text-[var(--dashboard-text)]">Instructions</span>
              <textarea
                value={instructions}
                onChange={(event) => setInstructions(event.target.value)}
                className="dashboard-soft-tile mt-2 min-h-[120px] w-full rounded-[1.15rem] border border-[var(--dashboard-panel-border)] bg-transparent px-4 py-3 text-sm leading-6 text-[var(--dashboard-text)] outline-none"
                placeholder="Tell candidates how to approach the assessment, time expectations, and response rules."
              />
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <div className="dashboard-panel rounded-[1.8rem] p-5">
            <p className="text-sm font-semibold text-[var(--dashboard-text)]">Delivery and publishing</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {[
                {
                  label: 'Mode',
                  value: mode,
                  onChange: (value: string) => setMode(value as 'REAL' | 'PRACTICE'),
                  options: [
                    ['REAL', 'Real exam'],
                    ['PRACTICE', 'Practice mode'],
                  ],
                },
                {
                  label: 'Status',
                  value: status,
                  onChange: (value: string) => setStatus(value as 'DRAFT' | 'PUBLISHED'),
                  options: [
                    ['DRAFT', 'Draft'],
                    ['PUBLISHED', 'Published'],
                  ],
                },
              ].map((field) => (
                <label key={field.label} className="block">
                  <span className="text-sm font-semibold text-[var(--dashboard-text)]">{field.label}</span>
                  <select
                    value={field.value}
                    onChange={(event) => field.onChange(event.target.value)}
                    className="dashboard-soft-tile mt-2 w-full rounded-[1.15rem] border border-[var(--dashboard-panel-border)] bg-transparent px-4 py-3 text-sm text-[var(--dashboard-text)] outline-none"
                  >
                    {field.options.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
              ))}

              <label className="block">
                <span className="text-sm font-semibold text-[var(--dashboard-text)]">Duration (mins)</span>
                <input
                  type="number"
                  min={1}
                  value={durationInMinutes}
                  onChange={(event) => setDurationInMinutes(Number(event.target.value))}
                  className="dashboard-soft-tile mt-2 w-full rounded-[1.15rem] border border-[var(--dashboard-panel-border)] bg-transparent px-4 py-3 text-sm text-[var(--dashboard-text)] outline-none"
                />
              </label>

            </div>
          </div>

          <div className="dashboard-panel rounded-[1.8rem] p-5">
            <p className="text-sm font-semibold text-[var(--dashboard-text)]">Security and scoring</p>
            <div className="mt-4 space-y-3">
              <div className="dashboard-soft-tile rounded-[1.2rem] px-4 py-4">
                <p className="text-sm font-semibold text-[var(--dashboard-text)]">Certificate eligibility threshold</p>
                <p className="mt-2 text-sm leading-6 text-[var(--dashboard-muted)]">
                  All assessments use the platform-wide grading scale. Students become certificate-eligible from {certificateThreshold}% upward.
                </p>
              </div>
              {[
                { label: 'Shuffle questions', enabled: shuffleQuestions, onChange: setShuffleQuestions },
                { label: 'Shuffle options', enabled: shuffleOptions, onChange: setShuffleOptions },
                { label: 'Require fullscreen', enabled: fullscreenRequired, onChange: setFullscreenRequired },
                { label: 'Require webcam', enabled: webcamRequired, onChange: setWebcamRequired },
              ].map((item) => (
                <label
                  key={item.label}
                  className="dashboard-soft-tile flex items-center justify-between gap-3 rounded-[1.2rem] px-4 py-3"
                >
                  <span className="text-sm font-semibold text-[var(--dashboard-text)]">{item.label}</span>
                  <input
                    type="checkbox"
                    checked={item.enabled}
                    onChange={(event) => item.onChange(event.target.checked)}
                    className="h-4 w-4 accent-[var(--dashboard-accent-foreground)]"
                  />
                </label>
              ))}

              <label className="block">
                <span className="text-sm font-semibold text-[var(--dashboard-text)]">Tab switch limit</span>
                <input
                  type="number"
                  min={0}
                  value={tabSwitchLimit}
                  onChange={(event) => setTabSwitchLimit(Number(event.target.value))}
                  className="dashboard-soft-tile mt-2 w-full rounded-[1.15rem] border border-[var(--dashboard-panel-border)] bg-transparent px-4 py-3 text-sm text-[var(--dashboard-text)] outline-none"
                />
              </label>
            </div>
          </div>

          <div className="dashboard-panel rounded-[1.8rem] p-5">
            <p className="text-sm font-semibold text-[var(--dashboard-text)]">Assessment summary</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                ['Questions', `${questions.length}`],
                ['Total marks', `${totalMarks}`],
                ['Certificate threshold', `${certificateThreshold}%`],
              ].map(([label, value]) => (
                <div key={label} className="dashboard-soft-tile rounded-[1.15rem] px-4 py-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-subtle)]">{label}</p>
                  <p className="mt-1 text-sm font-semibold text-[var(--dashboard-text)]">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="dashboard-panel rounded-[1.9rem] p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--dashboard-accent-foreground)]">
              Question builder
            </p>
            <h3 className="mt-2 text-[1.55rem] font-semibold tracking-[-0.04em] text-[var(--dashboard-text)]">
              {formMode === 'edit' ? 'Manage the assessment question set' : 'Compose the initial question set'}
            </h3>
          </div>
          <button
            type="button"
            onClick={addQuestion}
            className="dashboard-dark-button rounded-2xl px-4 py-3 text-sm font-semibold"
          >
            Add question
          </button>
        </div>

        <div className="mt-6">
          <QuestionImportPanel
            onAppend={(result) => handleImportedQuestions(result, 'append')}
            onReplace={(result) => handleImportedQuestions(result, 'replace')}
          />
        </div>

        <div className="mt-6 space-y-4">
          {questions.map((question, questionIndex) => (
            <div key={question.id} className="dashboard-soft-tile rounded-[1.5rem] border border-[var(--dashboard-panel-border)] p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[var(--dashboard-text)]">Question {questionIndex + 1}</p>
                  <p className="mt-1 text-sm text-[var(--dashboard-muted)]">
                    Choose a format, add the prompt, and define the answer logic for the first publishable version.
                  </p>
                </div>
                {questions.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => removeQuestion(question.id)}
                    className="rounded-2xl border border-rose-400/35 px-4 py-2 text-sm font-semibold text-rose-400 transition hover:bg-rose-500/10"
                  >
                    Remove
                  </button>
                ) : null}
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <label className="block">
                  <span className="text-sm font-semibold text-[var(--dashboard-text)]">Type</span>
                  <select
                    value={question.type}
                    onChange={(event) => updateQuestion(question.id, 'type', event.target.value as QuestionDraft['type'])}
                    className="dashboard-panel mt-2 w-full rounded-[1.1rem] border border-[var(--dashboard-panel-border)] bg-transparent px-4 py-3 text-sm text-[var(--dashboard-text)] outline-none"
                  >
                    <option value="MCQ">MCQ</option>
                    <option value="THEORY">Theory</option>
                    <option value="CODING">Coding</option>
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-[var(--dashboard-text)]">Difficulty</span>
                  <select
                    value={question.difficulty}
                    onChange={(event) => updateQuestion(question.id, 'difficulty', event.target.value as QuestionDraft['difficulty'])}
                    className="dashboard-panel mt-2 w-full rounded-[1.1rem] border border-[var(--dashboard-panel-border)] bg-transparent px-4 py-3 text-sm text-[var(--dashboard-text)] outline-none"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-[var(--dashboard-text)]">Marks</span>
                  <input
                    type="number"
                    min={1}
                    value={question.marks}
                    onChange={(event) => updateQuestion(question.id, 'marks', Number(event.target.value))}
                    className="dashboard-panel mt-2 w-full rounded-[1.1rem] border border-[var(--dashboard-panel-border)] bg-transparent px-4 py-3 text-sm text-[var(--dashboard-text)] outline-none"
                  />
                </label>
              </div>

              <label className="mt-4 block">
                <span className="text-sm font-semibold text-[var(--dashboard-text)]">Prompt</span>
                <textarea
                  value={question.prompt}
                  onChange={(event) => updateQuestion(question.id, 'prompt', event.target.value)}
                  className="dashboard-panel mt-2 min-h-[110px] w-full rounded-[1.1rem] border border-[var(--dashboard-panel-border)] bg-transparent px-4 py-3 text-sm leading-6 text-[var(--dashboard-text)] outline-none"
                  placeholder="Write the question prompt here."
                />
              </label>

              {question.type === 'MCQ' ? (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[var(--dashboard-text)]">Options</p>
                    <button
                      type="button"
                      onClick={() => addOption(question.id)}
                      className="dashboard-dark-button rounded-xl px-3 py-2 text-sm font-semibold"
                    >
                      Add option
                    </button>
                  </div>
                  <div className="space-y-3">
                    {question.options.map((option, optionIndex) => (
                      <div key={option.id} className="grid gap-3 rounded-[1.1rem] border border-[var(--dashboard-panel-border)] bg-[var(--dashboard-panel-bg)] p-3 sm:grid-cols-[1fr_1.5fr_auto_auto] sm:items-center">
                        <input
                          value={option.label}
                          onChange={(event) => updateOption(question.id, option.id, 'label', event.target.value)}
                          className="rounded-xl border border-[var(--dashboard-panel-border)] bg-transparent px-3 py-2 text-sm text-[var(--dashboard-text)] outline-none"
                          placeholder={`Option ${optionIndex + 1}`}
                        />
                        <input
                          value={option.value}
                          onChange={(event) => updateOption(question.id, option.id, 'value', event.target.value)}
                          className="rounded-xl border border-[var(--dashboard-panel-border)] bg-transparent px-3 py-2 text-sm text-[var(--dashboard-text)] outline-none"
                          placeholder="Option value"
                        />
                        <label className="flex items-center gap-2 text-sm text-[var(--dashboard-text)]">
                          <input
                            type="radio"
                            checked={option.isCorrect}
                            onChange={(event) => updateOption(question.id, option.id, 'isCorrect', event.target.checked)}
                          />
                          Correct
                        </label>
                        {question.options.length > 2 ? (
                          <button
                            type="button"
                            onClick={() => removeOption(question.id, option.id)}
                            className="rounded-xl border border-rose-400/35 px-3 py-2 text-sm font-semibold text-rose-400"
                          >
                            Remove
                          </button>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {question.type === 'CODING' ? (
                    <label className="block">
                      <span className="text-sm font-semibold text-[var(--dashboard-text)]">Language</span>
                      <input
                        value={question.language}
                        onChange={(event) => updateQuestion(question.id, 'language', event.target.value)}
                        className="dashboard-panel mt-2 w-full rounded-[1.1rem] border border-[var(--dashboard-panel-border)] bg-transparent px-4 py-3 text-sm text-[var(--dashboard-text)] outline-none"
                        placeholder="JavaScript"
                      />
                    </label>
                  ) : null}
                  <label className={`block ${question.type === 'CODING' ? '' : 'sm:col-span-2'}`}>
                    <span className="text-sm font-semibold text-[var(--dashboard-text)]">Ideal answer / rubric note</span>
                    <textarea
                      value={question.correctAnswerText}
                      onChange={(event) => updateQuestion(question.id, 'correctAnswerText', event.target.value)}
                      className="dashboard-panel mt-2 min-h-[110px] w-full rounded-[1.1rem] border border-[var(--dashboard-panel-border)] bg-transparent px-4 py-3 text-sm leading-6 text-[var(--dashboard-text)] outline-none"
                      placeholder="Write the model answer, key logic, or expected response shape."
                    />
                  </label>
                </div>
              )}

              <label className="mt-4 block">
                <span className="text-sm font-semibold text-[var(--dashboard-text)]">Explanation (optional)</span>
                <textarea
                  value={question.explanation}
                  onChange={(event) => updateQuestion(question.id, 'explanation', event.target.value)}
                  className="dashboard-panel mt-2 min-h-[90px] w-full rounded-[1.1rem] border border-[var(--dashboard-panel-border)] bg-transparent px-4 py-3 text-sm leading-6 text-[var(--dashboard-text)] outline-none"
                  placeholder="Helpful for practice mode or internal admin review."
                />
              </label>
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => router.push('/admin/assessments')}
          className="dashboard-dark-button rounded-2xl px-4 py-3 text-sm font-semibold"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => {
            setStatus('DRAFT');
            void handleSubmit('DRAFT');
          }}
          disabled={isSubmitting}
          className="dashboard-dark-button rounded-2xl px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting && status === 'DRAFT' ? 'Saving draft...' : 'Save draft'}
        </button>
        <button
          type="button"
          onClick={() => {
            setStatus('PUBLISHED');
            void handleSubmit('PUBLISHED');
          }}
          disabled={isSubmitting}
          className="dashboard-lime-panel rounded-2xl px-4 py-3 text-sm font-semibold text-[#223200] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting && status === 'PUBLISHED'
            ? formMode === 'edit'
              ? 'Saving updates...'
              : 'Publishing...'
            : formMode === 'edit'
              ? 'Save assessment'
              : 'Create assessment'}
        </button>
      </div>
    </div>
  );
}
