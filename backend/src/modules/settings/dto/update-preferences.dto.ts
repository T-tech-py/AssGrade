import { DashboardDensity, ReminderWindow, ThemePreference } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdatePreferencesDto {
  @IsOptional()
  @IsEnum(ThemePreference)
  themePreference?: ThemePreference;

  @IsOptional()
  @IsEnum(DashboardDensity)
  dashboardDensity?: DashboardDensity;

  @IsOptional()
  @IsEnum(ReminderWindow)
  reminderWindow?: ReminderWindow;

  @IsOptional()
  @IsString()
  @MaxLength(240)
  studyGoal?: string;
}
