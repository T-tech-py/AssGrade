import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ListAdminCertificatesQueryDto {
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
  @IsIn(['all', 'issued', 'reissued'])
  status?: 'all' | 'issued' | 'reissued';

  @IsOptional()
  @IsString()
  field?: string;

  @IsOptional()
  @IsIn(['all', '30d', '90d', 'month'])
  date?: 'all' | '30d' | '90d' | 'month';
}
