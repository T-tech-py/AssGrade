import { AIArtifactType } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class GenerateAiArtifactDto {
  @IsEnum(AIArtifactType)
  type!: AIArtifactType;

  @IsString()
  prompt!: string;

  @IsOptional()
  @IsString()
  topic?: string;
}
