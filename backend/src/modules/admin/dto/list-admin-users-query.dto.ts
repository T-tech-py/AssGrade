import { IsIn, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class ListAdminUsersQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(5)
  @Max(50)
  pageSize?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(['all', 'active', 'pending', 'suspended', 'rejected'])
  status?: 'all' | 'active' | 'pending' | 'suspended' | 'rejected';

  @IsOptional()
  @IsString()
  field?: string;

  @IsOptional()
  @IsIn(['all', '30d', '90d', 'year'])
  joined?: 'all' | '30d' | '90d' | 'year';

  @IsOptional()
  @IsIn(['all', '7d', '30d', 'inactive'])
  activity?: 'all' | '7d' | '30d' | 'inactive';
}
