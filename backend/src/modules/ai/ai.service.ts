import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIArtifactType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { GenerateAiArtifactDto } from './dto/generate-ai-artifact.dto';
import { GeneratePracticeSessionDto } from './dto/generate-practice-session.dto';
import {
  PracticeQuestionFeedbackDto,
  ReviewPracticeSessionDto,
} from './dto/review-practice-session.dto';

type GradeOpenEndedResponseInput = {
  prompt: string;
  expectedAnswer?: unknown;
  rubric?: unknown;
  explanation?: string | null;
  studentAnswer?: unknown;
  maxMarks: number;
  questionType: 'THEORY' | 'CODING';
};

type GradeOpenEndedResponseResult = {
  awardedMarks: number;
  confidence: number;
  summary: string;
  matchedCriteria: string[];
  missedCriteria: string[];
  grader: 'ai' | 'heuristic';
};

type GenerateCareerInsightNarrativeInput = {
  course: string;
  readinessScore: number;
  readinessLevel: string;
  totalAttempts: number;
  certificateCount: number;
  latestAssessmentTitle?: string;
  topRole: {
    title: string;
    match: number;
  };
  strongestSignal: {
    label: string;
    score: number;
  };
  weakestSignal: {
    label: string;
    score: number;
  };
};

type GenerateCareerInsightNarrativeResult = {
  summary: string;
  strengths: string[];
  gaps: string[];
};

type PracticeCategory = 'Law' | 'Engineering' | 'Tech';
type PracticeQuestionType = 'MCQ' | 'Theory' | 'Coding' | 'Mixed';
type PracticeDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';
type PracticeStyle = 'Instant Feedback' | 'End-of-Session Review';

type PracticeQuestionBase = {
  id: string;
  number: number;
  type: 'mcq' | 'theory' | 'coding';
  prompt: string;
  supportingText?: string;
  topic: string;
  difficulty: PracticeDifficulty;
  explanation: string;
  takeaway: string;
  recommendedTopic: string;
};

type PracticeSessionQuestion =
  | (PracticeQuestionBase & {
      type: 'mcq';
      options: Array<{ id: string; label: string }>;
      correctOptionId: string;
    })
  | (PracticeQuestionBase & {
      type: 'theory';
      placeholder: string;
      modelAnswer: string;
      feedback: {
        strengths: string[];
        improvements: string[];
        betterResponseTip: string;
      };
    })
  | (PracticeQuestionBase & {
      type: 'coding';
      language: 'JavaScript' | 'Python';
      starterCode: string;
      sampleInput: string;
      sampleOutput: string;
      feedback: {
        logicQuality: string;
        codeClarity: string;
        improvementSuggestions: string[];
        modelApproach: string;
      };
    });

type StoredPracticeSession = {
  id: string;
  title: string;
  category: PracticeCategory;
  topic: string;
  difficulty: PracticeDifficulty;
  questionType: PracticeQuestionType;
  questionCount: number;
  style: PracticeStyle;
  progressNote: string;
  relaxedModeLabel: string;
  focusAreas: string[];
  recommendedTopics: string[];
  studyTips: string[];
  questions: PracticeSessionQuestion[];
};

type PracticeQuestionReview = {
  id: string;
  questionId: string;
  number: number;
  type: 'MCQ' | 'Theory' | 'Coding';
  prompt: string;
  userAnswer: string;
  idealAnswer: string;
  explanation: string;
  improvementNote: string;
  outcome: 'Correct' | 'Needs Improvement';
  score: number;
  maxScore: number;
  recommendedTopic: string;
};

type StoredPracticeReview = {
  id: string;
  sessionId: string;
  title: string;
  field: PracticeCategory;
  topic: string;
  difficulty: PracticeDifficulty;
  score: string;
  completion: string;
  completedAt: string;
  weakAreas: string[];
  studyPlan: Array<{ day: string; focus: string }>;
  careerInsight: string;
  summaryMetrics: Array<{ title: string; value: string; helper: string }>;
  questions: PracticeQuestionReview[];
  sessionSummary: string;
};

type PracticeBootstrapResponse = {
  recommendation: {
    title: string;
    summary: string;
    category: PracticeCategory;
    topic: string;
    difficulty: PracticeDifficulty;
    questionType: PracticeQuestionType;
    questionCount: number;
    style: PracticeStyle;
    focusAreas: string[];
  };
  recentSessions: Array<{
    id: string;
    title: string;
    topic: string;
    score: string;
    completion: string;
    summary: string;
    href: string;
  }>;
  studyPlan: Array<{ day: string; focus: string }>;
};

type PracticeQuestionSeed =
  | (Omit<
      Extract<PracticeSessionQuestion, { type: 'mcq' }>,
      'id' | 'number' | 'topic' | 'difficulty' | 'recommendedTopic'
    > & { recommendedTopic?: string })
  | (Omit<
      Extract<PracticeSessionQuestion, { type: 'theory' }>,
      'id' | 'number' | 'topic' | 'difficulty' | 'recommendedTopic'
    > & { recommendedTopic?: string })
  | (Omit<
      Extract<PracticeSessionQuestion, { type: 'coding' }>,
      'id' | 'number' | 'topic' | 'difficulty' | 'recommendedTopic'
    > & { recommendedTopic?: string });

