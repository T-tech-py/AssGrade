import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AIArtifactType,
  AttemptStatus,
  ExamMode,
  ExamStatus,
  Prisma,
  ProctorEventType,
  QuestionType,
  UserRole,
} from '@prisma/client';
import { JwtUser } from 'src/common/types/jwt-user.type';
import { AiService } from '../ai/ai.service';
import { CertificatesService } from '../certificates/certificates.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProctoringService } from '../proctoring/proctoring.service';
import { ProctorEventDto } from '../proctoring/dto/proctor-event.dto';
import { CreateExamDto } from './dto/create-exam.dto';
import { ListStudentResultsQueryDto } from './dto/list-student-results-query.dto';
import { SubmitAttemptDto } from './dto/submit-response.dto';
import { UpdateExamDto } from './dto/update-exam.dto';

@Injectable()
export class ExamsService {
  private static readonly CERTIFICATE_ELIGIBILITY_PERCENTAGE = 70;

  constructor(
    private readonly prisma: PrismaService,
    private readonly proctoringService: ProctoringService,
    private readonly certificatesService: CertificatesService,
    private readonly aiService: AiService,
  ) {}

  async createExam(adminId: string, dto: CreateExamDto) {
    const totalMarks = dto.questions.reduce((sum, question) => sum + question.marks, 0);

    return this.prisma.exam.create({
      data: {
        title: dto.title,
        slug: dto.slug,
        description: dto.description,
        instructions: dto.instructions,
        mode: dto.mode,
        status: dto.status ?? ExamStatus.DRAFT,
        durationInMinutes: dto.durationInMinutes,
        passingMarks: ExamsService.CERTIFICATE_ELIGIBILITY_PERCENTAGE,
        totalMarks,
        shuffleQuestions: dto.shuffleQuestions ?? false,
        shuffleOptions: dto.shuffleOptions ?? false,
        fullscreenRequired: dto.fullscreenRequired ?? true,
        webcamRequired: dto.webcamRequired ?? true,
        tabSwitchLimit: dto.tabSwitchLimit ?? 2,
        startAt: dto.startAt ? new Date(dto.startAt) : undefined,
        endAt: dto.endAt ? new Date(dto.endAt) : undefined,
        createdById: adminId,
        questions: {
          create: dto.questions.map((question) => ({
            type: question.type,
            prompt: question.prompt,
            explanation: question.explanation,
            marks: question.marks,
            orderIndex: question.orderIndex,
            difficulty: question.difficulty,
            metadata: question.metadata as Prisma.InputJsonValue | undefined,
            rubric: question.rubric as Prisma.InputJsonValue | undefined,
            correctAnswer: question.correctAnswer as Prisma.InputJsonValue | undefined,
            options: question.options
              ? {
                  create: question.options.map((option) => ({
                    label: option.label,
                    value: option.value,
                    isCorrect: option.isCorrect ?? false,
                    orderIndex: option.orderIndex,
                  })),
                }
              : undefined,
          })),
        },
      },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });
  }

  async updateExam(examId: string, adminId: string, dto: UpdateExamDto) {
    const exam = await this.prisma.exam.findUnique({
      where: { id: examId },
      select: { id: true },
    });

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    const totalMarks = dto.questions.reduce((sum, question) => sum + question.marks, 0);

    return this.prisma.$transaction(async (tx) => {
      await tx.questionOption.deleteMany({
        where: {
          question: {
            examId,
          },
        },
      });

      await tx.question.deleteMany({
        where: { examId },
      });

      return tx.exam.update({
        where: { id: examId },
        data: {
          title: dto.title,
          slug: dto.slug,
          description: dto.description,
          instructions: dto.instructions,
          mode: dto.mode,
          status: dto.status ?? ExamStatus.DRAFT,
          durationInMinutes: dto.durationInMinutes,
          passingMarks: ExamsService.CERTIFICATE_ELIGIBILITY_PERCENTAGE,
          totalMarks,
          shuffleQuestions: dto.shuffleQuestions ?? false,
          shuffleOptions: dto.shuffleOptions ?? false,
          fullscreenRequired: dto.fullscreenRequired ?? true,
          webcamRequired: dto.webcamRequired ?? true,
          tabSwitchLimit: dto.tabSwitchLimit ?? 2,
          startAt: dto.startAt ? new Date(dto.startAt) : null,
          endAt: dto.endAt ? new Date(dto.endAt) : null,
          createdById: adminId,
          questions: {
            create: dto.questions.map((question) => ({
              type: question.type,
              prompt: question.prompt,
              explanation: question.explanation,
              marks: question.marks,
              orderIndex: question.orderIndex,
              difficulty: question.difficulty,
              metadata: question.metadata as Prisma.InputJsonValue | undefined,
              rubric: question.rubric as Prisma.InputJsonValue | undefined,
              correctAnswer: question.correctAnswer as Prisma.InputJsonValue | undefined,
              options: question.options
                ? {
                    create: question.options.map((option) => ({
                      label: option.label,
                      value: option.value,
                      isCorrect: option.isCorrect ?? false,
                      orderIndex: option.orderIndex,
                    })),
                  }
                : undefined,
            })),
          },
        },
        include: {
          questions: {
            include: {
              options: true,
            },
          },
        },
      });
    });
  }

