import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { createHash, randomUUID } from 'crypto';
import {
  AdminRequestStatus,
  AIArtifactType,
  AttemptStatus,
  ExamStatus,
  Prisma,
  ProctorEventType,
  UserRole,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ListAdminAssessmentsQueryDto } from './dto/list-admin-assessments-query.dto';
import { ListAdminAttemptsQueryDto } from './dto/list-admin-attempts-query.dto';
import { ListAdminCertificatesQueryDto } from './dto/list-admin-certificates-query.dto';
import { ListAdminSecurityQueryDto } from './dto/list-admin-security-query.dto';
import { ListAdminUsersQueryDto } from './dto/list-admin-users-query.dto';
import { UpdateAdminSecurityStatusDto } from './dto/update-admin-security-status.dto';

type AdminExamRecord = Prisma.ExamGetPayload<{
  select: {
    id: true;
    title: true;
    slug: true;
    status: true;
    createdAt: true;
    updatedAt: true;
    _count: {
      select: {
        attempts: true;
        questions: true;
      };
    };
  };
}>;

type AdminAttemptRecord = Prisma.ExamAttemptGetPayload<{
  select: {
    id: true;
    status: true;
    percentage: true;
    suspiciousFlags: true;
    createdAt: true;
    submittedAt: true;
    exam: {
      select: {
        title: true;
        slug: true;
      };
    };
    student: {
      select: {
        firstName: true;
        lastName: true;
      };
    };
  };
}>;

type AdminCertificateRecord = Prisma.CertificateGetPayload<{
  select: {
    id: true;
    issuedAt: true;
    exam: {
      select: {
        title: true;
      };
    };
    student: {
      select: {
        firstName: true;
        lastName: true;
      };
    };
  };
}>;

type AdminProctorEventRecord = Prisma.ProctorEventGetPayload<{
  select: {
    id: true;
    type: true;
    severity: true;
    createdAt: true;
    attempt: {
      select: {
        exam: {
          select: {
            title: true;
          };
        };
        student: {
          select: {
            firstName: true;
            lastName: true;
          };
        };
      };
    };
  };
}>;

type AdminAiArtifactRecord = Prisma.AIArtifactGetPayload<{
  select: {
    id: true;
    createdAt: true;
    topic: true;
  };
}>;

type SecurityReviewStatus = 'Open' | 'Reviewed' | 'Escalated' | 'Cleared';

@Injectable()
export class AdminService {
  private static readonly CERTIFICATE_ELIGIBILITY_PERCENTAGE = 70;

  constructor(private readonly prisma: PrismaService) {}

