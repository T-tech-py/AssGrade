import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';

export class AttemptAnswerDto {
  @IsString()
  questionId!: string;

  @IsOptional()
  answer?: unknown;
}

export class SubmitAttemptDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttemptAnswerDto)
  answers!: AttemptAnswerDto[];
}

export class StartExamDto {
  @IsString()
  deviceId!: string;
}
