import { useEffect, useRef } from 'react';
import { CameraIcon } from './icons';

type WebcamPreviewCardProps = {
  stream: MediaStream | null;
  status: 'active' | 'requesting' | 'blocked' | 'unsupported';
  message?: string;
  facePresenceStatus?: 'single' | 'multiple' | 'unsupported' | 'checking';
  faceCount?: number;
};

export function WebcamPreviewCard({
  stream,
  status,
  message,
  facePresenceStatus = 'checking',
  faceCount = 0,
}: WebcamPreviewCardProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;
    if (stream) {
      videoRef.current.srcObject = stream;
      void videoRef.current.play().catch(() => undefined);
      return;
    }

    videoRef.current.srcObject = null;
  }, [stream]);

  const label =
    status === 'active'
      ? 'Webcam Active'
      : status === 'requesting'
        ? 'Connecting Webcam'
        : status === 'blocked'
          ? 'Webcam Blocked'
          : 'Webcam Unsupported';

  return (
    <div className="dashboard-panel rounded-[1.5rem] p-4">
      <div className="flex items-center gap-2">
        <CameraIcon className="h-4 w-4 text-[var(--dashboard-accent-foreground)]" />
        <p className="text-sm font-semibold text-[var(--dashboard-text)]">{label}</p>
      </div>
      <div className="mt-3 overflow-hidden rounded-[1.2rem] border border-[var(--dashboard-panel-border)] bg-[linear-gradient(180deg,rgba(22,32,26,0.95),rgba(12,18,14,0.98))]">
        {stream ? (
          <video ref={videoRef} muted playsInline className="h-32 w-full object-cover" />
        ) : (
          <div className="grid h-32 place-items-center px-4 text-center text-xs text-[var(--dashboard-muted)]">
            {status === 'requesting'
              ? 'Requesting camera access...'
              : message ?? 'Camera preview will appear here when access is granted.'}
          </div>
        )}
      </div>
      <p className="mt-3 text-xs leading-5 text-[var(--dashboard-muted)]">
        {message ??
          'Your camera preview is active for assessment integrity monitoring in this browser session.'}
      </p>
      <div className="mt-3 rounded-[1rem] border border-[var(--dashboard-panel-border)] bg-[var(--dashboard-soft-tile-bg)] px-3 py-3 text-xs text-[var(--dashboard-muted)]">
        {facePresenceStatus === 'single'
          ? 'Face detection: one person in frame.'
          : facePresenceStatus === 'multiple'
            ? `Face detection: ${faceCount} people detected in frame.`
            : facePresenceStatus === 'unsupported'
              ? 'Face detection is not available in this browser.'
              : 'Face detection is checking the current camera frame...'}
      </div>
    </div>
  );
}
