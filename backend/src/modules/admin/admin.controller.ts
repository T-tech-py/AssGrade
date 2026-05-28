import { Body, Controller, Get, Param, Post, Query, Res, UseGuards } from '@nestjs/common';
import { AIArtifactType, UserRole } from '@prisma/client';
import { Response } from 'express';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtUser } from 'src/common/types/jwt-user.type';
import { AiService } from '../ai/ai.service';
import { CreateAiQuestionSuggestionDto } from './dto/create-ai-question-suggestion.dto';
import { ListAdminAssessmentsQueryDto } from './dto/list-admin-assessments-query.dto';
import { ListAdminAttemptsQueryDto } from './dto/list-admin-attempts-query.dto';
import { ListAdminCertificatesQueryDto } from './dto/list-admin-certificates-query.dto';
import { ListAdminSecurityQueryDto } from './dto/list-admin-security-query.dto';
import { ListAdminUsersQueryDto } from './dto/list-admin-users-query.dto';
import { UpdateAdminAssessmentStatusDto } from './dto/update-admin-assessment-status.dto';
import { UpdateAdminSecurityStatusDto } from './dto/update-admin-security-status.dto';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly aiService: AiService,
  ) {}

  @Get('dashboard')
  getDashboard() {
    return this.adminService.getDashboardSummary();
  }

  @Get('users')
  listUsers(@Query() query: ListAdminUsersQueryDto) {
    return this.adminService.listUsers(query);
  }

  @Get('assessments')
  listAssessments(@Query() query: ListAdminAssessmentsQueryDto) {
    return this.adminService.listAssessments(query);
  }

  @Get('assessments/:id')
  getAssessment(@Param('id') id: string) {
    return this.adminService.getAssessmentDetail(id);
  }

  @Get('attempts')
  listAttempts(@Query() query: ListAdminAttemptsQueryDto) {
    return this.adminService.listAttempts(query);
  }

  @Get('attempts/export')
  async exportAttempts(@Query() query: ListAdminAttemptsQueryDto, @Res() res: Response) {
    const csv = await this.adminService.exportAttemptsCsv(query);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="gradassess-attempts-${new Date().toISOString().slice(0, 10)}.csv"`,
    );

    res.send(csv);
  }

  @Get('attempts/:id')
  getAttempt(@Param('id') id: string) {
    return this.adminService.getAttemptDetail(id);
  }

  @Get('security')
  listSecurityAlerts(@Query() query: ListAdminSecurityQueryDto) {
    return this.adminService.listSecurityAlerts(query);
  }

  @Get('security/:id')
  getSecurityAlert(@Param('id') id: string) {
    return this.adminService.getSecurityAlertDetail(id);
  }

  @Post('security/:id/status')
  updateSecurityAlertStatus(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Body() dto: UpdateAdminSecurityStatusDto,
  ) {
    return this.adminService.updateSecurityAlertStatus(id, user.sub, dto);
  }

  @Get('certificates')
  listCertificates(@Query() query: ListAdminCertificatesQueryDto) {
    return this.adminService.listCertificates(query);
  }

  @Get('certificates/export')
  async exportCertificates(@Query() query: ListAdminCertificatesQueryDto, @Res() res: Response) {
    const csv = await this.adminService.exportCertificatesCsv(query);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="gradassess-certificates-${new Date().toISOString().slice(0, 10)}.csv"`,
    );

    res.send(csv);
  }

  @Get('certificates/:id')
  getCertificate(@Param('id') id: string) {
    return this.adminService.getCertificateDetail(id);
  }

  @Post('certificates/:id/reissue')
  reissueCertificate(@Param('id') id: string) {
    return this.adminService.reissueCertificate(id);
  }

  @Post('certificates/:id/verify')
  verifyCertificateRecord(@Param('id') id: string) {
    return this.adminService.verifyCertificateRecord(id);
  }

  @Post('assessments/:id/status')
  updateAssessmentStatus(
    @Param('id') id: string,
    @Body() dto: UpdateAdminAssessmentStatusDto,
  ) {
    return this.adminService.updateAssessmentStatus(id, dto.status);
  }

  @Post('assessments/:id/duplicate')
  duplicateAssessment(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.adminService.duplicateAssessment(user.sub, id);
  }

  @Get('users/export')
  async exportUsers(@Query() query: ListAdminUsersQueryDto, @Res() res: Response) {
    const csv = await this.adminService.exportUsersCsv(query);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="gradassess-users-${new Date().toISOString().slice(0, 10)}.csv"`,
    );

    res.send(csv);
  }

  @Get('users/:id')
  getUser(@Param('id') id: string) {
    return this.adminService.getUserDetail(id);
  }

  @Post('users/:id/toggle-status')
  toggleUserStatus(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.adminService.toggleUserStatus(id, user.sub);
  }

  @Post('users/:id/reset-access')
  resetUserAccess(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.adminService.resetUserAccess(id, user.sub);
  }

  @Post('users/:id/approve-admin-request')
  approveAdminRequest(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.adminService.approveAdminRequest(id, user.sub);
  }

  @Post('users/:id/reject-admin-request')
  rejectAdminRequest(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.adminService.rejectAdminRequest(id, user.sub);
  }

  @Post('ai-question-suggestions')
  createAiQuestionSuggestion(
    @CurrentUser() user: JwtUser,
    @Body() dto: CreateAiQuestionSuggestionDto,
  ) {
    return this.aiService.generateArtifact(user.sub, {
      type: AIArtifactType.QUESTION_SUGGESTION,
      topic: dto.topic,
      prompt: `${dto.prompt}${dto.difficulty ? ` Difficulty: ${dto.difficulty}.` : ''}`,
    });
  }
}
