import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  DashboardDensity,
  Prisma,
  ProfileVisibility,
  ReminderWindow,
  ThemePreference,
} from '@prisma/client';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RevokeOtherSessionsDto } from './dto/revoke-other-sessions.dto';
import { UpdateNotificationsDto } from './dto/update-notifications.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { UpdatePrivacyDto } from './dto/update-privacy.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async getSettings(userId: string) {
    const user = await this.getUserOrThrow(userId);
    const settings = await this.ensureSettings(userId);

    return this.buildSettingsPayload(user, settings);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.usersService.updateById(userId, {
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      school: dto.school,
      course: dto.course,
      level: dto.level,
      location: dto.location,
      bio: dto.bio,
    });

    const settings = await this.ensureSettings(userId);
    return this.buildSettingsPayload(user, settings);
  }

  async updatePreferences(userId: string, dto: UpdatePreferencesDto) {
    const settings = await this.prisma.userSettings.upsert({
      where: { userId },
      update: {
        themePreference: dto.themePreference,
        dashboardDensity: dto.dashboardDensity,
        reminderWindow: dto.reminderWindow,
        studyGoal: dto.studyGoal,
      },
      create: {
        userId,
        themePreference: dto.themePreference ?? ThemePreference.SYSTEM,
        dashboardDensity: dto.dashboardDensity ?? DashboardDensity.COMFORTABLE,
        reminderWindow: dto.reminderWindow ?? ReminderWindow.TWENTY_FOUR_HOURS,
        studyGoal: dto.studyGoal ?? '',
      },
    });

    const user = await this.getUserOrThrow(userId);
    return this.buildSettingsPayload(user, settings);
  }

  async updateNotifications(userId: string, dto: UpdateNotificationsDto) {
    const settings = await this.prisma.userSettings.upsert({
      where: { userId },
      update: {
        notificationAssessmentReminders: dto.assessmentReminders,
        notificationPracticeNudges: dto.practiceNudges,
        notificationResultAlerts: dto.resultAlerts,
        notificationCareerInsights: dto.careerInsights,
      },
      create: {
        userId,
        notificationAssessmentReminders: dto.assessmentReminders ?? true,
        notificationPracticeNudges: dto.practiceNudges ?? true,
        notificationResultAlerts: dto.resultAlerts ?? true,
        notificationCareerInsights: dto.careerInsights ?? false,
      },
    });

    const user = await this.getUserOrThrow(userId);
    return this.buildSettingsPayload(user, settings);
  }

  async updatePrivacy(userId: string, dto: UpdatePrivacyDto) {
    const settings = await this.prisma.userSettings.upsert({
      where: { userId },
      update: {
        profileVisibility: dto.profileVisibility,
        certificateSharingEnabled: dto.certificateSharingEnabled,
      },
      create: {
        userId,
        profileVisibility: dto.profileVisibility ?? ProfileVisibility.PRIVATE,
        certificateSharingEnabled: dto.certificateSharingEnabled ?? false,
      },
    });

    const user = await this.getUserOrThrow(userId);
    return this.buildSettingsPayload(user, settings);
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.getUserOrThrow(userId);
    const validPassword = await argon2.verify(user.passwordHash, dto.currentPassword);

    if (!validPassword) {
      throw new UnauthorizedException('Your current password is incorrect.');
    }

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException('Choose a new password that is different from your current one.');
    }

    const currentSession = await this.findMatchingSession(userId, dto.currentRefreshToken);
    if (!currentSession) {
      throw new UnauthorizedException('Your current session could not be verified.');
    }

    const passwordHash = await argon2.hash(dto.newPassword);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: {
          passwordHash,
          passwordUpdatedAt: new Date(),
        },
      }),
      this.prisma.userSession.updateMany({
        where: {
          userId,
          revokedAt: null,
          NOT: { id: currentSession.id },
        },
        data: { revokedAt: new Date() },
      }),
    ]);

    return {
      message: 'Your password has been updated.',
    };
  }

  async listSessions(userId: string, currentDeviceId?: string) {
    const sessions = await this.prisma.userSession.findMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sessions.map((session) => ({
      id: session.id,
      deviceId: session.deviceId,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      isCurrent: Boolean(currentDeviceId && session.deviceId && session.deviceId === currentDeviceId),
    }));
  }

  async revokeSession(userId: string, sessionId: string, currentDeviceId?: string) {
    const session = await this.prisma.userSession.findFirst({
      where: {
        id: sessionId,
        userId,
        revokedAt: null,
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found.');
    }

    if (currentDeviceId && session.deviceId && session.deviceId === currentDeviceId) {
      throw new BadRequestException('You cannot revoke the current session from this action.');
    }

    await this.prisma.userSession.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    });

    return { success: true };
  }

  async revokeOtherSessions(userId: string, dto: RevokeOtherSessionsDto) {
    const currentSession = await this.findMatchingSession(userId, dto.currentRefreshToken);
    if (!currentSession) {
      throw new UnauthorizedException('Your current session could not be verified.');
    }

    const result = await this.prisma.userSession.updateMany({
      where: {
        userId,
        revokedAt: null,
        NOT: { id: currentSession.id },
      },
      data: { revokedAt: new Date() },
    });

    return { success: true, revokedCount: result.count };
  }

  private async getUserOrThrow(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    return user;
  }

  private async ensureSettings(userId: string) {
    return this.prisma.userSettings.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
  }

  private async findMatchingSession(userId: string, refreshToken: string) {
    const sessions = await this.prisma.userSession.findMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    for (const session of sessions) {
      if (await argon2.verify(session.refreshToken, refreshToken)) {
        return session;
      }
    }

    return null;
  }

  private buildSettingsPayload(
    user: Prisma.UserGetPayload<Record<string, never>>,
    settings: Prisma.UserSettingsGetPayload<Record<string, never>>,
  ) {
    return {
      profile: {
        fullName: `${user.firstName} ${user.lastName}`.trim(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone ?? '',
        school: user.school ?? '',
        course: user.course ?? '',
        level: user.level ?? '',
        location: user.location ?? '',
        bio: user.bio ?? '',
      },
      preferences: {
        themePreference: settings.themePreference,
        dashboardDensity: settings.dashboardDensity,
        reminderWindow: settings.reminderWindow,
        studyGoal: settings.studyGoal,
      },
      notifications: {
        assessmentReminders: settings.notificationAssessmentReminders,
        practiceNudges: settings.notificationPracticeNudges,
        resultAlerts: settings.notificationResultAlerts,
        careerInsights: settings.notificationCareerInsights,
      },
      privacy: {
        profileVisibility: settings.profileVisibility,
        certificateSharingEnabled: settings.certificateSharingEnabled,
        monitoringPolicy:
          'Assessment monitoring records are retained according to the platform integrity policy.',
      },
      security: {
        passwordUpdatedAt: user.passwordUpdatedAt,
        twoFactorEnabled: false,
      },
    };
  }
}