  async listAvailableExams(user: JwtUser) {
    if (user.role === UserRole.ADMIN) {
      return this.prisma.exam.findMany({
        include: {
          questions: true,
          attempts: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    const exams = await this.prisma.exam.findMany({
      where: { status: ExamStatus.PUBLISHED },
      orderBy: [{ startAt: 'asc' }, { createdAt: 'desc' }],
      include: {
        questions: {
          select: {
            difficulty: true,
          },
          orderBy: {
            orderIndex: 'asc',
          },
        },
        _count: {
          select: {
            questions: true,
          },
        },
      },
    });

    return exams.map((exam) => ({
      title: exam.title,
      field: this.getExamField(exam.title),
      duration: `${exam.durationInMinutes} mins`,
      difficulty: this.getExamDifficulty(exam.questions),
      questions: exam._count.questions,
      description:
        exam.description ??
        'Build a clearer readiness signal with this published graduate employability assessment.',
      href: `/assessments/${exam.id}/instructions`,
    }));
  }

  async getStudentResults(studentId: string, query: ListStudentResultsQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 6;
    const skip = (page - 1) * pageSize;

    const attemptWhere: Prisma.ExamAttemptWhereInput = {
      studentId,
      submittedAt: { not: null },
      percentage: { not: null },
    };

    const [attempts, pagedAttempts, certificates, latestCertificate] = await Promise.all([
      this.prisma.examAttempt.findMany({
        where: attemptWhere,
        include: {
          exam: {
            include: {
              questions: {
                select: {
                  id: true,
                  type: true,
                  prompt: true,
                  marks: true,
                },
              },
            },
          },
          responses: {
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
          certificate: true,
        },
        orderBy: {
          submittedAt: 'desc',
        },
      }),
      this.prisma.examAttempt.findMany({
        where: attemptWhere,
        include: {
          exam: {
            include: {
              questions: {
                select: {
                  id: true,
                },
              },
            },
          },
          certificate: true,
        },
        orderBy: {
          submittedAt: 'desc',
        },
        skip,
        take: pageSize,
      }),
      this.prisma.certificate.findMany({
        where: {
          studentId,
        },
      }),
      this.prisma.certificate.findFirst({
        where: {
          studentId,
        },
        orderBy: {
          issuedAt: 'desc',
        },
      }),
    ]);

    const totalAttempts = attempts.length;
    const averageScore =
      totalAttempts > 0
        ? Math.round(
            attempts.reduce((sum, attempt) => sum + (attempt.percentage ?? 0), 0) / totalAttempts,
          )
        : 0;
    const latestAttempt = attempts[0] ?? null;
    const earliestAttempt = attempts[attempts.length - 1] ?? null;
    const readinessGrowth =
      latestAttempt && earliestAttempt
        ? Math.round((latestAttempt.percentage ?? 0) - (earliestAttempt.percentage ?? 0))
        : 0;
    const currentSignal = this.getReadinessLabel(
      Math.round(latestAttempt?.percentage ?? averageScore),
    );
    const latestTitle = latestAttempt?.exam.title ?? 'No completed assessments yet';
    const latestScore = Math.round(latestAttempt?.percentage ?? 0);

    const trend = attempts
      .slice(0, 6)
      .reverse()
      .map((attempt) => ({
        label: new Intl.DateTimeFormat('en-US', { month: 'short' }).format(
          attempt.submittedAt ?? attempt.createdAt,
        ),
        score: Math.round(attempt.percentage ?? 0),
      }));

    const formatBuckets = {
      MCQ: { awarded: 0, total: 0 },
      THEORY: { awarded: 0, total: 0 },
      CODING: { awarded: 0, total: 0 },
    };

    const competencyBuckets = {
      'Assessment accuracy': { scoreSum: 0, count: 0, tone: 'success' as const },
      'Applied reasoning': { scoreSum: 0, count: 0, tone: 'accent' as const },
      'Written communication': { scoreSum: 0, count: 0, tone: 'warm' as const },
      'Session discipline': { scoreSum: 0, count: 0, tone: 'neutral' as const },
    };

    attempts.forEach((attempt) => {
      const attemptScore = Math.round(attempt.percentage ?? 0);
      competencyBuckets['Assessment accuracy'].scoreSum += attemptScore;
      competencyBuckets['Assessment accuracy'].count += 1;

      const integrityScore = Math.max(
        0,
        100 -
          attempt.tabSwitchCount * 12 -
          attempt.fullscreenViolations * 18 -
          attempt.suspiciousFlags * 15,
      );
      competencyBuckets['Session discipline'].scoreSum += integrityScore;
      competencyBuckets['Session discipline'].count += 1;

      attempt.responses.forEach((response) => {
        const marks = response.question.marks;
        const awarded = response.awardedMarks ?? 0;
        const type = response.question.type;

        formatBuckets[type].awarded += awarded;
        formatBuckets[type].total += marks;

        if (type === QuestionType.MCQ || type === QuestionType.CODING) {
          const score = marks > 0 ? Math.round((awarded / marks) * 100) : 0;
          competencyBuckets['Applied reasoning'].scoreSum += score;
          competencyBuckets['Applied reasoning'].count += 1;
        }

        if (type === QuestionType.THEORY) {
          const score = marks > 0 ? Math.round((awarded / marks) * 100) : 0;
          competencyBuckets['Written communication'].scoreSum += score;
          competencyBuckets['Written communication'].count += 1;
        }
      });
    });

    const competencies = Object.entries(competencyBuckets).map(([name, bucket]) => ({
      name,
      score: bucket.count ? Math.round(bucket.scoreSum / bucket.count) : 0,
      tone: bucket.tone,
    }));

    const formats = [
      {
        label: 'MCQ performance',
        score:
          formatBuckets.MCQ.total > 0
            ? Math.round((formatBuckets.MCQ.awarded / formatBuckets.MCQ.total) * 100)
            : 0,
        helper: 'Accuracy and speed on structured objective questions.',
      },
      {
        label: 'Theory performance',
        score:
          formatBuckets.THEORY.total > 0
            ? Math.round((formatBuckets.THEORY.awarded / formatBuckets.THEORY.total) * 100)
            : 0,
        helper: 'Quality and structure across open-ended written responses.',
      },
      {
        label: 'Coding performance',
        score:
          formatBuckets.CODING.total > 0
            ? Math.round((formatBuckets.CODING.awarded / formatBuckets.CODING.total) * 100)
            : 0,
        helper: 'Problem solving and correctness across coding-style prompts.',
      },
    ];

    const certificateForLatest = latestAttempt?.certificate;

    return {
      highlights: {
        latestTitle,
        latestScore,
        latestGrade: this.getGradeFromPercentage(latestScore),
        latestSummary:
          latestAttempt && latestAttempt.percentage !== null
            ? `Your latest result shows ${this.getReadinessHelper(
                Math.round(latestAttempt.percentage),
              ).toLowerCase()} and reflects how your readiness is progressing over time.`
            : 'Complete an assessment to see your latest performance summary here.',
        strengths: competencies
          .filter((item) => item.score >= 70)
          .slice(0, 3)
          .map((item) => `${item.name} is currently one of your stronger readiness signals.`),
        focusAreas: competencies
          .filter((item) => item.score < 80)
          .slice(0, 3)
          .map((item) => `Continue improving ${item.name.toLowerCase()} in your next assessment cycle.`),
        latestCertificateHref: certificateForLatest ? `/certificates/${certificateForLatest.id}` : '/certificates',
      },
      metrics: [
        {
          title: 'Average score',
          value: `${averageScore}%`,
          helper: `Across your latest ${Math.min(totalAttempts, 5)} completed assessments`,
          icon: 'score',
        },
        {
          title: 'Readiness growth',
          value: `${readinessGrowth >= 0 ? '+' : ''}${readinessGrowth} pts`,
          helper: 'Since your first recorded assessment',
          icon: 'growth',
        },
        {
          title: 'Certificates ready',
          value: `${certificates.length}`,
          helper: certificates.length
            ? 'Available to view and share right now'
            : 'Unlock by scoring at least 70%',
          icon: 'certificate',
        },
        {
          title: 'Current signal',
          value: currentSignal,
          helper:
            currentSignal === 'Job-Ready'
              ? 'You are performing at a strong readiness level'
              : currentSignal === 'Developing'
                ? 'You are building toward job-ready performance'
                : 'Early signal stage with room to strengthen',
          icon: 'readiness',
        },
      ],
      trend,
      readinessNote: {
        strongestSignal:
          competencies.slice().sort((a, b) => b.score - a.score)[0]?.name ??
          'Assessment accuracy',
        currentBlocker:
          competencies.slice().sort((a, b) => a.score - b.score)[0]?.name ??
          'Written communication',
        recommendedNextMove:
          latestAttempt && this.isCertificateEligible(latestAttempt.percentage ?? 0)
            ? 'Keep momentum with one more assessment after a short practice session to deepen your readiness signal.'
            : 'Use practice mode and one more assessment attempt to strengthen your weaker areas.',
      },
      attempts: pagedAttempts.map((attempt) => ({
        id: attempt.id,
        title: attempt.exam.title,
        field: this.getExamField(attempt.exam.title),
        score: Math.round(attempt.percentage ?? 0),
        grade: this.getGradeFromPercentage(attempt.percentage ?? 0),
        status: this.getAssessmentOutcomeStatus(attempt.percentage ?? 0),
        completedAt: this.formatDate(attempt.submittedAt ?? attempt.createdAt),
        duration: `${attempt.exam.durationInMinutes} mins`,
        questionCount: attempt.exam.questions.length,
        improvement: this.buildResultImprovementNote(
          attempt.exam.title,
          Math.round(attempt.percentage ?? 0),
        ),
        certificateAvailable: Boolean(attempt.certificate),
        certificateHref: attempt.certificate ? `/certificates/${attempt.certificate.id}` : null,
        breakdownHref: `/results/${attempt.id}`,
      })),
      breakdown: {
        competencies,
        formats,
      },
      pagination: {
        page,
        pageSize,
        total: totalAttempts,
        totalPages: Math.max(1, Math.ceil(totalAttempts / pageSize)),
      },
      overview: {
        latestIssued: latestCertificate ? this.formatDate(latestCertificate.issuedAt) : 'Not issued yet',
      },
    };
  }

  async getStudentCareerInsights(studentId: string) {
    const [student, attempts, certificates] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: studentId },
        select: {
          firstName: true,
          lastName: true,
          course: true,
          school: true,
        },
      }),
      this.prisma.examAttempt.findMany({
        where: {
          studentId,
          submittedAt: { not: null },
          percentage: { not: null },
        },
        include: {
          exam: {
            include: {
              questions: {
                select: {
                  type: true,
                  marks: true,
                },
              },
            },
          },
          responses: {
            include: {
              question: {
                select: {
                  type: true,
                  marks: true,
                },
              },
            },
          },
        },
        orderBy: {
          submittedAt: 'desc',
        },
      }),
      this.prisma.certificate.findMany({
        where: {
          studentId,
        },
      }),
    ]);

    const averageScore =
      attempts.length > 0
        ? Math.round(attempts.reduce((sum, attempt) => sum + (attempt.percentage ?? 0), 0) / attempts.length)
        : 0;
    const readinessScore = averageScore;
    const readinessLevel = this.getReadinessLabel(readinessScore);
    const course = student?.course ?? 'General';
    const latestAttempt = attempts[0];
    const objectiveAccuracy = this.computeCareerSignalScore(
      attempts,
      [QuestionType.MCQ, QuestionType.CODING],
      0,
    );
    const openEndedCommunication = this.computeCareerSignalScore(
      attempts,
      [QuestionType.THEORY],
      0,
    );
    const sessionDiscipline = this.computeSessionDisciplineScore(attempts);
    const consistencyScore = this.computeConsistencyScore(attempts);

    const signals = [
      {
        label: 'Objective accuracy',
        score: objectiveAccuracy,
        helper: 'How well you score on structured assessment tasks with clear right-or-wrong outcomes.',
      },
      {
        label: 'Open-ended communication',
        score: openEndedCommunication,
        helper: 'How clearly your theory and long-form responses communicate reasoning and structure.',
      },
      {
        label: 'Session discipline',
        score: sessionDiscipline,
        helper: 'How well you maintain assessment integrity through fullscreen, tab, and webcam compliance.',
      },
      {
        label: 'Consistency over time',
        score: consistencyScore,
        helper: 'How steady your performance looks across your recent completed assessments.',
      },
    ];

    const sortedSignals = [...signals].sort((left, right) => right.score - left.score);
    const strongestSignal = sortedSignals[0];
    const weakestSignal = sortedSignals[sortedSignals.length - 1];
    const roleMatches = this.buildStudentCareerRoleMatches({
      course,
      readinessScore,
      strongestSignal,
      weakestSignal,
      latestAssessmentTitle: latestAttempt?.exam.title,
      certificateCount: certificates.length,
      objectiveAccuracy,
      openEndedCommunication,
      sessionDiscipline,
      consistencyScore,
    });
    const topRole = roleMatches[0];
    const narrative = topRole
      ? await this.aiService.generateCareerInsightNarrative({
          course,
          readinessScore,
          readinessLevel,
          totalAttempts: attempts.length,
          certificateCount: certificates.length,
          latestAssessmentTitle: latestAttempt?.exam.title,
          topRole: {
            title: topRole.title,
            match: topRole.match,
          },
          strongestSignal: {
            label: strongestSignal.label,
            score: strongestSignal.score,
          },
          weakestSignal: {
            label: weakestSignal.label,
            score: weakestSignal.score,
          },
        })
      : null;

    return {
      hero: {
        title: 'Career Insights',
        subtitle:
          'See where your assessment performance points, understand the roles you are trending toward, and get practical next steps for becoming more job-ready.',
        readinessLevel,
        readinessScore,
        summary:
          narrative?.summary ??
          (topRole
            ? `Your strongest signal currently points toward ${topRole.title.toLowerCase()} roles, with ${weakestSignal.label.toLowerCase()} as the clearest area to improve next.`
            : 'Complete more assessments to unlock richer career guidance and role fit suggestions.'),
      },
      stats: [
        {
          title: 'Top role match',
          value: topRole ? `${topRole.match}%` : '0%',
          helper: topRole
            ? `${topRole.title} is your strongest current fit.`
            : 'Complete more assessments to unlock role matches.',
        },
        {
          title: 'Career direction',
          value: this.getCareerDirectionLabel(course, topRole?.title),
          helper:
            latestAttempt?.exam.title
              ? `Grounded most strongly in your recent ${this.getExamField(latestAttempt.exam.title).toLowerCase()} assessment outcomes.`
              : 'This reflects the direction your current evidence supports most strongly.',
        },
        {
          title: 'Highest signal',
          value: strongestSignal.label,
          helper: 'This is your clearest employability strength at the moment.',
        },
        {
          title: 'Growth focus',
          value: weakestSignal.label,
          helper: 'This is the fastest area to improve for stronger role fit.',
        },
      ],
      roleMatches,
      signals,
      strengths:
        narrative?.strengths ??
        this.buildCareerStrengths({
          strongestSignal,
          certificatesEarned: certificates.length,
          readinessLevel,
          latestAssessmentTitle: latestAttempt?.exam.title,
        }),
      gaps:
        narrative?.gaps ??
        this.buildCareerGaps({
          weakestSignal,
          certificatesEarned: certificates.length,
          sessionDiscipline,
          consistencyScore,
        }),
      nextSteps: [
        {
          title: 'Start focused practice',
          description: `Use guided practice to improve ${weakestSignal.label.toLowerCase()} before your next scored assessment.`,
          href: '/practice',
          tone: 'primary' as const,
        },
        {
          title: 'Take another assessment',
          description: topRole
            ? `Retest after targeted preparation to make your fit for ${topRole.title.toLowerCase()} roles more convincing.`
            : 'Retest after targeted preparation to improve both readiness level and role fit confidence.',
          href: '/assessments',
          tone: 'secondary' as const,
        },
        {
          title: certificates.length > 0 ? 'Review your certificates' : 'Review latest results',
          description: certificates.length > 0
            ? 'Use your issued certificates and strong results as proof points while you improve weaker signals.'
            : 'Open your most recent result breakdown to see which signals are pushing your fit upward or downward.',
          href: certificates.length > 0 ? '/certificates' : '/results',
          tone: 'secondary' as const,
        },
      ],
    };
  }

