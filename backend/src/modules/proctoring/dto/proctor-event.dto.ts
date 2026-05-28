import { ProctorEventType } from '@prisma/client';
import { IsEnum, IsInt, IsObject, IsOptional, Min } from 'class-validator';

export class ProctorEventDto {
  @IsEnum(ProctorEventType)
  type!: ProctorEventType;

  @IsOptional()
  @IsInt()
  @Min(1)
  severity?: number;

  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;
}
