import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ListAdminAttemptsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(6)
  @Max(60)
  pageSize?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  assessment?: string;

  @IsOptional()
  @IsString()
  field?: string;

  @IsOptional()
  @IsIn(['all', 'fairly-passed', 'passed', 'credit', 'excellent', 'fail'])
  grade?: 'all' | 'fairly-passed' | 'passed' | 'credit' | 'excellent' | 'fail';

  @IsOptional()
  @IsIn(['all', 'submitted', 'reviewed', 'flagged', 'in-progress'])
  status?: 'all' | 'submitted' | 'reviewed' | 'flagged' | 'in-progress';

  @IsOptional()
  @IsIn(['all', '7d', '30d', '90d'])
  date?: 'all' | '7d' | '30d' | '90d';

  @IsOptional()
  @IsString()
  student?: string;
}
