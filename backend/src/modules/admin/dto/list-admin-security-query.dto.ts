import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ListAdminSecurityQueryDto {
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
  @IsIn(['all', 'low', 'medium', 'high'])
  risk?: 'all' | 'low' | 'medium' | 'high';

  @IsOptional()
  @IsString()
  assessment?: string;

  @IsOptional()
  @IsIn(['all', '7d', '14d', '30d', '90d'])
  date?: 'all' | '7d' | '14d' | '30d' | '90d';

  @IsOptional()
  @IsString()
  violation?: string;

  @IsOptional()
  @IsIn(['all', 'open', 'reviewed', 'escalated', 'cleared'])
  status?: 'all' | 'open' | 'reviewed' | 'escalated' | 'cleared';
}
