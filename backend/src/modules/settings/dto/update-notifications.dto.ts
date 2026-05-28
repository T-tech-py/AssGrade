import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationsDto {
  @IsOptional()
  @IsBoolean()
  assessmentReminders?: boolean;

  @IsOptional()
  @IsBoolean()
  practiceNudges?: boolean;

  @IsOptional()
  @IsBoolean()
  resultAlerts?: boolean;

  @IsOptional()
  @IsBoolean()
  careerInsights?: boolean;
}
