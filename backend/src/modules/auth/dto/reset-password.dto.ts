import { IsString, Matches, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  token!: string;

  @IsString()
  @MinLength(8)
  @Matches(/[A-Z]/, { message: 'Password must include at least one uppercase letter.' })
  @Matches(/[0-9]/, { message: 'Password must include at least one number.' })
  password!: string;
}
