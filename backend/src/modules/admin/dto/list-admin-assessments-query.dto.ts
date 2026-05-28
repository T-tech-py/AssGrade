import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ListAdminAssessmentsQueryDto {
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
  field?: string;

  @IsOptional()
  @IsIn(['all', 'draft', 'active', 'archived'])
  status?: 'all' | 'draft' | 'active' | 'archived';

  @IsOptional()
  @IsIn(['all', 'beginner', 'intermediate', 'advanced'])
  difficulty?: 'all' | 'beginner' | 'intermediate' | 'advanced';

  @IsOptional()
  @IsIn(['all', '30d', '90d', 'year'])
  created?: 'all' | '30d' | '90d' | 'year';
}
