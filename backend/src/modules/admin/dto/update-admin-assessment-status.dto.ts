import { IsEnum } from 'class-validator';
import { ExamStatus } from '@prisma/client';

export class UpdateAdminAssessmentStatusDto {
  @IsEnum(ExamStatus)
  status!: ExamStatus;
}
