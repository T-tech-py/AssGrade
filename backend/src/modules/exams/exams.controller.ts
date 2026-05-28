import {
  Body,
  Controller,
  Get,
  Patch,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { UserRole } from '@prisma/client';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtUser } from 'src/common/types/jwt-user.type';
import { CreateExamDto } from './dto/create-exam.dto';
import { ListStudentResultsQueryDto } from './dto/list-student-results-query.dto';
import { StartExamDto, SubmitAttemptDto } from './dto/submit-response.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { ExamsService } from './exams.service';
import { ProctorEventDto } from '../proctoring/dto/proctor-event.dto';

@Controller('exams')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Get('dashboard/overview')
  @Roles(UserRole.STUDENT)
  getStudentDashboardOverview(@CurrentUser() user: JwtUser) {
    return this.examsService.getStudentDashboardOverview(user.sub);
  }

  @Get('results')
  @Roles(UserRole.STUDENT)
  getStudentResults(
    @CurrentUser() user: JwtUser,
    @Query() query: ListStudentResultsQueryDto,
  ) {
    return this.examsService.getStudentResults(user.sub, query);
  }

  @Get('career-insights')
  @Roles(UserRole.STUDENT)
  getStudentCareerInsights(@CurrentUser() user: JwtUser) {
    return this.examsService.getStudentCareerInsights(user.sub);
  }

  @Get('results/:attemptId')
  @Roles(UserRole.STUDENT)
  getStudentResultDetail(
    @CurrentUser() user: JwtUser,
    @Param('attemptId') attemptId: string,
  ) {
    return this.examsService.getStudentResultDetail(user.sub, attemptId);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  createExam(@CurrentUser() user: JwtUser, @Body() dto: CreateExamDto) {
    return this.examsService.createExam(user.sub, dto);
  }

  @Patch(':examId')
  @Roles(UserRole.ADMIN)
  updateExam(
    @Param('examId') examId: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: UpdateExamDto,
  ) {
    return this.examsService.updateExam(examId, user.sub, dto);
  }

  @Get()
  listAvailableExams(@CurrentUser() user: JwtUser) {
    return this.examsService.listAvailableExams(user);
  }

  @Post(':examId/start')
  @Roles(UserRole.STUDENT)
  startExam(
    @Param('examId') examId: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: StartExamDto,
    @Req() req: Request,
  ) {
    const forwardedFor = req.headers['x-forwarded-for'];
    const ipAddress = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor ?? req.ip;

    return this.examsService.startExam(examId, user, {
      deviceId: dto.deviceId,
      ipAddress,
      userAgent: req.headers['user-agent'],
    });
  }

  @Get(':examId/session')
  getExamSession(@Param('examId') examId: string, @CurrentUser() user: JwtUser) {
    return this.examsService.getExamSession(examId, user);
  }

  @Post(':examId/submit')
  @Roles(UserRole.STUDENT)
  submitAttempt(
    @Param('examId') examId: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: SubmitAttemptDto,
  ) {
    return this.examsService.submitAttempt(examId, user, dto);
  }

  @Post('attempts/:attemptId/proctor-events')
  @Roles(UserRole.STUDENT)
  logProctorEvent(
    @Param('attemptId') attemptId: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: ProctorEventDto,
  ) {
    return this.examsService.logStudentProctorEvent(attemptId, user, dto);
  }
}
