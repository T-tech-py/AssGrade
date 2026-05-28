import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtUser } from 'src/common/types/jwt-user.type';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RevokeOtherSessionsDto } from './dto/revoke-other-sessions.dto';
import { UpdateNotificationsDto } from './dto/update-notifications.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { UpdatePrivacyDto } from './dto/update-privacy.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { SettingsService } from './settings.service';

@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.STUDENT, UserRole.ADMIN)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('me')
  me(@CurrentUser() user: JwtUser) {
    return this.settingsService.getSettings(user.sub);
  }

  @Patch('profile')
  updateProfile(@CurrentUser() user: JwtUser, @Body() dto: UpdateProfileDto) {
    return this.settingsService.updateProfile(user.sub, dto);
  }

  @Patch('preferences')
  updatePreferences(@CurrentUser() user: JwtUser, @Body() dto: UpdatePreferencesDto) {
    return this.settingsService.updatePreferences(user.sub, dto);
  }

  @Patch('notifications')
  updateNotifications(@CurrentUser() user: JwtUser, @Body() dto: UpdateNotificationsDto) {
    return this.settingsService.updateNotifications(user.sub, dto);
  }

  @Patch('privacy')
  updatePrivacy(@CurrentUser() user: JwtUser, @Body() dto: UpdatePrivacyDto) {
    return this.settingsService.updatePrivacy(user.sub, dto);
  }

  @Post('change-password')
  changePassword(@CurrentUser() user: JwtUser, @Body() dto: ChangePasswordDto) {
    return this.settingsService.changePassword(user.sub, dto);
  }

  @Get('sessions')
  sessions(@CurrentUser() user: JwtUser, @Headers('x-device-id') currentDeviceId?: string) {
    return this.settingsService.listSessions(user.sub, currentDeviceId);
  }

  @Post('sessions/revoke-others')
  revokeOthers(@CurrentUser() user: JwtUser, @Body() dto: RevokeOtherSessionsDto) {
    return this.settingsService.revokeOtherSessions(user.sub, dto);
  }

  @Post('sessions/:id/revoke')
  revokeSession(
    @CurrentUser() user: JwtUser,
    @Param('id') sessionId: string,
    @Headers('x-device-id') currentDeviceId?: string,
  ) {
    return this.settingsService.revokeSession(user.sub, sessionId, currentDeviceId);
  }
}