@Injectable()
export class AiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async generateArtifact(userId: string, dto: GenerateAiArtifactDto) {
    const apiKey = this.configService.get<string>('app.geminiApiKey');
    if (!apiKey) {
      throw new ServiceUnavailableException('Gemini API key is not configured');
    }

    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = this.buildPrompt(dto.type, dto.prompt, dto.topic);
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return this.prisma.aIArtifact.create({
      data: {
        userId,
        type: dto.type,
        topic: dto.topic,
        prompt,
        response: { text } as Prisma.InputJsonValue,
      },
    });
  }

  async gradeOpenEndedResponse(
    input: GradeOpenEndedResponseInput,
  ): Promise<GradeOpenEndedResponseResult> {
    const apiKey = this.configService.get<string>('app.geminiApiKey');

    if (apiKey) {
      try {
        return await this.gradeWithGemini(apiKey, input);
      } catch {
        return this.gradeHeuristically(input);
      }
    }

    return this.gradeHeuristically(input);
  }

  async generateCareerInsightNarrative(
    input: GenerateCareerInsightNarrativeInput,
  ): Promise<GenerateCareerInsightNarrativeResult> {
    const apiKey = this.configService.get<string>('app.geminiApiKey');

    if (apiKey) {
      try {
        return await this.generateCareerNarrativeWithGemini(apiKey, input);
      } catch {
        return this.generateCareerNarrativeHeuristically(input);
      }
    }

    return this.generateCareerNarrativeHeuristically(input);
  }

  async getPracticeBootstrap(userId: string): Promise<PracticeBootstrapResponse> {
    const [user, attempts, reviewArtifacts] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { course: true, firstName: true },
      }),
      this.prisma.examAttempt.findMany({
        where: {
          studentId: userId,
          submittedAt: { not: null },
          percentage: { not: null },
        },
        include: {
          exam: {
            select: {
              title: true,
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
        orderBy: { submittedAt: 'desc' },
        take: 8,
      }),
      this.prisma.aIArtifact.findMany({
        where: {
          userId,
          type: AIArtifactType.PRACTICE_QUESTIONS,
        },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
    ]);

    const latestAttempt = attempts[0];
    const category = this.getPracticeCategory(user?.course, latestAttempt?.exam.title);
    const signalScores = this.getPracticeSignalScores(attempts);
    const weakestSignal = [...signalScores].sort((a, b) => a.score - b.score)[0];
    const topic = this.getRecommendedPracticeTopic(category, weakestSignal?.label);
    const recommendation = {
      title: 'Recommended for your next session',
      summary: latestAttempt
        ? `Based on your recent performance, we recommend a focused ${topic} session to improve ${weakestSignal?.label.toLowerCase() ?? 'weaker areas'} before your next scored assessment.`
        : `Start with a guided ${topic} session to build a clearer readiness signal without exam pressure.`,
      category,
      topic,
      difficulty: this.getRecommendedPracticeDifficulty(latestAttempt?.percentage ?? null),
      questionType: this.getRecommendedPracticeQuestionType(weakestSignal?.label),
      questionCount: latestAttempt ? 10 : 5,
      style: 'Instant Feedback' as const,
      focusAreas: this.getRecommendationFocusAreas(category, weakestSignal?.label),
    };

    const recentSessions = reviewArtifacts
      .map((artifact) => {
        const payload = artifact.response as Prisma.JsonObject;
        if (payload?.kind !== 'practice-review') return null;
        const review = payload.review as Prisma.JsonObject | undefined;
        if (!review) return null;

        return {
          id: artifact.id,
          title: String(review.title ?? 'Practice Review'),
          topic: String(review.topic ?? recommendation.topic),
          score: String(review.score ?? '0%'),
          completion: `Completed ${this.formatRelativeDate(artifact.createdAt)}`,
          summary: String(review.sessionSummary ?? 'Guided review is available for this practice session.'),
          href: `/practice/review?reviewId=${artifact.id}`,
        };
      })
      .filter(Boolean)
      .slice(0, 3) as PracticeBootstrapResponse['recentSessions'];

    return {
      recommendation,
      recentSessions,
      studyPlan: this.buildPracticeStudyPlan(
        recommendation.focusAreas,
        topic,
      ),
    };
  }

  async generatePracticeSession(userId: string, dto: GeneratePracticeSessionDto) {
    const session = await this.buildPracticeSession(userId, dto);
    const artifact = await this.prisma.aIArtifact.create({
      data: {
        userId,
        type: AIArtifactType.PRACTICE_QUESTIONS,
        topic: dto.topic,
        prompt: `Generate practice session for ${dto.category} / ${dto.topic} / ${dto.questionType} / ${dto.difficulty}`,
        response: {
          kind: 'practice-session',
          session,
        } as Prisma.InputJsonValue,
      },
    });

    return {
      sessionId: artifact.id,
      session,
    };
  }

  async getPracticeSession(userId: string, sessionId: string) {
    const artifact = await this.prisma.aIArtifact.findFirst({
      where: {
        id: sessionId,
        userId,
        type: AIArtifactType.PRACTICE_QUESTIONS,
      },
    });

    const payload = artifact?.response as Prisma.JsonObject | undefined;
    if (!artifact || payload?.kind !== 'practice-session') {
      throw new NotFoundException('Practice session not found');
    }

    return {
      sessionId: artifact.id,
      session: payload.session,
    };
  }

  async getPracticeQuestionFeedback(userId: string, dto: PracticeQuestionFeedbackDto) {
    const session = await this.resolvePracticeSession(userId, dto.sessionId);
    const question = session.questions.find((item) => item.id === dto.questionId);

    if (!question) {
      throw new NotFoundException('Practice question not found');
    }

    return this.evaluatePracticeQuestion(question, dto.answer);
  }

  async reviewPracticeSession(userId: string, dto: ReviewPracticeSessionDto) {
    const session = await this.resolvePracticeSession(userId, dto.sessionId);
    const answersByQuestionId = new Map(
      dto.answers.map((item) => [item.questionId, item.answer]),
    );

    const questionReviews = await Promise.all(
      session.questions.map((question) =>
        this.evaluatePracticeQuestion(question, answersByQuestionId.get(question.id)),
      ),
    );

    const totalScore = questionReviews.reduce((sum, review) => sum + review.score, 0);
    const maxScore = questionReviews.reduce((sum, review) => sum + review.maxScore, 0);
    const accuracy = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    const correctCount = questionReviews.filter((review) => review.outcome === 'Correct').length;
    const weakAreas = Array.from(
      new Set(
        questionReviews
          .filter((review) => review.outcome === 'Needs Improvement')
          .map((review) => review.recommendedTopic),
      ),
    ).slice(0, 3);
    const strongestArea =
      this.getMostCommon(questionReviews.filter((review) => review.outcome === 'Correct').map((review) => review.recommendedTopic)) ??
      session.topic;
    const weakestArea =
      this.getMostCommon(questionReviews.filter((review) => review.outcome === 'Needs Improvement').map((review) => review.recommendedTopic)) ??
      weakAreas[0] ??
      session.topic;

    const review: StoredPracticeReview = {
      id: `practice-review-${Date.now()}`,
      sessionId: dto.sessionId,
      title: `${session.topic} Guided Practice`,
      field: session.category,
      topic: session.topic,
      difficulty: session.difficulty,
      score: `${accuracy}%`,
      completion: `${correctCount} of ${session.questions.length} answered strongly`,
      completedAt: this.formatDate(new Date()),
      weakAreas,
      studyPlan: this.buildPracticeStudyPlan(weakAreas.length ? weakAreas : session.focusAreas, session.topic),
      careerInsight: this.buildPracticeCareerInsight(session.category, strongestArea, weakestArea, accuracy),
      sessionSummary:
        accuracy >= 80
          ? `Strong session overall. You are getting more confident in ${strongestArea.toLowerCase()} and can now focus on polishing weaker areas.`
          : `This session shows clear progress, but ${weakestArea.toLowerCase()} still needs more guided repetition.`,
      summaryMetrics: [
        {
          title: 'Correct answers',
          value: `${correctCount}/${session.questions.length}`,
          helper: `You performed best on ${strongestArea.toLowerCase()} prompts.`,
        },
        {
          title: 'Accuracy rate',
          value: `${accuracy}%`,
          helper:
            accuracy >= 80
              ? 'A strong guided-practice result with useful momentum.'
              : 'A good base to build on with another focused session.',
        },
        {
          title: 'Strongest area',
          value: strongestArea,
          helper: 'This is the topic where your answers felt most secure.',
        },
        {
          title: 'Weakest area',
          value: weakestArea,
          helper: 'This is the clearest opportunity for your next practice cycle.',
        },
      ],
      questions: questionReviews.map((review) => ({
        ...review,
      })),
    };

    const artifact = await this.prisma.aIArtifact.create({
      data: {
        userId,
        type: AIArtifactType.PRACTICE_QUESTIONS,
        topic: session.topic,
        prompt: `Review practice session ${dto.sessionId}`,
        response: {
          kind: 'practice-review',
          review,
        } as Prisma.InputJsonValue,
      },
    });

    return {
      reviewId: artifact.id,
      review,
    };
  }

  async getPracticeReview(userId: string, reviewId: string) {
    const artifact = await this.prisma.aIArtifact.findFirst({
      where: {
        id: reviewId,
        userId,
        type: AIArtifactType.PRACTICE_QUESTIONS,
      },
    });

    const payload = artifact?.response as Prisma.JsonObject | undefined;
    if (!artifact || payload?.kind !== 'practice-review') {
      throw new NotFoundException('Practice review not found');
    }

    return {
      reviewId: artifact.id,
      review: payload.review,
    };
  }

  private buildPrompt(type: AIArtifactType, prompt: string, topic?: string) {
    const commonRules = [
      'Return structured, concise educational content.',
      'Do not reveal exam answers for any real examination attempt.',
      'If generating practice questions, include difficulty and expected answer summary.',
    ].join(' ');

    const typeInstruction: Record<AIArtifactType, string> = {
      PRACTICE_QUESTIONS: 'Generate practice questions only.',
      STUDY_PLAN: 'Generate a focused study plan with milestones.',
      CAREER_PATH: 'Suggest career paths aligned with the learner profile.',
      QUESTION_SUGGESTION: 'Suggest high-quality exam questions for admins.',
    };

    return `${commonRules} ${typeInstruction[type]} Topic: ${topic ?? 'general'}. User request: ${prompt}`;
  }

  private async gradeWithGemini(
    apiKey: string,
    input: GradeOpenEndedResponseInput,
  ): Promise<GradeOpenEndedResponseResult> {
    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = [
      'You are grading a graduate employability assessment response.',
      'Return JSON only with keys: awardedMarks, confidence, summary, matchedCriteria, missedCriteria.',
      `Question type: ${input.questionType}.`,
      `Question prompt: ${input.prompt}`,
      `Maximum marks: ${input.maxMarks}`,
      `Expected answer: ${JSON.stringify(input.expectedAnswer ?? null)}`,
      `Rubric: ${JSON.stringify(input.rubric ?? null)}`,
      `Reference explanation: ${input.explanation ?? ''}`,
      `Student answer: ${JSON.stringify(input.studentAnswer ?? null)}`,
      'Be strict but fair. Reward semantic correctness, coverage, clarity, and working logic where applicable.',
      'awardedMarks must be a number between 0 and max marks. confidence must be a number between 0 and 1.',
    ].join('\n');

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = this.extractJson<{
      awardedMarks?: number;
      confidence?: number;
      summary?: string;
      matchedCriteria?: string[];
      missedCriteria?: string[];
    }>(text);

    return {
      awardedMarks: this.clampMarks(parsed.awardedMarks ?? 0, input.maxMarks),
      confidence: this.clampConfidence(parsed.confidence ?? 0.75),
      summary:
        parsed.summary?.trim() ||
        'AI-assisted grading completed based on rubric alignment and semantic similarity.',
      matchedCriteria: Array.isArray(parsed.matchedCriteria) ? parsed.matchedCriteria.slice(0, 5) : [],
      missedCriteria: Array.isArray(parsed.missedCriteria) ? parsed.missedCriteria.slice(0, 5) : [],
      grader: 'ai',
    };
  }

  private async generateCareerNarrativeWithGemini(
    apiKey: string,
    input: GenerateCareerInsightNarrativeInput,
  ): Promise<GenerateCareerInsightNarrativeResult> {
    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = [
      'You are generating concise career-insight copy for a graduate employability platform.',
      'Return JSON only with keys: summary, strengths, gaps.',
      'The tone should be supportive, honest, and evidence-based.',
      'Do not invent data outside the evidence provided.',
      `Course: ${input.course}`,
      `Readiness score: ${input.readinessScore}`,
      `Readiness level: ${input.readinessLevel}`,
      `Completed assessments: ${input.totalAttempts}`,
      `Certificates earned: ${input.certificateCount}`,
      `Latest assessment: ${input.latestAssessmentTitle ?? 'N/A'}`,
      `Top role match: ${input.topRole.title} (${input.topRole.match}%)`,
      `Strongest signal: ${input.strongestSignal.label} (${input.strongestSignal.score}%)`,
      `Weakest signal: ${input.weakestSignal.label} (${input.weakestSignal.score}%)`,
      'Summary should be 1-2 sentences.',
      'Strengths and gaps should each contain exactly 3 concise bullet-style strings.',
    ].join('\n');

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = this.extractJson<{
      summary?: string;
      strengths?: string[];
      gaps?: string[];
    }>(text);

    const fallback = this.generateCareerNarrativeHeuristically(input);

    return {
      summary: parsed.summary?.trim() || fallback.summary,
      strengths:
        Array.isArray(parsed.strengths) && parsed.strengths.length > 0
          ? parsed.strengths.slice(0, 3)
          : fallback.strengths,
      gaps:
        Array.isArray(parsed.gaps) && parsed.gaps.length > 0
          ? parsed.gaps.slice(0, 3)
          : fallback.gaps,
    };
  }

  private gradeHeuristically(
    input: GradeOpenEndedResponseInput,
  ): GradeOpenEndedResponseResult {
    const studentText = this.normalizeText(input.studentAnswer);
    const expectedText = this.normalizeText(input.expectedAnswer);
    const rubricText = this.normalizeText(input.rubric);
    const referenceText = [expectedText, rubricText, input.explanation ?? '']
      .filter(Boolean)
      .join(' ');

    if (!studentText.trim()) {
      return {
        awardedMarks: 0,
        confidence: 0.5,
        summary: 'No meaningful response was detected for grading.',
        matchedCriteria: [],
        missedCriteria: ['No submitted answer'],
        grader: 'heuristic',
      };
    }

    const referenceKeywords = this.extractKeywords(referenceText);
    const studentKeywords = this.extractKeywords(studentText);
    const matchedKeywords = referenceKeywords.filter((keyword) =>
      studentKeywords.includes(keyword),
    );
    const coverage =
      referenceKeywords.length > 0 ? matchedKeywords.length / referenceKeywords.length : 0.6;

    const lengthFactor = Math.min(1, studentText.length / Math.max(80, referenceText.length || 80));
    const combinedScore = (coverage * 0.75) + (lengthFactor * 0.25);
    const awardedMarks = this.clampMarks(
      Math.round(input.maxMarks * Math.max(0.15, combinedScore)),
      input.maxMarks,
    );

    const missedCriteria = referenceKeywords
      .filter((keyword) => !studentKeywords.includes(keyword))
      .slice(0, 5);

    return {
      awardedMarks,
      confidence: this.clampConfidence(referenceKeywords.length ? 0.62 : 0.55),
      summary:
        awardedMarks >= input.maxMarks * 0.75
          ? 'The response covers most of the expected ideas and aligns reasonably well with the grading guide.'
          : 'The response only partially covers the expected answer and misses some important ideas from the grading guide.',
      matchedCriteria: matchedKeywords.slice(0, 5),
      missedCriteria,
      grader: 'heuristic',
    };
  }

  private generateCareerNarrativeHeuristically(
    input: GenerateCareerInsightNarrativeInput,
  ): GenerateCareerInsightNarrativeResult {
    const summary = `Your current performance points most strongly toward ${input.topRole.title.toLowerCase()} roles, supported by ${input.strongestSignal.label.toLowerCase()} and held back most by ${input.weakestSignal.label.toLowerCase()}. ${input.totalAttempts > 0 ? `This recommendation is grounded in ${input.totalAttempts} completed assessment${input.totalAttempts > 1 ? 's' : ''}${input.latestAssessmentTitle ? `, including ${input.latestAssessmentTitle}` : ''}.` : ''}`;

    const strengths = [
      `${input.strongestSignal.label} is currently one of your clearest employability signals.`,
      input.certificateCount > 0
        ? `You have already converted performance into ${input.certificateCount} earned certificate${input.certificateCount > 1 ? 's' : ''}, which strengthens this direction.`
        : 'Your readiness profile is starting to show a clearer direction, even before certificate eligibility.',
      `Your current ${input.readinessLevel.toLowerCase()} readiness level supports practical growth toward ${input.topRole.title.toLowerCase()} work.`,
    ];

    const gaps = [
      `${input.weakestSignal.label} is the fastest area to improve for stronger role fit.`,
      'A little more consistency across future attempts will make your strongest career direction more reliable.',
      input.certificateCount > 0
        ? 'Use your passed assessments as a baseline and focus the next improvement cycle on your weaker signal.'
        : 'One more strong assessment result would make your role fit signal much more credible.',
    ];

    return { summary, strengths, gaps };
  }

  private async buildPracticeSession(
    userId: string,
    dto: GeneratePracticeSessionDto,
  ): Promise<StoredPracticeSession> {
    const apiKey = this.configService.get<string>('app.geminiApiKey');

    if (apiKey) {
      try {
        return await this.generatePracticeSessionWithGemini(apiKey, userId, dto);
      } catch {
        return this.generatePracticeSessionHeuristically(dto);
      }
    }

    return this.generatePracticeSessionHeuristically(dto);
  }

  private async generatePracticeSessionWithGemini(
    apiKey: string,
    userId: string,
    dto: GeneratePracticeSessionDto,
  ): Promise<StoredPracticeSession> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        firstName: true,
        course: true,
      },
    });

    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = [
      'You are generating a guided practice session for a graduate employability platform.',
      'Return JSON only.',
      'Keep the tone supportive, practical, and learning-oriented.',
      `Category: ${dto.category}`,
      `Topic: ${dto.topic}`,
      `Question type: ${dto.questionType}`,
      `Difficulty: ${dto.difficulty}`,
      `Number of questions: ${dto.questionCount}`,
      `Practice style: ${dto.style}`,
      `Student course: ${user?.course ?? dto.category}`,
      'Return an object with keys: title, progressNote, relaxedModeLabel, focusAreas, recommendedTopics, studyTips, questions.',
      'questions must be an array.',
      'Each question must contain: id, number, type, prompt, topic, difficulty, explanation, takeaway, recommendedTopic.',
      'MCQ questions must include options[{id,label}] and correctOptionId.',
      'Theory questions must include placeholder, modelAnswer, feedback{strengths, improvements, betterResponseTip}.',
      'Coding questions must include language, starterCode, sampleInput, sampleOutput, feedback{logicQuality, codeClarity, improvementSuggestions, modelApproach}.',
      'Every question must be meaningfully different from the others.',
      'Do not repeat prompts, scenarios, or answer options across questions.',
      'For MCQ, all four options must be distinct, plausible, and directly tied to the topic.',
      'Avoid markdown fences.',
    ].join('\n');

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = this.extractJson<Partial<StoredPracticeSession>>(text);
    const fallback = this.generatePracticeSessionHeuristically(dto);

    const parsedQuestions = Array.isArray(parsed.questions) ? parsed.questions : fallback.questions;
    const normalizedQuestions = parsedQuestions
      .slice(0, dto.questionCount)
      .map((question, index) => this.normalizePracticeQuestion(question, dto, index + 1));
    const seenPrompts = new Set<string>();
    const deDuplicatedQuestions = normalizedQuestions.map((question, index) => {
      const normalizedPrompt = question.prompt.trim().toLowerCase();
      const fallbackQuestion = fallback.questions[index];

      if (!normalizedPrompt || seenPrompts.has(normalizedPrompt)) {
        seenPrompts.add(fallbackQuestion.prompt.trim().toLowerCase());
        return {
          ...fallbackQuestion,
          id: question.id,
          number: question.number,
        };
      }

      seenPrompts.add(normalizedPrompt);
      return question;
    });

    return {
      id: `practice-${Date.now()}`,
      title: parsed.title?.trim() || fallback.title,
      category: dto.category,
      topic: dto.topic,
      difficulty: dto.difficulty,
      questionType: dto.questionType,
      questionCount: normalizedQuestions.length,
      style: dto.style,
      progressNote: parsed.progressNote?.trim() || fallback.progressNote,
      relaxedModeLabel: parsed.relaxedModeLabel?.trim() || fallback.relaxedModeLabel,
      focusAreas: Array.isArray(parsed.focusAreas) && parsed.focusAreas.length ? parsed.focusAreas.slice(0, 3) : fallback.focusAreas,
      recommendedTopics:
        Array.isArray(parsed.recommendedTopics) && parsed.recommendedTopics.length
          ? parsed.recommendedTopics.slice(0, 3)
          : fallback.recommendedTopics,
      studyTips:
        Array.isArray(parsed.studyTips) && parsed.studyTips.length
          ? parsed.studyTips.slice(0, 3)
          : fallback.studyTips,
      questions: deDuplicatedQuestions,
    };
  }

  private generatePracticeSessionHeuristically(
    dto: GeneratePracticeSessionDto,
  ): StoredPracticeSession {
    const requestedTypes =
      dto.questionType === 'Mixed'
        ? (['mcq', 'theory', 'coding'] as const)
        : ([dto.questionType.toLowerCase()] as const);
    const curatedSeeds = this.getCuratedPracticeQuestionBank(dto);
    const seeds =
      curatedSeeds.length >= dto.questionCount
        ? curatedSeeds.slice(0, dto.questionCount)
        : [
            ...curatedSeeds,
            ...this.getGenericPracticeQuestionSeeds(dto, requestedTypes, dto.questionCount - curatedSeeds.length),
          ].slice(0, dto.questionCount);
    const questions = seeds.map((seed, index) => this.buildPracticeQuestionFromSeed(seed, dto, index + 1));

    return {
      id: `practice-${Date.now()}`,
      title: `${dto.topic} AI Practice Session`,
      category: dto.category,
      topic: dto.topic,
      difficulty: dto.difficulty,
      questionType: dto.questionType,
      questionCount: dto.questionCount,
      style: dto.style,
      progressNote: 'Small, guided sessions help you improve without the pressure of a live assessment.',
      relaxedModeLabel: 'Guided mode on',
      focusAreas: this.getRecommendationFocusAreas(dto.category, dto.questionType),
      recommendedTopics: this.getRecommendedPracticeTopics(dto.category, dto.topic),
      studyTips: [
        'Explain your reasoning before you optimize your answer.',
        'Treat every answer like something you might explain in an interview.',
        'Use the feedback to spot one pattern to improve in the next question.',
      ],
      questions,
    };
  }

  private normalizePracticeQuestion(
    question: unknown,
    dto: GeneratePracticeSessionDto,
    number: number,
  ): PracticeSessionQuestion {
    const baseObject =
      question && typeof question === 'object' ? (question as Record<string, unknown>) : {};
    const rawType = typeof baseObject.type === 'string' ? baseObject.type.toLowerCase() : 'mcq';
    const base = {
      id: typeof baseObject.id === 'string' ? baseObject.id : `pq-${number}`,
      number,
      prompt:
        typeof baseObject.prompt === 'string'
          ? baseObject.prompt
          : `Practice question ${number} on ${dto.topic}`,
      supportingText:
        typeof baseObject.supportingText === 'string' ? baseObject.supportingText : undefined,
      topic: typeof baseObject.topic === 'string' ? baseObject.topic : dto.topic,
      difficulty:
        baseObject.difficulty === 'Beginner' ||
        baseObject.difficulty === 'Intermediate' ||
        baseObject.difficulty === 'Advanced'
          ? (baseObject.difficulty as PracticeDifficulty)
          : dto.difficulty,
      explanation:
        typeof baseObject.explanation === 'string'
          ? baseObject.explanation
          : `This answer is strongest when it applies ${dto.topic.toLowerCase()} clearly.`,
      takeaway:
        typeof baseObject.takeaway === 'string'
          ? baseObject.takeaway
          : `A good ${dto.topic.toLowerCase()} answer stays practical and well structured.`,
      recommendedTopic:
        typeof baseObject.recommendedTopic === 'string'
          ? baseObject.recommendedTopic
          : dto.topic,
    };

    if (rawType === 'theory') {
      return {
        ...base,
        type: 'theory',
        placeholder:
          typeof baseObject.placeholder === 'string'
            ? baseObject.placeholder
            : 'Write a clear, structured answer...',
        modelAnswer:
          typeof baseObject.modelAnswer === 'string'
            ? baseObject.modelAnswer
            : `A strong answer would explain the key ${dto.topic.toLowerCase()} principle, apply it clearly, and end with a useful recommendation.`,
        feedback: {
          strengths: this.toStringArray(baseObject.feedback, 'strengths', [
            'Clear structure makes your reasoning easier to trust.',
          ]),
          improvements: this.toStringArray(baseObject.feedback, 'improvements', [
            'Be more explicit about why your recommendation works.',
          ]),
          betterResponseTip: this.toNestedString(
            baseObject.feedback,
            'betterResponseTip',
            'Use a diagnose, reason, recommend structure.',
          ),
        },
      };
    }

    if (rawType === 'coding') {
      return {
        ...base,
        type: 'coding',
        language: baseObject.language === 'Python' ? 'Python' : 'JavaScript',
        starterCode:
          typeof baseObject.starterCode === 'string'
            ? baseObject.starterCode
            : '// Write your solution here',
        sampleInput:
          typeof baseObject.sampleInput === 'string' ? baseObject.sampleInput : 'sample input',
        sampleOutput:
          typeof baseObject.sampleOutput === 'string' ? baseObject.sampleOutput : 'sample output',
        feedback: {
          logicQuality: this.toNestedString(
            baseObject.feedback,
            'logicQuality',
            'Focus on solving the task clearly before optimizing.',
          ),
          codeClarity: this.toNestedString(
            baseObject.feedback,
            'codeClarity',
            'Use readable names and simple control flow.',
          ),
          improvementSuggestions: this.toStringArray(baseObject.feedback, 'improvementSuggestions', [
            'Prefer the clearest built-in construct.',
          ]),
          modelApproach: this.toNestedString(
            baseObject.feedback,
            'modelApproach',
            `A strong solution would translate the ${dto.topic.toLowerCase()} requirement into a small, readable function.`,
          ),
        },
      };
    }

    const options = Array.isArray(baseObject.options)
      ? baseObject.options
          .map((option, index) => {
            if (!option || typeof option !== 'object') return null;
            const item = option as Record<string, unknown>;
            return {
              id: typeof item.id === 'string' ? item.id : String.fromCharCode(97 + index),
              label:
                typeof item.label === 'string'
                  ? item.label
                  : typeof item.value === 'string'
                    ? item.value
                    : `Option ${index + 1}`,
            };
          })
          .filter(Boolean)
      : null;
    const normalizedOptions = (options as Array<{ id: string; label: string }> | null)?.filter(
      (option, index, items) =>
        option.label.trim().length > 0 &&
        items.findIndex(
          (candidate) => candidate.label.trim().toLowerCase() === option.label.trim().toLowerCase(),
        ) === index,
    );

    return {
      ...base,
      type: 'mcq',
      options:
        normalizedOptions && normalizedOptions.length >= 3 ? normalizedOptions : [
          { id: 'a', label: 'A vague answer with weak reasoning' },
          { id: 'b', label: `A practical answer grounded in ${dto.topic.toLowerCase()}` },
          { id: 'c', label: 'A response that ignores the main constraint' },
          { id: 'd', label: 'A generic answer with little application' },
        ],
      correctOptionId:
        typeof baseObject.correctOptionId === 'string' ? baseObject.correctOptionId : 'b',
    };
  }

  private buildPracticeQuestionFromSeed(
    seed: PracticeQuestionSeed,
    dto: GeneratePracticeSessionDto,
    number: number,
  ): PracticeSessionQuestion {
    return {
      ...seed,
      id: `pq-${number}`,
      number,
      topic: dto.topic,
      difficulty: dto.difficulty,
      recommendedTopic: seed.recommendedTopic ?? dto.topic,
    } as PracticeSessionQuestion;
  }

  private getCuratedPracticeQuestionBank(dto: GeneratePracticeSessionDto): PracticeQuestionSeed[] {
    const normalizedTopic = dto.topic.toLowerCase();

    if (normalizedTopic.includes('javascript')) {
      return [
        {
          type: 'mcq',
          prompt: 'Which JavaScript method is best for creating a new array from an existing list of scores without mutating the original list?',
          supportingText: 'Pick the method that expresses transformation clearly.',
          options: [
            { id: 'a', label: 'forEach' },
            { id: 'b', label: 'map' },
            { id: 'c', label: 'find' },
            { id: 'd', label: 'sort' },
          ],
          correctOptionId: 'b',
          explanation: '`map` is built for transforming each element into a new array without mutating the original collection.',
          takeaway: 'Choose array methods that communicate intent directly.',
        },
        {
          type: 'mcq',
          prompt: 'What is the safest way to avoid blocking the UI when processing a large list in JavaScript on the client side?',
          supportingText: 'Focus on responsiveness, not just correctness.',
          options: [
            { id: 'a', label: 'Run the whole loop synchronously inside one click handler' },
            { id: 'b', label: 'Break the work into smaller chunks or defer non-urgent processing' },
            { id: 'c', label: 'Use alert boxes to pause the browser during processing' },
            { id: 'd', label: 'Keep reloading the page while the work runs' },
          ],
          correctOptionId: 'b',
          explanation: 'Chunking or deferring large work helps the browser stay responsive while still completing the task.',
          takeaway: 'Good JavaScript decisions consider user experience as well as logic.',
        },
        {
          type: 'theory',
          prompt: 'How would you explain the difference between `map` and `filter` to a junior developer working on a student dashboard?',
          supportingText: 'Use a simple example and explain when each method is appropriate.',
          placeholder: 'Write a clear explanation with a small example...',
          modelAnswer: '`map` changes every item in a collection into a new value, while `filter` keeps only the items that match a condition. For example, use `filter` to keep only completed tasks, then use `map` to turn those tasks into display labels.',
          explanation: 'Strong answers distinguish transformation from selection and tie both to a practical use case.',
          takeaway: 'Clear explanations compare purpose, behavior, and a realistic example.',
          feedback: {
            strengths: ['The clearest explanations contrast intent, not just syntax.'],
            improvements: ['Use one concrete example to make the distinction easier to remember.'],
            betterResponseTip: 'Explain what each method does, then show one short example of each.',
          },
        },
        {
          type: 'coding',
          prompt: 'Write a function that returns only the students whose readiness score is 75 or above.',
          supportingText: 'Each student has a `name` and a `score` field.',
          language: 'JavaScript',
          starterCode: "function getJobReadyStudents(students) {\n  // return only students with scores of 75 or above\n}\n",
          sampleInput: "[{ name: 'Ada', score: 82 }, { name: 'Tobi', score: 61 }]",
          sampleOutput: "[{ name: 'Ada', score: 82 }]",
          explanation: 'A clean answer filters the array by score and returns a new list.',
          takeaway: 'Filtering arrays is a core JavaScript skill for UI-ready data.',
          feedback: {
            logicQuality: 'Use the built-in array method that best matches the problem.',
            codeClarity: 'Readable naming and one direct return make this solution stronger.',
            improvementSuggestions: [
              'Prefer `filter` for selection problems.',
              'Keep the function pure and return a new array.',
              'Mentally test one boundary value like 75.',
            ],
            modelApproach: "Return `students.filter((student) => student.score >= 75)`.",
          },
        },
      ];
    }

    if (normalizedTopic.includes('react')) {
      return [
        {
          type: 'mcq',
          prompt: 'Which React pattern is best when an input field should always reflect component state?',
          supportingText: 'Think about predictable updates and form handling.',
          options: [
            { id: 'a', label: 'Manipulate the DOM directly with query selectors' },
            { id: 'b', label: 'Use a controlled input connected to state' },
            { id: 'c', label: 'Refresh the page after every keystroke' },
            { id: 'd', label: 'Store the current value only in CSS classes' },
          ],
          correctOptionId: 'b',
          explanation: 'Controlled inputs keep UI and state aligned, which makes form behavior predictable.',
          takeaway: 'React works best when the UI reflects state clearly.',
        },
        {
          type: 'theory',
          prompt: 'A dashboard card rerenders too often. How would you investigate the cause before optimizing it?',
          supportingText: 'Focus on the troubleshooting sequence, not just the final fix.',
          placeholder: 'Describe how you would inspect the rerenders and choose improvements...',
          modelAnswer: 'I would first confirm when the rerenders happen, identify which props or state changes trigger them, and then decide whether the issue is unnecessary parent updates, expensive child rendering, or avoidable derived work. Only after that would I choose a focused optimization.',
          explanation: 'The best answers show diagnosis first, then optimization.',
          takeaway: 'Strong frontend reasoning starts with evidence, not guesswork.',
          feedback: {
            strengths: ['A good answer separates investigation from implementation.'],
            improvements: ['Mention what you would inspect to confirm the trigger.'],
            betterResponseTip: 'Use a diagnose, confirm, optimize structure.',
          },
        },
        {
          type: 'coding',
          prompt: 'Write a React helper that returns `Job-Ready`, `Developing`, or `Beginner` based on a numeric score.',
          supportingText: 'Use these ranges: below 50, 50-74, and 75 or above.',
          language: 'JavaScript',
          starterCode: "function getReadinessLabel(score) {\n  // return the correct label\n}\n",
          sampleInput: '78',
          sampleOutput: "'Job-Ready'",
          explanation: 'The key here is writing clear branching logic and handling boundaries correctly.',
          takeaway: 'Simple utility logic should still be explicit and easy to test.',
          feedback: {
            logicQuality: 'Handle lower thresholds first and keep returns direct.',
            codeClarity: 'Simple if-statements are enough for this kind of branching.',
            improvementSuggestions: [
              'Check the 50 and 75 boundaries explicitly.',
              'Keep each label return obvious.',
              'Avoid unnecessary nesting.',
            ],
            modelApproach: "If score is below 50 return 'Beginner', if below 75 return 'Developing', otherwise return 'Job-Ready'.",
          },
        },
      ];
    }

    if (normalizedTopic.includes('legal') || normalizedTopic.includes('case')) {
      return [
        {
          type: 'mcq',
          prompt: 'Which response shows the strongest legal reasoning in a graduate employability scenario?',
          supportingText: 'Look for the answer that applies the rule to the facts rather than repeating the rule alone.',
          options: [
            { id: 'a', label: 'Quote a legal principle without connecting it to the scenario' },
            { id: 'b', label: 'State the issue, apply the rule to the facts, and reach a reasoned conclusion' },
            { id: 'c', label: 'Ignore the opposing argument and jump to a conclusion' },
            { id: 'd', label: 'Use broad moral language instead of legal analysis' },
          ],
          correctOptionId: 'b',
          explanation: 'Strong legal reasoning connects rule, facts, and conclusion in a structured way.',
          takeaway: 'Legal analysis is strongest when it is structured and fact-specific.',
        },
        {
          type: 'theory',
          prompt: 'How would you structure a short answer to a legal reasoning question so it feels clear and credible?',
          supportingText: 'Focus on answer structure and what makes the reasoning persuasive.',
          placeholder: 'Write a short structured response...',
          modelAnswer: 'A strong answer identifies the issue, states the relevant rule, applies that rule to the facts, and then closes with a reasoned conclusion. This keeps the analysis clear, logical, and easy to assess.',
          explanation: 'The best responses describe a clear analytical structure rather than staying abstract.',
          takeaway: 'Structured legal writing improves both clarity and credibility.',
          feedback: {
            strengths: ['Clear legal structure makes reasoning easier to trust.'],
            improvements: ['Mention how the rule should connect directly to the facts.'],
            betterResponseTip: 'Use issue, rule, application, conclusion as your answer frame.',
          },
        },
      ];
    }

    return [];
  }

  private getGenericPracticeQuestionSeeds(
    dto: GeneratePracticeSessionDto,
    requestedTypes: readonly string[],
    count: number,
  ): PracticeQuestionSeed[] {
    return Array.from({ length: count }, (_, index) => {
      const type = requestedTypes[index % requestedTypes.length];
      const variation = index % 4;

      if (type === 'mcq') {
        const variants = [
          {
            prompt: `Which option best reflects a strong ${dto.topic.toLowerCase()} decision in a ${dto.category.toLowerCase()} employability context?`,
            supportingText: 'Choose the option that shows the clearest applied understanding.',
            options: [
              { id: 'a', label: 'A vague action with little reasoning behind it' },
              { id: 'b', label: `A practical response grounded in ${dto.topic.toLowerCase()} fundamentals` },
              { id: 'c', label: 'An answer that ignores the key constraint in the prompt' },
              { id: 'd', label: 'A response that sounds confident but stays generic' },
            ],
          },
          {
            prompt: `A graduate is asked to justify a ${dto.topic.toLowerCase()} recommendation. Which answer is strongest?`,
            supportingText: 'Look for the response with the clearest reasoning and practical relevance.',
            options: [
              { id: 'a', label: 'A response that repeats the question without adding analysis' },
              { id: 'b', label: `A concise recommendation linked clearly to ${dto.topic.toLowerCase()} evidence` },
              { id: 'c', label: 'An answer that skips the main tradeoff in the scenario' },
              { id: 'd', label: 'A broad statement that avoids taking a position' },
            ],
          },
          {
            prompt: `Which choice shows the best applied judgment for a ${dto.topic.toLowerCase()} task?`,
            supportingText: 'Select the option that is specific, reasoned, and aligned with the problem.',
            options: [
              { id: 'a', label: 'A choice based only on confidence, not evidence' },
              { id: 'b', label: 'A practical step that solves the core problem and explains why' },
              { id: 'c', label: 'A response that creates more complexity than the prompt needs' },
              { id: 'd', label: 'A generic answer copied from an unrelated scenario' },
            ],
          },
          {
            prompt: `In a realistic ${dto.category.toLowerCase()} scenario, which response demonstrates the strongest ${dto.topic.toLowerCase()} thinking?`,
            supportingText: 'The best answer should balance clarity, relevance, and sound judgment.',
            options: [
              { id: 'a', label: 'A response that jumps to action without explaining the decision' },
              { id: 'b', label: `A well-scoped response that applies ${dto.topic.toLowerCase()} in a realistic way` },
              { id: 'c', label: 'An answer that focuses on style while ignoring the main requirement' },
              { id: 'd', label: 'A recommendation that sounds polished but is not actionable' },
            ],
          },
        ];
        const variant = variants[variation];
        return {
          type: 'mcq',
          prompt: variant.prompt,
          supportingText: variant.supportingText,
          options: variant.options,
          correctOptionId: 'b',
          explanation: `The strongest option is the one that applies ${dto.topic.toLowerCase()} clearly instead of staying abstract.`,
          takeaway: `In ${dto.category.toLowerCase()} practice, clear applied reasoning usually beats vague confidence.`,
        };
      }

      if (type === 'theory') {
        return {
          type: 'theory',
          prompt: [
            `How would you explain a strong ${dto.topic.toLowerCase()} approach in a realistic ${dto.category.toLowerCase()} scenario?`,
            `A student gives a weak answer on ${dto.topic.toLowerCase()}. How would you rewrite it to be more employability-ready?`,
            `What would a well-structured answer about ${dto.topic.toLowerCase()} include in a graduate assessment setting?`,
            `How should a graduate justify a ${dto.topic.toLowerCase()} decision so the response feels clear and credible?`,
          ][variation],
          supportingText: 'Use a short, structured response with reasoning and a practical next step.',
          placeholder: 'Write a clear answer with structure, reasoning, and a practical recommendation...',
          modelAnswer: `A strong answer would explain the core ${dto.topic.toLowerCase()} principle, apply it to the scenario, and end with a practical recommendation or next step.`,
          explanation: `The best responses are structured, practical, and explicit about why the approach works.`,
          takeaway: 'Clear structure and practical reasoning make theory answers more convincing.',
          feedback: {
            strengths: ['You are more convincing when your answer is structured and practical.'],
            improvements: [
              'Be more explicit about the reasoning behind your recommendation.',
              'Use a clearer beginning, middle, and end.',
            ],
            betterResponseTip: 'Try using a three-part structure: situation, reasoning, action.',
          },
        };
      }

      return {
        type: 'coding',
        prompt: [
          `Write a small ${dto.topic.toLowerCase()} helper for a ${dto.category.toLowerCase()} workflow.`,
          `Implement a compact ${dto.topic.toLowerCase()} utility that improves a graduate platform task.`,
          `Write a function that solves a practical ${dto.topic.toLowerCase()} scenario for a student-facing product.`,
          `Create a readable ${dto.topic.toLowerCase()} helper that handles a realistic employability-platform need.`,
        ][variation],
        supportingText: 'Focus on clarity, correctness, and readable logic.',
        language: 'JavaScript',
        starterCode: [
          `function solvePrompt(input) {\n  // implement your ${dto.topic.toLowerCase()} solution here\n}\n`,
          `function buildResult(input) {\n  // return the right output for this ${dto.topic.toLowerCase()} task\n}\n`,
          `function handleScenario(items) {\n  // use ${dto.topic.toLowerCase()} logic here\n}\n`,
          `function evaluateAnswer(data) {\n  // write a clear solution for this prompt\n}\n`,
        ][variation],
        sampleInput: ['sample input', 'array of inputs', 'single scenario object', 'mixed record set'][variation],
        sampleOutput: ['sample output', 'filtered result', 'scored output', 'transformed response'][variation],
        explanation: 'A strong coding answer solves the problem clearly and uses readable control flow.',
        takeaway: 'Readable, direct solutions are easier to trust and explain.',
        feedback: {
          logicQuality: 'Focus on solving the task directly before trying to optimize the code.',
          codeClarity: 'Use explicit variable names and keep the control flow easy to follow.',
          improvementSuggestions: [
            'Prefer the clearest built-in construct for the job.',
            'Check one edge case before submitting.',
            'Keep the return path straightforward.',
          ],
          modelApproach: `A solid solution would translate the ${dto.topic.toLowerCase()} requirement into one small, readable function.`,
        },
      };
    });
  }

  private async resolvePracticeSession(userId: string, sessionId: string): Promise<StoredPracticeSession> {
    const artifact = await this.prisma.aIArtifact.findFirst({
      where: {
        id: sessionId,
        userId,
        type: AIArtifactType.PRACTICE_QUESTIONS,
      },
    });

    const payload = artifact?.response as Prisma.JsonObject | undefined;
    if (!artifact || payload?.kind !== 'practice-session') {
      throw new NotFoundException('Practice session not found');
    }

    return payload.session as unknown as StoredPracticeSession;
  }

  private async evaluatePracticeQuestion(
    question: PracticeSessionQuestion,
    answer: unknown,
  ): Promise<PracticeQuestionReview> {
    const normalizedAnswer = this.normalizeText(answer);

    if (question.type === 'mcq') {
      const isCorrect = normalizedAnswer === question.correctOptionId;
      const correctOption =
        question.options.find((option) => option.id === question.correctOptionId)?.label ??
        question.correctOptionId;
      return {
        id: `review-${question.id}`,
        questionId: question.id,
        number: question.number,
        type: 'MCQ',
        prompt: question.prompt,
        userAnswer:
          question.options.find((option) => option.id === normalizedAnswer)?.label ||
          'No answer submitted',
        idealAnswer: correctOption,
        explanation: question.explanation,
        improvementNote: isCorrect
          ? question.takeaway
          : `Review ${question.recommendedTopic} and compare your choice with the strongest option.`,
        outcome: isCorrect ? 'Correct' : 'Needs Improvement',
        score: isCorrect ? 1 : 0,
        maxScore: 1,
        recommendedTopic: question.recommendedTopic,
      };
    }

    if (question.type === 'theory') {
      const graded = await this.gradeOpenEndedResponse({
        prompt: question.prompt,
        expectedAnswer: question.modelAnswer,
        rubric: question.feedback,
        explanation: question.explanation,
        studentAnswer: normalizedAnswer,
        maxMarks: 10,
        questionType: 'THEORY',
      });
      const passed = graded.awardedMarks >= 6;
      return {
        id: `review-${question.id}`,
        questionId: question.id,
        number: question.number,
        type: 'Theory',
        prompt: question.prompt,
        userAnswer: normalizedAnswer || 'No answer submitted',
        idealAnswer: question.modelAnswer,
        explanation: graded.summary || question.explanation,
        improvementNote:
          graded.missedCriteria.length > 0
            ? `Improve these areas next: ${graded.missedCriteria.join(', ')}.`
            : question.feedback.betterResponseTip,
        outcome: passed ? 'Correct' : 'Needs Improvement',
        score: graded.awardedMarks,
        maxScore: 10,
        recommendedTopic: question.recommendedTopic,
      };
    }

    const graded = await this.gradeOpenEndedResponse({
      prompt: question.prompt,
      expectedAnswer: question.feedback.modelApproach,
      rubric: question.feedback,
      explanation: question.explanation,
      studentAnswer: normalizedAnswer,
      maxMarks: 10,
      questionType: 'CODING',
    });
    const passed = graded.awardedMarks >= 6;
    return {
      id: `review-${question.id}`,
      questionId: question.id,
      number: question.number,
      type: 'Coding',
      prompt: question.prompt,
      userAnswer: normalizedAnswer || 'No answer submitted',
      idealAnswer: question.feedback.modelApproach,
      explanation: graded.summary || question.explanation,
      improvementNote:
        graded.missedCriteria.length > 0
          ? `Improve these areas next: ${graded.missedCriteria.join(', ')}.`
          : question.feedback.codeClarity,
      outcome: passed ? 'Correct' : 'Needs Improvement',
      score: graded.awardedMarks,
      maxScore: 10,
      recommendedTopic: question.recommendedTopic,
    };
  }

  private getPracticeSignalScores(
    attempts: Array<{
      percentage: number | null;
      responses: Array<{
        awardedMarks: number | null;
        question: {
          type: 'MCQ' | 'THEORY' | 'CODING';
          marks: number;
        };
      }>;
    }>,
  ) {
    const objective = this.computeQuestionTypeScore(attempts, ['MCQ', 'CODING']);
    const theory = this.computeQuestionTypeScore(attempts, ['THEORY']);
    const overall =
      attempts.length > 0
        ? Math.round(
            attempts.reduce((sum, attempt) => sum + (attempt.percentage ?? 0), 0) / attempts.length,
          )
        : 0;

    return [
      { label: 'Objective accuracy', score: objective || overall || 55 },
      { label: 'Structured explanations', score: theory || Math.max(45, overall - 8) || 50 },
      { label: 'Session confidence', score: overall || 52 },
    ];
  }

  private computeQuestionTypeScore(
    attempts: Array<{
      responses: Array<{
        awardedMarks: number | null;
        question: {
          type: 'MCQ' | 'THEORY' | 'CODING';
          marks: number;
        };
      }>;
    }>,
    types: Array<'MCQ' | 'THEORY' | 'CODING'>,
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

    if (!total) return 0;
    return Math.round((awarded / total) * 100);
  }

  private getPracticeCategory(course?: string | null, latestAssessmentTitle?: string) {
    const normalized = `${course ?? ''} ${latestAssessmentTitle ?? ''}`.toLowerCase();
    if (normalized.includes('law')) return 'Law' as const;
    if (
      normalized.includes('engineer') ||
      normalized.includes('mechanic') ||
      normalized.includes('civil')
    ) {
      return 'Engineering' as const;
    }
    return 'Tech' as const;
  }

  private getRecommendedPracticeTopic(category: PracticeCategory, weakestSignal?: string) {
    if (category === 'Law') {
      if (weakestSignal?.includes('explanations')) return 'Case Analysis';
      return 'Legal Reasoning';
    }

    if (category === 'Engineering') {
      if (weakestSignal?.includes('accuracy')) return 'Mathematics';
      return 'Systems Design';
    }

    if (weakestSignal?.includes('accuracy')) return 'Algorithms';
    if (weakestSignal?.includes('explanations')) return 'React Fundamentals';
    return 'JavaScript';
  }

  private getRecommendedPracticeDifficulty(score: number | null): PracticeDifficulty {
    if (!score) return 'Beginner';
    if (score >= 80) return 'Advanced';
    if (score >= 60) return 'Intermediate';
    return 'Beginner';
  }

  private getRecommendedPracticeQuestionType(weakestSignal?: string): PracticeQuestionType {
    if (!weakestSignal) return 'Mixed';
    if (weakestSignal.includes('explanations')) return 'Theory';
    if (weakestSignal.includes('accuracy')) return 'Mixed';
    return 'Mixed';
  }

  private getRecommendationFocusAreas(category: PracticeCategory, weakestSignal?: string) {
    if (category === 'Law') {
      return weakestSignal?.includes('explanations')
        ? ['Case analysis depth', 'Argument structure', 'Legal writing confidence']
        : ['Rule application', 'Reasoning accuracy', 'Timed legal judgment'];
    }
    if (category === 'Engineering') {
      return weakestSignal?.includes('accuracy')
        ? ['Quantitative accuracy', 'Systems reasoning', 'Step-by-step validation']
        : ['Technical reporting', 'Applied reasoning', 'Structured explanations'];
    }
    return weakestSignal?.includes('explanations')
      ? ['Structured technical explanations', 'Component reasoning', 'Clearer tradeoff analysis']
      : ['Problem decomposition', 'Applied JavaScript logic', 'Boundary-case checking'];
  }

  private getRecommendedPracticeTopics(category: PracticeCategory, topic: string) {
    const map: Record<PracticeCategory, string[]> = {
      Law: ['Legal Reasoning', 'Case Analysis', 'Contract Law'],
      Engineering: ['Mathematics', 'Mechanics', 'Systems Design'],
      Tech: ['JavaScript', 'React Fundamentals', 'Algorithms'],
    };

    return map[category].filter((item) => item !== topic).slice(0, 3);
  }

  private buildPracticeStudyPlan(focusAreas: string[], topic: string) {
    const [first = topic, second = topic, third = topic] = focusAreas;
    return [
      { day: 'Day 1', focus: `Review ${first.toLowerCase()} with one short guided session.` },
      { day: 'Day 3', focus: `Rewrite one answer more clearly to improve ${second.toLowerCase()}.` },
      { day: 'Day 5', focus: `Take another mixed session and compare progress on ${third.toLowerCase()}.` },
    ];
  }

  private buildPracticeCareerInsight(
    category: PracticeCategory,
    strongestArea: string,
    weakestArea: string,
    accuracy: number,
  ) {
    const direction =
      category === 'Law'
        ? 'legal reasoning and research-oriented roles'
        : category === 'Engineering'
          ? 'engineering analysis and systems-focused roles'
          : 'frontend and product-facing graduate roles';

    return accuracy >= 80
      ? `Your current practice signals suggest growing readiness for ${direction}. Keep strengthening ${weakestArea.toLowerCase()} so your strongest area, ${strongestArea.toLowerCase()}, becomes even more convincing.`
      : `Your practice work shows promise for ${direction}, but improving ${weakestArea.toLowerCase()} will make your stronger signal in ${strongestArea.toLowerCase()} much easier to trust.`;
  }

  private getMostCommon(values: string[]) {
    const counts = new Map<string, number>();
    values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  }

  private toStringArray(
    value: Record<string, unknown> | unknown,
    key: string,
    fallback: string[],
  ) {
    if (!value || typeof value !== 'object') return fallback;
    const candidate = (value as Record<string, unknown>)[key];
    if (!Array.isArray(candidate)) return fallback;
    const strings = candidate.filter((item): item is string => typeof item === 'string');
    return strings.length ? strings : fallback;
  }

  private toNestedString(
    value: Record<string, unknown> | unknown,
    key: string,
    fallback: string,
  ) {
    if (!value || typeof value !== 'object') return fallback;
    const candidate = (value as Record<string, unknown>)[key];
    return typeof candidate === 'string' ? candidate : fallback;
  }

  private formatDate(date: Date) {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  }

  private formatRelativeDate(date: Date) {
    const diffMs = Date.now() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks === 1) return 'last week';
    return `${diffWeeks} weeks ago`;
  }

  private normalizeText(value: unknown) {
    if (typeof value === 'string') return value;
    if (value === null || value === undefined) return '';
    return JSON.stringify(value);
  }

  private extractKeywords(value: string) {
    return Array.from(
      new Set(
        value
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, ' ')
          .split(/\s+/)
          .map((token) => token.trim())
          .filter((token) => token.length >= 4),
      ),
    );
  }

  private clampMarks(value: number, maxMarks: number) {
    if (!Number.isFinite(value)) return 0;
    return Math.max(0, Math.min(maxMarks, Number(value)));
  }

  private clampConfidence(value: number) {
    if (!Number.isFinite(value)) return 0.5;
    return Math.max(0, Math.min(1, Number(value)));
  }

  private extractJson<T>(text: string): T {
    const fenced = text.match(/```json\s*([\s\S]*?)```/i)?.[1];
    const candidate = fenced ?? text.match(/\{[\s\S]*\}/)?.[0] ?? '{}';
    return JSON.parse(candidate) as T;
  }
}