  async getDashboardSummary() {
    const now = new Date();
    const todayStart = this.startOfDay(now);
    const sixDaysAgo = new Date(todayStart);
    sixDaysAgo.setDate(todayStart.getDate() - 6);

    const [
      students,
      admins,
      exams,
      attempts,
      certificates,
      proctorEvents,
      aiArtifacts,
      averageScoreAggregate,
    ] = await Promise.all([
      this.prisma.user.findMany({
        where: { role: UserRole.STUDENT },
        select: { createdAt: true },
      }),
      this.prisma.user.count({ where: { role: UserRole.ADMIN } }),
      this.prisma.exam.findMany({
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              attempts: true,
              questions: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.examAttempt.findMany({
        select: {
          id: true,
          status: true,
          percentage: true,
          suspiciousFlags: true,
          createdAt: true,
          submittedAt: true,
          exam: {
            select: {
              title: true,
              slug: true,
            },
          },
          student: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.certificate.findMany({
        select: {
          id: true,
          issuedAt: true,
          exam: {
            select: {
              title: true,
            },
          },
          student: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { issuedAt: 'desc' },
      }),
      this.prisma.proctorEvent.findMany({
        select: {
          id: true,
          type: true,
          severity: true,
          createdAt: true,
          attempt: {
            select: {
              exam: {
                select: {
                  title: true,
                },
              },
              student: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.aIArtifact.findMany({
        where: { type: AIArtifactType.QUESTION_SUGGESTION },
        select: {
          id: true,
          createdAt: true,
          topic: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.examAttempt.aggregate({
        _avg: {
          percentage: true,
        },
        where: {
          percentage: { not: null },
        },
      }),
    ]);

    const totalStudents = students.length;
    const totalAdmins = admins;
    const publishedExams = exams.filter((exam: AdminExamRecord) => exam.status === ExamStatus.PUBLISHED).length;
    const totalAttempts = attempts.length;
    const certificatesIssued = certificates.length;
    const flaggedSecurityEvents = proctorEvents.filter((event: AdminProctorEventRecord) => event.severity >= 2).length;
    const averagePlatformScore = Math.round(averageScoreAggregate._avg.percentage ?? 0);
    const studentsThisMonth = students.filter((student: { createdAt: Date }) => student.createdAt >= this.startOfMonth(now)).length;
    const draftsCount = exams.filter((exam: AdminExamRecord) => exam.status === ExamStatus.DRAFT).length;
    const inProgressAttempts = attempts.filter((attempt: AdminAttemptRecord) => attempt.status === AttemptStatus.IN_PROGRESS).length;
    const publishedThisWeek = exams.filter((exam: AdminExamRecord) => exam.createdAt >= this.daysAgoStart(now, 7)).length;
    const reissuedLikeCount = Math.max(
      0,
      certificates.filter((certificate: AdminCertificateRecord) => certificate.issuedAt >= this.startOfMonth(now)).length - 1,
    );
    const flaggedAttempts = attempts.filter((attempt: AdminAttemptRecord) => attempt.suspiciousFlags > 0).length;
    const reviewedAttempts = attempts.filter((attempt: AdminAttemptRecord) => typeof attempt.percentage === 'number');
    const passedAttempts = reviewedAttempts.filter((attempt: AdminAttemptRecord) => this.isCertificateEligible(attempt.percentage ?? 0)).length;

    const attemptsTrend = this.buildAttemptsTrend(attempts, sixDaysAgo, todayStart);
    const passFailDistribution = this.buildPassFailDistribution(reviewedAttempts);
    const topCategories = this.buildTopCategories(attempts);
    const recentActivity = this.buildRecentActivity(exams, certificates, proctorEvents, aiArtifacts);

    return {
      metrics: [
        {
          title: 'Total Students',
          value: this.formatInteger(totalStudents),
          helper: `${this.formatInteger(studentsThisMonth)} added this month`,
          trend: totalStudents === 0 ? 'No data' : `+${Math.max(1, Math.round((studentsThisMonth / Math.max(totalStudents, 1)) * 100))}%`,
          tone: 'accent',
          icon: 'users',
        },
        {
          title: 'Active Assessments',
          value: this.formatInteger(publishedExams),
          helper: `${this.formatInteger(publishedThisWeek)} published this week`,
          trend: `+${publishedExams}`,
          tone: 'neutral',
          icon: 'assessments',
        },
        {
          title: 'Total Attempts',
          value: this.formatInteger(totalAttempts),
          helper: `${this.formatInteger(inProgressAttempts)} currently in progress`,
          trend: reviewedAttempts.length === 0 ? 'No data' : `+${Math.max(1, Math.round((reviewedAttempts.length / Math.max(totalAttempts, 1)) * 10))}%`,
          tone: 'warm',
          icon: 'attempts',
        },
        {
          title: 'Certificates Issued',
          value: this.formatInteger(certificatesIssued),
          helper: `${this.formatInteger(reissuedLikeCount)} issued this month`,
          trend: certificatesIssued > 0 ? 'Healthy' : 'Pending',
          tone: 'success',
          icon: 'certificates',
        },
        {
          title: 'Flagged Security Events',
          value: this.formatInteger(flaggedSecurityEvents),
          helper: `${this.formatInteger(flaggedAttempts)} attempts need review`,
          trend: flaggedSecurityEvents > 0 ? 'Review' : 'Clear',
          tone: flaggedSecurityEvents > 0 ? 'danger' : 'neutral',
          icon: 'security',
        },
        {
          title: 'Average Platform Score',
          value: `${averagePlatformScore}%`,
          helper: `${this.formatInteger(passedAttempts)} passing attempts on record`,
          trend: reviewedAttempts.length === 0 ? 'No data' : `${averagePlatformScore >= AdminService.CERTIFICATE_ELIGIBILITY_PERCENTAGE ? '+' : ''}${averagePlatformScore - 70}%`,
          tone: 'neutral',
          icon: 'score',
        },
      ],
      attemptsTrend,
      passFailDistribution,
      topCategories,
      recentActivity,
      quickActions: [
        {
          title: 'Create New Assessment',
          description: draftsCount > 0
            ? `${this.formatInteger(draftsCount)} draft assessment${draftsCount === 1 ? '' : 's'} already in progress.`
            : 'Launch a new graduate-readiness exam with formats, rules, and timing.',
          href: '/admin/assessments',
          icon: 'bolt',
        },
        {
          title: 'Review Flagged Attempts',
          description: flaggedAttempts > 0
            ? `${this.formatInteger(flaggedAttempts)} flagged attempt${flaggedAttempts === 1 ? '' : 's'} need attention.`
            : 'No flagged attempts need review right now.',
          href: '/admin/security',
          icon: 'security',
        },
        {
          title: 'Review Certificates',
          description: certificatesIssued > 0
            ? `${this.formatInteger(certificates.filter((certificate: AdminCertificateRecord) => certificate.issuedAt >= this.daysAgoStart(now, 7)).length)} certificates issued this week.`
            : 'No certificates have been issued yet.',
          href: '/admin/certificates',
          icon: 'certificates',
        },
      ],
      meta: {
        totalAdmins,
        totalExams: exams.length,
      },
    };
  }

  async listUsers(query: ListAdminUsersQueryDto) {
    const now = new Date();
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const where = this.buildUserFilters(query, now);

    const [users, total, availableFields] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: [{ lastLoginAt: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          course: true,
          level: true,
          school: true,
          role: true,
          adminRequestStatus: true,
          adminRequestRequestedAt: true,
          adminRequestReviewedAt: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          _count: {
            select: {
              attempts: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where: {
          course: { not: null },
        },
        distinct: ['course'],
        select: {
          course: true,
        },
        orderBy: { course: 'asc' },
      }),
    ]);

    return {
      items: users.map((user) => this.mapAdminUser(user)),
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
        availableFields: availableFields
          .map((item) => item.course)
          .filter((value): value is string => Boolean(value)),
      },
    };
  }

  async exportUsersCsv(query: ListAdminUsersQueryDto) {
    const users = await this.prisma.user.findMany({
      where: this.buildUserFilters(query, new Date()),
      orderBy: [{ lastLoginAt: 'desc' }, { createdAt: 'desc' }],
      select: {
        firstName: true,
        lastName: true,
        email: true,
        course: true,
        level: true,
        school: true,
        phone: true,
        location: true,
        role: true,
        adminRequestStatus: true,
        adminRequestRequestedAt: true,
        adminRequestReviewedAt: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        _count: {
          select: {
            attempts: true,
            certificates: true,
          },
        },
      },
    });

    const rows = [
      [
        'Name',
        'Email',
        'Status',
        'Role',
        'Field',
        'Grad Year',
        'School',
        'Phone',
        'Location',
        'Assessments',
        'Certificates',
        'Last Active',
        'Joined At',
      ],
      ...users.map((user) => [
        this.getFullName(user.firstName, user.lastName),
        user.email,
        this.getAdminUserStatus(user),
        this.getAdminUserRoleLabel(user.role),
        user.course ?? 'Not set',
        user.level ?? 'Not set',
        user.school ?? 'Not set',
        user.phone ?? '',
        user.location ?? 'Not set',
        String(user._count.attempts),
        String(user._count.certificates),
        user.lastLoginAt ? this.formatRelativeTime(user.lastLoginAt) : 'Never signed in',
        user.createdAt.toISOString(),
      ]),
    ];

    return rows
      .map((row) => row.map((value) => this.escapeCsvValue(value)).join(','))
      .join('\n');
  }

  async getUserDetail(id: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        school: true,
        course: true,
        level: true,
        location: true,
        bio: true,
        role: true,
        adminRequestStatus: true,
        adminRequestRequestedAt: true,
        adminRequestReviewedAt: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        _count: {
          select: {
            attempts: true,
            certificates: true,
          },
        },
        attempts: {
          where: {
            percentage: { not: null },
          },
          orderBy: { createdAt: 'desc' },
          select: {
            percentage: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const averageScore =
      user.attempts.length > 0
        ? Math.round(
            user.attempts.reduce((sum, attempt) => sum + (attempt.percentage ?? 0), 0) /
              user.attempts.length,
          )
        : null;

    return {
      ...this.mapAdminUser(user),
      phone: user.phone ?? '',
      school: user.school ?? 'Not set',
      location: user.location ?? 'Not set',
      bio:
        user.bio ??
        (user.role === UserRole.ADMIN
          ? 'No admin profile note has been added yet.'
          : 'No student bio has been added yet.'),
      requestSubmittedAt: user.adminRequestRequestedAt ? this.formatDateTime(user.adminRequestRequestedAt) : null,
      requestReviewedAt: user.adminRequestReviewedAt ? this.formatDateTime(user.adminRequestReviewedAt) : null,
      stats: {
        certificatesEarned: user._count.certificates,
        averageScore: averageScore !== null ? `${averageScore}%` : 'No scored attempts yet',
      },
    };
  }

  async toggleUserStatus(id: string, actorId: string) {
    if (id === actorId) {
      throw new BadRequestException('You cannot change your own admin access from this screen.');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        id,
      },
      select: {
        id: true,
        isActive: true,
        role: true,
        adminRequestStatus: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        isActive: !user.isActive,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        course: true,
        level: true,
        school: true,
        role: true,
        adminRequestStatus: true,
        adminRequestRequestedAt: true,
        adminRequestReviewedAt: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        _count: {
          select: {
            attempts: true,
          },
        },
      },
    });

    return {
      item: this.mapAdminUser(updated),
      message: updated.isActive
        ? `${this.getAdminUserRoleLabel(updated.role)} account reactivated.`
        : `${this.getAdminUserRoleLabel(updated.role)} account suspended.`,
    };
  }

  async resetUserAccess(id: string, actorId: string) {
    if (id === actorId) {
      throw new BadRequestException('You cannot reset your own admin access from this screen.');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        id,
      },
      select: {
        id: true,
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const revoked = await this.prisma.userSession.updateMany({
      where: {
        userId: id,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    return {
      success: true,
      revokedCount: revoked.count,
      message:
        revoked.count > 0
          ? `${this.getAdminUserRoleLabel(user.role)} access has been reset and active sessions were revoked.`
          : `${this.getAdminUserRoleLabel(user.role)} access has been reset. No active sessions were found.`,
    };
  }

  async approveAdminRequest(id: string, reviewerId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        role: true,
        adminRequestStatus: true,
      },
    });

    if (!user || user.role !== UserRole.ADMIN) {
      throw new NotFoundException('Admin request not found.');
    }

    if (user.adminRequestStatus !== AdminRequestStatus.PENDING) {
      throw new BadRequestException('Only pending admin requests can be approved.');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        adminRequestStatus: AdminRequestStatus.APPROVED,
        adminRequestReviewedAt: new Date(),
        adminRequestReviewedById: reviewerId,
        adminRequestNotes: 'Approved by platform administrator.',
        isActive: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        course: true,
        level: true,
        school: true,
        role: true,
        adminRequestStatus: true,
        adminRequestRequestedAt: true,
        adminRequestReviewedAt: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        _count: {
          select: {
            attempts: true,
          },
        },
      },
    });

    return {
      item: this.mapAdminUser(updated),
      message: 'Admin request approved. The user can now log in to the admin workspace.',
    };
  }

  async rejectAdminRequest(id: string, reviewerId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        role: true,
        adminRequestStatus: true,
      },
    });

    if (!user || user.role !== UserRole.ADMIN) {
      throw new NotFoundException('Admin request not found.');
    }

    if (user.adminRequestStatus !== AdminRequestStatus.PENDING) {
      throw new BadRequestException('Only pending admin requests can be rejected.');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        adminRequestStatus: AdminRequestStatus.REJECTED,
        adminRequestReviewedAt: new Date(),
        adminRequestReviewedById: reviewerId,
        adminRequestNotes: 'Rejected by platform administrator.',
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        course: true,
        level: true,
        school: true,
        role: true,
        adminRequestStatus: true,
        adminRequestRequestedAt: true,
        adminRequestReviewedAt: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        _count: {
          select: {
            attempts: true,
          },
        },
      },
    });

    await this.prisma.userSession.updateMany({
      where: {
        userId: id,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    return {
      item: this.mapAdminUser(updated),
      message: 'Admin request rejected. The user will not be able to access the admin workspace.',
    };
  }

  async listAssessments(query: ListAdminAssessmentsQueryDto) {
    const now = new Date();
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 9;
    const where = this.buildAssessmentFilters(query, now);

    const [items, total, allExams] = await Promise.all([
      this.prisma.exam.findMany({
        where,
        orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          questions: {
            select: {
              type: true,
              difficulty: true,
            },
          },
          _count: {
            select: {
              attempts: true,
              questions: true,
            },
          },
          attempts: {
            where: {
              percentage: { not: null },
            },
            select: {
              percentage: true,
            },
          },
        },
      }),
      this.prisma.exam.count({ where }),
      this.prisma.exam.findMany({
        select: {
          title: true,
          slug: true,
          questions: {
            select: {
              difficulty: true,
            },
          },
        },
      }),
    ]);

    const availableFields = Array.from(
      new Set(allExams.map((exam) => this.getAssessmentCategory(exam.title, exam.slug))),
    ).sort((left, right) => left.localeCompare(right));

    return {
      items: items.map((exam) => this.mapAdminAssessment(exam)),
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
        availableFields,
      },
    };
  }

  async getAssessmentDetail(id: string) {
    const exam = await this.prisma.exam.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' },
          include: {
            options: {
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
        attempts: {
          orderBy: { createdAt: 'desc' },
          take: 12,
          include: {
            student: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            proctorEvents: {
              select: {
                severity: true,
                type: true,
              },
            },
          },
        },
        _count: {
          select: {
            attempts: true,
            questions: true,
          },
        },
      },
    });

    if (!exam) {
      throw new NotFoundException('Assessment not found.');
    }

    const scoredAttempts = exam.attempts.filter((attempt) => typeof attempt.percentage === 'number');
    const averageScore = scoredAttempts.length
      ? Math.round(
          scoredAttempts.reduce((sum, attempt) => sum + (attempt.percentage ?? 0), 0) / scoredAttempts.length,
        )
      : null;
    const passRate = scoredAttempts.length
      ? Math.round(
          (scoredAttempts.filter((attempt) => this.isCertificateEligible(attempt.percentage ?? 0)).length / scoredAttempts.length) * 100,
        )
      : null;

    return {
      ...this.mapAdminAssessment(exam),
      instructions: exam.instructions ?? '',
      createdById: exam.createdById,
      slug: exam.slug,
      mode: exam.mode,
      totalMarks: exam.totalMarks,
      passingMarks: exam.passingMarks,
      shuffleQuestions: exam.shuffleQuestions,
      shuffleOptions: exam.shuffleOptions,
      fullscreenRequired: exam.fullscreenRequired,
      webcamRequired: exam.webcamRequired,
      tabSwitchLimit: exam.tabSwitchLimit,
      metrics: {
        attempts: exam._count.attempts,
        averageScore: averageScore !== null ? `${averageScore}%` : 'No scored attempts yet',
        passRate: passRate !== null ? `${passRate}%` : 'No scored attempts yet',
        totalMarks: `${exam.totalMarks}`,
      },
      questions: exam.questions.map((question) => ({
        id: question.id,
        type: question.type,
        difficulty: question.difficulty ?? 'Intermediate',
        prompt: question.prompt,
        marks: question.marks,
        explanation: question.explanation ?? '',
        language:
          question.type === 'CODING' && question.metadata && typeof question.metadata === 'object'
            ? String((question.metadata as Record<string, unknown>).language ?? 'JavaScript')
            : '',
        correctAnswerText:
          typeof question.correctAnswer === 'string'
            ? question.correctAnswer
            : question.correctAnswer != null
              ? JSON.stringify(question.correctAnswer)
              : '',
        source: 'Manual',
        lastUpdated: question.updatedAt.toISOString(),
        optionCount: question.options.length,
        options: question.options.map((option) => ({
          id: option.id,
          label: option.label,
          value: option.value,
          isCorrect: option.isCorrect,
        })),
      })),
      attempts: exam.attempts.map((attempt) => ({
        id: attempt.id,
        student: this.getFullName(attempt.student.firstName, attempt.student.lastName),
        score: typeof attempt.percentage === 'number' ? `${Math.round(attempt.percentage)}%` : 'Pending',
        grade:
          typeof attempt.percentage === 'number'
            ? this.getGradeFromPercentage(attempt.percentage)
            : 'Pending',
        status: this.mapAttemptStatus(attempt.status),
        submittedAt: this.formatDateTime(attempt.submittedAt ?? attempt.createdAt),
        security: this.getAttemptSecurityStatus(
          attempt.suspiciousFlags,
          attempt.proctorEvents.some((event) => event.severity >= 3),
        ),
      })),
    };
  }

  async updateAssessmentStatus(id: string, status: ExamStatus) {
    const exam = await this.prisma.exam.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      select: { id: true, status: true, title: true },
    });

    if (!exam) {
      throw new NotFoundException('Assessment not found.');
    }

    if (exam.status === status) {
      return {
        item: await this.getAssessmentDetail(id),
        message: `Assessment is already ${this.mapAssessmentStatus(status).toLowerCase()}.`,
      };
    }

    const updated = await this.prisma.exam.update({
      where: { id: exam.id },
      data: { status },
      include: {
        questions: {
          select: {
            type: true,
            difficulty: true,
          },
        },
        _count: {
          select: {
            attempts: true,
            questions: true,
          },
        },
        attempts: {
          where: {
            percentage: { not: null },
          },
          select: {
            percentage: true,
          },
        },
      },
    });

    return {
      item: this.mapAdminAssessment(updated),
      message: `${exam.title} moved to ${this.mapAssessmentStatus(status).toLowerCase()}.`,
    };
  }

  async duplicateAssessment(adminId: string, id: string) {
    const exam = await this.prisma.exam.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' },
          include: {
            options: {
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
      },
    });

    if (!exam) {
      throw new NotFoundException('Assessment not found.');
    }

    const baseSlug = `${exam.slug}-copy`;
    const slug = await this.ensureUniqueAssessmentSlug(baseSlug);
    const title = `${exam.title} Copy`;

    const duplicated = await this.prisma.exam.create({
      data: {
        title,
        slug,
        description: exam.description,
        instructions: exam.instructions,
        mode: exam.mode,
        status: ExamStatus.DRAFT,
        durationInMinutes: exam.durationInMinutes,
        totalMarks: exam.totalMarks,
        passingMarks: exam.passingMarks,
        shuffleQuestions: exam.shuffleQuestions,
        shuffleOptions: exam.shuffleOptions,
        fullscreenRequired: exam.fullscreenRequired,
        webcamRequired: exam.webcamRequired,
        tabSwitchLimit: exam.tabSwitchLimit,
        createdById: adminId,
        questions: {
          create: exam.questions.map((question) => ({
            type: question.type,
            prompt: question.prompt,
            explanation: question.explanation,
            marks: question.marks,
            orderIndex: question.orderIndex,
            difficulty: question.difficulty,
            metadata: question.metadata as Prisma.InputJsonValue | undefined,
            rubric: question.rubric as Prisma.InputJsonValue | undefined,
            correctAnswer: question.correctAnswer as Prisma.InputJsonValue | undefined,
            options: question.options.length
              ? {
                  create: question.options.map((option) => ({
                    label: option.label,
                    value: option.value,
                    isCorrect: option.isCorrect,
                    orderIndex: option.orderIndex,
                  })),
                }
              : undefined,
          })),
        },
      },
      include: {
        questions: {
          select: {
            type: true,
            difficulty: true,
          },
        },
        _count: {
          select: {
            attempts: true,
            questions: true,
          },
        },
        attempts: {
          where: {
            percentage: { not: null },
          },
          select: {
            percentage: true,
          },
        },
      },
    });

    return {
      item: this.mapAdminAssessment(duplicated),
      message: `${title} was created as a draft duplicate.`,
    };
  }

  async listAttempts(query: ListAdminAttemptsQueryDto) {
    const now = new Date();
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 12;
    const where = this.buildAttemptFilters(query, now);

    const [items, total, exams, courses] = await Promise.all([
      this.prisma.examAttempt.findMany({
        where,
        orderBy: [{ submittedAt: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          status: true,
          percentage: true,
          suspiciousFlags: true,
          gradingSummary: true,
          submittedAt: true,
          createdAt: true,
          exam: {
            select: {
              title: true,
              slug: true,
            },
          },
          student: {
            select: {
              firstName: true,
              lastName: true,
              course: true,
            },
          },
          proctorEvents: {
            select: {
              severity: true,
            },
          },
        },
      }),
      this.prisma.examAttempt.count({ where }),
      this.prisma.exam.findMany({
        select: { title: true },
        orderBy: { title: 'asc' },
      }),
      this.prisma.user.findMany({
        where: {
          role: UserRole.STUDENT,
          course: { not: null },
        },
        distinct: ['course'],
        select: { course: true },
        orderBy: { course: 'asc' },
      }),
    ]);

    return {
      items: items.map((attempt) => this.mapAdminAttempt(attempt)),
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
        availableAssessments: exams.map((exam) => exam.title),
        availableFields: courses
          .map((course) => course.course)
          .filter((value): value is string => Boolean(value)),
      },
    };
  }

  async exportAttemptsCsv(query: ListAdminAttemptsQueryDto) {
    const attempts = await this.prisma.examAttempt.findMany({
      where: this.buildAttemptFilters(query, new Date()),
      orderBy: [{ submittedAt: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        status: true,
        percentage: true,
        suspiciousFlags: true,
        gradingSummary: true,
        submittedAt: true,
        createdAt: true,
        exam: {
          select: {
            title: true,
            slug: true,
          },
        },
        student: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            course: true,
          },
        },
        proctorEvents: {
          select: {
            severity: true,
          },
        },
      },
    });

    const rows = [
      [
        'Attempt ID',
        'Student',
        'Email',
        'Assessment',
        'Field',
        'Score',
        'Grade',
        'Status',
        'Security',
        'Submitted At',
      ],
      ...attempts.map((attempt) => {
        const mapped = this.mapAdminAttempt(attempt);

        return [
          attempt.id,
          mapped.student,
          attempt.student.email,
          mapped.assessment,
          mapped.field,
          mapped.score,
          mapped.grade,
          mapped.status,
          mapped.security,
          mapped.submittedAt,
        ];
      }),
    ];

    return rows
      .map((row) => row.map((value) => this.escapeCsvValue(value)).join(','))
      .join('\n');
  }

  async getAttemptDetail(id: string) {
    const attempt = await this.prisma.examAttempt.findUnique({
      where: { id },
      include: {
        exam: {
          select: {
            title: true,
            slug: true,
            durationInMinutes: true,
          },
        },
        student: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            school: true,
            course: true,
          },
        },
        responses: {
          orderBy: {
            question: {
              orderIndex: 'asc',
            },
          },
          include: {
            question: {
              select: {
                id: true,
                type: true,
                prompt: true,
                marks: true,
              },
            },
          },
        },
        proctorEvents: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            type: true,
            severity: true,
            createdAt: true,
            payload: true,
          },
        },
      },
    });

