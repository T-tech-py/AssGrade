import { IsString } from 'class-validator';

export class RevokeOtherSessionsDto {
  @IsString()
  currentRefreshToken!: string;
}
