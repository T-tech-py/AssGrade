import {
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class PracticeAnswerDto {
  @IsString()
  questionId!: string;

  @IsOptional()
  answer?: unknown;
}

export class ReviewPracticeSessionDto {
  @IsString()
  sessionId!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PracticeAnswerDto)
  answers!: PracticeAnswerDto[];
}

export class PracticeQuestionFeedbackDto {
  @IsString()
  sessionId!: string;

  @IsString()
  questionId!: string;

  @IsOptional()
  answer?: unknown;
}
