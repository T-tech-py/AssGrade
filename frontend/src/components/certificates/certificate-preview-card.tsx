import type { StudentCertificate } from '@/data/certificates-data';

export function CertificatePreviewCard({ certificate }: { certificate: StudentCertificate }) {
  return (
    <div id="student-certificate-preview" className="dashboard-panel-strong rounded-[2rem] p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--dashboard-accent-foreground)]">
            Certificate preview
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--dashboard-muted)]">
            This is the visual style the downloaded certificate will follow.
          </p>
        </div>
        <div className="dashboard-soft-tile rounded-[1.2rem] px-4 py-3 text-right">
          <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--dashboard-subtle)]">Verification ID</p>
          <p className="mt-1 text-sm font-semibold text-[var(--dashboard-text)]">{certificate.verificationId}</p>
        </div>
      </div>

      <div className="mt-6 rounded-[2rem] bg-[linear-gradient(180deg,#eef4e8,#dde8d7)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:bg-[linear-gradient(180deg,#1d2b22,#162119)] sm:p-6">
        <div className="relative overflow-hidden rounded-[1.85rem] bg-[#fdfdf9] p-5 shadow-[0_24px_80px_rgba(27,39,33,0.14)] dark:bg-[#f7f8f2] sm:p-8">
          <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-[#d9ef78]/70" />
          <div className="absolute -right-12 top-12 h-40 w-40 rounded-bl-[100px] rounded-tl-[120px] bg-[#b8d9a2]/80" />
          <div className="absolute -bottom-10 left-8 h-28 w-28 rounded-tr-[80px] rounded-tl-[18px] bg-[#d4f3df]" />
          <div className="absolute -bottom-8 right-10 h-20 w-20 rotate-12 rounded-[1.5rem] bg-[#f2dd78]/90" />
          <div className="absolute left-10 top-24 h-10 w-10 rounded-full border-[8px] border-[#4cc58f]/80" />
          <div className="absolute right-20 top-20 grid grid-cols-5 gap-2 opacity-60">
            {Array.from({ length: 20 }).map((_, index) => (
              <span key={index} className="h-1.5 w-1.5 rounded-full bg-[#7b73ef]" />
            ))}
          </div>
          <div className="absolute left-8 bottom-10 grid grid-cols-5 gap-2 opacity-55">
            {Array.from({ length: 15 }).map((_, index) => (
              <span key={index} className="h-1.5 w-1.5 rounded-full bg-[#7b73ef]" />
            ))}
          </div>

          <div className="relative rounded-[1.6rem] border border-[#eef1e7] bg-white px-5 py-8 shadow-[0_10px_36px_rgba(27,39,33,0.08)] sm:px-8 sm:py-10">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(180deg,#9fdc86,#6db56c)] text-lg font-bold text-[#223200]">
                GA
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#7a8a7f]">GradAssess AI</p>
              <h3 className="mt-5 text-[1.5rem] font-semibold tracking-[-0.04em] text-[#253226] sm:text-[1.9rem]">
                Certificate of Employability Readiness
              </h3>
              <p className="mt-2 text-sm font-medium text-[#6a786f]">{certificate.field}</p>
              <p className="mt-5 text-[2rem] font-semibold tracking-[-0.05em] text-[#1f2c22] sm:text-[2.5rem]">
                {certificate.recipientName}
              </p>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#5b6c61]">
                Successfully demonstrated strong graduate readiness across structured assessment, practical reasoning, and employability indicators through the {certificate.title}.
              </p>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.2rem] bg-[#f3f7ee] px-4 py-4 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7a8a7f]">Score</p>
                <p className="mt-2 text-xl font-semibold text-[#243022]">{certificate.score}</p>
              </div>
              <div className="rounded-[1.2rem] bg-[#f3f7ee] px-4 py-4 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7a8a7f]">Grade</p>
                <p className="mt-2 text-xl font-semibold text-[#243022]">{certificate.grade}</p>
              </div>
              <div className="rounded-[1.2rem] bg-[#f3f7ee] px-4 py-4 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7a8a7f]">Issued</p>
                <p className="mt-2 text-sm font-semibold text-[#243022]">{certificate.issuedAt}</p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-6 border-t border-[#eef1e7] pt-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="h-px w-32 bg-[#243022]" />
                <p className="mt-3 text-sm font-semibold text-[#243022]">Assessment Verification</p>
                <p className="text-xs text-[#7a8a7f]">Verified by {certificate.organization}</p>
              </div>
              <div className="text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-4 border-[#8d7ef0] text-center text-[11px] font-semibold leading-4 text-[#6253df]">
                  VERIFIED
                </div>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#7a8a7f]">
                  {certificate.verificationId}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