  async getStudentResultDetail(studentId: string, attemptId: string) {
    const attempt = await this.prisma.examAttempt.findFirst({
      where: {
        id: attemptId,
        studentId,
        submittedAt: { not: null },
      },
      include: {
        exam: {
          include: {
            questions: {
              orderBy: {
                orderIndex: 'asc',
              },
            },
          },
        },
        responses: {
          include: {
            question: true,
          },
          orderBy: {
            question: {
              orderIndex: 'asc',
            },
          },
        },
        certificate: true,
      },
    });

    if (!attempt) {
      throw new NotFoundException('Result not found');
    }

    const percentage = Math.round(attempt.percentage ?? 0);
    const competencies = this.buildAttemptCompetencies(attempt);
    const formats = this.buildAttemptFormats(attempt);

    return {
      hero: {
        title: attempt.exam.title,
        field: this.getExamField(attempt.exam.title),
        completedAt: this.formatDate(attempt.submittedAt ?? attempt.createdAt),
        score: percentage,
        grade: this.getGradeFromPercentage(percentage),
        status: this.getAssessmentOutcomeStatus(percentage),
        duration: `${attempt.exam.durationInMinutes} mins`,
        questionCount: attempt.exam.questions.length,
        certificateHref: attempt.certificate ? `/certificates/${attempt.certificate.id}` : null,
      },
      summary: {
        strongestSignal:
          competencies.slice().sort((a, b) => b.score - a.score)[0]?.name ?? 'Assessment accuracy',
        weakestSignal:
          competencies.slice().sort((a, b) => a.score - b.score)[0]?.name ?? 'Written communication',
        note: this.buildResultImprovementNote(attempt.exam.title, percentage),
      },
      competencies,
      formats,
      responses: attempt.responses.map((response) => ({
        id: response.id,
        prompt: response.question.prompt,
        type: response.question.type,
        marks: response.question.marks,
        awardedMarks: response.awardedMarks ?? 0,
        autoFeedback: response.autoFeedback,
      })),
    };
  }

