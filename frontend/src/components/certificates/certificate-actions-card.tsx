'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { StudentCertificate } from '@/data/certificates-data';
import { emitAppToast } from '@/components/ui/app-toast';
import { downloadStudentCertificateRequest } from '@/lib/student-dashboard-api';

function getVerificationUrl(certificateNumber: string) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
  if (apiBaseUrl) {
    return `${apiBaseUrl}/certificates/verify/${certificateNumber}`;
  }

  if (typeof window !== 'undefined') {
    return `${window.location.origin}/certificates/verify/${certificateNumber}`;
  }

  return `/certificates/verify/${certificateNumber}`;
}

export function CertificateActionsCard({ certificate }: { certificate: StudentCertificate }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const handleDownload = async () => {
    if (certificate.status !== 'Issued') return;

    setIsDownloading(true);
    try {
      const { blob, fileName } = await downloadStudentCertificateRequest(certificate.id);
      const objectUrl = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = objectUrl;
      downloadLink.download = fileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);

      emitAppToast({
        title: 'Certificate ready',
        description: 'Your certificate file has been saved to your device.',
        tone: 'success',
      });
    } catch (error) {
      emitAppToast({
        title: 'Unable to download certificate',
        description:
          error instanceof Error
            ? error.message
            : 'We could not download your certificate right now.',
        tone: 'error',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    if (certificate.status !== 'Issued') return;

    const verificationUrl = getVerificationUrl(certificate.verificationId);
    const canUseNativeShare = typeof navigator.share === 'function';
    setIsSharing(true);

    try {
      if (canUseNativeShare) {
        await navigator.share({
          title: `${certificate.title} Verification`,
          text: `Verify ${certificate.recipientName}'s GradAssess AI certificate.`,
          url: verificationUrl,
        });
      } else {
        await navigator.clipboard.writeText(verificationUrl);
      }

      emitAppToast({
        title: 'Verification link ready',
        description: canUseNativeShare
          ? 'The verification link has been shared.'
          : 'The verification link has been copied to your clipboard.',
        tone: 'success',
      });
    } catch (error) {
      emitAppToast({
        title: 'Unable to share link',
        description:
          error instanceof Error
            ? error.message
            : 'We could not share the verification link right now.',
        tone: 'error',
      });
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="dashboard-panel rounded-[1.8rem] p-5">
      <p className="text-sm font-semibold text-[var(--dashboard-text)]">Actions</p>
      <div className="mt-4 flex flex-col gap-3">
        <button
          type="button"
          onClick={() => void handleDownload()}
          disabled={certificate.status !== 'Issued' || isDownloading}
          className="dashboard-lime-panel rounded-2xl px-4 py-3 text-sm font-semibold text-[#223200] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isDownloading ? 'Preparing Certificate...' : 'Download Certificate'}
        </button>
        <button
          type="button"
          onClick={() => void handleShare()}
          disabled={certificate.status !== 'Issued' || isSharing}
          className="dashboard-dark-button rounded-2xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSharing ? 'Sharing...' : 'Share Verification Link'}
        </button>
        <Link
          href="/results"
          className="dashboard-dark-button inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition"
        >
          Back to Results
        </Link>
      </div>
    </div>
  );
}
