'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ExamDefinition } from '@/data/exam-assessments';
import { queueAppToast } from '@/components/ui/app-toast';
import { detectFacesFromVideo } from '@/lib/face-detection';
import {
  logStudentProctorEventRequest,
  startStudentExamRequest,
  submitStudentExamRequest,
} from '@/lib/student-dashboard-api';
import { AssessmentLayout } from './assessment-layout';
import { BottomActionBar } from './bottom-action-bar';
import { ExamTopBar } from './exam-top-bar';
import { FileIcon, FlagIcon, FullscreenIcon, ListIcon } from './icons';
import { QuestionPalette } from './question-palette';
import { QuestionRenderer } from './question-renderer';
import { SubmitConfirmModal } from './submit-confirm-modal';
import { WarningModal } from './warning-modal';
import { WebcamPreviewCard } from './webcam-preview-card';

type Answers = Record<string, string>;
type SaveState = 'saved' | 'saving';
type WarningState = {
  title: string;
  description: string;
};
type FacePresenceStatus = 'single' | 'multiple' | 'unsupported' | 'checking';

type TakeAssessmentPageProps = {
  exam: ExamDefinition;
};

export function TakeAssessmentPage({ exam }: TakeAssessmentPageProps) {
  const router = useRouter();
  const sessionKey = `gradassess-exam-session:${exam.id}`;
  const submitGuardRef = useRef(false);
  const saveTimerRef = useRef<number | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [visited, setVisited] = useState<string[]>([exam.questions[0]?.id ?? '']);
  const [flagged, setFlagged] = useState<string[]>([]);
  const [saveStatus, setSaveStatus] = useState<SaveState>('saved');
  const [saveMessage, setSaveMessage] = useState('All responses saved');
  const [warnings, setWarnings] = useState(0);
  const [warningLimit, setWarningLimit] = useState(3);
  const [warningState, setWarningState] = useState<WarningState | null>(null);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('00:00');
  const [endTime, setEndTime] = useState<number | null>(null);
  const [isFullscreenEnabled, setIsFullscreenEnabled] = useState(false);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const [webcamStatus, setWebcamStatus] = useState<'active' | 'requesting' | 'blocked' | 'unsupported'>('requesting');
  const [webcamMessage, setWebcamMessage] = useState<string | undefined>(
    'Connecting your camera for assessment monitoring.',
  );
  const [facePresenceStatus, setFacePresenceStatus] = useState<FacePresenceStatus>('checking');
  const [faceCount, setFaceCount] = useState(0);
  const [faceDetectionEngine, setFaceDetectionEngine] = useState<'native' | 'tfjs' | 'unavailable'>('unavailable');
  const [isBootingSession, setIsBootingSession] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hiddenVideoRef = useRef<HTMLVideoElement | null>(null);
  const multiFaceWarningActiveRef = useRef(false);
  const webcamStreamRef = useRef<MediaStream | null>(null);
  const noFaceWarningActiveRef = useRef(false);
  const pendingProctorEventsRef = useRef<
    Array<{
      type:
        | 'TAB_SWITCH'
        | 'FULLSCREEN_EXIT'
        | 'WEBCAM_STATUS'
        | 'IP_CHANGE'
        | 'DEVICE_CHANGE'
        | 'MULTIPLE_FACE_DETECTED'
        | 'NO_FACE_DETECTED'
        | 'SUSPICIOUS_ACTIVITY';
      severity?: number;
      payload?: Record<string, unknown>;
    }>
  >([]);

  const cleanupExamSession = async () => {
    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }

    setWebcamStream((current) => {
      current?.getTracks().forEach((track) => track.stop());
      return null;
    });
    webcamStreamRef.current?.getTracks().forEach((track) => track.stop());
    webcamStreamRef.current = null;
    setWebcamStatus('unsupported');
    setWebcamMessage('Assessment session ended. Camera access has been released.');

    if (hiddenVideoRef.current) {
      hiddenVideoRef.current.srcObject = null;
    }

    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch {
        // Ignore browser exit failures and continue cleanup.
      }
    }

    setIsFullscreenEnabled(false);
  };

  const currentQuestion = exam.questions[currentIndex];

  const flushPendingProctorEvents = async (nextAttemptId: string) => {
    const queuedEvents = [...pendingProctorEventsRef.current];
    pendingProctorEventsRef.current = [];

    await Promise.allSettled(
      queuedEvents.map((event) => logStudentProctorEventRequest(nextAttemptId, event)),
    );
  };

  const logProctorEvent = async (event: {
    type:
      | 'TAB_SWITCH'
      | 'FULLSCREEN_EXIT'
      | 'WEBCAM_STATUS'
      | 'IP_CHANGE'
      | 'DEVICE_CHANGE'
      | 'MULTIPLE_FACE_DETECTED'
      | 'NO_FACE_DETECTED'
      | 'SUSPICIOUS_ACTIVITY';
    severity?: number;
    payload?: Record<string, unknown>;
  }) => {
    if (!attemptId) {
      pendingProctorEventsRef.current.push(event);
      return;
    }

    try {
      await logStudentProctorEventRequest(attemptId, event);
    } catch {
      // Keep the assessment experience moving even if background security logging fails.
    }
  };

  const answeredCount = useMemo(
    () => exam.questions.filter((question) => Boolean(answers[question.id]?.trim())).length,
    [answers, exam.questions],
  );

  const paletteItems = exam.questions.map((question, index) => {
    const isCurrent = index === currentIndex;
    const isAnswered = Boolean(answers[question.id]?.trim());
    const isFlagged = flagged.includes(question.id);
    const isVisited = visited.includes(question.id);

    let status: 'not_visited' | 'answered' | 'current' | 'flagged' = 'not_visited';

    if (isCurrent) status = 'current';
    else if (isFlagged) status = 'flagged';
    else if (isAnswered) status = 'answered';
    else if (isVisited) status = 'answered';

    return { id: question.id, number: question.number, status };
  });

  const unansweredCount = exam.questions.length - answeredCount;

  useEffect(() => {
    if (typeof document === 'undefined') return;
    setIsFullscreenEnabled(Boolean(document.fullscreenElement));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedSessionRaw = window.sessionStorage.getItem(sessionKey);
    if (savedSessionRaw) {
      try {
        const savedSession = JSON.parse(savedSessionRaw) as {
          attemptId?: string;
          answers?: Answers;
          flagged?: string[];
          visited?: string[];
          currentIndex?: number;
          warnings?: number;
          warningLimit?: number;
          endTime?: number;
        };

        if (savedSession.answers) setAnswers(savedSession.answers);
        if (savedSession.flagged) setFlagged(savedSession.flagged);
        if (savedSession.visited?.length) setVisited(savedSession.visited);
        if (typeof savedSession.currentIndex === 'number') setCurrentIndex(savedSession.currentIndex);
        if (typeof savedSession.warnings === 'number') setWarnings(savedSession.warnings);
        if (typeof savedSession.warningLimit === 'number') setWarningLimit(savedSession.warningLimit);
        if (typeof savedSession.endTime === 'number') setEndTime(savedSession.endTime);
        if (savedSession.attemptId) setAttemptId(savedSession.attemptId);
      } catch {
        window.sessionStorage.removeItem(sessionKey);
      }
    }
  }, [sessionKey]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const payload = {
      attemptId,
      answers,
      flagged,
      visited,
      currentIndex,
      warnings,
      warningLimit,
      endTime,
    };
    window.sessionStorage.setItem(sessionKey, JSON.stringify(payload));
  }, [answers, attemptId, currentIndex, endTime, flagged, sessionKey, visited, warningLimit, warnings]);

  useEffect(() => {
    let isCancelled = false;

    const bootSession = async () => {
      setIsBootingSession(true);
      try {
        if (!attemptId) {
          const started = await startStudentExamRequest(exam.id);
          if (isCancelled) return;
          setAttemptId(started.attemptId);
          setWarningLimit(Math.max(1, started.restrictions.tabSwitchLimit + 1));
          await flushPendingProctorEvents(started.attemptId);

          if (!endTime) {
            setEndTime(Date.now() + exam.durationMinutes * 60 * 1000);
          }
        }
      } catch (error) {
        if (isCancelled) return;
        queueAppToast({
          title: 'Unable to start assessment',
          description:
            error instanceof Error
              ? error.message
              : 'We could not start this assessment session.',
          tone: 'error',
        });
      } finally {
        if (!isCancelled) {
          setIsBootingSession(false);
        }
      }
    };

    void bootSession();

    return () => {
      isCancelled = true;
    };
  }, [attemptId, endTime, exam.durationMinutes, exam.id]);

  useEffect(() => {
    if (!endTime) return;

    const updateTimer = () => {
      const remaining = Math.max(0, endTime - Date.now());
      const totalSeconds = Math.ceil(remaining / 1000);
      const minutes = Math.floor(totalSeconds / 60)
        .toString()
        .padStart(2, '0');
      const seconds = (totalSeconds % 60).toString().padStart(2, '0');
      setTimeRemaining(`${minutes}:${seconds}`);

      if (remaining <= 0 && !submitGuardRef.current) {
        void handleSubmit('Time elapsed. Your assessment was auto-submitted.');
      }
    };

    updateTimer();
    const intervalId = window.setInterval(updateTimer, 1000);
    return () => window.clearInterval(intervalId);
  }, [endTime]);

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setWebcamStatus('unsupported');
      setWebcamMessage('This browser does not support webcam access for assessment monitoring.');
      setFacePresenceStatus('unsupported');
      return;
    }

    let isCancelled = false;

    const enableCamera = async () => {
      setWebcamStatus('requesting');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
          },
          audio: false,
        });
        if (isCancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        setWebcamStream(stream);
        webcamStreamRef.current = stream;
        setWebcamStatus('active');
        setWebcamMessage('Webcam stream is active for this assessment session.');
      } catch {
        if (isCancelled) return;
        setWebcamStatus('blocked');
        setWebcamMessage('Camera access is blocked. Please allow webcam access to continue safely.');
        setFacePresenceStatus('unsupported');
        void logProctorEvent({
          type: 'WEBCAM_STATUS',
          severity: 3,
          payload: {
            status: 'blocked',
            message: 'Camera access was denied or unavailable during assessment startup.',
          },
        });
      }
    };

    void enableCamera();

    return () => {
      isCancelled = true;
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
      webcamStreamRef.current?.getTracks().forEach((track) => track.stop());
      webcamStreamRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!hiddenVideoRef.current) return;
    if (webcamStream) {
      hiddenVideoRef.current.srcObject = webcamStream;
      void hiddenVideoRef.current.play().catch(() => undefined);
      return;
    }
    hiddenVideoRef.current.srcObject = null;
  }, [webcamStream]);

  useEffect(() => {
    if (!webcamStream || !hiddenVideoRef.current) return;

    let isCancelled = false;

    const runDetection = async () => {
      if (!hiddenVideoRef.current || hiddenVideoRef.current.readyState < 2 || isCancelled) {
        return;
      }

      try {
        const result = await detectFacesFromVideo(hiddenVideoRef.current);
        if (isCancelled) return;

        setFaceDetectionEngine(result.engine);
        if (result.engine === 'unavailable') {
          setFacePresenceStatus('unsupported');
          return;
        }

        const count = result.count;
        setFaceCount(count);

        if (count > 1) {
          setFacePresenceStatus('multiple');
          if (!multiFaceWarningActiveRef.current) {
            multiFaceWarningActiveRef.current = true;
            void logProctorEvent({
              type: 'MULTIPLE_FACE_DETECTED',
              severity: 3,
              payload: {
                faceCount: count,
                detector: result.engine,
              },
            });
            registerWarning({
              title: 'Multiple persons detected in camera view.',
              description:
                'Only the test taker should remain visible. Ask others to leave the frame to continue safely.',
            });
          }
        } else if (count === 0) {
          setFacePresenceStatus('checking');
          if (!noFaceWarningActiveRef.current) {
            noFaceWarningActiveRef.current = true;
            void logProctorEvent({
              type: 'NO_FACE_DETECTED',
              severity: 2,
              payload: {
                faceCount: count,
                detector: result.engine,
              },
            });
            registerWarning({
              title: 'No face detected in camera view.',
              description:
                'Keep your face clearly visible in the webcam frame to avoid integrity warnings.',
            });
          }
        } else {
          setFacePresenceStatus('single');
          multiFaceWarningActiveRef.current = false;
          noFaceWarningActiveRef.current = false;
        }
      } catch {
        if (isCancelled) return;
        setFacePresenceStatus('unsupported');
        setFaceDetectionEngine('unavailable');
      }
    };

    const intervalId = window.setInterval(() => {
      void runDetection();
    }, 4000);

    void runDetection();

    return () => {
      isCancelled = true;
      window.clearInterval(intervalId);
    };
  }, [webcamStream]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const enabled = Boolean(document.fullscreenElement);
      setIsFullscreenEnabled(enabled);

      if (!enabled && !submitGuardRef.current) {
        void logProctorEvent({
          type: 'FULLSCREEN_EXIT',
          severity: 2,
          payload: {
            message: 'User exited fullscreen during assessment.',
          },
        });
        registerWarning({
          title: 'Fullscreen mode was exited.',
          description:
            'Return to fullscreen to continue the assessment without risking termination.',
        });
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && !submitGuardRef.current) {
        void logProctorEvent({
          type: 'TAB_SWITCH',
          severity: 2,
          payload: {
            message: 'User switched tabs or backgrounded the assessment page.',
          },
        });
        registerWarning({
          title: 'Tab switching is not allowed during this assessment.',
          description:
            'Please stay on the assessment page. Repeated tab switches may end your session automatically.',
        });
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const registerWarning = (nextWarning: WarningState) => {
    setWarnings((current) => {
      const nextCount = current + 1;
      setWarningState(nextWarning);
      setShowWarningModal(true);

      if (nextCount >= warningLimit && !submitGuardRef.current) {
        void handleSubmit('Assessment ended after repeated security warnings.');
      }

      return nextCount;
    });
  };

  const requestFullscreenMode = async () => {
    if (document.fullscreenElement) return;
    try {
      await document.documentElement.requestFullscreen();
      setIsFullscreenEnabled(true);
    } catch {
      queueAppToast({
        title: 'Fullscreen not enabled',
        description: 'Use the fullscreen button again to continue in secure mode.',
        tone: 'error',
      });
    }
  };

  const handleAnswerChange = (value: string) => {
    setAnswers((current) => ({ ...current, [currentQuestion.id]: value }));
    setSaveStatus('saving');
    setSaveMessage('Saving...');

    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = window.setTimeout(() => {
      setSaveStatus('saved');
      setSaveMessage('All responses saved');
    }, 500);
  };

  const jumpToQuestion = (questionId: string) => {
    const nextIndex = exam.questions.findIndex((question) => question.id === questionId);
    if (nextIndex >= 0) {
      setCurrentIndex(nextIndex);
      setVisited((current) => Array.from(new Set([...current, questionId])));
      setShowPalette(false);
    }
  };

  const moveQuestion = (direction: 'previous' | 'next') => {
    setCurrentIndex((current) => {
      const nextIndex = direction === 'previous' ? current - 1 : current + 1;
      const boundedIndex = Math.max(0, Math.min(exam.questions.length - 1, nextIndex));
      const nextQuestion = exam.questions[boundedIndex];
      setVisited((visitedQuestions) => Array.from(new Set([...visitedQuestions, nextQuestion.id])));
      return boundedIndex;
    });
  };

  const toggleFlag = () => {
    setFlagged((current) =>
      current.includes(currentQuestion.id)
        ? current.filter((id) => id !== currentQuestion.id)
        : [...current, currentQuestion.id],
    );
  };

  const handleManualSave = () => {
    setSaveStatus('saving');
    setSaveMessage('Saving...');
    window.setTimeout(() => {
      setSaveStatus('saved');
      setSaveMessage('All responses saved');
      queueAppToast({
        title: 'Responses saved',
        description: 'Your current progress has been saved in this session.',
        tone: 'success',
      });
    }, 300);
  };

  const handleSubmit = async (successDescription?: string) => {
    if (submitGuardRef.current) return;
    submitGuardRef.current = true;
    setIsSubmitting(true);
    setShowSubmitModal(false);

    try {
      const payload = exam.questions.map((question) => ({
        questionId: question.id,
        answer: answers[question.id]?.trim() ? answers[question.id] : undefined,
      }));

      const result = await submitStudentExamRequest(exam.id, payload);
      await cleanupExamSession();
      window.sessionStorage.removeItem(sessionKey);
      queueAppToast({
        title: 'Assessment submitted',
        description:
          successDescription ??
          `Your responses have been submitted successfully${result.passed ? '.' : ' for review.'}`,
        tone: 'success',
      });
      const submitParams = new URLSearchParams({
        score: String(result.score),
        maxScore: String(result.maxScore),
        percentage: String(Math.round(result.percentage)),
        grade: result.grade,
        passed: result.passed ? 'true' : 'false',
      });

      if (result.certificate?.certificateNumber) {
        submitParams.set('certificate', result.certificate.certificateNumber);
      }

      router.push(`/assessments/${exam.id}/submit?${submitParams.toString()}`);
    } catch (error) {
      submitGuardRef.current = false;
      setIsSubmitting(false);
      queueAppToast({
        title: 'Submission failed',
        description:
          error instanceof Error
            ? error.message
            : 'We could not submit your assessment right now.',
        tone: 'error',
      });
    }
  };

  if (!currentQuestion) {
    return (
      <AssessmentLayout>
        <div className="dashboard-panel-strong rounded-[2rem] p-6 text-sm text-[var(--dashboard-muted)]">
          This assessment has no questions yet.
        </div>
      </AssessmentLayout>
    );
  }

  return (
    <AssessmentLayout>
      <div className="space-y-4 lg:space-y-5">
        <ExamTopBar
          title={exam.title}
          timeRemaining={timeRemaining}
          currentQuestion={currentQuestion.number}
          totalQuestions={exam.totalQuestions}
          answeredCount={answeredCount}
          warnings={warnings}
          saveStatus={saveStatus}
          webcamActive={webcamStatus === 'active'}
          fullscreenEnabled={isFullscreenEnabled}
          sessionSecure={
            webcamStatus === 'active' &&
            isFullscreenEnabled &&
            warnings < warningLimit &&
            facePresenceStatus !== 'multiple'
          }
          facePresenceStatus={facePresenceStatus}
          onSubmit={() => setShowSubmitModal(true)}
          extraAction={
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  void requestFullscreenMode();
                }}
                className="dashboard-dark-button inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition"
              >
                <FullscreenIcon className="h-4 w-4" />
                {isFullscreenEnabled ? 'Fullscreen Active' : 'Enter Fullscreen'}
              </button>
              <button
                type="button"
                onClick={() =>
                  {
                    void logProctorEvent({
                      type: 'SUSPICIOUS_ACTIVITY',
                      severity: 2,
                      payload: {
                        reason: 'Manual security warning trigger used from assessment UI.',
                      },
                    });
                    registerWarning({
                      title: 'Security warning triggered.',
                      description:
                        'This is a manual warning check for the session. Continue carefully.',
                    });
                  }
                }
                className="dashboard-dark-button inline-flex rounded-full px-4 py-2 text-xs font-semibold transition"
              >
                Trigger Warning
              </button>
            </div>
          }
        />

        <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
          <section className="space-y-4">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="dashboard-panel-strong rounded-[2rem] p-6 sm:p-7"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[var(--dashboard-icon-surface)] px-3 py-2 text-xs font-semibold text-[var(--dashboard-text)]">
                  Question {currentQuestion.number}
                </span>
                <span className="rounded-full bg-[var(--dashboard-accent-soft)] px-3 py-2 text-xs font-semibold text-[var(--dashboard-accent-foreground)]">
                  {currentQuestion.type.toUpperCase()}
                </span>
                <span className="rounded-full bg-[var(--dashboard-warm-soft)] px-3 py-2 text-xs font-semibold text-[var(--dashboard-warm-foreground)]">
                  {currentQuestion.difficulty}
                </span>
                {flagged.includes(currentQuestion.id) ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-[var(--dashboard-warm-soft)] px-3 py-2 text-xs font-semibold text-[var(--dashboard-warm-foreground)]">
                    <FlagIcon className="h-4 w-4" />
                    Flagged
                  </span>
                ) : null}
              </div>

              <div className="mt-5 space-y-4">
                <h2 className="text-[1.7rem] font-semibold leading-[1.2] tracking-[-0.04em] text-[var(--dashboard-text)]">
                  {currentQuestion.prompt}
                </h2>
                {currentQuestion.scenario ? (
                  <div className="rounded-[1.5rem] border border-[var(--dashboard-panel-border)] bg-[var(--dashboard-soft-tile-bg)] px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-muted)]">Scenario</p>
                    <p className="mt-2 text-sm leading-7 text-[var(--dashboard-text)]">{currentQuestion.scenario}</p>
                  </div>
                ) : null}
              </div>

              <div className="mt-6">
                <QuestionRenderer
                  question={currentQuestion}
                  answer={answers[currentQuestion.id]}
                  onAnswerChange={handleAnswerChange}
                />
              </div>
            </motion.div>

            <BottomActionBar
              canGoPrevious={currentIndex > 0}
              canGoNext={currentIndex < exam.questions.length - 1}
              flagged={flagged.includes(currentQuestion.id)}
              onPrevious={() => moveQuestion('previous')}
              onNext={() => moveQuestion('next')}
              onSave={() => {
                setSaveStatus('saving');
                window.setTimeout(() => setSaveStatus('saved'), 500);
              }}
              onToggleFlag={toggleFlag}
            />
          </section>

          <aside className="space-y-4">
            <div className="xl:hidden">
              <button
                type="button"
                onClick={() => setShowPalette((current) => !current)}
                className="dashboard-dark-button inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition"
              >
                <ListIcon className="h-4 w-4" />
                {showPalette ? 'Hide Question Palette' : 'Open Question Palette'}
              </button>
            </div>

            <div className="hidden xl:block">
              <QuestionPalette items={paletteItems} onSelect={jumpToQuestion} />
            </div>

            <AnimatePresence>
              {showPalette ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="xl:hidden"
                >
                  <QuestionPalette items={paletteItems} onSelect={jumpToQuestion} />
                </motion.div>
              ) : null}
            </AnimatePresence>

            <WebcamPreviewCard
              stream={webcamStream}
              status={webcamStatus}
              message={webcamMessage}
              facePresenceStatus={facePresenceStatus}
              faceCount={faceCount}
            />

            <div className="dashboard-panel rounded-[1.5rem] p-4">
              <div className="flex items-center gap-2">
                <FileIcon className="h-4 w-4 text-[var(--dashboard-accent-foreground)]" />
                <p className="text-sm font-semibold text-[var(--dashboard-text)]">Session tracking</p>
              </div>
              <p className="mt-3 text-sm leading-6 text-[var(--dashboard-muted)]">
                Attempt ID: {attemptId ?? 'Starting...'}.
                {' '}
                {isBootingSession
                  ? 'Secure session is booting.'
                  : 'Your session is being monitored for assessment integrity in this browser session.'}
              </p>
              <div className="mt-4 space-y-2 text-xs text-[var(--dashboard-muted)]">
                <p>Fullscreen: {isFullscreenEnabled ? 'Enabled' : 'Not enabled'}</p>
                <p>Warnings: {warnings} / {warningLimit}</p>
                <p>Save state: {saveMessage}</p>
                <p>
                  Detector:{' '}
                  {faceDetectionEngine === 'native'
                    ? 'native browser detector'
                    : faceDetectionEngine === 'tfjs'
                      ? 'TensorFlow.js fallback'
                      : 'not available'}
                </p>
                <p>
                  Face scan:{' '}
                  {facePresenceStatus === 'multiple'
                    ? `${faceCount} persons detected`
                    : facePresenceStatus === 'single'
                      ? 'single person confirmed'
                      : facePresenceStatus === 'unsupported'
                        ? 'not available in this browser'
                        : 'checking'}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <video ref={hiddenVideoRef} muted playsInline className="hidden" />

      <WarningModal
        open={showWarningModal}
        onClose={() => setShowWarningModal(false)}
        title={warningState?.title}
        description={warningState?.description}
        warningCount={warnings}
        warningLimit={warningLimit}
      />
      <SubmitConfirmModal
        open={showSubmitModal}
        unansweredCount={unansweredCount}
        flaggedCount={flagged.length}
        onReview={() => setShowSubmitModal(false)}
        onSubmit={() => void handleSubmit()}
      />
    </AssessmentLayout>
  );
}
