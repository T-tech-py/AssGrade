import { IsIn, IsInt, IsString, Max, Min } from 'class-validator';

export class GeneratePracticeSessionDto {
  @IsString()
  @IsIn(['Law', 'Engineering', 'Tech'])
  category!: 'Law' | 'Engineering' | 'Tech';

  @IsString()
  topic!: string;

  @IsString()
  @IsIn(['MCQ', 'Theory', 'Coding', 'Mixed'])
  questionType!: 'MCQ' | 'Theory' | 'Coding' | 'Mixed';

  @IsString()
  @IsIn(['Beginner', 'Intermediate', 'Advanced'])
  difficulty!: 'Beginner' | 'Intermediate' | 'Advanced';

  @IsInt()
  @Min(1)
  @Max(20)
  questionCount!: number;

  @IsString()
  @IsIn(['Instant Feedback', 'End-of-Session Review'])
  style!: 'Instant Feedback' | 'End-of-Session Review';
}