  async getStudentDashboardOverview(studentId: string) {
    const [student, attempts, publishedExams, certificates, aiArtifacts] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: studentId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          course: true,
          school: true,
        },
      }),
      this.prisma.examAttempt.findMany({
        where: {
          studentId,
          submittedAt: { not: null },
        },
        include: {
          exam: {
            include: {
              questions: {
                select: {
                  difficulty: true,
                },
              },
            },
          },
        },
        orderBy: {
          submittedAt: 'desc',
        },
      }),
      this.prisma.exam.findMany({
        where: {
          status: ExamStatus.PUBLISHED,
        },
        include: {
          questions: {
            select: {
              difficulty: true,
            },
            orderBy: {
              orderIndex: 'asc',
            },
          },
          _count: {
            select: {
              questions: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 3,
      }),
      this.prisma.certificate.findMany({
        where: {
          studentId,
        },
        include: {
          exam: true,
          attempt: true,
        },
        orderBy: {
          issuedAt: 'desc',
        },
        take: 2,
      }),
      this.prisma.aIArtifact.findMany({
        where: {
          userId: studentId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 6,
      }),
    ]);

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const completedAttempts = attempts.filter((attempt) => attempt.percentage !== null);
    const totalAttempts = completedAttempts.length;
    const averageScore = totalAttempts
      ? completedAttempts.reduce((sum, attempt) => sum + (attempt.percentage ?? 0), 0) / totalAttempts
      : 0;
    const latestAttempt = completedAttempts[0] ?? null;
    const readinessScore = Math.round(averageScore);
    const readinessLabel = this.getReadinessLabel(readinessScore);

    return {
      hero: {
        readinessScore,
        readinessLabel,
        nextGoal: this.getNextGoal(readinessScore, totalAttempts),
        latestWin: latestAttempt
          ? `You earned ${this.getGradeFromPercentage(latestAttempt.percentage ?? 0)} in the ${latestAttempt.exam.title}.`
          : 'Complete your first assessment to unlock a readiness signal.',
        practiceHint: this.getPracticeHint(student.course, readinessScore),
      },
      summaryStats: [
        {
          title: 'Total Assessments Taken',
          value: String(totalAttempts),
          helper: totalAttempts ? `${this.countRecentAttempts(completedAttempts)} completed this month` : 'No completed attempts yet',
          trend: totalAttempts ? `+${Math.max(1, Math.round(totalAttempts / 2))}%` : 'New',
          icon: 'assignment',
          tone: 'accent',
        },
        {
          title: 'Average Score',
          value: `${Math.round(averageScore)}%`,
          helper: totalAttempts ? 'Across completed assessments' : 'Build this by taking assessments',
          trend: latestAttempt?.percentage ? `${Math.round(latestAttempt.percentage)}% latest` : 'No score yet',
          icon: 'trending_up',
          tone: 'warm',
        },
        {
          title: 'Certificates Earned',
          value: String(certificates.length),
          helper: certificates.length ? `${certificates.length} verified credential${certificates.length > 1 ? 's' : ''}` : 'Unlock by scoring at least 70%',
          trend: certificates.length ? 'Issued' : 'Locked',
          icon: 'workspace_premium',
          tone: 'success',
        },
        {
          title: 'Current Readiness Level',
          value: readinessLabel,
          helper: this.getReadinessHelper(readinessScore),
          trend: `${readinessScore}/100`,
          icon: 'track_changes',
          tone: 'neutral',
        },
      ],
      performanceSeries: this.buildPerformanceSeries(completedAttempts),
      availableAssessments: publishedExams.map((exam) => ({
        title: exam.title,
        field: this.getExamField(exam.title),
        duration: `${exam.durationInMinutes} mins`,
        difficulty: this.getExamDifficulty(exam.questions),
        questions: exam._count.questions,
        description:
          exam.description ??
          'Build stronger employability signals with a structured readiness assessment.',
        href: `/assessments/${exam.id}/instructions`,
      })),
      recentActivity: this.buildRecentActivity(completedAttempts, certificates, aiArtifacts),
      careerInsights: this.buildCareerInsights(student.course, readinessScore),
      certificates: certificates.map((certificate) => ({
        title: certificate.exam.title,
        score: `${Math.round(certificate.attempt.percentage ?? 0)}%`,
        grade: this.getGradeFromPercentage(certificate.attempt.percentage ?? 0),
        verificationId: certificate.certificateNumber,
        issuedAt: this.formatDate(certificate.issuedAt),
        href: '/certificates',
      })),
    };
  }

  async startExam(
    examId: string,
    user: JwtUser,
    meta: { deviceId: string; ipAddress?: string; userAgent?: string },
  ) {
    const exam = await this.prisma.exam.findUnique({
      where: { id: examId },
    });
    if (!exam || exam.status !== ExamStatus.PUBLISHED) {
      throw new NotFoundException('Exam is not available');
    }

    const now = new Date();
    if (exam.startAt && exam.startAt > now) {
      throw new BadRequestException('Exam has not started yet');
    }
    if (exam.endAt && exam.endAt < now) {
      throw new BadRequestException('Exam is already closed');
    }

    const attempt = await this.prisma.examAttempt.upsert({
      where: {
        examId_studentId: {
          examId,
          studentId: user.sub,
        },
      },
      update: {
        status: AttemptStatus.IN_PROGRESS,
        startedAt: now,
        deviceId: meta.deviceId,
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
      },
      create: {
        examId,
        studentId: user.sub,
        status: AttemptStatus.IN_PROGRESS,
        startedAt: now,
        deviceId: meta.deviceId,
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
      },
    });

    return {
      attemptId: attempt.id,
      examId: exam.id,
      mode: exam.mode,
      restrictions: {
        fullscreenRequired: exam.fullscreenRequired,
        webcamRequired: exam.webcamRequired,
        tabSwitchLimit: exam.tabSwitchLimit,
      },
    };
  }

  async getExamSession(examId: string, user: JwtUser) {
    const exam = await this.prisma.exam.findUnique({
      where: { id: examId },
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' },
          include: { options: { orderBy: { orderIndex: 'asc' } } },
        },
      },
    });

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    const isAdmin = user.role === UserRole.ADMIN;
    const canView = isAdmin || exam.status === ExamStatus.PUBLISHED;
    if (!canView) {
      throw new ForbiddenException('Exam is not accessible');
    }

    return {
      ...exam,
      questions: exam.questions.map((question) => ({
        id: question.id,
        type: question.type,
        prompt: question.prompt,
        marks: question.marks,
        orderIndex: question.orderIndex,
        difficulty: question.difficulty,
        metadata: question.metadata,
        rubric: isAdmin || exam.mode === ExamMode.PRACTICE ? question.rubric : undefined,
        explanation: isAdmin || exam.mode === ExamMode.PRACTICE ? question.explanation : undefined,
        options: question.options.map((option) => ({
          id: option.id,
          label: option.label,
          value: option.value,
          orderIndex: option.orderIndex,
        })),
      })),
    };
  }

  async submitAttempt(examId: string, user: JwtUser, dto: SubmitAttemptDto) {
    const attempt = await this.prisma.examAttempt.findUnique({
      where: {
        examId_studentId: {
          examId,
          studentId: user.sub,
        },
      },
      include: {
        exam: {
          include: {
            questions: {
              include: { options: true },
            },
          },
        },
      },
    });

    if (!attempt || attempt.status !== AttemptStatus.IN_PROGRESS) {
      throw new BadRequestException('No active attempt found');
    }

    const answerMap = new Map(dto.answers.map((answer) => [answer.questionId, answer.answer]));
    let score = 0;
    const gradedResponses = await Promise.all(
      attempt.exam.questions.map(async (question) => {
        const submittedAnswer = answerMap.get(question.id);
        const grading = await this.gradeQuestion(question, submittedAnswer);
        score += grading.awardedMarks;

        return {
          questionId: question.id,
          submittedAnswer,
          awardedMarks: grading.awardedMarks,
          autoFeedback: grading.summary,
        };
      }),
    );

    const responseWrites = gradedResponses.map((gradedResponse) => {
      const submittedAt = new Date();

      return this.prisma.attemptResponse.upsert({
        where: {
          attemptId_questionId: {
            attemptId: attempt.id,
            questionId: gradedResponse.questionId,
          },
        },
        update: {
          answer: gradedResponse.submittedAnswer as Prisma.InputJsonValue | undefined,
          awardedMarks: gradedResponse.awardedMarks,
          autoFeedback: gradedResponse.autoFeedback,
          submittedAt,
        },
        create: {
          attemptId: attempt.id,
          questionId: gradedResponse.questionId,
          answer: gradedResponse.submittedAnswer as Prisma.InputJsonValue | undefined,
          awardedMarks: gradedResponse.awardedMarks,
          autoFeedback: gradedResponse.autoFeedback,
          submittedAt,
        },
      });
    });

    await this.prisma.$transaction(responseWrites);

    const percentage = attempt.exam.totalMarks === 0 ? 0 : (score / attempt.exam.totalMarks) * 100;
    const updatedAttempt = await this.prisma.examAttempt.update({
      where: { id: attempt.id },
      data: {
        status: AttemptStatus.AUTO_GRADED,
        submittedAt: new Date(),
        autoGradedAt: new Date(),
        score,
        maxScore: attempt.exam.totalMarks,
        percentage,
        gradingSummary: {
          method: 'automatic',
          responseCount: gradedResponses.length,
          theoryAndCodingAssisted: gradedResponses.some((response) => Boolean(response.autoFeedback)),
        } as Prisma.InputJsonValue,
      },
    });

    await this.evaluateAttemptSecurity(updatedAttempt.id, attempt.exam.tabSwitchLimit);

    const passed = this.isCertificateEligible(percentage);
    const certificate = passed
      ? await this.certificatesService.issueCertificate(updatedAttempt.id)
      : null;

    return {
      attemptId: updatedAttempt.id,
      score,
      maxScore: attempt.exam.totalMarks,
      percentage,
      grade: this.getGradeFromPercentage(percentage),
      passed,
      certificate,
    };
  }

  async logStudentProctorEvent(attemptId: string, user: JwtUser, dto: ProctorEventDto) {
    const attempt = await this.prisma.examAttempt.findUnique({
      where: { id: attemptId },
      select: {
        id: true,
        studentId: true,
        status: true,
      },
    });

    if (!attempt) {
      throw new NotFoundException('Attempt not found');
    }

    if (attempt.studentId !== user.sub) {
      throw new ForbiddenException('You do not have access to this attempt.');
    }

    if (attempt.status !== AttemptStatus.IN_PROGRESS) {
      throw new BadRequestException('This attempt is no longer accepting proctor events.');
    }

    return this.proctoringService.logEvent(attempt.id, dto);
  }

  private async gradeQuestion(
    question: {
      type: QuestionType;
      marks: number;
      correctAnswer: Prisma.JsonValue | null;
      rubric: Prisma.JsonValue | null;
      explanation: string | null;
      prompt: string;
      options: { value: string; isCorrect: boolean }[];
    },
    answer: unknown,
  ) {
    if (question.type === QuestionType.MCQ) {
      const correctValues = question.options.filter((option) => option.isCorrect).map((option) => option.value).sort();
      const submittedValues = Array.isArray(answer) ? answer.map(String).sort() : [String(answer ?? '')];
      return {
        awardedMarks:
          JSON.stringify(correctValues) === JSON.stringify(submittedValues) ? question.marks : 0,
        summary:
          JSON.stringify(correctValues) === JSON.stringify(submittedValues)
            ? 'Correct option selected.'
            : 'Selected option did not match the expected answer.',
      };
    }

    if (question.type === QuestionType.THEORY) {
      return this.aiService.gradeOpenEndedResponse({
        prompt: question.prompt,
        expectedAnswer: question.correctAnswer,
        rubric: question.rubric,
        explanation: question.explanation,
        studentAnswer: answer,
        maxMarks: question.marks,
        questionType: 'THEORY',
      });
    }

    if (question.type === QuestionType.CODING) {
      const expected = JSON.stringify(question.correctAnswer ?? null);
      const actual = JSON.stringify(answer ?? null);
      if (expected === actual) {
        return {
          awardedMarks: question.marks,
          summary: 'Submitted code matched the expected answer exactly.',
        };
      }

      return this.aiService.gradeOpenEndedResponse({
        prompt: question.prompt,
        expectedAnswer: question.correctAnswer,
        rubric: question.rubric,
        explanation: question.explanation,
        studentAnswer: answer,
        maxMarks: question.marks,
        questionType: 'CODING',
      });
    }

    return {
      awardedMarks: 0,
      summary: 'Question could not be graded.',
    };
  }

  private buildPerformanceSeries(
    attempts: Array<{
      submittedAt: Date | null;
      percentage: number | null;
    }>,
  ) {
    const lastSix = attempts
      .slice(0, 6)
      .filter((attempt) => attempt.submittedAt && attempt.percentage !== null)
      .reverse();

    return lastSix.map((attempt) => ({
      label: new Intl.DateTimeFormat('en-US', { month: 'short' }).format(
        attempt.submittedAt as Date,
      ),
      score: Math.round(attempt.percentage ?? 0),
    }));
  }

  private buildRecentActivity(
    attempts: Array<{
      exam: { title: string };
      percentage: number | null;
      submittedAt: Date | null;
    }>,
    certificates: Array<{
      exam: { title: string };
      issuedAt: Date;
    }>,
    aiArtifacts: Array<{
      type: AIArtifactType;
      topic: string | null;
      createdAt: Date;
    }>,
  ) {
    const activities: Array<{
      title: string;
      description: string;
      timestamp: string;
      createdAt: Date;
    }> = [];

    attempts.slice(0, 3).forEach((attempt) => {
      if (!attempt.submittedAt) return;

      activities.push({
        title: `Completed ${attempt.exam.title}`,
        description:
          attempt.percentage !== null
            ? `Scored ${Math.round(attempt.percentage)}% on your latest submission.`
            : 'Submitted an assessment for review.',
        timestamp: this.formatRelativeTime(attempt.submittedAt),
        createdAt: attempt.submittedAt,
      });
    });

    certificates.slice(0, 2).forEach((certificate) => {
      activities.push({
        title: 'Certificate issued',
        description: `A verified certificate was issued for ${certificate.exam.title}.`,
        timestamp: this.formatRelativeTime(certificate.issuedAt),
        createdAt: certificate.issuedAt,
      });
    });

    aiArtifacts.slice(0, 2).forEach((artifact) => {
      activities.push({
        title: this.getArtifactTitle(artifact.type),
        description: artifact.topic
          ? `New ${artifact.type.toLowerCase().replace(/_/g, ' ')} created for ${artifact.topic}.`
          : 'Your AI guidance was refreshed from recent performance.',
        timestamp: this.formatRelativeTime(artifact.createdAt),
        createdAt: artifact.createdAt,
      });
    });

    return activities
      .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
      .slice(0, 4)
      .map(({ createdAt: _createdAt, ...activity }) => activity);
  }

  private buildCareerInsights(course: string | null, readinessScore: number) {
    const normalizedCourse = (course ?? '').toLowerCase();
    const techTrack = normalizedCourse.includes('computer') || normalizedCourse.includes('software');
    const lawTrack = normalizedCourse.includes('law');
    const engineeringTrack =
      normalizedCourse.includes('engineering') || normalizedCourse.includes('mechanical');

    if (lawTrack) {
      return [
        {
          title: 'Legal Research Assistant',
          match: this.getCareerMatch(readinessScore, 6),
          summary: 'Your current results suggest good potential for research-heavy entry roles with structured legal writing.',
          skills: ['Case analysis', 'Reasoning', 'Research'],
          href: '/career-insights',
        },
        {
          title: 'Compliance Analyst',
          match: this.getCareerMatch(readinessScore, 2),
          summary: 'Accuracy, policy interpretation, and disciplined review patterns align well with compliance work.',
          skills: ['Policy review', 'Judgment', 'Documentation'],
          href: '/career-insights',
        },
        {
          title: 'Graduate Program Associate',
          match: this.getCareerMatch(readinessScore, -3),
          summary: 'A broader graduate role where sharper communication and structured thinking will help you stand out.',
          skills: ['Writing', 'Coordination', 'Professional readiness'],
          href: '/career-insights',
        },
      ];
    }

    if (engineeringTrack) {
      return [
        {
          title: 'Graduate Engineering Analyst',
          match: this.getCareerMatch(readinessScore, 5),
          summary: 'Your readiness pattern supports analytical and systems-focused early-career engineering work.',
          skills: ['Technical judgment', 'Systems thinking', 'Analysis'],
          href: '/career-insights',
        },
        {
          title: 'Operations Improvement Analyst',
          match: this.getCareerMatch(readinessScore, 1),
          summary: 'You show promise in process thinking and structured problem review under assessment pressure.',
          skills: ['Process review', 'Quantitative thinking', 'Documentation'],
          href: '/career-insights',
        },
        {
          title: 'Technical Project Coordinator',
          match: this.getCareerMatch(readinessScore, -4),
          summary: 'A strong fit once you improve consistency and communication around technical work.',
          skills: ['Planning', 'Technical communication', 'Team coordination'],
          href: '/career-insights',
        },
      ];
    }

    const defaultTrack = techTrack || !lawTrack;
    if (defaultTrack) {
      return [
        {
          title: 'Junior Frontend Developer',
          match: this.getCareerMatch(readinessScore, 8),
          summary: 'Your strongest signals lean toward UI implementation, structured problem solving, and product-facing work.',
          skills: ['React', 'Problem solving', 'UI systems'],
          href: '/career-insights',
        },
        {
          title: 'QA Automation Analyst',
          match: this.getCareerMatch(readinessScore, 2),
          summary: 'Strong attention to detail and repeatable logic make testing-oriented roles a realistic pathway.',
          skills: ['Testing', 'Debugging', 'Quality mindset'],
          href: '/career-insights',
        },
        {
          title: 'Product Support Engineer',
          match: this.getCareerMatch(readinessScore, -3),
          summary: 'A good stepping-stone role if you keep strengthening technical communication and troubleshooting speed.',
          skills: ['Troubleshooting', 'Communication', 'Product fluency'],
          href: '/career-insights',
        },
      ];
    }

    return [];
  }

  private countRecentAttempts(attempts: Array<{ submittedAt: Date | null }>) {
    const now = new Date();
    return attempts.filter((attempt) => {
      if (!attempt.submittedAt) return false;
      return (
        attempt.submittedAt.getMonth() === now.getMonth() &&
        attempt.submittedAt.getFullYear() === now.getFullYear()
      );
    }).length;
  }

  private getReadinessLabel(score: number) {
    if (score >= 80) return 'Job-Ready';
    if (score >= 60) return 'Developing';
    return 'Beginner';
  }

  private getNextGoal(score: number, totalAttempts: number) {
    if (!totalAttempts) {
      return 'Complete your first assessment to unlock a real readiness signal.';
    }
    if (score >= 80) {
      return 'Maintain this level with one more strong result to deepen your employer-ready signal.';
    }
    if (score >= 60) {
      return 'Complete one more assessment and targeted practice to move into job-ready territory.';
    }
    return 'Use practice mode and one new assessment attempt to start lifting your readiness profile.';
  }

  private getPracticeHint(course: string | null, score: number) {
    const normalizedCourse = (course ?? '').toLowerCase();
    if (normalizedCourse.includes('law')) {
      return score >= 80
        ? 'Keep your reasoning sharp with short case-analysis drills this week.'
        : 'Focus on legal reasoning and case analysis drills to strengthen your next result.';
    }
    if (normalizedCourse.includes('engineering')) {
      return score >= 80
        ? 'A short quantitative review session today will help sustain this pace.'
        : 'Focus on technical reasoning and quantitative accuracy before your next assessment.';
    }
    return score >= 80
      ? 'A short frontend and problem-solving review today will help sustain this momentum.'
      : 'Continue practice for frontend and problem-solving topics.';
  }

  private getReadinessHelper(score: number) {
    if (score >= 80) return 'You are performing at a strong graduate-readiness level';
    if (score >= 60) return 'Closing in on job-ready with a few focused improvements';
    return 'Early signal stage, with room to build confidence and consistency';
  }

  private getExamField(title: string) {
    const normalizedTitle = title.toLowerCase();
    if (normalizedTitle.includes('law')) return 'Law';
    if (normalizedTitle.includes('engineer')) return 'Engineering';
    if (normalizedTitle.includes('tech')) return 'Technology';
    return 'General';
  }

  private getExamDifficulty(questions: Array<{ difficulty: string | null }>) {
    const normalized = questions
      .map((question) => (question.difficulty ?? '').toLowerCase())
      .filter(Boolean);

    if (normalized.length === 0) {
      return 'Intermediate';
    }

    if (normalized.every((value) => value === 'beginner')) {
      return 'Beginner';
    }

    if (normalized.every((value) => value === 'advanced')) {
      return 'Advanced';
    }

    return 'Intermediate';
  }

  private buildResultImprovementNote(title: string, percentage: number) {
    const field = this.getExamField(title).toLowerCase();

    if (percentage >= 90) {
      return `Outstanding result across ${field} tasks, with excellent consistency and confidence under pressure.`;
    }

    if (percentage >= 80) {
      return `Strong progress in ${field}, with a credit-level performance and a stronger employability signal than before.`;
    }

    if (percentage >= ExamsService.CERTIFICATE_ELIGIBILITY_PERCENTAGE) {
      return `You passed this ${field} assessment and unlocked certificate eligibility. One more strong result can deepen your readiness signal.`;
    }

    if (percentage >= 50) {
      return `There is visible progress in ${field}, but this result is still below certificate eligibility and needs more consistency.`;
    }

    return `There is progress in ${field}, but accuracy and consistency still need improvement before the next attempt.`;
  }

  private buildAttemptCompetencies(attempt: {
    percentage: number | null;
    tabSwitchCount: number;
    fullscreenViolations: number;
    suspiciousFlags: number;
    responses: Array<{
      awardedMarks: number | null;
      question: {
        type: QuestionType;
        marks: number;
      };
    }>;
  }) {
    const buckets = {
      'Assessment accuracy': { scoreSum: Math.round(attempt.percentage ?? 0), count: 1, tone: 'success' as const },
      'Applied reasoning': { scoreSum: 0, count: 0, tone: 'accent' as const },
      'Written communication': { scoreSum: 0, count: 0, tone: 'warm' as const },
      'Session discipline': {
        scoreSum: Math.max(
          0,
          100 - attempt.tabSwitchCount * 12 - attempt.fullscreenViolations * 18 - attempt.suspiciousFlags * 15,
        ),
        count: 1,
        tone: 'neutral' as const,
      },
    };

    attempt.responses.forEach((response) => {
      const marks = response.question.marks;
      const awarded = response.awardedMarks ?? 0;
      const score = marks > 0 ? Math.round((awarded / marks) * 100) : 0;

      if (response.question.type === QuestionType.THEORY) {
        buckets['Written communication'].scoreSum += score;
        buckets['Written communication'].count += 1;
      } else {
        buckets['Applied reasoning'].scoreSum += score;
        buckets['Applied reasoning'].count += 1;
      }
    });

    return Object.entries(buckets).map(([name, bucket]) => ({
      name,
      score: bucket.count ? Math.round(bucket.scoreSum / bucket.count) : 0,
      tone: bucket.tone,
    }));
  }

  private buildAttemptFormats(attempt: {
    responses: Array<{
      awardedMarks: number | null;
      question: {
        type: QuestionType;
        marks: number;
      };
    }>;
  }) {
    const buckets = {
      MCQ: { awarded: 0, total: 0 },
      THEORY: { awarded: 0, total: 0 },
      CODING: { awarded: 0, total: 0 },
    };

    attempt.responses.forEach((response) => {
      buckets[response.question.type].awarded += response.awardedMarks ?? 0;
      buckets[response.question.type].total += response.question.marks;
    });

    return [
      {
        label: 'MCQ performance',
        score: buckets.MCQ.total ? Math.round((buckets.MCQ.awarded / buckets.MCQ.total) * 100) : 0,
        helper: 'Accuracy and speed on structured objective questions.',
      },
      {
        label: 'Theory performance',
        score: buckets.THEORY.total ? Math.round((buckets.THEORY.awarded / buckets.THEORY.total) * 100) : 0,
        helper: 'Quality and structure across open-ended written responses.',
      },
      {
        label: 'Coding performance',
        score: buckets.CODING.total ? Math.round((buckets.CODING.awarded / buckets.CODING.total) * 100) : 0,
        helper: 'Problem solving and correctness across coding-style prompts.',
      },
    ];
  }

  private buildStudentCareerRoleMatches(input: {
    course: string;
    readinessScore: number;
    strongestSignal: { label: string; score: number };
    weakestSignal: { label: string; score: number };
    latestAssessmentTitle?: string;
    certificateCount: number;
    objectiveAccuracy: number;
    openEndedCommunication: number;
    sessionDiscipline: number;
    consistencyScore: number;
  }) {
    const track = this.getCareerTrack(input.course, input.latestAssessmentTitle);
    const templates = this.getCareerRoleTemplates(track);

    return templates
      .map((template) => {
        const match = this.calculateCareerRoleMatch({
          readinessScore: input.readinessScore,
          certificateCount: input.certificateCount,
          weights: template.weights,
          signalValues: {
            objectiveAccuracy: input.objectiveAccuracy,
            openEndedCommunication: input.openEndedCommunication,
            sessionDiscipline: input.sessionDiscipline,
            consistencyScore: input.consistencyScore,
          },
        });

        return {
          id: template.id,
          title: template.title,
          match,
          summary: `This match is driven mainly by your ${input.strongestSignal.label.toLowerCase()} signal and your recent ${track.label.toLowerCase()} assessment pattern${input.latestAssessmentTitle ? `, especially in ${input.latestAssessmentTitle}` : ''}.`,
          skills: template.skills,
          fitType: this.getCareerFitType(match),
          focusAreas: template.focusAreas.map((item) =>
            item.replace('{weakestSignal}', input.weakestSignal.label.toLowerCase()),
          ),
          environments: template.environments,
          href: `/career-insights?role=${template.id}#role-spotlight`,
        };
      })
      .sort((left, right) => right.match - left.match);
  }

  private computeCareerSignalScore(
    attempts: Array<{
      responses: Array<{
        awardedMarks: number | null;
        question: {
          type: QuestionType;
          marks: number;
        };
      }>;
    }>,
    types: QuestionType[],
    fallback: number,
  ) {
    let awarded = 0;
    let total = 0;

    attempts.forEach((attempt) => {
      attempt.responses.forEach((response) => {
        if (types.includes(response.question.type)) {
          awarded += response.awardedMarks ?? 0;
          total += response.question.marks;
        }
      });
    });

    if (!total) {
      return fallback;
    }

    return Math.max(45, Math.min(96, Math.round((awarded / total) * 100)));
  }

  private getCareerDirectionLabel(course: string, topRoleTitle?: string) {
    if (course?.trim()) {
      return course;
    }
    if (topRoleTitle) {
      return topRoleTitle;
    }
    return 'General readiness';
  }

  private getGradeFromPercentage(percentage: number) {
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 80) return 'Credit';
    if (percentage >= ExamsService.CERTIFICATE_ELIGIBILITY_PERCENTAGE) return 'Passed';
    if (percentage >= 50) return 'Fairly passed';
    return 'Fail';
  }

  private getAssessmentOutcomeStatus(percentage: number) {
    return this.getGradeFromPercentage(percentage);
  }

  private isCertificateEligible(percentage: number) {
    return percentage >= ExamsService.CERTIFICATE_ELIGIBILITY_PERCENTAGE;
  }

  private getCareerMatch(readinessScore: number, offset: number) {
    return Math.max(55, Math.min(96, readinessScore + offset));
  }

  private computeSessionDisciplineScore(
    attempts: Array<{
      tabSwitchCount: number;
      fullscreenViolations: number;
      suspiciousFlags: number;
    }>,
  ) {
    if (!attempts.length) {
      return 0;
    }

    const average =
      attempts.reduce((sum, attempt) => {
        const score =
          100 -
          attempt.tabSwitchCount * 12 -
          attempt.fullscreenViolations * 16 -
          attempt.suspiciousFlags * 15;
        return sum + Math.max(0, score);
      }, 0) / attempts.length;

    return Math.max(0, Math.min(100, Math.round(average)));
  }

  private computeConsistencyScore(
    attempts: Array<{
      percentage: number | null;
    }>,
  ) {
    const values = attempts
      .map((attempt) => attempt.percentage ?? 0)
      .filter((value) => Number.isFinite(value));

    if (values.length <= 1) {
      return values.length === 1 ? Math.round(values[0]) : 0;
    }

    const average = values.reduce((sum, value) => sum + value, 0) / values.length;
    const variance =
      values.reduce((sum, value) => sum + (value - average) ** 2, 0) / values.length;
    const deviation = Math.sqrt(variance);

    return Math.max(40, Math.min(100, Math.round(100 - deviation * 2.2)));
  }

  private getCareerTrack(course: string, latestAssessmentTitle?: string) {
    const normalizedCourse = `${course} ${latestAssessmentTitle ?? ''}`.toLowerCase();

    if (normalizedCourse.includes('law')) {
      return { key: 'law' as const, label: 'Law' };
    }

    if (
      normalizedCourse.includes('engineer') ||
      normalizedCourse.includes('mechanic') ||
      normalizedCourse.includes('civil')
    ) {
      return { key: 'engineering' as const, label: 'Engineering' };
    }

    return { key: 'technology' as const, label: 'Technology' };
  }

  private getCareerRoleTemplates(track: { key: 'law' | 'engineering' | 'technology'; label: string }) {
    if (track.key === 'law') {
      return [
        {
          id: 'legal-research',
          title: 'Legal Research Assistant',
          weights: {
            objectiveAccuracy: 0.22,
            openEndedCommunication: 0.38,
            sessionDiscipline: 0.12,
            consistencyScore: 0.08,
            readiness: 0.2,
          },
          skills: ['Research', 'Structured writing', 'Case analysis'],
          focusAreas: [
            'Sharpen {weakestSignal} to support stronger legal writing and argument flow.',
            'Build more case-analysis depth under timed conditions.',
            'Improve synthesis across longer legal reasoning prompts.',
          ],
          environments: ['Law firms', 'Policy teams', 'Advisory units'],
        },
        {
          id: 'compliance-analyst',
          title: 'Compliance Analyst',
          weights: {
            objectiveAccuracy: 0.26,
            openEndedCommunication: 0.24,
            sessionDiscipline: 0.18,
            consistencyScore: 0.12,
            readiness: 0.2,
          },
          skills: ['Policy review', 'Documentation', 'Risk judgment'],
          focusAreas: [
            'Improve {weakestSignal} so your documentation reads more clearly.',
            'Build steadier accuracy on structured rule-based questions.',
            'Strengthen consistency across repeated assessment attempts.',
          ],
          environments: ['Compliance teams', 'Financial services', 'Regulated industries'],
        },
        {
          id: 'graduate-program-associate',
          title: 'Graduate Program Associate',
          weights: {
            objectiveAccuracy: 0.2,
            openEndedCommunication: 0.26,
            sessionDiscipline: 0.18,
            consistencyScore: 0.16,
            readiness: 0.2,
          },
          skills: ['Coordination', 'Professional communication', 'Documentation'],
          focusAreas: [
            'Improve {weakestSignal} for stronger cross-team communication.',
            'Keep building confidence in longer written responses.',
            'Use one more strong assessment result to deepen credibility for graduate roles.',
          ],
          environments: ['Corporate graduate programs', 'Operations teams', 'Advisory support'],
        },
      ];
    }

    if (track.key === 'engineering') {
      return [
        {
          id: 'engineering-analyst',
          title: 'Graduate Engineering Analyst',
          weights: {
            objectiveAccuracy: 0.34,
            openEndedCommunication: 0.12,
            sessionDiscipline: 0.12,
            consistencyScore: 0.22,
            readiness: 0.2,
          },
          skills: ['Analytical consistency', 'Systems thinking', 'Technical judgment'],
          focusAreas: [
            'Improve {weakestSignal} so your technical thinking translates more clearly.',
            'Raise consistency on multi-step analytical questions.',
            'Keep strengthening reporting clarity across engineering scenarios.',
          ],
          environments: ['Operations teams', 'Engineering support units', 'Technical analysis roles'],
        },
        {
          id: 'operations-improvement',
          title: 'Operations Improvement Analyst',
          weights: {
            objectiveAccuracy: 0.28,
            openEndedCommunication: 0.18,
            sessionDiscipline: 0.18,
            consistencyScore: 0.16,
            readiness: 0.2,
          },
          skills: ['Process review', 'Quantitative thinking', 'Documentation'],
          focusAreas: [
            'Improve {weakestSignal} so recommendations are communicated more convincingly.',
            'Build stronger discipline across timed sessions and reviews.',
            'Keep lifting objective accuracy on process-heavy questions.',
          ],
          environments: ['Operations teams', 'Service delivery units', 'Manufacturing support'],
        },
        {
          id: 'technical-project-coordinator',
          title: 'Technical Project Coordinator',
          weights: {
            objectiveAccuracy: 0.18,
            openEndedCommunication: 0.28,
            sessionDiscipline: 0.18,
            consistencyScore: 0.16,
            readiness: 0.2,
          },
          skills: ['Planning', 'Coordination', 'Technical communication'],
          focusAreas: [
            'Improve {weakestSignal} for clearer updates and stakeholder communication.',
            'Build steadier consistency from one assessment cycle to the next.',
            'Use stronger assessment discipline to support delivery-focused roles.',
          ],
          environments: ['Project teams', 'Implementation groups', 'Technical operations'],
        },
      ];
    }

    return [
      {
        id: 'frontend-dev',
        title: 'Junior Frontend Developer',
        weights: {
          objectiveAccuracy: 0.34,
          openEndedCommunication: 0.16,
          sessionDiscipline: 0.12,
          consistencyScore: 0.18,
          readiness: 0.2,
        },
        skills: ['Problem solving', 'UI systems', 'Web fundamentals'],
        focusAreas: [
          'Improve {weakestSignal} so your implementation thinking is explained more clearly.',
          'Keep raising objective accuracy on practical frontend-style questions.',
          'Build steadier consistency before your next technical assessment.',
        ],
        environments: ['Product teams', 'Startups', 'Internal tools platforms'],
      },
      {
        id: 'product-analyst',
        title: 'Graduate Product Analyst',
        weights: {
          objectiveAccuracy: 0.18,
          openEndedCommunication: 0.34,
          sessionDiscipline: 0.12,
          consistencyScore: 0.16,
          readiness: 0.2,
        },
        skills: ['Structured thinking', 'Analysis', 'Communication'],
        focusAreas: [
          'Improve {weakestSignal} so your ideas land more clearly in product-facing contexts.',
          'Keep strengthening reasoning across open-ended prompts.',
          'Use another strong result to make this role fit more reliable.',
        ],
        environments: ['Product teams', 'Digital services', 'Research-driven startups'],
      },
      {
        id: 'product-support-engineer',
        title: 'Product Support Engineer',
        weights: {
          objectiveAccuracy: 0.24,
          openEndedCommunication: 0.18,
          sessionDiscipline: 0.24,
          consistencyScore: 0.14,
          readiness: 0.2,
        },
        skills: ['Troubleshooting', 'Product fluency', 'Issue communication'],
        focusAreas: [
          'Improve {weakestSignal} so issue diagnosis and communication stay sharp under pressure.',
          'Keep strengthening session discipline and assessment integrity.',
          'Lift consistency across technical tasks before your next attempt.',
        ],
        environments: ['Support engineering teams', 'SaaS products', 'Customer success engineering'],
      },
    ];
  }

  private calculateCareerRoleMatch(input: {
    readinessScore: number;
    certificateCount: number;
    weights: {
      objectiveAccuracy: number;
      openEndedCommunication: number;
      sessionDiscipline: number;
      consistencyScore: number;
      readiness: number;
    };
    signalValues: {
      objectiveAccuracy: number;
      openEndedCommunication: number;
      sessionDiscipline: number;
      consistencyScore: number;
    };
  }) {
    const weightedScore =
      input.signalValues.objectiveAccuracy * input.weights.objectiveAccuracy +
      input.signalValues.openEndedCommunication * input.weights.openEndedCommunication +
      input.signalValues.sessionDiscipline * input.weights.sessionDiscipline +
      input.signalValues.consistencyScore * input.weights.consistencyScore +
      input.readinessScore * input.weights.readiness;
    const certificateBoost = Math.min(4, input.certificateCount * 2);

    return Math.max(48, Math.min(96, Math.round(weightedScore + certificateBoost)));
  }

  private getCareerFitType(match: number) {
    if (match >= 84) return 'Strong fit' as const;
    if (match >= 72) return 'Emerging fit' as const;
    return 'Stretch fit' as const;
  }

  private buildCareerStrengths(input: {
    strongestSignal: { label: string; score: number };
    certificatesEarned: number;
    readinessLevel: string;
    latestAssessmentTitle?: string;
  }) {
    return [
      `${input.strongestSignal.label} is currently your clearest employability signal at ${input.strongestSignal.score}%.`,
      input.latestAssessmentTitle
        ? `Your recent results, including ${input.latestAssessmentTitle}, are giving this career direction more evidence.`
        : `Your ${input.readinessLevel.toLowerCase()} readiness profile is starting to form a clearer direction.`,
      input.certificatesEarned > 0
        ? `You have already turned performance into ${input.certificatesEarned} earned certificate${input.certificatesEarned > 1 ? 's' : ''}, which strengthens your profile.`
        : 'You are building a profile that can become much more credible with one more strong completed assessment.',
    ];
  }

  private buildCareerGaps(input: {
    weakestSignal: { label: string; score: number };
    certificatesEarned: number;
    sessionDiscipline: number;
    consistencyScore: number;
  }) {
    const gaps = [
      `${input.weakestSignal.label} is your biggest current blocker and the fastest thing to improve next.`,
      input.consistencyScore < 75
        ? 'Your performance is still fluctuating across attempts, so steadier results would strengthen your role fit.'
        : 'Keep your stronger performance levels steady so employers see a more reliable readiness pattern.',
    ];

    gaps.push(
      input.sessionDiscipline < 85
        ? 'Assessment discipline and integrity signals need to stay stronger, because they affect how trustworthy your readiness profile looks.'
        : input.certificatesEarned > 0
          ? 'Use your passed assessments as a baseline and focus the next cycle on deepening your weaker signal.'
          : 'A stronger next result would make your current career direction much more convincing.',
    );

    return gaps;
  }

  private getArtifactTitle(type: AIArtifactType) {
    if (type === AIArtifactType.PRACTICE_QUESTIONS) return 'Started AI practice session';
    if (type === AIArtifactType.STUDY_PLAN) return 'Study plan refreshed';
    if (type === AIArtifactType.CAREER_PATH) return 'Career recommendations refreshed';
    return 'Question guidance updated';
  }

  private formatDate(date: Date) {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  }

  private formatRelativeTime(date: Date) {
    const diffInSeconds = Math.round((date.getTime() - Date.now()) / 1000);
    const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

    const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
      ['day', 60 * 60 * 24],
      ['hour', 60 * 60],
      ['minute', 60],
    ];

    for (const [unit, seconds] of units) {
      if (Math.abs(diffInSeconds) >= seconds || unit === 'minute') {
        return formatter.format(Math.round(diffInSeconds / seconds), unit);
      }
    }

    return formatter.format(diffInSeconds, 'second');
  }

  private async evaluateAttemptSecurity(attemptId: string, tabSwitchLimit: number) {
    const attempt = await this.prisma.examAttempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt) {
      return;
    }

    if (attempt.tabSwitchCount > tabSwitchLimit || attempt.fullscreenViolations > 0) {
      await this.prisma.examAttempt.update({
        where: { id: attemptId },
        data: { status: AttemptStatus.TERMINATED },
      });

      await this.proctoringService.logEvent(attemptId, {
        type: ProctorEventType.SUSPICIOUS_ACTIVITY,
        severity: 3,
        payload: {
          reason: 'Attempt terminated after proctoring rule violation',
          tabSwitchCount: attempt.tabSwitchCount,
          fullscreenViolations: attempt.fullscreenViolations,
        },
      });
    }
  }
}