    if (!attempt) {
      throw new NotFoundException('Attempt not found.');
    }

    const securityStatus = this.getAttemptSecurityStatus(
      attempt.suspiciousFlags,
      attempt.proctorEvents.some((event) => event.severity >= 3),
    );
    const totalWarnings = attempt.proctorEvents.filter((event) => event.severity >= 2).length;
    const mcqResponses = attempt.responses.filter((response) => response.question.type === 'MCQ');
    const theoryResponses = attempt.responses.filter((response) => response.question.type === 'THEORY');
    const codingResponses = attempt.responses.filter((response) => response.question.type === 'CODING');
    const mcqCorrect = `${mcqResponses.filter((response) => (response.awardedMarks ?? 0) > 0).length}/${mcqResponses.length || 0}`;

    return {
      id: attempt.id,
      student: this.getFullName(attempt.student.firstName, attempt.student.lastName),
      studentEmail: attempt.student.email,
      studentSchool: attempt.student.school ?? 'Not set',
      assessment: attempt.exam.title,
      score:
        typeof attempt.percentage === 'number' ? `${Math.round(attempt.percentage)}%` : 'Pending',
      grade:
        typeof attempt.percentage === 'number'
          ? this.getGradeFromPercentage(attempt.percentage)
          : 'Pending',
      status: this.mapAttemptStatus(attempt.status),
      submittedAt: this.formatDateTime(attempt.submittedAt ?? attempt.createdAt),
      startedAt: attempt.startedAt ? this.formatDateTime(attempt.startedAt) : 'Not started',
      duration: attempt.startedAt && attempt.submittedAt
        ? `${Math.max(1, Math.round((attempt.submittedAt.getTime() - attempt.startedAt.getTime()) / 60000))} mins`
        : `${attempt.exam.durationInMinutes} mins`,
      security: securityStatus,
      field: this.getAssessmentCategory(attempt.exam.title, attempt.exam.slug),
      device: attempt.userAgent ?? 'Unknown device',
      ipAddress: attempt.ipAddress ?? 'Unknown IP',
      warningCount: totalWarnings,
      readinessNote: this.buildAttemptReadinessNote(
        attempt.percentage,
        securityStatus,
        this.getAssessmentCategory(attempt.exam.title, attempt.exam.slug),
      ),
      summary: {
        mcqCorrect,
        theoryQuality: this.getResponseQualityLabel(theoryResponses),
        codingQuality: this.getResponseQualityLabel(codingResponses),
      },
      answers: attempt.responses.map((response, index) => ({
        id: response.id,
        number: index + 1,
        type: response.question.type,
        prompt: response.question.prompt,
        answer: this.formatAttemptAnswer(response.answer),
        status: this.getAnswerReviewStatus(response.awardedMarks, response.question.marks),
        awardedMarks: `${this.formatMarks(response.awardedMarks)}/${response.question.marks}`,
        note:
          response.autoFeedback ||
          this.buildAnswerReviewNote(response.awardedMarks, response.question.marks),
      })),
      securityTimeline: attempt.proctorEvents.length
        ? attempt.proctorEvents.map((event) => ({
            time: this.formatTime(event.createdAt),
            title: this.formatViolationLabel(event.type),
            note: this.buildEventNote(event.type, event.payload),
            severity: this.mapSeverityLabel(event.severity),
          }))
        : [
            {
              time: this.formatTime(attempt.createdAt),
              title: 'Secure session started',
              note: 'No proctoring violations were recorded for this attempt.',
              severity: 'Low',
            },
      ],
    };
  }

  async listSecurityAlerts(query: ListAdminSecurityQueryDto) {
    const now = new Date();
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 12;
    const where = this.buildSecurityAlertFilters(query, now);

    const [attempts, total, assessments, eventTypes] = await Promise.all([
      this.prisma.examAttempt.findMany({
        where,
        orderBy: [{ updatedAt: 'desc' }, { submittedAt: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          status: true,
          suspiciousFlags: true,
          reviewedAt: true,
          ipAddress: true,
          userAgent: true,
          createdAt: true,
          updatedAt: true,
          submittedAt: true,
          gradingSummary: true,
          exam: {
            select: {
              title: true,
            },
          },
          student: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          proctorEvents: {
            orderBy: { createdAt: 'asc' },
            select: {
              id: true,
              type: true,
              severity: true,
              createdAt: true,
              payload: true,
            },
          },
        },
      }),
      this.prisma.examAttempt.count({ where }),
      this.prisma.exam.findMany({
        select: { title: true },
        orderBy: { title: 'asc' },
      }),
      this.prisma.proctorEvent.findMany({
        distinct: ['type'],
        select: { type: true },
        orderBy: { type: 'asc' },
      }),
    ]);

    const items = attempts.map((attempt) => this.mapSecurityAlert(attempt));
    const highRiskSessions = items.filter((item) => item.risk === 'High').length;
    const webcamViolations = attempts.reduce(
      (count, attempt) =>
        count +
        attempt.proctorEvents.filter(
          (event) =>
            event.type === ProctorEventType.WEBCAM_STATUS ||
            event.type === ProctorEventType.MULTIPLE_FACE_DETECTED ||
            event.type === ProctorEventType.NO_FACE_DETECTED,
        ).length,
      0,
    );
    const tabSwitchIncidents = attempts.reduce(
      (count, attempt) =>
        count +
        attempt.proctorEvents.filter((event) => event.type === ProctorEventType.TAB_SWITCH).length,
      0,
    );

    return {
      metrics: {
        totalFlaggedAttempts: total,
        highRiskSessions,
        webcamViolations,
        tabSwitchIncidents,
      },
      items,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
        availableAssessments: assessments.map((assessment) => assessment.title),
        availableViolations: eventTypes.map((event) => this.formatViolationLabel(event.type)),
      },
    };
  }

  async getSecurityAlertDetail(id: string) {
    const attempt = await this.prisma.examAttempt.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        suspiciousFlags: true,
        reviewedAt: true,
        ipAddress: true,
        userAgent: true,
        startedAt: true,
        submittedAt: true,
        createdAt: true,
        updatedAt: true,
        gradingSummary: true,
        exam: {
          select: {
            title: true,
            slug: true,
            durationInMinutes: true,
          },
        },
        student: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            school: true,
            course: true,
          },
        },
        proctorEvents: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            type: true,
            severity: true,
            createdAt: true,
            payload: true,
          },
        },
      },
    });

    if (!attempt) {
      throw new NotFoundException('Security incident not found.');
    }

    const alert = this.mapSecurityAlert(attempt);
    const review = this.getSecurityReview(attempt.gradingSummary);

    return {
      ...alert,
      field: attempt.student.course ?? this.getAssessmentCategory(attempt.exam.title, attempt.exam.slug),
      studentEmail: attempt.student.email,
      studentSchool: attempt.student.school ?? 'Not set',
      startedAt: attempt.startedAt ? this.formatDateTime(attempt.startedAt) : 'Not started',
      submittedAt: this.formatDateTime(attempt.submittedAt ?? attempt.createdAt),
      duration:
        attempt.startedAt && attempt.submittedAt
          ? `${Math.max(1, Math.round((attempt.submittedAt.getTime() - attempt.startedAt.getTime()) / 60000))} mins`
          : `${attempt.exam.durationInMinutes} mins`,
      timeline: attempt.proctorEvents.length
        ? attempt.proctorEvents.map((event) => ({
            id: event.id,
            time: this.formatTime(event.createdAt),
            title: this.formatViolationLabel(event.type),
            note: this.buildEventNote(event.type, event.payload),
            severity: this.mapSeverityLabel(event.severity),
          }))
        : [
            {
              id: `${attempt.id}-clean`,
              time: this.formatTime(attempt.createdAt),
              title: 'Secure session started',
              note: 'No proctoring violations were recorded for this attempt.',
              severity: 'Low',
            },
          ],
      review: {
        status: review.status,
        notes: review.notes,
        updatedAt: review.updatedAt ? this.formatDateTime(review.updatedAt) : 'Not reviewed yet',
      },
    };
  }

  async updateSecurityAlertStatus(
    id: string,
    adminId: string,
    dto: UpdateAdminSecurityStatusDto,
  ) {
    const attempt = await this.prisma.examAttempt.findUnique({
      where: { id },
      select: {
        id: true,
        suspiciousFlags: true,
        gradingSummary: true,
      },
    });

    if (!attempt) {
      throw new NotFoundException('Security incident not found.');
    }

    const existingSummary =
      attempt.gradingSummary && typeof attempt.gradingSummary === 'object'
        ? { ...(attempt.gradingSummary as Record<string, unknown>) }
        : {};

    const securityReview = {
      status: this.mapSecurityReviewMutationStatus(dto.status),
      notes: dto.notes?.trim() ?? '',
      updatedAt: new Date().toISOString(),
      updatedById: adminId,
    };

    const updated = await this.prisma.examAttempt.update({
      where: { id },
      data: {
        reviewedAt: new Date(),
        suspiciousFlags: dto.status === 'CLEARED' ? 0 : Math.max(attempt.suspiciousFlags, 1),
        gradingSummary: {
          ...(existingSummary as Prisma.InputJsonObject),
          securityReview,
        } as Prisma.InputJsonValue,
      },
      select: {
        id: true,
        status: true,
        suspiciousFlags: true,
        reviewedAt: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        updatedAt: true,
        submittedAt: true,
        gradingSummary: true,
        exam: {
          select: {
            title: true,
          },
        },
        student: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        proctorEvents: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            type: true,
            severity: true,
            createdAt: true,
            payload: true,
          },
        },
      },
    });

    return {
      item: this.mapSecurityAlert(updated),
      message:
        dto.status === 'REVIEWED'
          ? 'Security incident marked as reviewed.'
          : dto.status === 'ESCALATED'
            ? 'Security incident escalated for follow-up.'
            : 'Security incident cleared successfully.',
    };
  }

  async listCertificates(query: ListAdminCertificatesQueryDto) {
    const now = new Date();
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 12;
    const where = this.buildCertificateFilters(query, now);

    const [rawItems, allCertificates] = await Promise.all([
      this.prisma.certificate.findMany({
        where,
        orderBy: [{ issuedAt: 'desc' }],
        include: {
          exam: {
            select: {
              title: true,
              slug: true,
            },
          },
          student: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          attempt: {
            select: {
              percentage: true,
            },
          },
        },
      }),
      this.prisma.certificate.findMany({
        select: {
          exam: {
            select: {
              title: true,
              slug: true,
            },
          },
        },
      }),
    ]);

    const filteredItems = rawItems.filter((certificate) =>
      this.matchesCertificateStatus(certificate.metadata, query.status ?? 'all'),
    );
    const total = filteredItems.length;
    const items = filteredItems.slice((page - 1) * pageSize, page * pageSize);

    const availableFields = Array.from(
      new Set(
        allCertificates.map((item) =>
          this.getAssessmentCategory(item.exam.title, item.exam.slug),
        ),
      ),
    ).sort((left, right) => left.localeCompare(right));

    return {
      items: items.map((certificate) => this.mapAdminCertificate(certificate)),
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
        availableFields,
      },
    };
  }

  async exportCertificatesCsv(query: ListAdminCertificatesQueryDto) {
    const items = (
      await this.prisma.certificate.findMany({
      where: this.buildCertificateFilters(query, new Date()),
      orderBy: [{ issuedAt: 'desc' }],
      include: {
        exam: {
          select: {
            title: true,
            slug: true,
          },
        },
        student: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        attempt: {
          select: {
            percentage: true,
          },
        },
      },
      })
    ).filter((certificate) =>
      this.matchesCertificateStatus(certificate.metadata, query.status ?? 'all'),
    );

    const rows = [
      ['Certificate ID', 'Student', 'Email', 'Assessment', 'Field', 'Score', 'Grade', 'Verification ID', 'Issued At', 'Status'],
      ...items.map((certificate) => {
        const mapped = this.mapAdminCertificate(certificate);
        return [
          mapped.id,
          mapped.student,
          certificate.student.email,
          mapped.assessment,
          mapped.field,
          mapped.score,
          mapped.grade,
          mapped.verificationId,
          mapped.issuedAt,
          mapped.status,
        ];
      }),
    ];

    return rows
      .map((row) => row.map((value) => this.escapeCsvValue(value)).join(','))
      .join('\n');
  }

  async getCertificateDetail(id: string) {
    const certificate = await this.prisma.certificate.findUnique({
      where: { id },
      include: {
        exam: {
          select: {
            title: true,
            slug: true,
            durationInMinutes: true,
            totalMarks: true,
          },
        },
        student: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            school: true,
            course: true,
          },
        },
        attempt: {
          select: {
            id: true,
            percentage: true,
            score: true,
            maxScore: true,
            submittedAt: true,
            createdAt: true,
          },
        },
      },
    });

    if (!certificate) {
      throw new NotFoundException('Certificate not found.');
    }

    const status = this.getCertificateStatus(certificate.metadata);
    const percentage = certificate.attempt.percentage;
    const score = typeof percentage === 'number' ? `${Math.round(percentage)}%` : 'Pending';

    return {
      id: certificate.id,
      student: this.getFullName(certificate.student.firstName, certificate.student.lastName),
      studentEmail: certificate.student.email,
      studentSchool: certificate.student.school ?? 'Not set',
      assessment: certificate.exam.title,
      field: certificate.student.course ?? this.getAssessmentCategory(certificate.exam.title, certificate.exam.slug),
      score,
      grade: typeof percentage === 'number' ? this.getGradeFromPercentage(percentage) : 'Pending',
      status,
      verificationId: certificate.certificateNumber,
      verificationHash: certificate.verificationHash,
      issuedAt: this.formatDateTime(certificate.issuedAt),
      issuedDate: this.formatDate(certificate.issuedAt),
      attemptId: certificate.attempt.id,
      submittedAt: this.formatDateTime(certificate.attempt.submittedAt ?? certificate.attempt.createdAt),
      duration: `${certificate.exam.durationInMinutes} mins`,
      totalMarks: `${certificate.exam.totalMarks}`,
      scoreValue:
        typeof certificate.attempt.score === 'number' && typeof certificate.attempt.maxScore === 'number'
          ? `${this.formatMarks(certificate.attempt.score)}/${this.formatMarks(certificate.attempt.maxScore)}`
          : 'Not available',
      preview: {
        studentName: this.getFullName(certificate.student.firstName, certificate.student.lastName),
        assessmentTitle: certificate.exam.title,
        issuedDate: this.formatDate(certificate.issuedAt),
      },
      verificationUrl: `/certificates/verify/${certificate.certificateNumber}`,
    };
  }

  async verifyCertificateRecord(id: string) {
    const certificate = await this.prisma.certificate.findUnique({
      where: { id },
      select: {
        id: true,
        certificateNumber: true,
      },
    });

    if (!certificate) {
      throw new NotFoundException('Certificate not found.');
    }

    return {
      success: true,
      message: 'Certificate record verified successfully.',
      record: {
        certificateNumber: certificate.certificateNumber,
      },
    };
  }

  async reissueCertificate(id: string) {
    const certificate = await this.prisma.certificate.findUnique({
      where: { id },
      include: {
        exam: {
          select: {
            id: true,
            title: true,
          },
        },
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        attempt: {
          select: {
            percentage: true,
            score: true,
          },
        },
      },
    });

    if (!certificate) {
      throw new NotFoundException('Certificate not found.');
    }

    const certificateNumber = `CERT-${randomUUID().slice(0, 8).toUpperCase()}`;
    const verificationHash = createHash('sha256')
      .update(`${certificate.exam.id}:${certificate.student.id}:${certificateNumber}`)
      .digest('hex');

    const metadata = this.mergeCertificateMetadata(certificate.metadata, {
      studentName: this.getFullName(certificate.student.firstName, certificate.student.lastName),
      examTitle: certificate.exam.title,
      score: certificate.attempt.score ?? certificate.attempt.percentage ?? null,
      reissuedAt: new Date().toISOString(),
      reissueCount: this.getCertificateReissueCount(certificate.metadata) + 1,
    });

    const updated = await this.prisma.certificate.update({
      where: { id },
      data: {
        certificateNumber,
        verificationHash,
        issuedAt: new Date(),
        metadata,
      },
      include: {
        exam: {
          select: {
            title: true,
            slug: true,
          },
        },
        student: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        attempt: {
          select: {
            percentage: true,
          },
        },
      },
    });

    return {
      item: this.mapAdminCertificate(updated),
      message: 'Certificate has been reissued with a new verification ID.',
    };
  }

  private buildAttemptsTrend(
    attempts: AdminAttemptRecord[],
    from: Date,
    to: Date,
  ) {
    const days = this.buildDayRange(from, to);

    return days.map((day) => {
      const attemptsForDay = attempts.filter((attempt) => {
        const date = this.startOfDay(attempt.submittedAt ?? attempt.createdAt);
        return date.getTime() === day.getTime();
      });
      const reviewed = attemptsForDay.filter((attempt) => typeof attempt.percentage === 'number');
      const passed = reviewed.filter((attempt) => this.isCertificateEligible(attempt.percentage ?? 0)).length;
      const passRate = reviewed.length === 0 ? 0 : Math.round((passed / reviewed.length) * 100);

      return {
        label: day.toLocaleDateString('en-US', { weekday: 'short' }),
        attempts: attemptsForDay.length,
        passRate,
      };
    });
  }

  private buildPassFailDistribution(
    attempts: AdminAttemptRecord[],
  ) {
    const map = new Map<string, { passed: number; failed: number }>();

    for (const attempt of attempts) {
      const category = this.getAssessmentCategory(attempt.exam.title, attempt.exam.slug);
      const current = map.get(category) ?? { passed: 0, failed: 0 };
      if (this.isCertificateEligible(attempt.percentage ?? 0)) {
        current.passed += 1;
      } else {
        current.failed += 1;
      }
      map.set(category, current);
    }

    return Array.from(map.entries()).map(([label, value]) => ({
      label,
      passed: value.passed,
      failed: value.failed,
    }));
  }

  private buildTopCategories(
    attempts: AdminAttemptRecord[],
  ) {
    const map = new Map<
      string,
      { total: number; scoreSum: number; scoreCount: number; flagged: number }
    >();

    for (const attempt of attempts) {
      const category = this.getAssessmentCategory(attempt.exam.title, attempt.exam.slug);
      const current = map.get(category) ?? {
        total: 0,
        scoreSum: 0,
        scoreCount: 0,
        flagged: 0,
      };

      current.total += 1;
      if (typeof attempt.percentage === 'number') {
        current.scoreSum += attempt.percentage;
        current.scoreCount += 1;
      }
      if (attempt.suspiciousFlags > 0) {
        current.flagged += 1;
      }

      map.set(category, current);
    }

    return Array.from(map.entries())
      .map(([label, value]) => ({
        label,
        value: value.total,
        helper:
          value.scoreCount > 0
            ? `${Math.round(value.scoreSum / value.scoreCount)}% avg score • ${value.flagged} flagged`
            : `${value.flagged} flagged session${value.flagged === 1 ? '' : 's'}`,
      }))
      .sort((left, right) => right.value - left.value)
      .slice(0, 3);
  }

  private buildRecentActivity(
    exams: AdminExamRecord[],
    certificates: AdminCertificateRecord[],
    proctorEvents: AdminProctorEventRecord[],
    aiArtifacts: AdminAiArtifactRecord[],
  ) {
    const activity = [
      ...exams.slice(0, 2).map((exam) => ({
        createdAt: exam.updatedAt,
        title: exam.status === ExamStatus.PUBLISHED ? 'Assessment published' : 'Assessment updated',
        description: `${exam.title} now has ${exam._count.questions} question${exam._count.questions === 1 ? '' : 's'} ready for review.`,
      })),
      ...certificates.slice(0, 2).map((certificate) => ({
        createdAt: certificate.issuedAt,
        title: 'Certificate issued',
        description: `${this.getFullName(certificate.student.firstName, certificate.student.lastName)} received a certificate for ${certificate.exam.title}.`,
      })),
      ...proctorEvents
        .filter((event) => event.severity >= 2)
        .slice(0, 2)
        .map((event) => ({
          createdAt: event.createdAt,
          title: 'Security alert flagged',
          description: `${this.getFullName(event.attempt.student.firstName, event.attempt.student.lastName)} triggered ${this.formatViolationLabel(event.type)} in ${event.attempt.exam.title}.`,
        })),
      ...aiArtifacts.slice(0, 1).map((artifact) => ({
        createdAt: artifact.createdAt,
        title: 'AI question batch generated',
        description: `${artifact.topic ?? 'A new topic'} question suggestions were generated for admin review.`,
      })),
    ];

    return activity
      .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
      .slice(0, 4)
      .map((item) => ({
        title: item.title,
        description: item.description,
        timestamp: this.formatRelativeTime(item.createdAt),
      }));
  }

  private getAssessmentCategory(title: string, slug: string) {
    const normalized = `${title} ${slug}`.toLowerCase();

    if (normalized.includes('law') || normalized.includes('legal')) {
      return 'Law';
    }
    if (
      normalized.includes('engineering') ||
      normalized.includes('mechanical') ||
      normalized.includes('electrical')
    ) {
      return 'Engineering';
    }
    if (
      normalized.includes('tech') ||
      normalized.includes('software') ||
      normalized.includes('frontend') ||
      normalized.includes('react') ||
      normalized.includes('javascript')
    ) {
      return 'Technology';
    }

    return 'General';
  }

  private formatViolationLabel(type: ProctorEventType) {
    return type
      .toLowerCase()
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  private parseViolationFilter(value: string) {
    const normalized = value.trim().toUpperCase().replace(/\s+/g, '_');
    return Object.values(ProctorEventType).includes(normalized as ProctorEventType)
      ? (normalized as ProctorEventType)
      : ProctorEventType.SUSPICIOUS_ACTIVITY;
  }

  private getFullName(firstName: string, lastName: string) {
    return `${firstName} ${lastName}`.trim();
  }

  private buildDayRange(from: Date, to: Date) {
    const days: Date[] = [];
    const cursor = new Date(from);

    while (cursor.getTime() <= to.getTime()) {
      days.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }

    return days;
  }

  private startOfDay(value: Date) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  private startOfMonth(value: Date) {
    return new Date(value.getFullYear(), value.getMonth(), 1);
  }

  private daysAgoStart(value: Date, days: number) {
    const start = this.startOfDay(value);
    start.setDate(start.getDate() - days);
    return start;
  }

  private formatRelativeTime(value: Date) {
    const diffInMs = Date.now() - value.getTime();
    const diffInMinutes = Math.max(1, Math.floor(diffInMs / (1000 * 60)));

    if (diffInMinutes < 60) {
      return `${diffInMinutes} min${diffInMinutes === 1 ? '' : 's'} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) {
      return 'Yesterday';
    }

    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  }

  private formatInteger(value: number) {
    return new Intl.NumberFormat('en-US').format(value);
  }

  private formatDate(value: Date) {
    return value.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  private formatDateTime(value: Date) {
    return value.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  private formatTime(value: Date) {
    return value.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  private formatMarks(value?: number | null) {
    if (typeof value !== 'number') {
      return '0';
    }

    return Number.isInteger(value) ? `${value}` : value.toFixed(1);
  }

  private mapAssessmentStatus(status: ExamStatus) {
    if (status === ExamStatus.PUBLISHED) return 'Active';
    if (status === ExamStatus.ARCHIVED) return 'Archived';
    return 'Draft';
  }

  private getAssessmentDifficulty(difficulties: Array<string | null | undefined>) {
    const normalized = difficulties
      .map((item) => String(item ?? 'intermediate').trim().toLowerCase())
      .filter(Boolean);

    if (!normalized.length) {
      return 'Intermediate';
    }

    const unique = Array.from(new Set(normalized));
    if (unique.length > 1) {
      return 'Mixed';
    }

    const only = unique[0] ?? 'intermediate';
    return only.charAt(0).toUpperCase() + only.slice(1);
  }

  private getFormatsFromQuestions(types: string[]) {
    return Array.from(new Set(types)).map((type) =>
      type === 'CODING' ? 'Coding' : type === 'THEORY' ? 'Theory' : 'MCQ',
    );
  }

  private mapAdminAssessment(
    exam: {
      id: string;
      title: string;
      slug: string;
      description: string | null;
      durationInMinutes: number;
      status: ExamStatus;
      createdAt: Date;
      updatedAt: Date;
      questions: Array<{ type: string; difficulty: string | null }>;
      _count: { attempts: number; questions: number };
      attempts: Array<{ percentage: number | null }>;
    },
  ) {
    const scoredAttempts = exam.attempts.filter((attempt) => typeof attempt.percentage === 'number');
    const averageScore = scoredAttempts.length
      ? `${Math.round(scoredAttempts.reduce((sum, attempt) => sum + (attempt.percentage ?? 0), 0) / scoredAttempts.length)}%`
      : 'N/A';
    const passRate = scoredAttempts.length
      ? `${Math.round((scoredAttempts.filter((attempt) => this.isCertificateEligible(attempt.percentage ?? 0)).length / scoredAttempts.length) * 100)}%`
      : 'N/A';

    return {
      id: exam.id,
      title: exam.title,
      field: this.getAssessmentCategory(exam.title, exam.slug),
      questionCount: exam._count.questions,
      duration: `${exam.durationInMinutes} mins`,
      difficulty: this.getAssessmentDifficulty(exam.questions.map((question) => question.difficulty)),
      status: this.mapAssessmentStatus(exam.status),
      attemptsCount: exam._count.attempts,
      formats: this.getFormatsFromQuestions(exam.questions.map((question) => question.type)),
      createdAt: this.formatDate(exam.createdAt),
      updatedAt: this.formatDate(exam.updatedAt),
      passRate,
      averageScore,
      description: exam.description ?? 'No assessment description has been added yet.',
    };
  }

  private getGradeFromPercentage(percentage: number) {
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 80) return 'Credit';
    if (percentage >= AdminService.CERTIFICATE_ELIGIBILITY_PERCENTAGE) return 'Passed';
    if (percentage >= 50) return 'Fairly passed';
    return 'Fail';
  }

  private isCertificateEligible(percentage: number) {
    return percentage >= AdminService.CERTIFICATE_ELIGIBILITY_PERCENTAGE;
  }

  private mapAttemptStatus(status: AttemptStatus) {
    if (status === AttemptStatus.REVIEWED || status === AttemptStatus.AUTO_GRADED) return 'Reviewed';
    if (status === AttemptStatus.SUBMITTED) return 'Submitted';
    if (status === AttemptStatus.TERMINATED) return 'Flagged';
    return 'In Progress';
  }

  private getAttemptSecurityStatus(suspiciousFlags: number, hasHighRiskEvent: boolean) {
    if (hasHighRiskEvent) return 'High Risk';
    if (suspiciousFlags > 0) return 'Flagged';
    return 'Clean';
  }

  private getSecurityReview(
    gradingSummary: Prisma.JsonValue | null,
  ): { status: SecurityReviewStatus; notes: string; updatedAt: Date | null } {
    if (!gradingSummary || typeof gradingSummary !== 'object' || Array.isArray(gradingSummary)) {
      return { status: 'Open', notes: '', updatedAt: null };
    }

    const review = (gradingSummary as Record<string, unknown>).securityReview;
    if (!review || typeof review !== 'object' || Array.isArray(review)) {
      return { status: 'Open', notes: '', updatedAt: null };
    }

    const status = (review as Record<string, unknown>).status;
    const notes = (review as Record<string, unknown>).notes;
    const updatedAt = (review as Record<string, unknown>).updatedAt;

    return {
      status:
        status === 'Reviewed' ||
        status === 'Escalated' ||
        status === 'Cleared'
          ? status
          : 'Open',
      notes: typeof notes === 'string' ? notes : '',
      updatedAt: typeof updatedAt === 'string' ? new Date(updatedAt) : null,
    };
  }

  private mapSecurityReviewMutationStatus(
    status: UpdateAdminSecurityStatusDto['status'],
  ): Exclude<SecurityReviewStatus, 'Open'> {
    if (status === 'REVIEWED') return 'Reviewed';
    if (status === 'ESCALATED') return 'Escalated';
    return 'Cleared';
  }

  private mapSecurityRisk(
    attempt: {
      status: AttemptStatus;
      suspiciousFlags: number;
      proctorEvents: Array<{ severity: number }>;
    },
  ) {
    if (
      attempt.status === AttemptStatus.TERMINATED ||
      attempt.proctorEvents.some((event) => event.severity >= 3)
    ) {
      return 'High' as const;
    }
    if (attempt.suspiciousFlags > 0 || attempt.proctorEvents.some((event) => event.severity >= 2)) {
      return 'Medium' as const;
    }
    return 'Low' as const;
  }

  private mapSecurityAlert(
    attempt: {
      id: string;
      status: AttemptStatus;
      suspiciousFlags: number;
      reviewedAt?: Date | null;
      ipAddress: string | null;
      userAgent: string | null;
      createdAt: Date;
      updatedAt: Date;
      submittedAt: Date | null;
      gradingSummary: Prisma.JsonValue | null;
      exam: { title: string };
      student: { firstName: string; lastName: string };
      proctorEvents: Array<{
        id: string;
        type: ProctorEventType;
        severity: number;
        createdAt: Date;
        payload: Prisma.JsonValue | null;
      }>;
    },
  ) {
    const review = this.getSecurityReview(attempt.gradingSummary);
    const highestRiskEvent =
      [...attempt.proctorEvents].sort((left, right) => right.severity - left.severity)[0] ??
      null;
    const latestEvent = attempt.proctorEvents[attempt.proctorEvents.length - 1] ?? null;
    const leadEvent = highestRiskEvent ?? latestEvent;
    const warningCount = attempt.proctorEvents.filter((event) => event.severity >= 2).length;

    return {
      id: attempt.id,
      student: this.getFullName(attempt.student.firstName, attempt.student.lastName),
      assessment: attempt.exam.title,
      violation: leadEvent ? this.formatViolationLabel(leadEvent.type) : 'Suspicious Activity',
      warningCount,
      risk: this.mapSecurityRisk(attempt),
      detectedAt: this.formatDateTime(leadEvent?.createdAt ?? attempt.updatedAt ?? attempt.createdAt),
      status: review.status,
      device: attempt.userAgent ?? 'Unknown device',
      ipAddress: attempt.ipAddress ?? 'Unknown IP',
      timeline: attempt.proctorEvents.length
        ? attempt.proctorEvents.map((event) => ({
            time: this.formatTime(event.createdAt),
            title: this.formatViolationLabel(event.type),
            note: this.buildEventNote(event.type, event.payload),
          }))
        : [
            {
              time: this.formatTime(attempt.createdAt),
              title: 'Secure session started',
              note: 'No proctoring violations were recorded for this attempt.',
            },
          ],
      reviewNotes: review.notes,
      reviewUpdatedAt: review.updatedAt ? this.formatDateTime(review.updatedAt) : null,
    };
  }

  private mapAdminAttempt(
    attempt: {
      id: string;
      status: AttemptStatus;
      percentage: number | null;
      suspiciousFlags: number;
      gradingSummary?: Prisma.JsonValue | null;
      submittedAt: Date | null;
      createdAt: Date;
      exam: { title: string; slug: string };
      student: { firstName: string; lastName: string; course: string | null };
      proctorEvents: Array<{ severity: number }>;
    },
  ) {
    const securityReview = this.getSecurityReview(attempt.gradingSummary ?? null);
    const security = this.getAttemptSecurityStatus(
      securityReview.status === 'Cleared' ? 0 : attempt.suspiciousFlags,
      attempt.proctorEvents.some((event) => event.severity >= 3),
    );

    return {
      id: attempt.id,
      student: this.getFullName(attempt.student.firstName, attempt.student.lastName),
      assessment: attempt.exam.title,
      score: typeof attempt.percentage === 'number' ? `${Math.round(attempt.percentage)}%` : 'Pending',
      grade:
        typeof attempt.percentage === 'number'
          ? this.getGradeFromPercentage(attempt.percentage)
          : 'Pending',
      status: this.mapAttemptStatus(attempt.status),
      submittedAt: this.formatDateTime(attempt.submittedAt ?? attempt.createdAt),
      security,
      field: attempt.student.course ?? this.getAssessmentCategory(attempt.exam.title, attempt.exam.slug),
    };
  }

  private mapAdminCertificate(
    certificate: {
      id: string;
      certificateNumber: string;
      issuedAt: Date;
      metadata: Prisma.JsonValue | null;
      exam: { title: string; slug: string };
      student: { firstName: string; lastName: string; email: string };
      attempt: { percentage: number | null };
    },
  ) {
    const percentage = certificate.attempt.percentage;

    return {
      id: certificate.id,
      student: this.getFullName(certificate.student.firstName, certificate.student.lastName),
      assessment: certificate.exam.title,
      score: typeof percentage === 'number' ? `${Math.round(percentage)}%` : 'Pending',
      grade:
        typeof percentage === 'number'
          ? this.getGradeFromPercentage(percentage)
          : 'Pending',
      verificationId: certificate.certificateNumber,
      issuedAt: this.formatDate(certificate.issuedAt),
      status: this.getCertificateStatus(certificate.metadata),
      field: this.getAssessmentCategory(certificate.exam.title, certificate.exam.slug),
      studentEmail: certificate.student.email,
    };
  }

  private mapAdminUser(
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      course: string | null;
      level: string | null;
      school?: string | null;
      role: UserRole;
      adminRequestStatus: AdminRequestStatus;
      adminRequestRequestedAt?: Date | null;
      adminRequestReviewedAt?: Date | null;
      isActive: boolean;
      lastLoginAt: Date | null;
      createdAt: Date;
      _count: { attempts: number; certificates?: number };
    },
  ) {
    return {
      id: user.id,
      name: this.getFullName(user.firstName, user.lastName),
      email: user.email,
      field: user.course ?? 'Not set',
      graduationYear: user.level ?? 'Not set',
      role: this.getAdminUserRoleLabel(user.role),
      status: this.getAdminUserStatus(user),
      assessmentsTaken: user._count.attempts,
      lastActive: user.lastLoginAt ? this.formatRelativeTime(user.lastLoginAt) : 'Never signed in',
      joinedAt: this.formatDate(user.createdAt),
      school: user.school ?? 'Not set',
    };
  }

  private getCreatedWindowFilter(
    created: 'all' | '30d' | '90d' | 'year',
    now: Date,
  ): Pick<Prisma.ExamWhereInput, 'createdAt'> | {} {
    if (created === 'all') {
      return {};
    }

    const days = created === '30d' ? 30 : created === '90d' ? 90 : 365;
    return {
      createdAt: {
        gte: this.daysAgoStart(now, days),
      },
    };
  }

  private buildAssessmentFilters(
    query: ListAdminAssessmentsQueryDto,
    now: Date,
  ): Prisma.ExamWhereInput {
    const search = query.search?.trim();
    const field = query.field ?? 'all';
    const status = query.status ?? 'all';
    const difficulty = query.difficulty ?? 'all';
    const created = query.created ?? 'all';

    const categoryTokens =
      field !== 'all'
        ? field === 'Technology'
          ? ['tech', 'technology', 'software', 'frontend', 'javascript', 'react']
          : field === 'Engineering'
            ? ['engineering', 'mechanical', 'electrical']
            : field === 'Law'
              ? ['law', 'legal']
              : [field.toLowerCase()]
        : [];

    return {
      ...(status !== 'all'
        ? {
            status:
              status === 'active'
                ? ExamStatus.PUBLISHED
                : status === 'archived'
                  ? ExamStatus.ARCHIVED
                  : ExamStatus.DRAFT,
          }
        : {}),
      ...(difficulty !== 'all'
        ? {
            questions: {
              some: {
                difficulty: {
                  equals: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
                  mode: 'insensitive',
                },
              },
            },
          }
        : {}),
      ...(field !== 'all'
        ? {
            OR: categoryTokens.flatMap((token) => [
              { title: { contains: token, mode: 'insensitive' as const } },
              { slug: { contains: token, mode: 'insensitive' as const } },
            ]),
          }
        : {}),
      ...(search
        ? {
            AND: [
              {
                OR: [
                  { title: { contains: search, mode: 'insensitive' } },
                  { slug: { contains: search, mode: 'insensitive' } },
                  { description: { contains: search, mode: 'insensitive' } },
                ],
              },
            ],
          }
        : {}),
      ...this.getCreatedWindowFilter(created, now),
    };
  }

  private async ensureUniqueAssessmentSlug(baseSlug: string) {
    const normalizedBase = baseSlug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-');
    let candidate = normalizedBase;
    let counter = 2;

    while (true) {
      const existing = await this.prisma.exam.findUnique({
        where: { slug: candidate },
        select: { id: true },
      });

      if (!existing) {
        return candidate;
      }

      candidate = `${normalizedBase}-${counter}`;
      counter += 1;

      if (counter > 1000) {
        throw new BadRequestException('Unable to generate a unique slug for the duplicated assessment.');
      }
    }
  }

  private getAttemptDateFilter(
    date: 'all' | '7d' | '30d' | '90d',
    now: Date,
  ): Pick<Prisma.ExamAttemptWhereInput, 'createdAt'> | {} {
    if (date === 'all') {
      return {};
    }

    const days = date === '7d' ? 7 : date === '30d' ? 30 : 90;
    return {
      createdAt: {
        gte: this.daysAgoStart(now, days),
      },
    };
  }

  private getSecurityAlertDateFilter(
    date: 'all' | '7d' | '14d' | '30d' | '90d',
    now: Date,
  ): Pick<Prisma.ExamAttemptWhereInput, 'createdAt'> | {} {
    if (date === 'all') {
      return {};
    }

    const days = date === '7d' ? 7 : date === '14d' ? 14 : date === '30d' ? 30 : 90;
    return {
      createdAt: {
        gte: this.daysAgoStart(now, days),
      },
    };
  }

  private buildSecurityAlertFilters(
    query: ListAdminSecurityQueryDto,
    now: Date,
  ): Prisma.ExamAttemptWhereInput {
    const search = query.search?.trim();
    const assessment = query.assessment ?? 'all';
    const date = query.date ?? '14d';
    const risk = query.risk ?? 'all';
    const status = query.status ?? 'all';
    const violation = query.violation ?? 'all';

    const severityFilter =
      risk === 'all'
        ? {}
        : risk === 'high'
          ? {
              OR: [
                { status: AttemptStatus.TERMINATED },
                {
                  proctorEvents: {
                    some: {
                      severity: { gte: 3 },
                    },
                  },
                },
              ],
            }
          : risk === 'medium'
            ? {
                OR: [
                  { suspiciousFlags: { gt: 0 } },
                  {
                    proctorEvents: {
                      some: {
                        severity: { gte: 2 },
                      },
                    },
                  },
                ],
              }
            : {
                suspiciousFlags: 0,
                proctorEvents: {
                  none: {
                    severity: { gte: 2 },
                  },
                },
              };

    const reviewStatusFilter =
      status === 'all'
        ? {}
        : status === 'open'
          ? {
              NOT: [
                { gradingSummary: { path: ['securityReview', 'status'], equals: 'Reviewed' } },
                { gradingSummary: { path: ['securityReview', 'status'], equals: 'Escalated' } },
                { gradingSummary: { path: ['securityReview', 'status'], equals: 'Cleared' } },
              ],
            }
          : {
              gradingSummary: {
                path: ['securityReview', 'status'],
                equals:
                  status === 'reviewed'
                    ? 'Reviewed'
                    : status === 'escalated'
                      ? 'Escalated'
                      : 'Cleared',
              },
            };

    const violationFilter =
      violation === 'all'
        ? {}
        : {
            proctorEvents: {
              some: {
                type: this.parseViolationFilter(violation),
              },
            },
          };

    return {
      OR: [
        { suspiciousFlags: { gt: 0 } },
        {
          proctorEvents: {
            some: {
              severity: { gte: 2 },
            },
          },
        },
        { status: AttemptStatus.TERMINATED },
      ],
      ...(assessment !== 'all'
        ? {
            exam: {
              title: assessment,
            },
          }
        : {}),
      ...severityFilter,
      ...reviewStatusFilter,
      ...violationFilter,
      ...this.getSecurityAlertDateFilter(date, now),
      ...(search
        ? {
            OR: [
              {
                student: {
                  firstName: { contains: search, mode: 'insensitive' },
                },
              },
              {
                student: {
                  lastName: { contains: search, mode: 'insensitive' },
                },
              },
              {
                student: {
                  email: { contains: search, mode: 'insensitive' },
                },
              },
              {
                exam: {
                  title: { contains: search, mode: 'insensitive' },
                },
              },
            ],
          }
        : {}),
    };
  }

  private buildAttemptFilters(
    query: ListAdminAttemptsQueryDto,
    now: Date,
  ): Prisma.ExamAttemptWhereInput {
    const search = query.search?.trim();
    const assessment = query.assessment ?? 'all';
    const field = query.field ?? 'all';
    const grade = query.grade ?? 'all';
    const status = query.status ?? 'all';
    const date = query.date ?? 'all';
    const student = query.student?.trim();

    const attemptStatusFilter =
      status === 'all'
        ? {}
        : status === 'reviewed'
          ? { status: { in: [AttemptStatus.REVIEWED, AttemptStatus.AUTO_GRADED] } }
          : status === 'submitted'
            ? { status: AttemptStatus.SUBMITTED }
            : status === 'in-progress'
              ? { status: AttemptStatus.IN_PROGRESS }
              : {};

    const gradeFilter =
      grade === 'all'
        ? {}
        : grade === 'excellent'
          ? { percentage: { gte: 90 } }
          : grade === 'credit'
            ? { percentage: { gte: 80, lt: 90 } }
            : grade === 'passed'
              ? { percentage: { gte: 70, lt: 80 } }
              : grade === 'fairly-passed'
                ? { percentage: { gte: 50, lt: 70 } }
                : { OR: [{ percentage: { lt: 50 } }, { percentage: null }] };

    const flaggedFilter =
      status === 'flagged'
        ? {
            OR: [
              { suspiciousFlags: { gt: 0 } },
              {
                proctorEvents: {
                  some: {
                    severity: { gte: 2 },
                  },
                },
              },
              { status: AttemptStatus.TERMINATED },
            ],
          }
        : {};

    return {
      ...(assessment !== 'all'
        ? {
            exam: {
              title: assessment,
            },
          }
        : {}),
      ...(field !== 'all'
        ? {
            student: {
              course: field,
            },
          }
        : {}),
      ...attemptStatusFilter,
      ...flaggedFilter,
      ...gradeFilter,
      ...this.getAttemptDateFilter(date, now),
      ...(student
        ? {
            studentId: student,
          }
        : {}),
      ...(search
        ? {
            OR: [
              {
                student: {
                  firstName: { contains: search, mode: 'insensitive' },
                },
              },
              {
                student: {
                  lastName: { contains: search, mode: 'insensitive' },
                },
              },
              {
                student: {
                  email: { contains: search, mode: 'insensitive' },
                },
              },
              {
                exam: {
                  title: { contains: search, mode: 'insensitive' },
                },
              },
            ],
          }
        : {}),
    };
  }

  private getCertificateDateFilter(
    date: 'all' | '30d' | '90d' | 'month',
    now: Date,
  ): Pick<Prisma.CertificateWhereInput, 'issuedAt'> | {} {
    if (date === 'all') {
      return {};
    }

    if (date === 'month') {
      return {
        issuedAt: {
          gte: this.startOfMonth(now),
        },
      };
    }

    const days = date === '30d' ? 30 : 90;
    return {
      issuedAt: {
        gte: this.daysAgoStart(now, days),
      },
    };
  }

  private buildCertificateFilters(
    query: ListAdminCertificatesQueryDto,
    now: Date,
  ): Prisma.CertificateWhereInput {
    const search = query.search?.trim();
    const field = query.field ?? 'all';
    const date = query.date ?? 'all';

    const categoryTokens =
      field !== 'all'
        ? field === 'Technology'
          ? ['tech', 'technology', 'software', 'frontend', 'javascript', 'react']
          : field === 'Engineering'
            ? ['engineering', 'mechanical', 'electrical']
            : field === 'Law'
              ? ['law', 'legal']
              : [field.toLowerCase()]
        : [];

    return {
      ...(field !== 'all'
        ? {
            OR: categoryTokens.flatMap((token) => [
              { exam: { title: { contains: token, mode: 'insensitive' } } },
              { exam: { slug: { contains: token, mode: 'insensitive' } } },
            ]),
          }
        : {}),
      ...(search
        ? {
            OR: [
              { certificateNumber: { contains: search, mode: 'insensitive' } },
              { student: { firstName: { contains: search, mode: 'insensitive' } } },
              { student: { lastName: { contains: search, mode: 'insensitive' } } },
              { student: { email: { contains: search, mode: 'insensitive' } } },
              { exam: { title: { contains: search, mode: 'insensitive' } } },
            ],
          }
        : {}),
      ...this.getCertificateDateFilter(date, now),
    };
  }

  private getCertificateStatus(metadata: Prisma.JsonValue | null) {
    return this.getCertificateReissueCount(metadata) > 0 ? 'Reissued' : 'Issued';
  }

  private matchesCertificateStatus(
    metadata: Prisma.JsonValue | null,
    status: 'all' | 'issued' | 'reissued',
  ) {
    if (status === 'all') {
      return true;
    }

    const derivedStatus = this.getCertificateStatus(metadata).toLowerCase();
    return derivedStatus === status;
  }

  private getCertificateReissueCount(metadata: Prisma.JsonValue | null) {
    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
      return 0;
    }

    const value = (metadata as Record<string, unknown>).reissueCount;
    return typeof value === 'number' && Number.isFinite(value) ? value : 0;
  }

  private mergeCertificateMetadata(
    metadata: Prisma.JsonValue | null,
    updates: Record<string, unknown>,
  ): Prisma.InputJsonValue {
    const base =
      metadata && typeof metadata === 'object' && !Array.isArray(metadata)
        ? (metadata as Record<string, unknown>)
        : {};

    return {
      ...base,
      ...updates,
    } as Prisma.InputJsonValue;
  }

  private getResponseQualityLabel(
    responses: Array<{ awardedMarks?: number | null; question: { marks: number } }>,
  ) {
    if (!responses.length) {
      return 'N/A';
    }

    const ratio =
      responses.reduce((sum, response) => sum + ((response.awardedMarks ?? 0) / Math.max(response.question.marks, 1)), 0) /
      responses.length;

    if (ratio >= 0.8) return 'Strong';
    if (ratio >= 0.45) return 'Needs Review';
    return 'Weak';
  }

  private formatAttemptAnswer(answer: Prisma.JsonValue | null | undefined): string {
    if (answer == null) {
      return 'No answer submitted.';
    }

    if (typeof answer === 'string') {
      return answer;
    }

    return JSON.stringify(answer, null, 2);
  }

  private getAnswerReviewStatus(awardedMarks: number | null | undefined, maxMarks: number) {
    const ratio = (awardedMarks ?? 0) / Math.max(maxMarks, 1);
    if (ratio >= 0.8) return 'Strong' as const;
    if (ratio >= 0.4) return 'Needs Review' as const;
    return 'Flagged' as const;
  }

  private buildAnswerReviewNote(awardedMarks: number | null | undefined, maxMarks: number) {
    const ratio = (awardedMarks ?? 0) / Math.max(maxMarks, 1);
    if (ratio >= 0.8) {
      return 'This response aligned strongly with the expected outcome and earned a high mark share.';
    }
    if (ratio >= 0.4) {
      return 'This response showed partial understanding, but still needs closer review for depth or accuracy.';
    }
    return 'This response performed weakly against the marking criteria and may need manual follow-up.';
  }

  private mapSeverityLabel(severity: number) {
    if (severity >= 3) return 'High' as const;
    if (severity >= 2) return 'Medium' as const;
    return 'Low' as const;
  }

  private buildEventNote(type: ProctorEventType, payload: Prisma.JsonValue | null) {
    if (payload && typeof payload === 'object') {
      const values = Object.values(payload as Record<string, unknown>)
        .filter((value) => typeof value === 'string' || typeof value === 'number')
        .slice(0, 2)
        .map((value) => String(value));
      if (values.length) {
        return values.join(' • ');
      }
    }

    switch (type) {
      case ProctorEventType.TAB_SWITCH:
        return 'The student changed browser context during the assessment session.';
      case ProctorEventType.FULLSCREEN_EXIT:
        return 'Fullscreen mode was exited during the active attempt.';
      case ProctorEventType.WEBCAM_STATUS:
        return 'A webcam state change was recorded during monitoring.';
      case ProctorEventType.IP_CHANGE:
        return 'The session IP address changed during the attempt.';
      case ProctorEventType.DEVICE_CHANGE:
        return 'The active device fingerprint changed during the session.';
      case ProctorEventType.MULTIPLE_FACE_DETECTED:
        return 'Monitoring flagged more than one face in the camera view.';
      case ProctorEventType.NO_FACE_DETECTED:
        return 'Monitoring temporarily lost the candidate face in view.';
      default:
        return 'A suspicious activity event was captured for this attempt.';
    }
  }

  private buildAttemptReadinessNote(
    percentage: number | null,
    security: string,
    field: string,
  ) {
    if (security === 'High Risk') {
      return `Performance in ${field.toLowerCase()} shows promise, but the integrity risk means this attempt should be reviewed before it influences readiness decisions.`;
    }
    if (security === 'Flagged') {
      return `The result suggests progress in ${field.toLowerCase()}, but the session still carries review signals that should be resolved before finalizing the outcome.`;
    }
    if (this.isCertificateEligible(percentage ?? 0)) {
      return `This attempt indicates strong readiness momentum in ${field.toLowerCase()} with a clean assessment session.`;
    }
    return `This attempt suggests developing readiness in ${field.toLowerCase()} and highlights areas that would benefit from more practice.`;
  }

  private getJoinedWindowFilter(
    joined: 'all' | '30d' | '90d' | 'year',
    now: Date,
  ): Pick<Prisma.UserWhereInput, 'createdAt'> | {} {
    if (joined === 'all') {
      return {};
    }

    const days = joined === '30d' ? 30 : joined === '90d' ? 90 : 365;
    return {
      createdAt: {
        gte: this.daysAgoStart(now, days),
      },
    };
  }

  private getActivityFilter(
    activity: 'all' | '7d' | '30d' | 'inactive',
    now: Date,
  ): Pick<Prisma.UserWhereInput, 'lastLoginAt'> | {} {
    if (activity === 'all') {
      return {};
    }

    if (activity === 'inactive') {
      return {
        OR: [
          { lastLoginAt: null },
          {
            lastLoginAt: {
              lt: this.daysAgoStart(now, 30),
            },
          },
        ],
      } as Prisma.UserWhereInput;
    }

    const days = activity === '7d' ? 7 : 30;
    return {
      lastLoginAt: {
        gte: this.daysAgoStart(now, days),
      },
    };
  }

  private buildUserFilters(query: ListAdminUsersQueryDto, now: Date): Prisma.UserWhereInput {
    const search = query.search?.trim();
    const status = query.status ?? 'all';
    const field = query.field ?? 'all';
    const joined = query.joined ?? 'all';
    const activity = query.activity ?? 'all';

    return {
      ...(status === 'active'
        ? {
            isActive: true,
            NOT: [{ role: UserRole.ADMIN, adminRequestStatus: { in: [AdminRequestStatus.PENDING, AdminRequestStatus.REJECTED] } }],
          }
        : status === 'suspended'
          ? { isActive: false }
          : status === 'pending'
            ? { role: UserRole.ADMIN, adminRequestStatus: AdminRequestStatus.PENDING }
            : status === 'rejected'
              ? { role: UserRole.ADMIN, adminRequestStatus: AdminRequestStatus.REJECTED }
              : {}),
      ...(field !== 'all' ? { course: field } : {}),
      ...(search
        ? {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { school: { contains: search, mode: 'insensitive' } },
              { course: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...this.getJoinedWindowFilter(joined, now),
      ...this.getActivityFilter(activity, now),
    };
  }

  private getAdminUserRoleLabel(role: UserRole) {
    return role === UserRole.ADMIN ? ('Admin' as const) : ('Student' as const);
  }

  private getAdminUserStatus(user: {
    role: UserRole;
    adminRequestStatus: AdminRequestStatus;
    isActive: boolean;
  }) {
    if (user.role === UserRole.ADMIN && user.adminRequestStatus === AdminRequestStatus.PENDING) {
      return 'Pending' as const;
    }

    if (user.role === UserRole.ADMIN && user.adminRequestStatus === AdminRequestStatus.REJECTED) {
      return 'Rejected' as const;
    }

    return user.isActive ? ('Active' as const) : ('Suspended' as const);
  }

  private escapeCsvValue(value: string) {
    const normalized = value.replace(/"/g, '""');
    return /[",\n]/.test(normalized) ? `"${normalized}"` : normalized;
  }
}
