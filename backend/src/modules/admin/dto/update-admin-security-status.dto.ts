import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateAdminSecurityStatusDto {
  @IsIn(['REVIEWED', 'ESCALATED', 'CLEARED'])
  status!: 'REVIEWED' | 'ESCALATED' | 'CLEARED';

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
