import { Injectable, NotFoundException } from '@nestjs/common';
import { createHash, randomUUID } from 'crypto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ListStudentCertificatesQueryDto } from './dto/list-student-certificates-query.dto';

@Injectable()
export class CertificatesService {
  constructor(private readonly prisma: PrismaService) {}

  async listStudentCertificates(studentId: string, query: ListStudentCertificatesQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 6;
    const skip = (page - 1) * pageSize;

    const [items, total, latestCertificate, pendingUnlocks] = await Promise.all([
      this.prisma.certificate.findMany({
        where: { studentId },
        include: {
          exam: true,
          attempt: true,
          student: true,
        },
        orderBy: {
          issuedAt: 'desc',
        },
        skip,
        take: pageSize,
      }),
      this.prisma.certificate.count({
        where: { studentId },
      }),
      this.prisma.certificate.findFirst({
        where: { studentId },
        orderBy: {
          issuedAt: 'desc',
        },
      }),
      this.prisma.examAttempt.count({
        where: {
          studentId,
          submittedAt: { not: null },
          certificate: null,
        },
      }),
    ]);

    return {
      overview: {
        totalIssued: String(total),
        shareableNow: String(total),
        pendingUnlocks: String(pendingUnlocks),
        latestIssued: latestCertificate ? this.formatDate(latestCertificate.issuedAt) : 'Not issued yet',
      },
      items: items.map((certificate) => this.mapStudentCertificate(certificate)),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    };
  }

  async getStudentCertificateDetail(studentId: string, id: string) {
    const certificate = await this.prisma.certificate.findFirst({
      where: {
        id,
        studentId,
      },
      include: {
        exam: true,
        attempt: true,
        student: true,
      },
    });

    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }

    return this.mapStudentCertificate(certificate);
  }

  async getStudentCertificateDownload(studentId: string, id: string) {
    const certificate = await this.prisma.certificate.findFirst({
      where: {
        id,
        studentId,
      },
      include: {
        exam: true,
        attempt: true,
        student: true,
      },
    });

    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }

    const mapped = this.mapStudentCertificate(certificate);
    const fileName = `${this.slugify(certificate.exam.title)}-certificate.svg`;

    return {
      fileName,
      mimeType: 'image/svg+xml; charset=utf-8',
      content: this.renderCertificateSvg(mapped),
    };
  }

  async issueCertificate(attemptId: string) {
    const attempt = await this.prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        exam: true,
        student: true,
      },
    });

    if (!attempt) {
      throw new NotFoundException('Attempt not found');
    }

    const existing = await this.prisma.certificate.findUnique({
      where: { attemptId },
    });

    if (existing) {
      return existing;
    }

    const certificateNumber = `CERT-${randomUUID().slice(0, 8).toUpperCase()}`;
    const verificationHash = createHash('sha256')
      .update(`${attempt.examId}:${attempt.studentId}:${certificateNumber}`)
      .digest('hex');

    return this.prisma.certificate.create({
      data: {
        examId: attempt.examId,
        attemptId,
        studentId: attempt.studentId,
        certificateNumber,
        verificationHash,
        metadata: {
          studentName: `${attempt.student.firstName} ${attempt.student.lastName}`,
          examTitle: attempt.exam.title,
          score: attempt.score,
          issuedAt: new Date().toISOString(),
        } as Prisma.InputJsonValue,
      },
    });
  }

  async verifyCertificate(certificateNumber: string) {
    const certificate = await this.prisma.certificate.findUnique({
      where: { certificateNumber },
      include: {
        exam: true,
        student: true,
      },
    });

    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }

    return {
      verified: true,
      certificateNumber: certificate.certificateNumber,
      issuedAt: certificate.issuedAt,
      student: {
        firstName: certificate.student.firstName,
        lastName: certificate.student.lastName,
      },
      exam: {
        title: certificate.exam.title,
      },
      verificationHash: certificate.verificationHash,
    };
  }

  private mapStudentCertificate(certificate: {
    id: string;
    certificateNumber: string;
    issuedAt: Date;
    verificationHash: string;
    exam: { title: string };
    attempt: {
      score: number | null;
      maxScore: number;
      percentage: number | null;
      submittedAt: Date | null;
    };
    student: {
      firstName: string;
      lastName: string;
      school: string | null;
      course: string | null;
    };
  }) {
    const percentage = Math.round(certificate.attempt.percentage ?? 0);
    const fullName = `${certificate.student.firstName} ${certificate.student.lastName}`;
    const field = certificate.student.course ?? this.getExamField(certificate.exam.title);

    return {
      id: certificate.id,
      title: certificate.exam.title,
      field,
      score: `${percentage}%`,
      grade: this.getGradeFromPercentage(percentage),
      verificationId: certificate.certificateNumber,
      issuedAt: this.formatDate(certificate.issuedAt),
      status: 'Issued' as const,
      recipientName: fullName,
      readinessLevel: this.getReadinessLabel(percentage),
      summary: `Awarded for verified performance in ${certificate.exam.title}, reflecting graduate readiness across ${field.toLowerCase()} assessment conditions.`,
      eligibilityNote: 'Issued and ready to share with employers, schools, and institutional partners.',
      skillSignals: this.getSkillSignals(certificate.exam.title, field),
      organization: 'GradAssess AI',
      assessmentDate: this.formatDate(certificate.attempt.submittedAt ?? certificate.issuedAt),
      expires: 'Does not expire',
      href: `/certificates/${certificate.id}`,
      verificationHash: certificate.verificationHash,
      school: certificate.student.school ?? 'Not set',
      marks: `${this.formatMarks(certificate.attempt.score ?? 0)}/${this.formatMarks(certificate.attempt.maxScore)}`,
    };
  }

  private renderCertificateSvg(certificate: ReturnType<CertificatesService['mapStudentCertificate']>) {
    const titleLines = this.wrapText(certificate.title, 34);
    const nameLines = this.wrapText(certificate.recipientName, 24);
    const summaryLines = this.wrapText(
      `Successfully demonstrated verified graduate readiness through the ${certificate.title}.`,
      64,
    );

    const titleSpans = titleLines
      .map((line, index) => `<tspan x="700" dy="${index === 0 ? 0 : 44}">${this.escapeXml(line)}</tspan>`)
      .join('');
    const nameSpans = nameLines
      .map((line, index) => `<tspan x="700" dy="${index === 0 ? 0 : 56}">${this.escapeXml(line)}</tspan>`)
      .join('');
    const summarySpans = summaryLines
      .map((line, index) => `<tspan x="700" dy="${index === 0 ? 0 : 28}">${this.escapeXml(line)}</tspan>`)
      .join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1400" height="1040" viewBox="0 0 1400 1040" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="pageBg" x1="180" y1="48" x2="1240" y2="930" gradientUnits="userSpaceOnUse">
      <stop stop-color="#EEF4E7"/>
      <stop offset="1" stop-color="#DDE8D6"/>
    </linearGradient>
    <linearGradient id="brandOrb" x1="0" y1="0" x2="0" y2="72" gradientUnits="userSpaceOnUse">
      <stop stop-color="#9FDC86"/>
      <stop offset="1" stop-color="#6DB56C"/>
    </linearGradient>
    <linearGradient id="accentGlow" x1="238" y1="210" x2="1154" y2="792" gradientUnits="userSpaceOnUse">
      <stop stop-color="#7D75F0" stop-opacity="0.18"/>
      <stop offset="1" stop-color="#8CF0B7" stop-opacity="0.14"/>
    </linearGradient>
    <filter id="softShadow" x="88" y="88" width="1224" height="920" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="BackgroundImageFix"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dy="26"/>
      <feGaussianBlur stdDeviation="34"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.1 0 0 0 0 0.16 0 0 0 0 0.12 0 0 0 0.12 0"/>
      <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1_1"/>
      <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1_1" result="shape"/>
    </filter>
  </defs>

  <rect width="1400" height="1040" rx="40" fill="url(#pageBg)"/>
  <circle cx="138" cy="136" r="118" fill="#A9D98E" fill-opacity="0.72"/>
  <path d="M1178 116C1178 80.6538 1206.65 52 1242 52H1400V420H1178V116Z" fill="#BDD7A5" fill-opacity="0.86"/>
  <path d="M88 842C88 803.34 119.34 772 158 772H252V1040H88V842Z" fill="#D3F0DD"/>
  <rect x="1164" y="796" width="116" height="116" rx="34" transform="rotate(12 1164 796)" fill="#F0DE76"/>
  <circle cx="162" cy="260" r="26" stroke="#49C58E" stroke-width="12" stroke-opacity="0.9"/>

  <g opacity="0.64" fill="#7D75F0">
    ${Array.from({ length: 20 })
      .map((_, index) => {
        const col = index % 5;
        const row = Math.floor(index / 5);
        return `<circle cx="${1044 + col * 18}" cy="${156 + row * 18}" r="4.5"/>`;
      })
      .join('')}
    ${Array.from({ length: 15 })
      .map((_, index) => {
        const col = index % 5;
        const row = Math.floor(index / 5);
        return `<circle cx="${120 + col * 18}" cy="${786 + row * 18}" r="4.5"/>`;
      })
      .join('')}
  </g>

  <g filter="url(#softShadow)">
    <rect x="130" y="112" width="1140" height="820" rx="34" fill="#FDFDF8"/>
    <rect x="164" y="146" width="1072" height="640" rx="28" fill="white" stroke="#EEF1E7" stroke-width="2"/>
  </g>

  <rect x="166" y="148" width="1068" height="636" rx="28" fill="url(#accentGlow)" fill-opacity="0.4"/>
  <circle cx="700" cy="214" r="36" fill="url(#brandOrb)"/>
  <text x="700" y="227" text-anchor="middle" fill="#243200" font-size="26" font-weight="800" font-family="Inter, Arial, sans-serif">GA</text>

  <text x="700" y="286" text-anchor="middle" fill="#7A8A7F" font-size="15" font-weight="700" letter-spacing="4.6" font-family="Inter, Arial, sans-serif">GRADASSESS AI</text>
  <text x="700" y="338" text-anchor="middle" fill="#1F2C22" font-size="50" font-weight="700" font-family="Inter, Arial, sans-serif">${titleSpans}</text>
  <text x="700" y="446" text-anchor="middle" fill="#6A786F" font-size="24" font-weight="500" font-family="Inter, Arial, sans-serif">${this.escapeXml(certificate.field)}</text>
  <text x="700" y="526" text-anchor="middle" fill="#1F2C22" font-size="64" font-weight="700" font-family="Inter, Arial, sans-serif">${nameSpans}</text>
  <text x="700" y="640" text-anchor="middle" fill="#5B6C61" font-size="22" font-weight="400" font-family="Inter, Arial, sans-serif">${summarySpans}</text>

  <g>
    <rect x="256" y="678" width="228" height="124" rx="24" fill="#F3F7EE"/>
    <rect x="506" y="678" width="228" height="124" rx="24" fill="#F3F7EE"/>
    <rect x="756" y="678" width="228" height="124" rx="24" fill="#F3F7EE"/>

    <text x="292" y="718" fill="#7A8A7F" font-size="12" font-weight="700" letter-spacing="3.2" font-family="Inter, Arial, sans-serif">SCORE</text>
    <text x="292" y="772" fill="#243022" font-size="36" font-weight="700" font-family="Inter, Arial, sans-serif">${this.escapeXml(certificate.score)}</text>

    <text x="542" y="718" fill="#7A8A7F" font-size="12" font-weight="700" letter-spacing="3.2" font-family="Inter, Arial, sans-serif">GRADE</text>
    <text x="542" y="772" fill="#243022" font-size="36" font-weight="700" font-family="Inter, Arial, sans-serif">${this.escapeXml(certificate.grade)}</text>

    <text x="792" y="718" fill="#7A8A7F" font-size="12" font-weight="700" letter-spacing="3.2" font-family="Inter, Arial, sans-serif">ISSUED</text>
    <text x="792" y="772" fill="#243022" font-size="24" font-weight="700" font-family="Inter, Arial, sans-serif">${this.escapeXml(certificate.issuedAt)}</text>
  </g>

  <line x1="256" y1="836" x2="1144" y2="836" stroke="#EEF1E7" stroke-width="2"/>

  <g>
    <line x1="284" y1="876" x2="448" y2="876" stroke="#243022" stroke-width="2"/>
    <text x="284" y="926" fill="#243022" font-size="20" font-weight="700" font-family="Inter, Arial, sans-serif">Assessment Verification</text>
    <text x="284" y="954" fill="#7A8A7F" font-size="16" font-weight="500" font-family="Inter, Arial, sans-serif">Verified by ${this.escapeXml(certificate.organization)}</text>
  </g>

  <g transform="translate(1010 846)">
    <circle cx="62" cy="62" r="54" stroke="#8D7EF0" stroke-width="8"/>
    <text x="62" y="54" text-anchor="middle" fill="#6253DF" font-size="14" font-weight="700" font-family="Inter, Arial, sans-serif">VERIFIED</text>
    <text x="62" y="74" text-anchor="middle" fill="#6253DF" font-size="14" font-weight="700" font-family="Inter, Arial, sans-serif">READY</text>
  </g>

  <text x="906" y="954" fill="#7A8A7F" font-size="13" font-weight="700" letter-spacing="2.8" font-family="Inter, Arial, sans-serif">${this.escapeXml(certificate.verificationId)}</text>
  <text x="256" y="994" fill="#607066" font-size="16" font-weight="500" font-family="Inter, Arial, sans-serif">Assessment date: ${this.escapeXml(certificate.assessmentDate)}</text>
  <text x="600" y="994" fill="#607066" font-size="16" font-weight="500" font-family="Inter, Arial, sans-serif">Readiness level: ${this.escapeXml(certificate.readinessLevel)}</text>
  <text x="930" y="994" fill="#607066" font-size="16" font-weight="500" font-family="Inter, Arial, sans-serif">${this.escapeXml(certificate.marks ?? '')}</text>
</svg>`;
  }

  private wrapText(value: string, maxLength: number) {
    const words = value.trim().split(/\s+/);
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const nextLine = currentLine ? `${currentLine} ${word}` : word;
      if (nextLine.length <= maxLength) {
        currentLine = nextLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
        }
        currentLine = word;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines.slice(0, 3);
  }

  private escapeXml(value: string) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private slugify(value: string) {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private getExamField(title: string) {
    const normalizedTitle = title.toLowerCase();
    if (normalizedTitle.includes('law')) return 'Law';
    if (normalizedTitle.includes('engineer')) return 'Engineering';
    if (normalizedTitle.includes('tech')) return 'Technology';
    return 'General';
  }

  private getGradeFromPercentage(percentage: number) {
    if (percentage >= 98) return 'Excellent';
    if (percentage >= 90) return 'Credit';
    if (percentage >= 80) return 'Pass';
    return 'Needs work';
  }

  private getReadinessLabel(score: number) {
    if (score >= 80) return 'Job-Ready';
    if (score >= 60) return 'Developing';
    return 'Beginner';
  }

  private getSkillSignals(title: string, field: string) {
    const normalizedTitle = title.toLowerCase();
    if (normalizedTitle.includes('law') || field.toLowerCase().includes('law')) {
      return ['Legal reasoning', 'Research structure', 'Written clarity'];
    }
    if (normalizedTitle.includes('engineer') || field.toLowerCase().includes('engineer')) {
      return ['Systems thinking', 'Technical judgment', 'Analytical consistency'];
    }
    return ['Problem solving', 'Technical communication', 'Practical readiness'];
  }

  private formatDate(date: Date) {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  }

  private formatMarks(value: number) {
    return Number.isInteger(value) ? `${value}` : value.toFixed(1);
  }
}
