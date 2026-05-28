import { IsOptional, IsString } from 'class-validator';

export class CreateAiQuestionSuggestionDto {
  @IsString()
  topic!: string;

  @IsString()
  prompt!: string;

  @IsOptional()
  @IsString()
  difficulty?: string;
}
