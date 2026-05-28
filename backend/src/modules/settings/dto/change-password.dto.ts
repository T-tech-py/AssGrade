import { IsString, Matches, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  currentPassword!: string;

  @IsString()
  @MinLength(8)
  @Matches(/[A-Z]/, { message: 'New password must include at least one uppercase letter.' })
  @Matches(/[0-9]/, { message: 'New password must include at least one number.' })
  newPassword!: string;

  @IsString()
  currentRefreshToken!: string;
}
