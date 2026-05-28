import type { ReactNode } from 'react';
import { CameraIcon, FullscreenIcon, PeopleIcon, ShieldIcon, WarningIcon } from './icons';
import { ExamProgress } from './exam-progress';
import { SaveStatus } from './save-status';
import { SecurityBadge } from './security-badge';
import { TimerCard } from './timer-card';

type ExamTopBarProps = {
  title: string;
  timeRemaining: string;
  currentQuestion: number;
  totalQuestions: number;
  answeredCount: number;
  warnings: number;
  saveStatus: 'saved' | 'saving';
  webcamActive?: boolean;
  fullscreenEnabled?: boolean;
  sessionSecure?: boolean;
  facePresenceStatus?: 'single' | 'multiple' | 'unsupported' | 'checking';
  onSubmit: () => void;
  extraAction?: ReactNode;
};

export function ExamTopBar({
  title,
  timeRemaining,
  currentQuestion,
  totalQuestions,
  answeredCount,
  warnings,
  saveStatus,
  webcamActive = true,
  fullscreenEnabled = true,
  sessionSecure = true,
  facePresenceStatus = 'checking',
  onSubmit,
  extraAction,
}: ExamTopBarProps) {
  return (
    <div className="dashboard-panel-strong sticky top-3 z-20 rounded-[2rem] p-4 sm:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--dashboard-accent-foreground)]">Secure assessment session</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[var(--dashboard-text)]">{title}</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <SecurityBadge
              tone={webcamActive ? 'good' : 'warn'}
              label={webcamActive ? 'Webcam Active' : 'Webcam Needed'}
              icon={<CameraIcon className="h-4 w-4" />}
            />
            <SecurityBadge
              tone={fullscreenEnabled ? 'good' : 'warn'}
              label={fullscreenEnabled ? 'Fullscreen On' : 'Fullscreen Off'}
              icon={<FullscreenIcon className="h-4 w-4" />}
            />
            <SecurityBadge
              tone={sessionSecure ? 'good' : 'warn'}
              label={sessionSecure ? 'Secure Session' : 'Attention Needed'}
              icon={<ShieldIcon className="h-4 w-4" />}
            />
            <SecurityBadge
              tone={
                facePresenceStatus === 'multiple'
                  ? 'warn'
                  : facePresenceStatus === 'single'
                    ? 'good'
                    : 'neutral'
              }
              label={
                facePresenceStatus === 'multiple'
                  ? 'Multiple Persons'
                  : facePresenceStatus === 'single'
                    ? 'Single Person'
                    : facePresenceStatus === 'unsupported'
                      ? 'Face Scan Unavailable'
                      : 'Checking Faces'
              }
              icon={<PeopleIcon className="h-4 w-4" />}
            />
            <SecurityBadge tone={warnings > 0 ? 'warn' : 'neutral'} label={`${warnings} Warnings`} icon={<WarningIcon className="h-4 w-4" />} />
          </div>
        </div>

        <div className="space-y-3 xl:min-w-[23rem]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <TimerCard timeRemaining={timeRemaining} />
            <button
              type="button"
              onClick={onSubmit}
              className="dashboard-lime-panel inline-flex justify-center rounded-2xl px-5 py-3 text-sm font-semibold text-[#203100]"
            >
              Submit Assessment
            </button>
          </div>
          <ExamProgress current={currentQuestion} total={totalQuestions} answered={answeredCount} />
          <div className="flex flex-wrap items-center gap-2">
            <SaveStatus status={saveStatus} />
            <p className="text-xs leading-5 text-[var(--dashboard-muted)]">
              Your session is being monitored for assessment integrity.
            </p>
          </div>
          {extraAction}
        </div>
      </div>
    </div>
  );
}
