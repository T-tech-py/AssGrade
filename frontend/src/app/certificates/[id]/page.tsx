import { StudentCertificateDetailClient } from '@/components/certificates/student-certificate-detail-client';

export default async function CertificateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <StudentCertificateDetailClient id={id} />;
}
